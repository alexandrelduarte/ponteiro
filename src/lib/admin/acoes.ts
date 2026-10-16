"use server";

/**
 * Server Actions do `/admin` — a única forma de mexer na série oficial.
 *
 * Invariantes de segurança, sem exceção:
 *  1. `exigirAdmin()` é revalidado NO CORPO de cada action (defesa em
 *     profundidade: uma Server Action é um endpoint POST público — middleware
 *     e checagem na página não a protegem);
 *  2. escrita só via service role, nunca com a chave anônima;
 *  3. toda mutação vira linha em `audit_log` com o e-mail do ator;
 *  4. entrada do formulário é hostil: passa pelo MESMO pipeline de sanidade do
 *     coletor (`processarRespostaIA`);
 *  5. o que muda a série publicada dispara `revalidatePath('/')` + snapshot.
 */
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { ErroAutorizacao, exigirAdmin } from "@/lib/admin/auth";
import { executarReconstituicao } from "@/lib/reconstituir";
import { pingIndexNow } from "@/lib/seo";
import { slugPesquisa } from "@/lib/slug";
import { gravarSnapshot } from "@/lib/snapshot";
import {
  DATA_MINIMA,
  hojeSaoPaulo,
  processarRespostaIA,
  rodarUpdater,
  type ContextoBusca,
  type InstitutoConhecido,
  type PesquisaAceita,
  type Rejeicao,
  type ResumoUpdater,
} from "@/lib/updater";
import { exigirClienteAdmin, registrarAuditoria } from "@/lib/supabase/admin";

export type ResultadoAcao = { ok: true; mensagem: string } | { ok: false; erro: string };

export type ResultadoAtualizacao =
  { ok: true; mensagem: string; resumo: ResumoUpdater } | { ok: false; erro: string };

/** Campos aceitos no formulário de inclusão manual. */
export interface EntradaManual {
  instituto?: unknown;
  contratante?: unknown;
  inicio?: unknown;
  fim?: unknown;
  n?: unknown;
  moe?: unknown;
  tse?: unknown;
  l1?: unknown;
  f1?: unknown;
  bnns1?: unknown;
  l2?: unknown;
  f2?: unknown;
  fonte?: unknown;
}

const esquemaId = z.string().uuid("identificador inválido");
const esquemaMotivo = z
  .string()
  .max(500)
  .transform((s) => s.replace(/\p{C}/gu, " ").replace(/\s+/g, " ").trim())
  .transform((s) => (s.length ? s : null))
  .nullable();

const COLUNAS_AUDIT =
  "id,instituto_id,contratante,campo_inicio,campo_fim,amostra,moe,tse," +
  "t1_lula,t1_flavio,t1_bnns,t2_lula,t2_flavio,t2_bnns,fonte_url,status,origem," +
  "criado_em,publicado_em,publicado_por";

interface LinhaAudit {
  id: string;
  instituto_id: string;
  contratante: string | null;
  campo_inicio: string;
  campo_fim: string;
  amostra: number | null;
  moe: number | null;
  tse: string | null;
  t1_lula: number | null;
  t1_flavio: number | null;
  t1_bnns: number | null;
  t2_lula: number | null;
  t2_flavio: number | null;
  t2_bnns: number | null;
  fonte_url: string | null;
  status: "pendente" | "publicada" | "rejeitada";
  origem: "seed" | "auto" | "admin";
  criado_em: string;
  publicado_em: string | null;
  publicado_por: string | null;
}

/**
 * Detalhes publicáveis de uma pesquisa. `bruto` NUNCA entra: é texto não
 * verificado da IA e o feed de transparência é público.
 */
function detalhesPublicaveis(l: LinhaAudit): Record<string, unknown> {
  return {
    instituto_id: l.instituto_id,
    contratante: l.contratante,
    campo_inicio: l.campo_inicio,
    campo_fim: l.campo_fim,
    amostra: l.amostra,
    moe: l.moe,
    tse: l.tse,
    t1_lula: l.t1_lula,
    t1_flavio: l.t1_flavio,
    t1_bnns: l.t1_bnns,
    t2_lula: l.t2_lula,
    t2_flavio: l.t2_flavio,
    t2_bnns: l.t2_bnns,
    fonte: l.fonte_url,
    origem: l.origem,
  };
}

function falha(erro: unknown, padrao: string): { ok: false; erro: string } {
  if (erro instanceof ErroAutorizacao) return { ok: false, erro: erro.message };
  console.error("[admin] ", erro);
  return { ok: false, erro: padrao };
}

/** Revalida as rotas que mostram a série e regrava o snapshot. */
async function serieMudou(slugAfetado?: string): Promise<void> {
  revalidatePath("/");
  revalidatePath("/historico");
  revalidatePath("/admin");
  // A série mudou ⇒ tudo que a lista/depende muda junto: a lista da
  // /metodologia, o índice e TODAS as fichas (peso/posição/tendência são
  // relativos à série), e o sitemap (lastmod real).
  revalidatePath("/metodologia");
  revalidatePath("/pesquisas");
  revalidatePath("/pesquisas/[slug]", "page");
  revalidatePath("/sitemap.xml");
  // Superfícies de máquina que publicam o mesmo número (DECISOES.md, 2º turno).
  revalidatePath("/api/resumo");
  revalidatePath("/embed");
  revalidatePath("/llms.txt");
  revalidatePath("/opengraph-image");
  await gravarSnapshot("aprovacao");
  await pingIndexNow([
    "/",
    "/historico",
    "/pesquisas",
    ...(slugAfetado ? [`/pesquisas/${slugAfetado}`] : []),
  ]);
}

/* ------------------------------------------------------------------ *
 * Aprovar                                                            *
 * ------------------------------------------------------------------ */

export async function aprovarPesquisa(id: string): Promise<ResultadoAcao> {
  try {
    const admin = await exigirAdmin();
    const idOk = esquemaId.safeParse(id);
    if (!idOk.success) return { ok: false, erro: "Identificador inválido." };

    const supabase = exigirClienteAdmin();
    const { data, error } = await supabase
      .from("pesquisas")
      .update({
        status: "publicada",
        publicado_em: new Date().toISOString(),
        publicado_por: admin.email,
      })
      .eq("id", idOk.data)
      .eq("status", "pendente")
      .select(COLUNAS_AUDIT)
      .maybeSingle<LinhaAudit>();

    if (error) throw new Error(error.message);
    if (!data) return { ok: false, erro: "Pesquisa não encontrada ou já processada." };

    await registrarAuditoria({
      ator: admin.email,
      acao: "aprovacao",
      entidade: "pesquisa",
      entidadeId: data.id,
      detalhes: detalhesPublicaveis(data),
    });

    await serieMudou(slugPesquisa(data.instituto_id, data.campo_fim));
    return { ok: true, mensagem: "Pesquisa publicada na série oficial." };
  } catch (erro) {
    return falha(erro, "Não foi possível aprovar a pesquisa.");
  }
}

/* ------------------------------------------------------------------ *
 * Rejeitar                                                           *
 * ------------------------------------------------------------------ */

export async function rejeitarPesquisa(id: string, motivo?: string): Promise<ResultadoAcao> {
  try {
    const admin = await exigirAdmin();
    const idOk = esquemaId.safeParse(id);
    if (!idOk.success) return { ok: false, erro: "Identificador inválido." };
    const motivoOk = esquemaMotivo.safeParse(motivo ?? null);

    const supabase = exigirClienteAdmin();
    const { data, error } = await supabase
      .from("pesquisas")
      .update({ status: "rejeitada" })
      .eq("id", idOk.data)
      .eq("status", "pendente")
      .select(COLUNAS_AUDIT)
      .maybeSingle<LinhaAudit>();

    if (error) throw new Error(error.message);
    if (!data) return { ok: false, erro: "Pesquisa não encontrada ou já processada." };

    await registrarAuditoria({
      ator: admin.email,
      acao: "rejeicao",
      entidade: "pesquisa",
      entidadeId: data.id,
      detalhes: {
        ...detalhesPublicaveis(data),
        motivo: motivoOk.success ? motivoOk.data : null,
      },
    });

    // Rejeitar não muda a série publicada: revalida só o painel.
    revalidatePath("/admin");
    return { ok: true, mensagem: "Pesquisa rejeitada." };
  } catch (erro) {
    return falha(erro, "Não foi possível rejeitar a pesquisa.");
  }
}

/* ------------------------------------------------------------------ *
 * Inclusão manual                                                    *
 * ------------------------------------------------------------------ */

function valorDoForm(form: FormData | EntradaManual, campo: string): unknown {
  if (typeof FormData !== "undefined" && form instanceof FormData) {
    const v = form.get(campo);
    return typeof v === "string" ? v : null;
  }
  return (form as Record<string, unknown>)[campo] ?? null;
}

type ClienteAdmin = ReturnType<typeof exigirClienteAdmin>;

/** Contexto do funil para entrada HUMANA: o passado pode ser lançado (DATA_MINIMA). */
async function contextoAdmin(supabase: ClienteAdmin): Promise<ContextoBusca> {
  const [institutos, existentes] = await Promise.all([
    supabase.from("institutos").select("id,nome,aliases").returns<InstitutoConhecido[]>(),
    supabase
      .from("pesquisas")
      .select("instituto_id,campo_fim")
      .in("status", ["publicada", "pendente"])
      .returns<{ instituto_id: string; campo_fim: string }[]>(),
  ]);
  if (institutos.error) throw new Error(institutos.error.message);
  if (existentes.error) throw new Error(existentes.error.message);
  return {
    institutos: (institutos.data ?? []).map((i) => ({
      id: i.id,
      nome: i.nome,
      aliases: i.aliases ?? [],
    })),
    existentes: (existentes.data ?? []).map((p) => `${p.instituto_id}|${p.campo_fim}`),
    // O admin pode incluir uma rodada antiga que faltava: a janela de busca
    // existe para conter a IA, não o humano.
    ultimoFim: DATA_MINIMA,
    hoje: hojeSaoPaulo(),
  };
}

/**
 * Grava UMA pesquisa já aprovada pelo funil como `publicada` (origem admin).
 * Chave ocupada por linha REJEITADA (o robô achou com número errado e o admin
 * recusou) é reaproveitada com os números conferidos — antes, a única saída era
 * mexer no banco à mão. Publicada ou pendente continua barrando.
 */
async function gravarPublicada(
  supabase: ClienteAdmin,
  aceita: PesquisaAceita,
  email: string,
  bruto: Record<string, unknown> | null,
): Promise<{ linha: LinhaAudit } | { erro: string }> {
  if (aceita.institutoNovo) {
    const { error } = await supabase
      .from("institutos")
      .upsert(
        { id: aceita.institutoId, nome: aceita.institutoNome, aliases: [] },
        { onConflict: "id" },
      );
    if (error) throw new Error(error.message);
  }
  const linha = {
    instituto_id: aceita.institutoId,
    contratante: aceita.contratante,
    campo_inicio: aceita.inicio,
    campo_fim: aceita.fim,
    amostra: aceita.n,
    moe: aceita.moe,
    tse: aceita.tse,
    t1_lula: aceita.l1,
    t1_flavio: aceita.f1,
    t1_bnns: aceita.bn1,
    t2_lula: aceita.l2,
    t2_flavio: aceita.f2,
    t2_bnns: aceita.bn2,
    fonte_url: aceita.fonte,
    status: "publicada" as const,
    origem: "admin" as const,
    bruto,
    publicado_em: new Date().toISOString(),
    publicado_por: email,
  };
  const inserida = await supabase
    .from("pesquisas")
    .insert(linha)
    .select(COLUNAS_AUDIT)
    .maybeSingle<LinhaAudit>();
  if (!inserida.error) {
    return inserida.data
      ? { linha: inserida.data }
      : { erro: "Não foi possível gravar a pesquisa." };
  }
  if (inserida.error.code !== "23505") throw new Error(inserida.error.message);
  const regravada = await supabase
    .from("pesquisas")
    .update(linha)
    .eq("instituto_id", aceita.institutoId)
    .eq("campo_fim", aceita.fim)
    .eq("status", "rejeitada")
    .select(COLUNAS_AUDIT)
    .maybeSingle<LinhaAudit>();
  if (regravada.error) throw new Error(regravada.error.message);
  return regravada.data
    ? { linha: regravada.data }
    : { erro: "Já existe uma rodada deste instituto nesta data." };
}

/**
 * Inclusão consciente do admin: entra direto como `publicada` (origem
 * `admin`), mas passa pelo mesmo funil de sanidade do coletor.
 *
 * Aceita `FormData` (uso com `<form action={...}>`) ou objeto simples.
 */
export async function incluirManual(form: FormData | EntradaManual): Promise<ResultadoAcao> {
  try {
    const admin = await exigirAdmin();
    const supabase = exigirClienteAdmin();

    const fim = valorDoForm(form, "fim");
    const inicioBruto = valorDoForm(form, "inicio");
    const item: Record<string, unknown> = {
      instituto: valorDoForm(form, "instituto"),
      contratante: valorDoForm(form, "contratante"),
      inicio: inicioBruto === null || inicioBruto === "" ? fim : inicioBruto,
      fim,
      n: valorDoForm(form, "n"),
      moe: valorDoForm(form, "moe"),
      tse: valorDoForm(form, "tse"),
      l1: valorDoForm(form, "l1"),
      f1: valorDoForm(form, "f1"),
      bn1: valorDoForm(form, "bnns1"),
      l2: valorDoForm(form, "l2"),
      f2: valorDoForm(form, "f2"),
      bn2: valorDoForm(form, "bnns2"),
      fonte: valorDoForm(form, "fonte"),
    };

    const ctx = await contextoAdmin(supabase);

    const { aceitas, rejeitadas } = processarRespostaIA(JSON.stringify([item]), ctx);
    const aceita = aceitas[0];
    if (!aceita) {
      return { ok: false, erro: rejeitadas[0]?.motivo ?? "Dados inválidos." };
    }

    const gravada = await gravarPublicada(supabase, aceita, admin.email, null);
    if ("erro" in gravada) return { ok: false, erro: gravada.erro };
    const data = gravada.linha;

    await registrarAuditoria({
      ator: admin.email,
      acao: "inclusao_manual",
      entidade: "pesquisa",
      entidadeId: data.id,
      detalhes: {
        ...detalhesPublicaveis(data),
        instituto_novo: aceita.institutoNovo,
      },
    });

    await serieMudou(slugPesquisa(data.instituto_id, data.campo_fim));
    return { ok: true, mensagem: `Pesquisa de ${aceita.institutoNome} incluída na série.` };
  } catch (erro) {
    return falha(erro, "Não foi possível incluir a pesquisa.");
  }
}

/* ------------------------------------------------------------------ *
 * Importação em lote (2º turno, out/2026)                            *
 * ------------------------------------------------------------------ */

/** Teto do lote: uma leva verificada de um mês cabe com folga. */
const MAX_LOTE = 150;

export interface LinhaPreviaLote {
  instituto: string;
  fim: string;
  l2: number;
  f2: number;
  bn2: number | null;
  temT1: boolean;
  avisos: string[];
}

export type ResultadoLote =
  | { ok: true; aceitas: LinhaPreviaLote[]; rejeitadas: Rejeicao[]; mensagem?: string }
  | { ok: false; erro: string };

/** `outros1` do lote: nome → % (0–100), no máximo 20 nomes. O resto é descartado. */
function outros1DoItem(bruto: Record<string, unknown>): Record<string, number> | null {
  const alvo = bruto.outros1;
  if (!alvo || typeof alvo !== "object" || Array.isArray(alvo)) return null;
  const saida: Record<string, number> = {};
  for (const [nome, v] of Object.entries(alvo as Record<string, unknown>).slice(0, 20)) {
    const limpo = nome.replace(/\p{C}/gu, " ").replace(/\s+/g, " ").trim();
    if (limpo.length < 2 || limpo.length > 60) continue;
    if (typeof v === "number" && Number.isFinite(v) && v >= 0 && v <= 100) saida[limpo] = v;
  }
  return Object.keys(saida).length ? saida : null;
}

async function processarLote(texto: unknown) {
  if (typeof texto !== "string" || texto.length > 400_000) {
    return { erro: "Cole um array JSON (até 400 mil caracteres)." } as const;
  }
  const supabase = exigirClienteAdmin();
  const ctx = await contextoAdmin(supabase);
  const r = processarRespostaIA(texto, ctx, MAX_LOTE);
  if (r.falhaLeitura) return { erro: `Não deu para ler o lote: ${r.falhaLeitura}.` } as const;
  return { supabase, r } as const;
}

const paraPrevia = (a: PesquisaAceita): LinhaPreviaLote => ({
  instituto: a.institutoNome,
  fim: a.fim,
  l2: a.l2,
  f2: a.f2,
  bn2: a.bn2,
  temT1: a.l1 !== null && a.f1 !== null,
  avisos: Array.isArray(a.bruto._avisos) ? (a.bruto._avisos as string[]) : [],
});

/** Prévia do lote: o MESMO funil do robô e da inclusão manual, sem gravar nada. */
export async function previaLote(texto: unknown): Promise<ResultadoLote> {
  try {
    await exigirAdmin();
    const p = await processarLote(texto);
    if ("erro" in p) return { ok: false, erro: p.erro as string };
    return { ok: true, aceitas: p.r.aceitas.map(paraPrevia), rejeitadas: p.r.rejeitadas };
  } catch (erro) {
    return falha(erro, "Não foi possível analisar o lote.");
  }
}

/**
 * Publica o lote. O texto é processado DE NOVO no servidor (a prévia do cliente
 * não é confiável) e cada pesquisa vira uma linha publicada + uma linha
 * `inclusao_manual` no audit_log. `serieMudou` roda uma vez só, no fim.
 */
export async function publicarLote(texto: unknown): Promise<ResultadoLote> {
  try {
    const admin = await exigirAdmin();
    const p = await processarLote(texto);
    if ("erro" in p) return { ok: false, erro: p.erro as string };
    const publicadas: LinhaPreviaLote[] = [];
    const rejeitadas: Rejeicao[] = [...p.r.rejeitadas];
    for (const aceita of p.r.aceitas) {
      const outros1 = outros1DoItem(aceita.bruto);
      const gravada = await gravarPublicada(
        p.supabase,
        aceita,
        admin.email,
        outros1 ? { carga: "lote", outros1 } : { carga: "lote" },
      );
      if ("erro" in gravada) {
        rejeitadas.push({ instituto: aceita.institutoNome, fim: aceita.fim, motivo: gravada.erro });
        continue;
      }
      await registrarAuditoria({
        ator: admin.email,
        acao: "inclusao_manual",
        entidade: "pesquisa",
        entidadeId: gravada.linha.id,
        detalhes: {
          ...detalhesPublicaveis(gravada.linha),
          instituto_novo: aceita.institutoNovo,
          lote: true,
        },
      });
      publicadas.push(paraPrevia(aceita));
    }
    if (publicadas.length) await serieMudou();
    return {
      ok: true,
      aceitas: publicadas,
      rejeitadas,
      mensagem: `${publicadas.length} pesquisa(s) publicada(s); ${rejeitadas.length} recusada(s).`,
    };
  } catch (erro) {
    return falha(erro, "Não foi possível publicar o lote.");
  }
}

/* ------------------------------------------------------------------ *
 * Remoção                                                            *
 * ------------------------------------------------------------------ */

/**
 * Remove uma pesquisa. Pendente → remoção lógica (`rejeitada`). Publicada →
 * delete de verdade, com o registro completo preservado no `audit_log`
 * (menos `bruto`), para que a série continue auditável depois da remoção.
 */
export async function removerPesquisa(id: string, motivo?: string): Promise<ResultadoAcao> {
  try {
    const admin = await exigirAdmin();
    const idOk = esquemaId.safeParse(id);
    if (!idOk.success) return { ok: false, erro: "Identificador inválido." };
    const motivoOk = esquemaMotivo.safeParse(motivo ?? null);
    const motivoLimpo = motivoOk.success ? motivoOk.data : null;

    const supabase = exigirClienteAdmin();
    const { data: atual, error: erroLeitura } = await supabase
      .from("pesquisas")
      .select(COLUNAS_AUDIT)
      .eq("id", idOk.data)
      .maybeSingle<LinhaAudit>();

    if (erroLeitura) throw new Error(erroLeitura.message);
    if (!atual) return { ok: false, erro: "Pesquisa não encontrada." };

    if (atual.status === "publicada") {
      const { error } = await supabase.from("pesquisas").delete().eq("id", atual.id);
      if (error) throw new Error(error.message);

      await registrarAuditoria({
        ator: admin.email,
        acao: "remocao",
        entidade: "pesquisa",
        entidadeId: atual.id,
        detalhes: { tipo: "definitiva", motivo: motivoLimpo, registro: detalhesPublicaveis(atual) },
      });

      await serieMudou(slugPesquisa(atual.instituto_id, atual.campo_fim));
      return {
        ok: true,
        mensagem: "Pesquisa removida da série (registro preservado na auditoria).",
      };
    }

    const { error } = await supabase
      .from("pesquisas")
      .update({ status: "rejeitada" })
      .eq("id", atual.id)
      .eq("status", "pendente");
    if (error) throw new Error(error.message);

    await registrarAuditoria({
      ator: admin.email,
      acao: "remocao",
      entidade: "pesquisa",
      entidadeId: atual.id,
      detalhes: { tipo: "logica", motivo: motivoLimpo, registro: detalhesPublicaveis(atual) },
    });

    revalidatePath("/admin");
    return { ok: true, mensagem: "Pesquisa descartada da fila." };
  } catch (erro) {
    return falha(erro, "Não foi possível remover a pesquisa.");
  }
}

/* ------------------------------------------------------------------ *
 * Disparo manual do coletor                                          *
 * ------------------------------------------------------------------ */

/** Custo por chamada é real (IA + busca): trava simples contra spam de cliques. */
let ultimoDisparo = 0;
const INTERVALO_MINIMO_MS = 60_000;

export async function dispararAtualizacao(): Promise<ResultadoAtualizacao> {
  try {
    const admin = await exigirAdmin();

    const agora = Date.now();
    if (agora - ultimoDisparo < INTERVALO_MINIMO_MS) {
      const faltam = Math.ceil((INTERVALO_MINIMO_MS - (agora - ultimoDisparo)) / 1000);
      return { ok: false, erro: `Aguarde ${faltam}s antes de buscar de novo.` };
    }
    ultimoDisparo = agora;

    const resumo = await rodarUpdater(admin.email);
    revalidatePath("/admin");

    if (resumo.erro) return { ok: false, erro: resumo.erro };

    const mensagem = resumo.inseridas
      ? `${resumo.inseridas} pesquisa(s) nova(s) na fila de aprovação.`
      : resumo.encontradas
        ? `A busca achou ${resumo.encontradas} rodada(s), mas nenhuma entrou — veja os motivos abaixo.`
        : "A busca não achou nenhuma rodada no período.";
    return { ok: true, mensagem, resumo };
  } catch (erro) {
    return falha(erro, "Não foi possível executar a busca.");
  }
}

/* ------------------------------------------------------------------ *
 * Reconstituição retroativa do /historico                            *
 * ------------------------------------------------------------------ */

/**
 * Apaga e regrava APENAS os pontos `retroativo` da série de chance —
 * retratos registrados no dia nunca são tocados. Idempotente e sem custo de
 * IA, então não precisa de cooldown. Usar sempre que uma pesquisa ANTIGA
 * entrar na série: o tracejado fica desatualizado até esta ação rodar.
 */
export async function reconstituirHistorico(): Promise<ResultadoAcao> {
  try {
    const admin = await exigirAdmin();
    const resumo = await executarReconstituicao(admin.email);
    if (!resumo.ok) {
      return { ok: false, erro: resumo.motivo ?? "Não foi possível reconstituir o histórico." };
    }
    revalidatePath("/historico");
    return {
      ok: true,
      mensagem: `${resumo.inseridos} pontos recalculados (${resumo.de} a ${resumo.ate}); ${resumo.apagados} anteriores substituídos.`,
    };
  } catch (erro) {
    return falha(erro, "Não foi possível reconstituir o histórico.");
  }
}
