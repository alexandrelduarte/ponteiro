/**
 * Coletor automático de pesquisas (server-only).
 *
 * MODELO DE AMEAÇA — a resposta da IA é ENTRADA HOSTIL. Ela pode conter
 * instruções ("ignore as regras acima"), números inventados, URLs
 * `javascript:`, datas impossíveis, nomes com caracteres de controle/bidi,
 * chaves extras e payloads gigantes. Nada dela é executado, interpolado em
 * SQL ou renderizado sem passar por `processarRespostaIA`:
 *
 *   texto → extrai array JSON → Zod estrito → sanidade → normalização →
 *   dedup → INSERT como `status='pendente'` (R3: só humano publica).
 *
 * O item cru vai para `pesquisas.bruto` apenas como registro forense; a
 * camada de dados nunca o lê para pesquisas de origem `auto`.
 */
import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { montarPromptBusca } from "@/data/constantes";
import { criarClienteAdmin, registrarAuditoria } from "@/lib/supabase/admin";

/* ------------------------------------------------------------------ *
 * Limites — tudo que vem de fora é limitado antes de ser processado.  *
 * ------------------------------------------------------------------ */

const MAX_TEXTO = 200_000;
const MAX_ITENS = 12;
const MAX_BRUTO = 8_000;
const MAX_URL = 500;
/** Data mínima aceitável — protege contra "1970-01-01" e afins. */
export const DATA_MINIMA = "2025-01-01";

/* ------------------------------------------------------------------ *
 * Tipos                                                              *
 * ------------------------------------------------------------------ */

export interface InstitutoConhecido {
  id: string;
  nome: string;
  aliases: string[];
}

export interface ContextoBusca {
  /** Institutos já cadastrados, para normalizar o nome vindo da IA. */
  institutos: InstitutoConhecido[];
  /** Chaves `instituto_id|campo_fim` já existentes (publicadas E pendentes). */
  existentes: string[];
  /** `campo_fim` da pesquisa mais recente já na série (AAAA-MM-DD). */
  ultimoFim: string;
  /** Hoje em America/Sao_Paulo (AAAA-MM-DD). */
  hoje: string;
}

export interface PesquisaAceita {
  institutoId: string;
  institutoNome: string;
  institutoNovo: boolean;
  contratante: string | null;
  inicio: string;
  fim: string;
  n: number | null;
  moe: number | null;
  tse: string | null;
  l1: number | null;
  f1: number | null;
  bn1: number | null;
  l2: number;
  f2: number;
  fonte: string;
  /** Item cru da IA, para forense. */
  bruto: Record<string, unknown>;
}

export interface Rejeicao {
  motivo: string;
  instituto?: string;
  fim?: string;
}

export interface ResultadoProcessamento {
  encontradas: number;
  aceitas: PesquisaAceita[];
  rejeitadas: Rejeicao[];
}

export interface ResumoUpdater {
  encontradas: number;
  inseridas: number;
  rejeitadas: Rejeicao[];
  institutosNovos: string[];
  /** Preenchido quando o coletor nem chegou a rodar (config/rede). */
  erro?: string;
}

/* ------------------------------------------------------------------ *
 * Utilitários de texto e data                                        *
 * ------------------------------------------------------------------ */

/** Remove controles, formatadores (inclui bidi) e colapsa espaços. */
function limparTexto(s: string): string {
  return s.replace(/\p{C}/gu, " ").replace(/\s+/g, " ").trim();
}

/** Data de hoje no fuso oficial do produto (America/Sao_Paulo). */
export function hojeSaoPaulo(agora: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(agora);
}

/** `true` só para AAAA-MM-DD que existe de verdade no calendário. */
export function dataValida(s: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const [a, m, d] = s.split("-").map(Number);
  const dt = new Date(Date.UTC(a, m - 1, d));
  return dt.getUTCFullYear() === a && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
}

/** Slug estável para instituto novo. String vazia = nome inutilizável. */
export function slugInstituto(nome: string): string {
  return nome
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40)
    .replace(/-+$/g, "");
}

/** Chave de comparação de nomes de instituto (acento/pontuação/caixa). */
function chaveInstituto(nome: string): string {
  return nome
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/** URL de fonte aceitável: https, host com ponto, sem credenciais embutidas. */
function urlSegura(bruta: string): string | null {
  if (bruta.length > MAX_URL) return null;
  let u: URL;
  try {
    u = new URL(bruta);
  } catch {
    return null;
  }
  if (u.protocol !== "https:") return null;
  if (u.username || u.password) return null;
  if (!u.hostname.includes(".") || u.hostname.endsWith(".")) return null;
  return u.toString();
}

/* ------------------------------------------------------------------ *
 * Schema Zod estrito                                                 *
 * ------------------------------------------------------------------ */

/** Aceita número, ou string que é *só* um literal numérico. Nunca "1e9"/"0x". */
function paraNumero(v: unknown): unknown {
  if (v === undefined || v === null || v === "") return null;
  if (typeof v === "string") {
    const t = v.trim().replace(",", ".");
    return /^-?\d+(\.\d+)?$/.test(t) ? Number(t) : v;
  }
  return v;
}

function numeroOpcional(min: number, max: number, inteiro = false) {
  const base = inteiro ? z.number().int().min(min).max(max) : z.number().min(min).max(max);
  return z.preprocess(paraNumero, base.nullable());
}

function numeroObrigatorio(min: number, max: number) {
  return z.preprocess(paraNumero, z.number().min(min).max(max));
}

function textoOpcional(max: number) {
  return z.preprocess(
    (v) => (v === undefined || v === null ? null : v),
    z
      .string()
      .max(max * 4)
      .transform(limparTexto)
      .refine((s) => s.length <= max, `use até ${max} caracteres`)
      .transform((s) => (s.length ? s : null))
      .nullable(),
  );
}

const esquemaItem = z.object({
  instituto: z
    .string()
    .max(240)
    .transform(limparTexto)
    .refine((s) => s.length >= 2 && s.length <= 60, "instituto: use entre 2 e 60 caracteres"),
  inicio: z.string().max(10).refine(dataValida, "inicio: data inválida"),
  fim: z.string().max(10).refine(dataValida, "fim: data inválida"),
  n: numeroOpcional(300, 50_000, true),
  moe: numeroOpcional(0.3, 6),
  tse: textoOpcional(60),
  contratante: textoOpcional(120),
  l1: numeroOpcional(0, 100),
  f1: numeroOpcional(0, 100),
  bn1: numeroOpcional(0, 100),
  // Faixa ampla no schema; a sanidade eleitoral (20–70) é checada depois,
  // para que "99" produza um motivo de rejeição legível.
  l2: numeroObrigatorio(-1_000, 1_000),
  f2: numeroObrigatorio(-1_000, 1_000),
  fonte: z.string().max(MAX_URL),
});

/* ------------------------------------------------------------------ *
 * Extração do array JSON                                             *
 * ------------------------------------------------------------------ */

/** Recorta o primeiro array JSON do texto da IA. `null` quando não há. */
export function extrairArrayJSON(texto: string): unknown[] | null {
  const limpo = texto
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();
  const ini = limpo.indexOf("[");
  const fim = limpo.lastIndexOf("]");
  if (ini < 0 || fim <= ini) return null;
  try {
    const valor: unknown = JSON.parse(limpo.slice(ini, fim + 1));
    return Array.isArray(valor) ? valor : null;
  } catch {
    return null;
  }
}

/* ------------------------------------------------------------------ *
 * Núcleo puro — testável sem rede                                    *
 * ------------------------------------------------------------------ */

/**
 * Converte o texto bruto da IA em pesquisas aceitáveis + motivos de rejeição.
 * Função pura: não toca em rede, banco nem relógio (o "hoje" vem do contexto).
 */
export function processarRespostaIA(texto: unknown, ctx: ContextoBusca): ResultadoProcessamento {
  const vazio = (motivo: string): ResultadoProcessamento => ({
    encontradas: 0,
    aceitas: [],
    rejeitadas: [{ motivo }],
  });

  if (typeof texto !== "string" || texto.trim().length === 0) {
    return vazio("resposta vazia da IA");
  }
  if (texto.length > MAX_TEXTO) {
    return vazio("resposta grande demais — descartada sem processar");
  }

  const itens = extrairArrayJSON(texto);
  if (itens === null) return vazio("resposta sem array JSON válido");
  if (itens.length === 0) return { encontradas: 0, aceitas: [], rejeitadas: [] };

  const rejeitadas: Rejeicao[] = [];
  const aceitas: PesquisaAceita[] = [];

  const candidatos = itens.slice(0, MAX_ITENS);
  if (itens.length > MAX_ITENS) {
    rejeitadas.push({
      motivo: `resposta trouxe ${itens.length} itens; só os ${MAX_ITENS} primeiros foram analisados`,
    });
  }

  // Índice de normalização: nome canônico e apelidos → instituto.
  const porChave = new Map<string, InstitutoConhecido>();
  const porId = new Map<string, InstitutoConhecido>();
  for (const inst of ctx.institutos) {
    porId.set(inst.id, inst);
    porChave.set(chaveInstituto(inst.nome), inst);
    for (const alias of inst.aliases ?? []) porChave.set(chaveInstituto(alias), inst);
  }

  const vistos = new Set<string>(ctx.existentes);
  const ultimoFim = dataValida(ctx.ultimoFim) ? ctx.ultimoFim : DATA_MINIMA;
  const hoje = dataValida(ctx.hoje) ? ctx.hoje : hojeSaoPaulo();
  const novos = new Map<string, string>();

  for (const item of candidatos) {
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      rejeitadas.push({ motivo: "item não é um objeto JSON" });
      continue;
    }

    // O item cru é re-serializado antes de virar `bruto`: além de limitar o
    // tamanho, isso remove bytes NUL, que o Postgres recusa em jsonb e faria o
    // INSERT falhar (negação de serviço barata para quem controla a resposta).
    let bruto: Record<string, unknown>;
    try {
      const texto = JSON.stringify(item);
      if (texto.length > MAX_BRUTO) {
        rejeitadas.push({ motivo: "item grande demais para registro forense" });
        continue;
      }
      bruto = JSON.parse(texto.replace(/\\u0000/g, "")) as Record<string, unknown>;
    } catch {
      rejeitadas.push({ motivo: "item não serializável" });
      continue;
    }

    const analisado = esquemaItem.safeParse(item);
    if (!analisado.success) {
      const issue = analisado.error.issues[0];
      const campo = issue?.path?.join(".") || "item";
      rejeitadas.push({ motivo: `schema: ${campo} — ${issue?.message ?? "inválido"}` });
      continue;
    }
    const q = analisado.data;
    const rotulo = { instituto: q.instituto, fim: q.fim };

    // --- sanidade eleitoral -------------------------------------------------
    if (q.l2 < 20 || q.l2 > 70 || q.f2 < 20 || q.f2 > 70) {
      rejeitadas.push({ ...rotulo, motivo: "2º turno fora da faixa plausível (20–70)" });
      continue;
    }
    if (q.l1 !== null && q.f1 !== null && q.l1 + q.f1 > 100) {
      rejeitadas.push({ ...rotulo, motivo: "1º turno soma mais de 100 p.p." });
      continue;
    }

    // --- sanidade temporal --------------------------------------------------
    if (q.inicio > q.fim) {
      rejeitadas.push({ ...rotulo, motivo: "campo começa depois de terminar" });
      continue;
    }
    if (q.fim > hoje) {
      rejeitadas.push({ ...rotulo, motivo: `campo_fim no futuro (hoje é ${hoje})` });
      continue;
    }
    if (q.fim < ultimoFim) {
      rejeitadas.push({
        ...rotulo,
        motivo: `campo_fim anterior à última pesquisa da série (${ultimoFim})`,
      });
      continue;
    }
    if (q.inicio < DATA_MINIMA) {
      rejeitadas.push({ ...rotulo, motivo: `campo_inicio anterior a ${DATA_MINIMA}` });
      continue;
    }

    // --- fonte --------------------------------------------------------------
    const fonte = urlSegura(q.fonte);
    if (!fonte) {
      rejeitadas.push({ ...rotulo, motivo: "fonte não é uma URL https válida" });
      continue;
    }

    // --- instituto ----------------------------------------------------------
    const conhecido = porChave.get(chaveInstituto(q.instituto));
    let institutoId: string;
    let institutoNome: string;
    let institutoNovo = false;

    if (conhecido) {
      institutoId = conhecido.id;
      institutoNome = conhecido.nome;
    } else {
      const slug = slugInstituto(q.instituto);
      if (!slug) {
        rejeitadas.push({ ...rotulo, motivo: "nome de instituto inutilizável" });
        continue;
      }
      const mesmoId = porId.get(slug);
      if (mesmoId) {
        institutoId = mesmoId.id;
        institutoNome = mesmoId.nome;
      } else {
        institutoId = slug;
        institutoNome = q.instituto;
        institutoNovo = !novos.has(slug);
        novos.set(slug, q.instituto);
      }
    }

    // --- dedup --------------------------------------------------------------
    const chave = `${institutoId}|${q.fim}`;
    if (vistos.has(chave)) {
      rejeitadas.push({
        ...rotulo,
        motivo: "duplicata: já existe rodada deste instituto nesta data",
      });
      continue;
    }
    vistos.add(chave);

    aceitas.push({
      institutoId,
      institutoNome,
      institutoNovo,
      contratante: q.contratante,
      inicio: q.inicio,
      fim: q.fim,
      n: q.n,
      moe: q.moe,
      tse: q.tse,
      l1: q.l1,
      f1: q.f1,
      bn1: q.bn1,
      l2: q.l2,
      f2: q.f2,
      fonte,
      bruto,
    });
  }

  return { encontradas: candidatos.length, aceitas, rejeitadas };
}

/* ------------------------------------------------------------------ *
 * Chamada à IA                                                       *
 * ------------------------------------------------------------------ */

/** Junta só os blocos de texto da resposta — nada mais é interpretado. */
function textoDaResposta(blocos: Anthropic.ContentBlock[]): string {
  return blocos
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("\n");
}

async function buscarNaWeb(desde: string): Promise<string> {
  const cliente = new Anthropic({ timeout: 240_000, maxRetries: 1 });
  const resposta = await cliente.messages.create({
    model: process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-6",
    max_tokens: 2000,
    messages: [{ role: "user", content: montarPromptBusca(desde) }],
    tools: [{ type: "web_search_20250305", name: "web_search", max_uses: 8 }],
  });
  return textoDaResposta(resposta.content);
}

/* ------------------------------------------------------------------ *
 * Orquestração (rede + banco)                                        *
 * ------------------------------------------------------------------ */

async function carregarContexto(
  supabase: NonNullable<ReturnType<typeof criarClienteAdmin>>,
): Promise<ContextoBusca> {
  const [institutos, existentes, ultima] = await Promise.all([
    supabase.from("institutos").select("id,nome,aliases").returns<InstitutoConhecido[]>(),
    supabase
      .from("pesquisas")
      .select("instituto_id,campo_fim")
      .in("status", ["publicada", "pendente"])
      .returns<{ instituto_id: string; campo_fim: string }[]>(),
    supabase
      .from("pesquisas")
      .select("campo_fim")
      .eq("status", "publicada")
      .order("campo_fim", { ascending: false })
      .limit(1)
      .returns<{ campo_fim: string }[]>(),
  ]);

  if (institutos.error) throw new Error(`institutos: ${institutos.error.message}`);
  if (existentes.error) throw new Error(`pesquisas: ${existentes.error.message}`);
  if (ultima.error) throw new Error(`última pesquisa: ${ultima.error.message}`);

  const fimBanco = ultima.data?.[0]?.campo_fim;
  return {
    institutos: (institutos.data ?? []).map((i) => ({
      id: i.id,
      nome: i.nome,
      aliases: i.aliases ?? [],
    })),
    existentes: (existentes.data ?? []).map((p) => `${p.instituto_id}|${p.campo_fim}`),
    ultimoFim: fimBanco && dataValida(fimBanco) ? fimBanco : DATA_MINIMA,
    hoje: hojeSaoPaulo(),
  };
}

/**
 * Executa uma rodada completa do coletor: busca, valida, deduplica e insere
 * como `pendente`. Nunca publica nada (R3) e nunca lança — devolve o resumo.
 *
 * @param ator quem disparou (`'cron'` ou o e-mail do admin) — vai no audit_log.
 */
export async function rodarUpdater(ator = "cron"): Promise<ResumoUpdater> {
  const base: ResumoUpdater = {
    encontradas: 0,
    inseridas: 0,
    rejeitadas: [],
    institutosNovos: [],
  };

  if (!process.env.ANTHROPIC_API_KEY) {
    return { ...base, erro: "coletor indisponível: falta configuração da IA" };
  }
  const supabase = criarClienteAdmin();
  if (!supabase) {
    return { ...base, erro: "coletor indisponível: banco não configurado" };
  }

  let ctx: ContextoBusca;
  try {
    ctx = await carregarContexto(supabase);
  } catch (erro) {
    console.error("[updater] falha ao carregar contexto:", erro);
    return { ...base, erro: "coletor indisponível: falha ao ler a série atual" };
  }

  let texto: string;
  try {
    texto = await buscarNaWeb(ctx.ultimoFim);
  } catch (erro) {
    console.error("[updater] falha na busca:", erro);
    return { ...base, erro: "falha na busca automática" };
  }

  const { encontradas, aceitas, rejeitadas } = processarRespostaIA(texto, ctx);
  const resumo: ResumoUpdater = { ...base, encontradas, rejeitadas: [...rejeitadas] };

  for (const p of aceitas) {
    try {
      if (p.institutoNovo) {
        const { error } = await supabase
          .from("institutos")
          .upsert({ id: p.institutoId, nome: p.institutoNome, aliases: [] }, { onConflict: "id" });
        if (error) throw new Error(`instituto: ${error.message}`);
        resumo.institutosNovos.push(p.institutoId);
      }

      const { data, error } = await supabase
        .from("pesquisas")
        .insert({
          instituto_id: p.institutoId,
          contratante: p.contratante,
          campo_inicio: p.inicio,
          campo_fim: p.fim,
          amostra: p.n,
          moe: p.moe,
          tse: p.tse,
          t1_lula: p.l1,
          t1_flavio: p.f1,
          t1_bnns: p.bn1,
          t2_lula: p.l2,
          t2_flavio: p.f2,
          t2_bnns: null,
          fonte_url: p.fonte,
          status: "pendente",
          origem: "auto",
          bruto: p.bruto,
        })
        .select("id")
        .single();

      if (error) {
        // 23505 = violação da unique (instituto_id, campo_fim): corrida com
        // outra execução. Não é erro operacional, é dedup.
        const dup = error.code === "23505";
        resumo.rejeitadas.push({
          instituto: p.institutoNome,
          fim: p.fim,
          motivo: dup ? "duplicata detectada na inserção" : "falha ao inserir no banco",
        });
        if (!dup) console.error("[updater] insert falhou:", error.message);
        continue;
      }

      resumo.inseridas += 1;
      await registrarAuditoria({
        ator,
        acao: "auto_insercao",
        entidade: "pesquisa",
        entidadeId: data?.id ?? null,
        detalhes: {
          instituto: p.institutoNome,
          instituto_id: p.institutoId,
          instituto_novo: p.institutoNovo,
          campo_inicio: p.inicio,
          campo_fim: p.fim,
          t2_lula: p.l2,
          t2_flavio: p.f2,
          fonte: p.fonte,
        },
      });
    } catch (erro) {
      console.error("[updater] falha ao gravar pesquisa:", erro);
      resumo.rejeitadas.push({
        instituto: p.institutoNome,
        fim: p.fim,
        motivo: "falha ao gravar no banco",
      });
    }
  }

  return resumo;
}
