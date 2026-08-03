/**
 * DERIVADOS DO MODELO — porte puro dos `useMemo`/closures do componente do protótipo
 * `agregador-presidencial-2026.jsx`. Cada função abaixo é a mesma expressão do protótipo,
 * só que sem React: recebe o `ResultadoModelo` (o antigo `M`) por parâmetro.
 *
 * INTOCÁVEL NUMERICAMENTE (golden tests, tolerância 1e-9). As cores das bandas fazem
 * parte dos dados retornados no protótipo e são mantidas aqui.
 */
import { CANDIDATOS, CORES, ERRO_2022 } from "@/data/constantes";
import type { Candidato, Pesquisa, Placar } from "@/data/tipos";
import { meioCampo, mediaEm, normCdf, type LinhaModelo, type ResultadoModelo } from "./nucleo";

/* ---------------------- curva de viés ---------------------- */

/** Resultado do cenário de viés: margem ajustada e chance de Lula eleito (dia/hoje). */
export interface ResultadoVies {
  vies: number;
  /** margem ajustada pelo viés (margem bruta − viés) */
  mA: number;
  /** chance de Lula eleito projetada para o dia da votação */
  elD: number;
  /** chance de Lula eleito no cenário atual */
  elH: number;
}

/**
 * Recalcula a chance de eleição sob um viés assumido das pesquisas (p.p. pró-Lula).
 * Versão pura da closure `calcVies` do protótipo — parte SEMPRE da margem BRUTA
 * (`M.margem`), então independe do `params.vies` que gerou o `M`.
 */
export function calcVies(m: ResultadoModelo | null, vies: number): ResultadoVies {
  if (!m) return { vies, mA: 0, elD: 0.5, elH: 0.5 };
  const sigShare = (b: number) => Math.sqrt((b / 2) ** 2 + 1.5 ** 2);
  const mA = m.margem - vies;
  const pL2d = normCdf(mA / m.sigmaDia2);
  const pL2h = normCdf(mA / m.sigmaHoje);
  let elD = pL2d,
    elH = pL2h;
  if (m.t1valL && m.t1valF) {
    const vL = m.t1valL.valor - vies / 2,
      vF = m.t1valF.valor + vies / 2;
    const p1Ld = normCdf((vL - 50) / sigShare(m.sigmaDia1));
    const p1Fd = normCdf((vF - 50) / sigShare(m.sigmaDia1));
    const p1Lh = normCdf((vL - 50) / sigShare(m.sigmaHoje));
    const p1Fh = normCdf((vF - 50) / sigShare(m.sigmaHoje));
    elD = p1Ld + Math.max(0, 1 - p1Ld - p1Fd) * pL2d;
    elH = p1Lh + Math.max(0, 1 - p1Lh - p1Fh) * pL2h;
  }
  return { vies, mA, elD, elH };
}

/** Ponto da curva de sensibilidade ao viés: viés (p.p.) × chances em %. */
export interface PontoSens {
  v: number;
  l: number;
  f: number;
}

/** Curva de sensibilidade ao viés: −3 a +10 p.p., passo 0,25. */
export function calcSerieSens(m: ResultadoModelo | null): PontoSens[] {
  if (!m) return [];
  const pts: PontoSens[] = [];
  for (let v = -3; v <= 10.001; v += 0.25) {
    const c = calcVies(m, v);
    pts.push({ v: Math.round(v * 100) / 100, l: c.elD * 100, f: (1 - c.elD) * 100 });
  }
  return pts;
}

/* ---------------------- distribuição da margem ---------------------- */

/** Ponto da densidade (não normalizada) da margem projetada do 2º turno. */
export interface PontoDist {
  x: number;
  lula: number;
  flavio: number;
}

/** 121 pontos de ±4σ em torno da margem ajustada, separados por quem vence. */
export function calcDadosDist(m: ResultadoModelo | null): PontoDist[] {
  if (!m) return [];
  const { margemAj, sigmaDia2 } = m;
  const pts: PontoDist[] = [];
  for (let i = 0; i <= 120; i++) {
    const x = margemAj - 4 * sigmaDia2 + (i / 120) * 8 * sigmaDia2;
    const pdf = Math.exp(-((x - margemAj) ** 2) / (2 * sigmaDia2 ** 2));
    pts.push({ x, lula: x > 0 ? pdf : 0, flavio: x <= 0 ? pdf : 0 });
  }
  return pts;
}

/* ---------------------- réplica de 2022 ---------------------- */

/** Réplica fiel de 2022: o erro de cada turno aplicado no seu próprio turno. */
export interface Replay {
  /** Lula no 1ºT (válidos) com o erro do 1ºT de 2022 */
  r1L: number;
  /** Flávio no 1ºT (válidos) com o erro do 1ºT de 2022 */
  r1F: number;
  /** Lula no 2ºT (válidos) com o erro do 2ºT de 2022 */
  r2L: number;
  /** Flávio no 2ºT (válidos) com o erro do 2ºT de 2022 */
  r2F: number;
  /** chance de Lula eleito na réplica, projetada para o dia */
  elRepD: number;
  /** chance de Lula eleito na réplica, no cenário atual */
  elRepH: number;
  /** chance de Lula fechar o 1ºT já eleito, na réplica */
  p1Ld: number;
  /** chance de haver 2º turno, na réplica */
  p2Trep: number;
  /** chance de Lula chegar em 1º lugar no 1º turno */
  pLider1: number;
  /** chance de Lula vencer o 2º turno na réplica */
  pV2rep: number;
  /** chance de Lula eleito pelo painel com viés = erro do 2ºT de 2022 (+3,1) */
  pPainel: number;
}

/**
 * Réplica de 2022: aplica o erro MEDIDO de cada turno no seu próprio turno.
 * Os erros NÃO se somam — o do 2ºT foi medido sobre pesquisas novas, refeitas após o 1ºT.
 */
export function calcReplay(m: ResultadoModelo | null): Replay | null {
  if (!m || !m.t1valL || !m.t1valF) return null;
  const r1L = m.t1valL.valor + ERRO_2022.t1.lula;
  const r1F = m.t1valF.valor + ERRO_2022.t1.flavio;
  const r2L = m.validoL2 + ERRO_2022.t2.lula;
  const r2F = 100 - m.validoL2 + ERRO_2022.t2.flavio;
  /* Estimativa CONDICIONAL à réplica exata: o erro deixa de ser incerteza (fica fixado
     nos valores de 2022, turno a turno); resta apenas a deriva da opinião até a votação
     e o ruído amostral do agregado — sem o termo de erro sistemático. */
  const sig = (b: number) => Math.sqrt((b / 2) ** 2 + 1.5 ** 2);
  const seA = m.seAgora;
  const sD1c = Math.hypot(seA, m.deriva1),
    sD2c = Math.hypot(seA, m.deriva2);
  const mRep = m.margem - ERRO_2022.t2.margem;
  const p2d = normCdf(mRep / sD2c),
    p2h = normCdf(mRep / seA);
  const p1Ld = normCdf((r1L - 50) / sig(sD1c)),
    p1Fd = normCdf((r1F - 50) / sig(sD1c));
  const p1Lh = normCdf((r1L - 50) / sig(seA)),
    p1Fh = normCdf((r1F - 50) / sig(seA));
  const elRepD = p1Ld + Math.max(0, 1 - p1Ld - p1Fd) * p2d;
  const elRepH = p1Lh + Math.max(0, 1 - p1Lh - p1Fh) * p2h;
  /* probabilidades de cada quadro */
  const p2Trep = Math.max(0, 1 - p1Ld - p1Fd); // 1ºT termina sem definição → há 2º turno
  const sM1 = Math.hypot(sD1c, 3.0); // margem do 1ºT: deriva + ruído + realocação de indecisos
  const pLider1 = normCdf((r1L - r1F) / sM1); // Lula chega em 1º no 1º turno
  return {
    r1L,
    r1F,
    r2L,
    r2F,
    elRepD,
    elRepH,
    p1Ld,
    p2Trep,
    pLider1,
    pV2rep: p2d,
    pPainel: calcVies(m, ERRO_2022.t2.margem).elD,
  };
}

/* ---------------------- cenário-base modal ---------------------- */

/** Banda de margem do 2º turno com sua probabilidade e a cor do protótipo. */
export interface BandaCenario {
  rot: string;
  p: number;
  cor: string;
}

/** Cenário-base: o caminho modal do líder projetado. */
export interface CenarioBase {
  lider: string;
  liderLula: boolean;
  /** chance de o líder ser eleito */
  pElei: number;
  /** chance de o líder vencer já no 1º turno */
  pDireto: number;
  /** chance de o líder vencer o 2º turno */
  pV2: number;
  /** chance de Lula terminar o 1º turno em 1º lugar */
  pLulaEm1: number;
  bandas: BandaCenario[];
  /** banda mais provável */
  modal: BandaCenario;
  /** placar de Lula em votos válidos no 2º turno (%) */
  placarL: number;
}

/** Cenário-base modal do 2º turno (usa o viés corrente do painel). */
export function calcCenarioBase(m: ResultadoModelo | null, viesParam: number): CenarioBase | null {
  if (!m || !m.t1valL || !m.t1valF || !m.p1) return null;
  const vies = viesParam || 0;
  const p1 = m.p1;
  const liderLula = m.eleito.dia.l >= 0.5;
  const lider = liderLula ? "LULA" : "FLÁVIO BOLSONARO";
  const pElei = Math.max(m.eleito.dia.l, m.eleito.dia.f);
  const pDireto = liderLula ? p1.lulaDia : p1.flavioDia;
  const pV2 = liderLula ? m.pL2dia : 1 - m.pL2dia;
  // líder da largada (1º colocado no 1º turno)
  const m1 = m.t1valL.valor - m.t1valF.valor - vies;
  const sM1 = Math.hypot(m.sigmaDia1, 3.0);
  const pLulaEm1 = normCdf(m1 / sM1);
  // bandas de margem do 2ºT sobre N(margemAj, sigmaDia2)
  const F = (x: number) => normCdf((x - m.margemAj) / m.sigmaDia2);
  const bandas: BandaCenario[] = [
    { rot: "Flávio vence", p: F(0), cor: CORES.flavio },
    { rot: "Lula por 0–5 (apertada)", p: F(5) - F(0), cor: CORES.lula },
    { rot: "Lula por 5–10", p: F(10) - F(5), cor: "#D96A7A" },
    { rot: "Lula por 10+", p: Math.max(0, 1 - F(10)), cor: "#E8A4AE" },
  ];
  const modal = bandas.reduce((a, b) => (b.p > a.p ? b : a));
  const margemValid = (100 * m.margemAj) / (m.mediaL2 + m.mediaF2);
  const placarL = 50 + margemValid / 2;
  return { lider, liderLula, pElei, pDireto, pV2, pLulaEm1, bandas, modal, placarL };
}

/* ---------------------- campo completo (todos os candidatos) ---------------------- */

/** Intenção de voto de 1º turno de um candidato numa pesquisa (`null` = não testado). */
export const valCand = (p: Pesquisa, nome: string): number | null =>
  nome === "Lula"
    ? p.t1
      ? p.t1.lula
      : null
    : nome === "Flávio Bolsonaro"
      ? p.t1
        ? p.t1.flavio
        : null
      : p.outros1
        ? (p.outros1[nome] ?? null)
        : null;

/** Linha do ranking de 1º turno: candidato + média ponderada e nº de pesquisas. */
export interface LinhaCampo extends Candidato {
  media: number;
  k: number;
}

/** Ranking do 1º turno com os 9 candidatos e o contexto do par líder. */
export interface CampoCompleto {
  linhas: LinhaCampo[];
  /** média de branco/nulo + não sabe */
  bn: number | null;
  /** nomes dos dois primeiros */
  top2: string[];
  /** o par líder ainda é Lula × Flávio */
  parPadrao: boolean;
  /** distância do 2º para o 3º colocado */
  gap3: number | null;
  /** as 7 pesquisas de 1º turno mais recentes */
  pollsCampo: Pesquisa[];
}

/** Ranking do 1º turno (todos os candidatos) na data `hojeMs`. */
export function calcCampoCompleto(
  pesquisas: readonly Pesquisa[],
  meiaVida: number,
  hojeMs: number,
): CampoCompleto | null {
  const linhas = CANDIDATOS.map((c) => {
    const r = mediaEm(hojeMs, pesquisas, (p) => valCand(p, c.nome), meiaVida);
    return { ...c, media: r ? r.valor : null, k: r ? r.k : 0 };
  })
    .filter((c): c is LinhaCampo => c.media != null)
    .sort((a, b) => b.media - a.media);
  if (!linhas.length) return null;
  const bn = mediaEm(hojeMs, pesquisas, (p) => (p.t1 ? p.t1.bnns : null), meiaVida);
  const top2 = linhas.slice(0, 2).map((c) => c.nome);
  const parPadrao = top2.includes("Lula") && top2.includes("Flávio Bolsonaro");
  const gap3 = linhas.length > 2 ? linhas[1].media - linhas[2].media : null;
  const pollsCampo = pesquisas
    .filter((p) => p.t1 && p.t1.lula != null)
    .sort((a, b) => meioCampo(b) - meioCampo(a))
    .slice(0, 7);
  return { linhas, bn: bn ? bn.valor : null, top2, parPadrao, gap3, pollsCampo };
}

/* ---------------------- pontos do gráfico ---------------------- */

/** Pesquisa posicionada no gráfico: instante do meio do campo + valores do turno. */
export type PontoGrafico = LinhaModelo & {
  x: number;
  lVal: number;
  fVal: number;
};

/** Pontos (scatter) das pesquisas no turno escolhido (1 ou 2). */
export function calcPontosGrafico(m: ResultadoModelo | null, turnoGrafico: number): PontoGrafico[] {
  if (!m) return [];
  return m.linhas
    .filter((l) => (turnoGrafico === 2 ? !!l.t2 : !!(l.t1 && l.t1.lula != null)))
    .map((l) => ({
      ...l,
      x: meioCampo(l),
      lVal: turnoGrafico === 2 ? l.t2.lula : ((l.t1 as Placar).lula as number),
      fVal: turnoGrafico === 2 ? l.t2.flavio : ((l.t1 as Placar).flavio as number),
    }));
}
