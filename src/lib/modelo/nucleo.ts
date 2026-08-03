/**
 * NÚCLEO DO MODELO — porte TypeScript puro de `agregador-presidencial-2026.jsx`.
 *
 * AGREGADOR PRESIDENCIAL 2026 — Lula (PT) × Flávio Bolsonaro (PL)
 * Série histórica de pesquisas registradas no TSE (jan–jul/2026)
 * Modelo: média ponderada · tendência pareada por instituto ·
 * probabilidade no cenário atual e projetada para o dia da votação
 *
 * INTOCÁVEL NUMERICAMENTE. Golden tests em `tests/modelo.golden.test.ts` comparam
 * cada número desta implementação com a cópia verbatim do protótipo
 * (`tests/reference/original.mjs`) com tolerância 1e-9. Não trocar a aproximação da
 * normal, não mexer nos pisos/tetos, não "arredondar melhor". Bug real → DECISOES.md.
 *
 * Determinismo total: `hojeMs` é sempre explícito; nada aqui lê o relógio nem faz I/O.
 */
import { ELEICAO_1T, ELEICAO_2T } from "@/data/constantes";
import type { ParamsModelo, Pesquisa, Placar } from "@/data/tipos";
import { fmt, fmtSinal } from "./formatadores";

/* ---------------------- tipos ---------------------- */

/** Métrica extraída de uma pesquisa; `null` = a rodada não divulgou o dado. */
export type Metrica = (p: Pesquisa) => number | null;

/** Placar de 2º turno já garantido pelo filtro de `rodarModelo`. */
export interface Placar2T extends Placar {
  lula: number;
  flavio: number;
}

/** Pesquisa que entrou no agregado do 2º turno (t2 completo). */
export type PesquisaCom2T = Pesquisa & { t2: Placar2T };

/** Linha do agregado: a pesquisa + os derivados de peso/margem. */
export type LinhaModelo = PesquisaCom2T & {
  /** dias entre o meio do campo e `hojeMs` (mínimo 0) */
  idadeDias: number;
  /** peso final (recência × tamanho de amostra) */
  w: number;
  /** margem do 2º turno na pesquisa (Lula − Flávio) */
  margem2: number;
  /** margem dentro de 2× a margem de erro declarada */
  empate2: boolean;
};

/** Média ponderada em um instante: valor e nº de pesquisas que entraram. */
export interface Media {
  valor: number;
  k: number;
}

/** Tendência pareada: variação média e nº de pares (instituto × rodada anterior). */
export interface Tendencia {
  delta: number;
  pares: number;
}

/** Ponto da série do gráfico: instante em ms, Lula e Flávio. */
export interface PontoSerie {
  x: number;
  l: number;
  f: number;
}

/** Probabilidades de vitória JÁ no 1º turno (>50% dos válidos). */
export interface Probabilidades1T {
  lulaHoje: number;
  flavioHoje: number;
  lulaDia: number;
  flavioDia: number;
}

/** Tendências pareadas de um turno: Lula, Flávio e margem. */
export interface TendenciasTurno {
  l: Tendencia | null;
  f: Tendencia | null;
  m: Tendencia | null;
}

/** Chance combinada de ser eleito (1ºT direto OU vitória no 2ºT). */
export interface Eleito {
  hoje: { l: number; f: number };
  dia: { l: number; f: number };
}

/** Saída completa do modelo — serializável (sem funções, sem Date). */
export interface ResultadoModelo {
  linhas: LinhaModelo[];
  seAgora: number;
  sdEntre: number;
  kEff: number;
  mediaL2: number;
  mediaF2: number;
  margem: number;
  margemAj: number;
  validoL2: number;
  t1raw: Media | null;
  t1rawF: Media | null;
  t1valL: Media | null;
  t1valF: Media | null;
  p1: Probabilidades1T | null;
  sigmaHoje: number;
  sigmaDia1: number;
  sigmaDia2: number;
  deriva1: number;
  deriva2: number;
  pL2hoje: number;
  pL2dia: number;
  int80: [number, number];
  p2Tacontece: number;
  eleito: Eleito;
  tend2: TendenciasTurno;
  tend1: TendenciasTurno;
  serie1: PontoSerie[];
  serie2: PontoSerie[];
  dias1T: number;
  dias2T: number;
  titulo: string;
  texto: string;
  qtdEmpate: number;
  qtdRecentes: number;
}

/* ---------------------- utilidades ---------------------- */

/** Aproximação de Zelen & Severo (Abramowitz–Stegun 26.2.17) da normal acumulada. */
export function normCdf(z: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989423 * Math.exp((-z * z) / 2);
  const p =
    d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return z > 0 ? 1 - p : p;
}

/** Instante (ms) do meio do trabalho de campo da pesquisa. */
export const meioCampo = (p: Pick<Pesquisa, "inicio" | "fim">): number =>
  (Date.parse(p.inicio + "T12:00:00-03:00") + Date.parse(p.fim + "T12:00:00-03:00")) / 2;

/* Média ponderada em um instante t (recência conta a partir de t) */
export function mediaEm(
  t: number,
  polls: readonly Pesquisa[],
  metric: Metrica,
  meiaVida: number,
): Media | null {
  let sw = 0,
    sv = 0,
    k = 0;
  for (const p of polls) {
    const v = metric(p);
    const mid = meioCampo(p);
    if (v == null || mid > t) continue;
    const w =
      Math.exp((-Math.LN2 * ((t - mid) / 864e5)) / meiaVida) *
      Math.min(1.5, Math.sqrt((p.n || 1000) / 2000));
    sw += w;
    sv += w * v;
    k++;
  }
  return sw > 0 ? { valor: sv / sw, k } : null;
}

/* Tendência pareada: última rodada − rodada anterior do MESMO instituto (≤75 dias) */
export function tendenciaPareada(polls: readonly Pesquisa[], metric: Metrica): Tendencia | null {
  const porInst: Record<string, Pesquisa[]> = {};
  for (const p of polls) {
    if (metric(p) == null) continue;
    (porInst[p.instituto] = porInst[p.instituto] || []).push(p);
  }
  const deltas: number[] = [];
  for (const arr of Object.values(porInst)) {
    arr.sort((a, b) => meioCampo(a) - meioCampo(b));
    if (arr.length >= 2) {
      const ult = arr[arr.length - 1],
        ant = arr[arr.length - 2];
      if ((meioCampo(ult) - meioCampo(ant)) / 864e5 <= 75)
        deltas.push((metric(ult) as number) - (metric(ant) as number));
    }
  }
  if (!deltas.length) return null;
  return { delta: deltas.reduce((a, b) => a + b, 0) / deltas.length, pares: deltas.length };
}

/* ---------------------- o modelo ---------------------- */
export function rodarModelo(
  pesquisas: readonly Pesquisa[],
  params: ParamsModelo,
  hojeMs: number,
): ResultadoModelo | null {
  const com2T = pesquisas.filter(
    (p): p is PesquisaCom2T => !!(p.t2 && p.t2.lula != null && p.t2.flavio != null),
  );
  if (!com2T.length) return null;
  const { meiaVida, sigmaSys, coefDeriva } = params;
  const vies = params.vies || 0;

  const linhas: LinhaModelo[] = com2T
    .map((p) => {
      const idadeDias = Math.max(0, (hojeMs - meioCampo(p)) / 864e5);
      const w =
        Math.exp((-Math.LN2 * idadeDias) / meiaVida) *
        Math.min(1.5, Math.sqrt((p.n || 1000) / 2000));
      const margem2 = p.t2.lula - p.t2.flavio;
      return { ...p, idadeDias, w, margem2, empate2: Math.abs(margem2) <= 2 * (p.moe || 2) };
    })
    .sort((a, b) => meioCampo(a) - meioCampo(b));

  const somaW = linhas.reduce((s, l) => s + l.w, 0);
  const wm = (fn: (l: LinhaModelo) => number) =>
    linhas.reduce((s, l) => s + l.w * fn(l), 0) / somaW;

  /* -------- 2º turno: retrato -------- */
  const mediaL2 = wm((l) => l.t2.lula);
  const mediaF2 = wm((l) => l.t2.flavio);
  const margem = mediaL2 - mediaF2;
  const validoL2 = (100 * mediaL2) / (mediaL2 + mediaF2);

  const varEntre = wm((l) => Math.pow(l.margem2 - margem, 2));
  const sdEntre = Math.sqrt(Math.max(varEntre, 0));
  const somaW2 = linhas.reduce((s, l) => s + l.w * l.w, 0);
  const kEff = (somaW * somaW) / somaW2;
  const seAgora = Math.max(0.8, sdEntre / Math.sqrt(kEff));

  /* -------- incertezas: cenário atual × dia da votação -------- */
  const dias1T = Math.max(0, (ELEICAO_1T - hojeMs) / 864e5);
  const dias2T = Math.max(0, (ELEICAO_2T - hojeMs) / 864e5);
  const sigmaHoje = Math.sqrt(seAgora ** 2 + sigmaSys ** 2);
  const deriva2 = coefDeriva * Math.sqrt(dias2T);
  const deriva1 = coefDeriva * Math.sqrt(dias1T);
  const sigmaDia2 = Math.sqrt(sigmaHoje ** 2 + deriva2 ** 2);
  const sigmaDia1 = Math.sqrt(sigmaHoje ** 2 + deriva1 ** 2);

  const margemAj = margem - vies;
  const pL2hoje = normCdf(margemAj / sigmaHoje);
  const pL2dia = normCdf(margemAj / sigmaDia2);
  const z80 = 1.2816;
  const int80: [number, number] = [margemAj - z80 * sigmaDia2, margemAj + z80 * sigmaDia2];

  /* -------- 1º turno -------- */
  const t1raw = mediaEm(hojeMs, pesquisas, (p) => p.t1?.lula ?? null, meiaVida);
  const t1rawF = mediaEm(hojeMs, pesquisas, (p) => p.t1?.flavio ?? null, meiaVida);
  const t1valL = mediaEm(
    hojeMs,
    pesquisas,
    (p) =>
      p.t1 && p.t1.lula != null && p.t1.bnns != null ? (100 * p.t1.lula) / (100 - p.t1.bnns) : null,
    meiaVida,
  );
  const t1valF = mediaEm(
    hojeMs,
    pesquisas,
    (p) =>
      p.t1 && p.t1.flavio != null && p.t1.bnns != null
        ? (100 * p.t1.flavio) / (100 - p.t1.bnns)
        : null,
    meiaVida,
  );

  let p1: Probabilidades1T | null = null;
  if (t1valL && t1valF) {
    const sigShare = (base: number) => Math.sqrt((base / 2) ** 2 + 1.5 ** 2); // +realocação de indecisos
    const vL = t1valL.valor - vies / 2;
    const vF = t1valF.valor + vies / 2;
    p1 = {
      lulaHoje: normCdf((vL - 50) / sigShare(sigmaHoje)),
      flavioHoje: normCdf((vF - 50) / sigShare(sigmaHoje)),
      lulaDia: normCdf((vL - 50) / sigShare(sigmaDia1)),
      flavioDia: normCdf((vF - 50) / sigShare(sigmaDia1)),
    };
  }
  const p2Tacontece = p1 ? Math.max(0, 1 - p1.lulaDia - p1.flavioDia) : 1;
  const p2ThojeAcontece = p1 ? Math.max(0, 1 - p1.lulaHoje - p1.flavioHoje) : 1;

  /* -------- chance combinada de eleição (1ºT direto OU vitória no 2ºT) -------- */
  const eleitoLhoje = (p1 ? p1.lulaHoje : 0) + p2ThojeAcontece * pL2hoje;
  const eleitoLdia = (p1 ? p1.lulaDia : 0) + p2Tacontece * pL2dia;
  const eleito: Eleito = {
    hoje: { l: eleitoLhoje, f: 1 - eleitoLhoje },
    dia: { l: eleitoLdia, f: 1 - eleitoLdia },
  };

  /* -------- tendências pareadas (mesmo instituto, rodada vs anterior) -------- */
  const tend2: TendenciasTurno = {
    l: tendenciaPareada(pesquisas, (p) => p.t2?.lula ?? null),
    f: tendenciaPareada(pesquisas, (p) => p.t2?.flavio ?? null),
    m: tendenciaPareada(pesquisas, (p) =>
      p.t2 ? (p.t2.lula as number) - (p.t2.flavio as number) : null,
    ),
  };
  const tend1: TendenciasTurno = {
    l: tendenciaPareada(pesquisas, (p) => p.t1?.lula ?? null),
    f: tendenciaPareada(pesquisas, (p) => p.t1?.flavio ?? null),
    m: tendenciaPareada(pesquisas, (p) =>
      p.t1 && p.t1.lula != null ? p.t1.lula - (p.t1.flavio as number) : null,
    ),
  };

  /* -------- séries para o gráfico -------- */
  const fazSerie = (mL: Metrica, mF: Metrica): PontoSerie[] => {
    const t0 = meioCampo(linhas[0]);
    const pts: PontoSerie[] = [];
    for (let t = t0; t <= hojeMs + 1; t += 6 * 864e5) {
      const a = mediaEm(t, pesquisas, mL, meiaVida);
      const b = mediaEm(t, pesquisas, mF, meiaVida);
      if (a && b) pts.push({ x: t, l: a.valor, f: b.valor });
    }
    const a = mediaEm(hojeMs, pesquisas, mL, meiaVida);
    const b = mediaEm(hojeMs, pesquisas, mF, meiaVida);
    if (a && b) pts.push({ x: hojeMs, l: a.valor, f: b.valor });
    return pts;
  };
  const serie2 = fazSerie(
    (p) => p.t2?.lula ?? null,
    (p) => p.t2?.flavio ?? null,
  );
  const serie1 = fazSerie(
    (p) => p.t1?.lula ?? null,
    (p) => p.t1?.flavio ?? null,
  );

  /* -------- veredito -------- */
  const liderNome = eleito.dia.l >= 0.5 ? "LULA" : "FLÁVIO BOLSONARO";
  const pLider = Math.max(eleito.dia.l, eleito.dia.f);
  let titulo: string, texto: string;
  if (pLider < 0.6) {
    titulo = "ELEIÇÃO INDEFINIDA — EMPATE TÉCNICO PROJETADO";
    texto = `A diferença efetiva de ${fmt(Math.abs(margemAj))} p.p. no 2º turno é pequena frente à incerteza projetada (±${fmt(sigmaDia2)} p.p.). Pelos dados, qualquer desfecho é plausível.`;
  } else if (pLider < 0.75) {
    titulo = `${liderNome} LEVEMENTE FAVORITO`;
    texto = `Há vantagem, mas ela cabe dentro dos erros históricos de pesquisa somados aos ${Math.ceil(dias2T)} dias até a decisão. Virada segue plenamente possível.`;
  } else if (pLider < 0.9) {
    titulo = `${liderNome} FAVORITO — vitória provável, não garantida`;
    texto = `A vantagem efetiva de ${fmt(Math.abs(margemAj))} p.p. no 2º turno supera a incerteza de curto prazo, mas um erro coletivo de pesquisa como o de 2022, ou movimento na campanha de TV, ainda permitiria virada.`;
  } else {
    titulo = `${liderNome} AMPLAMENTE FAVORITO`;
    texto = `Vantagem consistente em todas as fontes; virada exigiria erro de pesquisa e mudança de opinião fora do padrão histórico.`;
  }
  if (vies !== 0) {
    texto += ` Cenário com viés assumido de ${fmt(vies)} p.p. pró-direita nas pesquisas (média bruta ${fmtSinal(margem)} → margem efetiva ${fmtSinal(margemAj)}).`;
  }
  const qtdEmpate = linhas.filter((l) => l.empate2 && l.idadeDias < 35).length;
  const qtdRecentes = linhas.filter((l) => l.idadeDias < 35).length;

  return {
    linhas,
    seAgora,
    sdEntre,
    kEff,
    mediaL2,
    mediaF2,
    margem,
    margemAj,
    validoL2,
    t1raw,
    t1rawF,
    t1valL,
    t1valF,
    p1,
    sigmaHoje,
    sigmaDia1,
    sigmaDia2,
    deriva1,
    deriva2,
    pL2hoje,
    pL2dia,
    int80,
    p2Tacontece,
    eleito,
    tend2,
    tend1,
    serie1,
    serie2,
    dias1T: Math.ceil(dias1T),
    dias2T: Math.ceil(dias2T),
    titulo,
    texto,
    qtdEmpate,
    qtdRecentes,
  };
}
