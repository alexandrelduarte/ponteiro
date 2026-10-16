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
import { z } from "zod";
import { montarPromptBusca } from "@/data/constantes";
import { slugInstituto } from "@/lib/slug";
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
/**
 * Janela da busca automática, em dias para trás a partir de hoje. A busca NÃO
 * parte mais da última pesquisa publicada: ela só andava quando o admin
 * aprovava, e uma pesquisa divulgada fora de ordem (campo mais antigo que a
 * última aprovada) ficava rejeitada para sempre — foi assim que a série parou em
 * agosto de 2026 (DECISOES.md, "fluxo de coleta"). A dedup cuida do resto.
 */
export const JANELA_BUSCA_DIAS = 21;
/** Soma Lula+Flávio a partir da qual, sem branco/nulo informado, o par parece voto VÁLIDO. */
const SOMA_PARECE_VALIDO = 98.5;

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
  /** Chaves `instituto_id|campo_fim` já existentes (publicadas, pendentes E rejeitadas). */
  existentes: string[];
  /**
   * Piso de `campo_fim` aceito (AAAA-MM-DD). No robô é o início da janela de
   * busca (min(última publicada, hoje − JANELA_BUSCA_DIAS)); na inclusão manual
   * e no lote do admin é `DATA_MINIMA` (o humano pode lançar o passado).
   */
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
  /** branco/nulo + não sabe do 2º turno (votos totais) */
  bn2: number | null;
  fonte: string;
  /** Item cru da IA, para forense (inclui `_avisos` de campos opcionais descartados). */
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
  /**
   * A resposta inteira não pôde ser lida (vazia, gigante, sem lista JSON). É
   * FALHA da coleta — nunca "não há pesquisa nova" (antes virava "a série já
   * está em dia" no /admin).
   */
  falhaLeitura?: string;
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

/** Inteiro em grafia brasileira: "2.004" e "2,004" são dois mil e quatro, não 2,004. */
function paraInteiro(v: unknown): unknown {
  if (typeof v === "string" && /^\d{1,3}([.,]\d{3})+$/.test(v.trim())) {
    return Number(v.trim().replace(/[.,]/g, ""));
  }
  return paraNumero(v);
}

/**
 * Campo OPCIONAL inválido vira `null` (com aviso no forense) em vez de derrubar a
 * pesquisa inteira: um "n" mal escrito não pode jogar fora um 2º turno bom.
 */
function numeroOpcional(min: number, max: number, inteiro = false) {
  const base = inteiro ? z.number().int().min(min).max(max) : z.number().min(min).max(max);
  return z.preprocess(inteiro ? paraInteiro : paraNumero, base.nullable()).catch(null);
}

function numeroObrigatorio(min: number, max: number) {
  return z.preprocess(paraNumero, z.number().min(min).max(max));
}

function textoOpcional(max: number) {
  return z
    .preprocess(
      (v) => (v === undefined || v === null ? null : v),
      z
        .string()
        .max(max * 4)
        .transform(limparTexto)
        .refine((s) => s.length <= max, `use até ${max} caracteres`)
        .transform((s) => (s.length ? s : null))
        .nullable(),
    )
    .catch(null);
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
  bn2: numeroOpcional(0, 100),
  // Válidos, quando o instituto destaca: só servem para conferir que l2/f2 são TOTAIS.
  l2v: numeroOpcional(0, 100),
  f2v: numeroOpcional(0, 100),
  fonte: z.string().max(MAX_URL),
});

/** Campos opcionais que, se vieram preenchidos e saíram `null`, geram aviso. */
const OPCIONAIS = ["n", "moe", "tse", "contratante", "l1", "f1", "bn1", "bn2"] as const;

/* ------------------------------------------------------------------ *
 * Extração do array JSON                                             *
 * ------------------------------------------------------------------ */

/**
 * Fecha o array que abre em `ini`: conta colchetes FORA de strings JSON. `-1`
 * quando não fecha. Linear no tamanho do texto (que já vem limitado).
 */
function fimDoArray(texto: string, ini: number): number {
  let prof = 0;
  let emString = false;
  for (let i = ini; i < texto.length; i++) {
    const c = texto[i];
    if (emString) {
      if (c === "\\") i++;
      else if (c === '"') emString = false;
      continue;
    }
    if (c === '"') emString = true;
    else if (c === "[") prof++;
    else if (c === "]" && --prof === 0) return i;
  }
  return -1;
}

/**
 * Recorta o primeiro array JSON VÁLIDO do texto da IA. `null` quando não há.
 *
 * Testa cada "[" candidato até um que feche num array parseável — a busca na
 * web costuma terminar a resposta com citações em markdown ("[fonte](url)") e
 * pegar do primeiro "[" ao ÚLTIMO "]" estragava o JSON inteiro.
 */
export function extrairArrayJSON(texto: string): unknown[] | null {
  const limpo = texto
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();
  let tentativas = 0;
  for (let ini = limpo.indexOf("["); ini >= 0; ini = limpo.indexOf("[", ini + 1)) {
    if (++tentativas > 200) break;
    const fim = fimDoArray(limpo, ini);
    if (fim < 0) continue;
    try {
      const valor: unknown = JSON.parse(limpo.slice(ini, fim + 1));
      if (Array.isArray(valor)) return valor;
    } catch {
      /* próximo candidato */
    }
  }
  return null;
}

/* ------------------------------------------------------------------ *
 * Núcleo puro — testável sem rede                                    *
 * ------------------------------------------------------------------ */

/**
 * Converte o texto bruto da IA em pesquisas aceitáveis + motivos de rejeição.
 * Função pura: não toca em rede, banco nem relógio (o "hoje" vem do contexto).
 */
export function processarRespostaIA(
  texto: unknown,
  ctx: ContextoBusca,
  /** teto de itens analisados — o robô usa MAX_ITENS; o lote do admin, mais */
  maxItens: number = MAX_ITENS,
): ResultadoProcessamento {
  const vazio = (motivo: string): ResultadoProcessamento => ({
    encontradas: 0,
    aceitas: [],
    rejeitadas: [{ motivo }],
    falhaLeitura: motivo,
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

  const candidatos = itens.slice(0, maxItens);
  if (itens.length > maxItens) {
    rejeitadas.push({
      motivo: `resposta trouxe ${itens.length} itens; só os ${maxItens} primeiros foram analisados`,
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
    // O modelo trabalha com votos TOTAIS. Par de válidos misturado na média
    // infla a diferença em ~1/(1−branco) e zera o branco/nulo publicado.
    if (q.bn2 === null && q.l2 + q.f2 >= SOMA_PARECE_VALIDO) {
      rejeitadas.push({
        ...rotulo,
        motivo: "2º turno parece voto válido (soma ≥ 98,5 sem branco/nulo) — confira e lance à mão",
      });
      continue;
    }
    if (q.bn2 !== null && Math.abs(q.l2 + q.f2 + q.bn2 - 100) > 3) {
      rejeitadas.push({ ...rotulo, motivo: "2º turno (Lula + Flávio + branco/nulo) não soma 100" });
      continue;
    }
    if (q.l2v !== null && q.f2v !== null && q.l2v === q.l2 && q.f2v === q.f2 && q.l2 + q.f2 > 95) {
      rejeitadas.push({
        ...rotulo,
        motivo: "2º turno veio igual aos válidos — esperado voto total",
      });
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
        motivo: `campo_fim anterior à janela de busca (desde ${ultimoFim})`,
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

    const avisos = OPCIONAIS.filter((k) => {
      const cru = (item as Record<string, unknown>)[k];
      return cru !== undefined && cru !== null && cru !== "" && q[k] === null;
    }).map((k) => `${k} inválido — descartado`);
    if (avisos.length) bruto = { ...bruto, _avisos: avisos };

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
      bn2: q.bn2,
      fonte,
      bruto,
    });
  }

  return { encontradas: candidatos.length, aceitas, rejeitadas };
}

/* ------------------------------------------------------------------ *
 * Chamada à IA                                                       *
 * ------------------------------------------------------------------ */

/** Modelo padrão: o degrau barato da geração vigente na OpenAI (DECISOES.md). */
const MODELO_PADRAO = "gpt-5.6-luna";

/**
 * Junta só os blocos `output_text` das mensagens da resposta — nada mais é
 * interpretado. A resposta é tratada como `unknown` de ponta a ponta: a forma
 * vem da rede, não do nosso código, então cada nível é conferido antes do uso.
 */
export function textoDaResposta(saida: unknown): string {
  if (!Array.isArray(saida)) return "";
  const partes: string[] = [];
  for (const item of saida) {
    if (!item || typeof item !== "object") continue;
    const { type, content } = item as { type?: unknown; content?: unknown };
    if (type !== "message" || !Array.isArray(content)) continue;
    for (const bloco of content) {
      if (!bloco || typeof bloco !== "object") continue;
      const { type: t, text } = bloco as { type?: unknown; text?: unknown };
      if (t === "output_text" && typeof text === "string") partes.push(text);
    }
  }
  return partes.join("\n");
}

/**
 * Orçamento por tentativa. A rota do cron declara `maxDuration = 300`; DUAS
 * tentativas + contexto + snapshot precisam caber nela, senão a plataforma
 * mata a função no meio e nem o snapshot diário é gravado (o contrato "nunca
 * lança" de `rodarUpdater` não protege de kill externo). 2×130s deixa ~40s
 * de folga para o resto da rota.
 */
const TIMEOUT_TENTATIVA_MS = 130_000;

/**
 * OpenAI Responses API com a ferramenta `web_search`, via fetch (sem SDK —
 * é um POST único; a dependência inteira não se paga, R7).
 * `max_output_tokens` folgado porque em modelo com raciocínio ele inclui os
 * tokens de pensamento — apertado demais, a resposta chega sem o JSON final.
 * Uma retentativa em falha transitória (rede/timeout/5xx/429).
 */
async function buscarNaWeb(desde: string, hoje: string): Promise<string> {
  const corpo = JSON.stringify({
    model: process.env.OPENAI_MODEL ?? MODELO_PADRAO,
    max_output_tokens: 12_000,
    tools: [{ type: "web_search" }],
    input: montarPromptBusca(desde, hoje),
  });

  for (let tentativa = 1; ; tentativa++) {
    let resposta: Response;
    try {
      resposta = await fetch("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: corpo,
        signal: AbortSignal.timeout(TIMEOUT_TENTATIVA_MS),
      });
    } catch (erro) {
      if (tentativa === 1) continue;
      throw erro;
    }
    if ((resposta.status >= 500 || resposta.status === 429) && tentativa === 1) {
      // Consome o corpo antes de descartar a Response (não deixa socket preso).
      await resposta.text().catch(() => undefined);
      continue;
    }
    if (!resposta.ok) {
      throw new Error(`OpenAI ${resposta.status}: ${(await resposta.text()).slice(0, 300)}`);
    }
    const dados: unknown = await resposta.json();
    const { status, incomplete_details, output } = dados as {
      status?: unknown;
      incomplete_details?: { reason?: unknown };
      output?: unknown;
    };
    // HTTP 200 não basta: `incomplete` (ex.: estourou max_output_tokens) chega
    // sem o JSON final e viraria um falso "não há pesquisa nova" no resumo.
    if (status !== "completed") {
      throw new Error(
        `OpenAI resposta ${String(status)}${
          incomplete_details?.reason ? ` (${String(incomplete_details.reason)})` : ""
        }`,
      );
    }
    return textoDaResposta(output);
  }
}

/* ------------------------------------------------------------------ *
 * Orquestração (rede + banco)                                        *
 * ------------------------------------------------------------------ */

async function carregarContexto(
  supabase: NonNullable<ReturnType<typeof criarClienteAdmin>>,
): Promise<ContextoBusca> {
  const [institutos, existentes, ultima] = await Promise.all([
    supabase.from("institutos").select("id,nome,aliases").returns<InstitutoConhecido[]>(),
    // Rejeitadas também: o que o admin recusou não volta todo dia pela porta do robô.
    supabase
      .from("pesquisas")
      .select("instituto_id,campo_fim")
      .in("status", ["publicada", "pendente", "rejeitada"])
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
  const hoje = hojeSaoPaulo();
  return {
    institutos: (institutos.data ?? []).map((i) => ({
      id: i.id,
      nome: i.nome,
      aliases: i.aliases ?? [],
    })),
    existentes: (existentes.data ?? []).map((p) => `${p.instituto_id}|${p.campo_fim}`),
    ultimoFim: inicioJanela(fimBanco && dataValida(fimBanco) ? fimBanco : null, hoje),
    hoje,
  };
}

/**
 * Início da janela de busca: `min(última publicada, hoje − JANELA_BUSCA_DIAS)`.
 * Se a série estiver atrasada, a busca recua até a última publicada; se estiver
 * em dia, ainda olha 3 semanas para trás — pesquisa divulgada com atraso entra.
 */
export function inicioJanela(ultimaPublicada: string | null, hoje: string): string {
  const [a, m, d] = hoje.split("-").map(Number);
  const recuo = new Date(Date.UTC(a, m - 1, d) - JANELA_BUSCA_DIAS * 86_400_000)
    .toISOString()
    .slice(0, 10);
  if (!ultimaPublicada) return recuo;
  return ultimaPublicada < recuo ? ultimaPublicada : recuo;
}

/** Registra a execução da coleta (sucesso OU falha) — base do selo de frescor. */
async function registrarColeta(ator: string, resumo: ResumoUpdater, desde: string | null) {
  await registrarAuditoria({
    ator,
    acao: "coleta",
    entidade: "coleta",
    detalhes: {
      ok: !resumo.erro,
      desde,
      encontradas: resumo.encontradas,
      inseridas: resumo.inseridas,
      rejeitadas: resumo.rejeitadas.length,
      motivos: resumo.rejeitadas
        .slice(0, 12)
        .map((r) => [r.instituto, r.fim, r.motivo].filter(Boolean).join(" · ").slice(0, 200)),
      ...(resumo.erro ? { erro: resumo.erro } : {}),
    },
  });
}

/**
 * Executa uma rodada completa do coletor: busca, valida, deduplica e insere
 * como `pendente`. Nunca publica nada (R3) e nunca lança — devolve o resumo.
 *
 * @param ator quem disparou (`'cron'` ou o e-mail do admin) — vai no audit_log.
 */
export async function rodarUpdater(ator = "cron"): Promise<ResumoUpdater> {
  const resumo = await executarColeta(ator);
  await registrarColeta(ator, resumo.resumo, resumo.desde).catch((erro) =>
    console.error("[updater] falha ao registrar a coleta:", erro),
  );
  return resumo.resumo;
}

async function executarColeta(
  ator: string,
): Promise<{ resumo: ResumoUpdater; desde: string | null }> {
  const base: ResumoUpdater = {
    encontradas: 0,
    inseridas: 0,
    rejeitadas: [],
    institutosNovos: [],
  };

  if (!process.env.OPENAI_API_KEY) {
    return {
      resumo: { ...base, erro: "coletor indisponível: falta configuração da IA" },
      desde: null,
    };
  }
  const supabase = criarClienteAdmin();
  if (!supabase) {
    return {
      resumo: { ...base, erro: "coletor indisponível: banco não configurado" },
      desde: null,
    };
  }

  let ctx: ContextoBusca;
  try {
    ctx = await carregarContexto(supabase);
  } catch (erro) {
    console.error("[updater] falha ao carregar contexto:", erro);
    return {
      resumo: { ...base, erro: "coletor indisponível: falha ao ler a série atual" },
      desde: null,
    };
  }

  let texto: string;
  try {
    texto = await buscarNaWeb(ctx.ultimoFim, ctx.hoje);
  } catch (erro) {
    console.error("[updater] falha na busca:", erro);
    return { resumo: { ...base, erro: "falha na busca automática" }, desde: ctx.ultimoFim };
  }

  const { encontradas, aceitas, rejeitadas, falhaLeitura } = processarRespostaIA(texto, ctx);
  const resumo: ResumoUpdater = { ...base, encontradas, rejeitadas: [...rejeitadas] };
  if (falhaLeitura) {
    console.error("[updater] resposta ilegível:", falhaLeitura, texto.slice(0, 500));
    resumo.erro = `resposta da IA ilegível: ${falhaLeitura}`;
    return { resumo, desde: ctx.ultimoFim };
  }

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
          t2_bnns: p.bn2,
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
          t2_bnns: p.bn2,
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

  return { resumo, desde: ctx.ultimoFim };
}
