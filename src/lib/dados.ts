/**
 * Camada de dados — a única fronteira entre o banco e as páginas.
 *
 * Regras que este módulo garante (R8, degradação graciosa):
 *  - sem `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`, tudo cai
 *    para o seed local de `src/data/` e o site builda e roda igual;
 *  - qualquer falha de rede/consulta vira fallback + `console.error` — nenhuma
 *    exceção sobe para a página;
 *  - só sai daqui dado já convertido para os tipos de `@/data/tipos`.
 *
 * Confiança do campo `bruto`: para `origem = 'auto'` ele é a resposta CRUA da
 * IA (entrada hostil, guardada só para forense) e NUNCA é lido para montar a
 * `Pesquisa`. Só `seed`/`admin` — escritos por nós — são reaproveitados.
 */
import type { ParamsModelo, Pesquisa, Placar } from "@/data/tipos";
import pesquisasSeedJson from "@/data/pesquisas.seed.json";
import institutosSeedJson from "@/data/institutos.seed.json";
import { criarClientePublico, supabaseConfigurado } from "@/lib/supabase/publico";

/* ------------------------------------------------------------------ *
 * Seed local (fallback)                                              *
 * ------------------------------------------------------------------ */

interface PesquisaSeedBruta {
  id: string;
  instituto: string;
  contratante: string;
  inicio: string;
  fim: string;
  n: number;
  moe: number;
  tse: string;
  t1: { lula: number | null; flavio: number | null; bnns: number | null } | null;
  outros1?: Record<string, number>;
  t2: { lula: number | null; flavio: number | null; bnns: number | null };
  fonte: string | null;
}

const SEED_PESQUISAS = pesquisasSeedJson as unknown as PesquisaSeedBruta[];
const SEED_INSTITUTOS = institutosSeedJson as unknown as {
  id: string;
  nome: string;
  aliases: string[];
}[];

/** Seed local tipado como `Pesquisa[]` (cópia defensiva a cada chamada). */
export function pesquisasDoSeed(): Pesquisa[] {
  return SEED_PESQUISAS.map((p) => ({
    id: p.id,
    instituto: p.instituto,
    contratante: p.contratante,
    inicio: p.inicio,
    fim: p.fim,
    n: p.n,
    moe: p.moe,
    tse: p.tse,
    t1: p.t1 ? { ...p.t1 } : null,
    ...(p.outros1 ? { outros1: { ...p.outros1 } } : {}),
    t2: { lula: p.t2.lula, flavio: p.t2.flavio, bnns: p.t2.bnns },
    fonte: p.fonte,
  }));
}

/* ------------------------------------------------------------------ *
 * Tipos de saída                                                     *
 * ------------------------------------------------------------------ */

/** De onde veio o dado — o selo público mostra quando o site está em fallback. */
export type FonteDados = "banco" | "seed";

export interface RegistroRun {
  id: string;
  executadoEm: string;
  gatilho: "cron" | "aprovacao" | "manual" | "deploy" | "retroativo";
  params: ParamsModelo;
  nPesquisas: number;
  /**
   * Saída serializada de `rodarModelo`. Tipada como estrutura opaca aqui para
   * a camada de dados não depender de `@/lib/modelo`; o consumidor faz o
   * cast para `ResultadoModelo`.
   */
  resultado: Record<string, unknown>;
}

/** Ponto do gráfico "probabilidade no tempo" (valores 0–1, como no modelo). */
export interface PontoRun {
  em: string;
  lula: number | null;
  flavio: number | null;
  /** `retroativo` = recalculado depois (backfill); o resto é registro ao vivo. */
  origem: "retroativo" | "registrado";
}

export interface EventoTransparencia {
  id: string;
  em: string;
  acao: "aprovacao" | "inclusao_manual" | "remocao";
  entidade: string;
  entidadeId: string | null;
  detalhes: Record<string, unknown> | null;
}

export interface PesquisaPendente {
  id: string;
  institutoId: string;
  instituto: string;
  contratante: string | null;
  inicio: string;
  fim: string;
  n: number | null;
  moe: number | null;
  tse: string | null;
  t1: Placar | null;
  t2: Placar;
  fonte: string | null;
  criadoEm: string;
  origem: "seed" | "auto" | "admin";
  /** Resposta crua da IA — só para conferência humana no /admin. */
  bruto: unknown;
}

export interface Frescor {
  /** Última execução do cron (verificação automática). */
  verificadoEm: string | null;
  /** `campo_fim` da pesquisa mais recente da série. */
  ultimaPesquisaFim: string | null;
  /** Momento em que a pesquisa mais recente entrou na série. */
  ultimaPesquisaEm: string | null;
  fonte: FonteDados;
}

/* ------------------------------------------------------------------ *
 * Linhas do banco                                                    *
 * ------------------------------------------------------------------ */

interface LinhaPesquisa {
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
  origem: "seed" | "auto" | "admin";
  bruto: unknown;
  criado_em: string;
  publicado_em: string | null;
}

interface LinhaInstituto {
  id: string;
  nome: string;
  aliases: string[] | null;
}

/* ------------------------------------------------------------------ *
 * Conversões                                                         *
 * ------------------------------------------------------------------ */

const numero = (v: unknown): number | null => {
  if (v === null || v === undefined || v === "") return null;
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : null;
};

/** `outros1` só é reaproveitado de `bruto` escrito por nós (seed/admin). */
function extrairOutros1(
  bruto: unknown,
  origem: LinhaPesquisa["origem"],
): Record<string, number> | undefined {
  if (origem === "auto") return undefined;
  if (!bruto || typeof bruto !== "object") return undefined;
  const alvo = (bruto as { outros1?: unknown }).outros1;
  if (!alvo || typeof alvo !== "object" || Array.isArray(alvo)) return undefined;
  const saida: Record<string, number> = {};
  for (const [nome, valor] of Object.entries(alvo as Record<string, unknown>)) {
    const n = numero(valor);
    if (n !== null && nome.length > 0 && nome.length <= 60) saida[nome] = n;
  }
  return Object.keys(saida).length ? saida : undefined;
}

/** Id do protótipo só é honrado no seed (o `bruto` de `auto` é hostil). */
function idPublico(linha: LinhaPesquisa): string {
  if (linha.origem !== "seed") return linha.id;
  const bruto = linha.bruto;
  if (bruto && typeof bruto === "object") {
    const proto = (bruto as { id_prototipo?: unknown }).id_prototipo;
    if (typeof proto === "string" && proto.length > 0 && proto.length <= 40) return proto;
  }
  return linha.id;
}

function linhaParaPesquisa(linha: LinhaPesquisa, nomes: Map<string, string>): Pesquisa | null {
  const l2 = numero(linha.t2_lula);
  const f2 = numero(linha.t2_flavio);
  // Sem 2º turno a linha não entra no modelo — descartamos em vez de fabricar.
  if (l2 === null || f2 === null) return null;

  const t1l = numero(linha.t1_lula);
  const t1f = numero(linha.t1_flavio);
  const outros1 = extrairOutros1(linha.bruto, linha.origem);

  return {
    id: idPublico(linha),
    instituto: nomes.get(linha.instituto_id) ?? linha.instituto_id,
    contratante: linha.contratante ?? "—",
    inicio: linha.campo_inicio,
    fim: linha.campo_fim,
    // `amostra`/`moe` são opcionais no banco, mas `Pesquisa` exige número.
    // Usamos exatamente os mesmos padrões internos do modelo para valor
    // ausente (`p.n || 1000`, `p.moe || 2`), então a reconstrução é neutra:
    // uma pesquisa sem amostra divulgada pesa o mesmo que pesaria lá dentro.
    n: numero(linha.amostra) ?? 1000,
    moe: numero(linha.moe) ?? 2,
    tse: linha.tse ?? "—",
    t1:
      t1l !== null && t1f !== null ? { lula: t1l, flavio: t1f, bnns: numero(linha.t1_bnns) } : null,
    ...(outros1 ? { outros1 } : {}),
    t2: { lula: l2, flavio: f2, bnns: numero(linha.t2_bnns) },
    fonte: linha.fonte_url,
    ...(linha.origem === "auto" ? { auto: true as const } : {}),
  };
}

const COLUNAS_PESQUISA =
  "id,instituto_id,contratante,campo_inicio,campo_fim,amostra,moe,tse," +
  "t1_lula,t1_flavio,t1_bnns,t2_lula,t2_flavio,t2_bnns,fonte_url,origem,bruto," +
  "criado_em,publicado_em";

/* ------------------------------------------------------------------ *
 * Leituras públicas                                                  *
 * ------------------------------------------------------------------ */

/**
 * Série oficial (apenas `status = 'publicada'`), da mais recente para a mais
 * antiga. Sem Supabase ou com falha de rede → seed local.
 */
export async function getPesquisasPublicadas(): Promise<Pesquisa[]> {
  const supabase = criarClientePublico();
  if (!supabase) return pesquisasDoSeed();

  try {
    const [pesquisas, institutos] = await Promise.all([
      supabase
        .from("pesquisas")
        .select(COLUNAS_PESQUISA)
        .eq("status", "publicada")
        .order("campo_fim", { ascending: false })
        .returns<LinhaPesquisa[]>(),
      supabase.from("institutos").select("id,nome,aliases").returns<LinhaInstituto[]>(),
    ]);

    if (pesquisas.error) throw new Error(pesquisas.error.message);
    if (!pesquisas.data?.length) return pesquisasDoSeed();

    const nomes = new Map<string, string>(
      (institutos.data ?? SEED_INSTITUTOS).map((i) => [i.id, i.nome]),
    );
    const convertidas = pesquisas.data
      .map((l) => linhaParaPesquisa(l, nomes))
      .filter((p): p is Pesquisa => p !== null);

    return convertidas.length ? convertidas : pesquisasDoSeed();
  } catch (erro) {
    console.error("[dados] getPesquisasPublicadas caiu para o seed:", erro);
    return pesquisasDoSeed();
  }
}

/**
 * Série publicada LIDA DO BANCO, sem fallback de seed. `null` = indisponível.
 * Existe para a reconstituição retroativa: gravar snapshots derivados do seed
 * local durante uma falha de rede seria reconstituir uma série que não é a
 * oficial — melhor abortar (R8 vale para LEITURA da página, não para escrita).
 */
export async function getPesquisasPublicadasDoBanco(): Promise<Pesquisa[] | null> {
  const supabase = criarClientePublico();
  if (!supabase) return null;
  try {
    const [pesquisas, institutos] = await Promise.all([
      supabase
        .from("pesquisas")
        .select(COLUNAS_PESQUISA)
        .eq("status", "publicada")
        .order("campo_fim", { ascending: false })
        .returns<LinhaPesquisa[]>(),
      supabase.from("institutos").select("id,nome,aliases").returns<LinhaInstituto[]>(),
    ]);
    if (pesquisas.error) throw new Error(pesquisas.error.message);
    if (!pesquisas.data?.length) return null;
    const nomes = new Map<string, string>(
      (institutos.data ?? SEED_INSTITUTOS).map((i) => [i.id, i.nome]),
    );
    const convertidas = pesquisas.data
      .map((l) => linhaParaPesquisa(l, nomes))
      .filter((p): p is Pesquisa => p !== null);
    return convertidas.length ? convertidas : null;
  } catch (erro) {
    console.error("[dados] getPesquisasPublicadasDoBanco indisponível:", erro);
    return null;
  }
}

function linhaParaRun(linha: {
  id: string;
  executado_em: string;
  gatilho: string;
  params: unknown;
  n_pesquisas: number;
  resultado: unknown;
}): RegistroRun | null {
  const gatilhos = ["cron", "aprovacao", "manual", "deploy", "retroativo"] as const;
  const gatilho = gatilhos.find((g) => g === linha.gatilho);
  if (!gatilho) return null;
  const resultado =
    linha.resultado && typeof linha.resultado === "object" && !Array.isArray(linha.resultado)
      ? (linha.resultado as Record<string, unknown>)
      : null;
  if (!resultado) return null;
  return {
    id: linha.id,
    executadoEm: linha.executado_em,
    gatilho,
    params: linha.params as ParamsModelo,
    nPesquisas: linha.n_pesquisas,
    resultado,
  };
}

/** Último snapshot do modelo gravado no banco. `null` sem banco/sem runs. */
export async function getUltimoRun(): Promise<RegistroRun | null> {
  const supabase = criarClientePublico();
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from("model_runs")
      .select("id,executado_em,gatilho,params,n_pesquisas,resultado")
      .order("executado_em", { ascending: false })
      .limit(1);
    if (error) throw new Error(error.message);
    const linha = data?.[0];
    return linha ? linhaParaRun(linha) : null;
  } catch (erro) {
    console.error("[dados] getUltimoRun indisponível:", erro);
    return null;
  }
}

/** Extrai `resultado.eleito.dia.{l,f}` sem confiar na forma do jsonb. */
function probabilidadeEleito(resultado: Record<string, unknown>): {
  l: number | null;
  f: number | null;
} {
  const eleito = resultado.eleito;
  if (!eleito || typeof eleito !== "object") return { l: null, f: null };
  const dia = (eleito as { dia?: unknown }).dia;
  if (!dia || typeof dia !== "object") return { l: null, f: null };
  const { l, f } = dia as { l?: unknown; f?: unknown };
  return { l: numero(l), f: numero(f) };
}

/**
 * Série histórica das probabilidades (gráfico "probabilidade no tempo"),
 * do mais antigo para o mais recente. Lista vazia sem banco.
 */
export async function getSerieRuns(limite = 500): Promise<PontoRun[]> {
  const supabase = criarClientePublico();
  if (!supabase) return [];
  try {
    // `dia:resultado->eleito->dia` puxa SÓ o par de probabilidades do jsonb:
    // com o backfill diário a série passa de 300 linhas, e o `resultado`
    // completo (~10–30 KB cada) tornaria a página cara à toa. O parse continua
    // defensivo — a forma vem do banco, não do nosso tipo.
    const { data, error } = await supabase
      .from("model_runs")
      .select("executado_em,gatilho,dia:resultado->eleito->dia")
      .order("executado_em", { ascending: false })
      .limit(Math.min(Math.max(limite, 1), 500))
      .returns<{ executado_em: string; gatilho: string; dia: unknown }[]>();
    if (error) throw new Error(error.message);
    return (data ?? [])
      .map((l) => {
        const dia =
          l.dia && typeof l.dia === "object" && !Array.isArray(l.dia)
            ? (l.dia as { l?: unknown; f?: unknown })
            : null;
        return {
          em: l.executado_em,
          lula: dia ? numero(dia.l) : null,
          flavio: dia ? numero(dia.f) : null,
          origem: (l.gatilho === "retroativo" ? "retroativo" : "registrado") as
            "retroativo" | "registrado",
        };
      })
      .reverse();
  } catch (erro) {
    console.error("[dados] getSerieRuns indisponível:", erro);
    return [];
  }
}

/**
 * Feed público de transparência. Lê a view `audit_publico` (migração 0003), que
 * projeta apenas colunas publicáveis — o `ator` (e-mail do admin) nunca sai do
 * banco para a anon key.
 */
export async function getFeedTransparencia(limite = 30): Promise<EventoTransparencia[]> {
  const supabase = criarClientePublico();
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from("audit_publico")
      .select("id,em,acao,entidade,entidade_id,detalhes")
      .order("em", { ascending: false })
      .limit(Math.min(Math.max(limite, 1), 200))
      .returns<
        {
          id: number;
          em: string;
          acao: string;
          entidade: string;
          entidade_id: string | null;
          detalhes: unknown;
        }[]
      >();
    if (error) throw new Error(error.message);
    const publicas = ["aprovacao", "inclusao_manual", "remocao"] as const;
    return (data ?? []).flatMap((l) => {
      const acao = publicas.find((a) => a === l.acao);
      if (!acao) return [];
      return [
        {
          id: String(l.id),
          em: l.em,
          acao,
          entidade: l.entidade,
          entidadeId: l.entidade_id,
          detalhes:
            l.detalhes && typeof l.detalhes === "object" && !Array.isArray(l.detalhes)
              ? (l.detalhes as Record<string, unknown>)
              : null,
        },
      ];
    });
  } catch (erro) {
    console.error("[dados] getFeedTransparencia indisponível:", erro);
    return [];
  }
}

/** Selo de frescor: última verificação do cron + última pesquisa incluída. */
export async function getFrescor(): Promise<Frescor> {
  const seed = SEED_PESQUISAS.reduce<string | null>(
    (max, p) => (max === null || p.fim > max ? p.fim : max),
    null,
  );
  const supabase = criarClientePublico();
  if (!supabase) {
    return {
      verificadoEm: null,
      ultimaPesquisaFim: seed,
      ultimaPesquisaEm: null,
      fonte: "seed",
    };
  }

  try {
    const [run, pesquisa] = await Promise.all([
      supabase
        .from("model_runs")
        .select("executado_em")
        .eq("gatilho", "cron")
        .order("executado_em", { ascending: false })
        .limit(1)
        .returns<{ executado_em: string }[]>(),
      supabase
        .from("pesquisas")
        .select("campo_fim,publicado_em")
        .eq("status", "publicada")
        .order("campo_fim", { ascending: false })
        .limit(1)
        .returns<{ campo_fim: string; publicado_em: string | null }[]>(),
    ]);
    if (run.error) throw new Error(run.error.message);
    if (pesquisa.error) throw new Error(pesquisa.error.message);

    return {
      verificadoEm: run.data?.[0]?.executado_em ?? null,
      ultimaPesquisaFim: pesquisa.data?.[0]?.campo_fim ?? seed,
      ultimaPesquisaEm: pesquisa.data?.[0]?.publicado_em ?? null,
      fonte: pesquisa.data?.length ? "banco" : "seed",
    };
  } catch (erro) {
    console.error("[dados] getFrescor caiu para o seed:", erro);
    return { verificadoEm: null, ultimaPesquisaFim: seed, ultimaPesquisaEm: null, fonte: "seed" };
  }
}

/* ------------------------------------------------------------------ *
 * Leitura restrita (/admin)                                          *
 * ------------------------------------------------------------------ */

/**
 * Pesquisas aguardando aprovação humana (R3). Usa o service role, então
 * revalida `exigirAdmin()` aqui dentro (defesa em profundidade): mesmo que
 * uma página esqueça a checagem, a fila de pendentes não vaza.
 *
 * Auth e service role são importados dinamicamente para que nenhuma página
 * pública carregue esses grafos de módulos (`next/headers` inclusive).
 */
export async function getPendentes(): Promise<PesquisaPendente[]> {
  if (!supabaseConfigurado()) return [];
  try {
    const { exigirAdmin } = await import("@/lib/admin/auth");
    await exigirAdmin(); // lança ErroAutorizacao — propagado abaixo

    const { criarClienteAdmin } = await import("@/lib/supabase/admin");
    const supabase = criarClienteAdmin();
    if (!supabase) return [];

    const [pendentes, institutos] = await Promise.all([
      supabase
        .from("pesquisas")
        .select(COLUNAS_PESQUISA)
        .eq("status", "pendente")
        .order("campo_fim", { ascending: false })
        .returns<LinhaPesquisa[]>(),
      supabase.from("institutos").select("id,nome,aliases").returns<LinhaInstituto[]>(),
    ]);
    if (pendentes.error) throw new Error(pendentes.error.message);

    const nomes = new Map<string, string>(
      (institutos.data ?? SEED_INSTITUTOS).map((i) => [i.id, i.nome]),
    );

    return (pendentes.data ?? []).map((l) => ({
      id: l.id,
      institutoId: l.instituto_id,
      instituto: nomes.get(l.instituto_id) ?? l.instituto_id,
      contratante: l.contratante,
      inicio: l.campo_inicio,
      fim: l.campo_fim,
      n: numero(l.amostra),
      moe: numero(l.moe),
      tse: l.tse,
      t1:
        numero(l.t1_lula) !== null && numero(l.t1_flavio) !== null
          ? { lula: numero(l.t1_lula), flavio: numero(l.t1_flavio), bnns: numero(l.t1_bnns) }
          : null,
      t2: { lula: numero(l.t2_lula), flavio: numero(l.t2_flavio), bnns: numero(l.t2_bnns) },
      fonte: l.fonte_url,
      criadoEm: l.criado_em,
      origem: l.origem,
      bruto: l.bruto,
    }));
  } catch (erro) {
    // Falta de autorização é erro do chamador, não indisponibilidade: sobe.
    if (erro instanceof Error && erro.name === "ErroAutorizacao") throw erro;
    console.error("[dados] getPendentes indisponível:", erro);
    return [];
  }
}
