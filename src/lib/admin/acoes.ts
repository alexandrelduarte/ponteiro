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
      fonte: valorDoForm(form, "fonte"),
    };

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

    const ctx: ContextoBusca = {
      institutos: (institutos.data ?? []).map((i) => ({
        id: i.id,
        nome: i.nome,
        aliases: i.aliases ?? [],
      })),
      existentes: (existentes.data ?? []).map((p) => `${p.instituto_id}|${p.campo_fim}`),
      // O admin pode incluir uma rodada antiga que faltava: a regra "não pode
      // ser anterior à última da série" existe para conter a IA, não o humano.
      ultimoFim: DATA_MINIMA,
      hoje: hojeSaoPaulo(),
    };

    const { aceitas, rejeitadas } = processarRespostaIA(JSON.stringify([item]), ctx);
    const aceita = aceitas[0];
    if (!aceita) {
      return { ok: false, erro: rejeitadas[0]?.motivo ?? "Dados inválidos." };
    }

    if (aceita.institutoNovo) {
      const { error } = await supabase
        .from("institutos")
        .upsert(
          { id: aceita.institutoId, nome: aceita.institutoNome, aliases: [] },
          { onConflict: "id" },
        );
      if (error) throw new Error(error.message);
    }

    const agora = new Date().toISOString();
    const { data, error } = await supabase
      .from("pesquisas")
      .insert({
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
        t2_bnns: null,
        fonte_url: aceita.fonte,
        status: "publicada",
        origem: "admin",
        bruto: null,
        publicado_em: agora,
        publicado_por: admin.email,
      })
      .select(COLUNAS_AUDIT)
      .maybeSingle<LinhaAudit>();

    if (error) {
      if (error.code === "23505") {
        return { ok: false, erro: "Já existe uma rodada deste instituto nesta data." };
      }
      throw new Error(error.message);
    }
    if (!data) return { ok: false, erro: "Não foi possível gravar a pesquisa." };

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
      : "Nenhuma rodada nova encontrada — a série já está em dia.";
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
