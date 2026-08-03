/**
 * GABARITO DOS GOLDEN TESTS — cópia VERBATIM das funções do protótipo
 * `agregador-presidencial-2026.jsx` (fonte da verdade), sem React.
 *
 * NÃO EDITE para "melhorar", "arrumar tipos" ou "padronizar": qualquer adaptação
 * além de tirar do React (closures do componente viram parâmetros explícitos)
 * invalida a comparação. Este arquivo reproduz as linhas originais do .jsx e é
 * ignorado de propósito pelo eslint (eslint.config.mjs) e pelo tsc.
 *
 * Adaptações permitidas e realizadas (SOMENTE estas):
 *  - `useMemo(() => {...}, [deps])` → `export function nome(...) {...}`;
 *  - closures sobre `M`, `params`, `pesquisas`, `hojeMs` e `turnoGrafico` → parâmetros;
 *  - `calcVies(v)` (closure sobre M) → `calcVies(M, v)`;
 *  - `export` nas declarações de topo.
 */

/* eslint-disable */


/* ---------------- constantes (verbatim) ---------------- */

export const CORES = {
  papel: "#E8E8DF",
  cartao: "#F6F6F0",
  tela: "#0E241A",
  telaBorda: "#1E3A2C",
  fosforo: "#A7EFBB",
  fosforoForte: "#D8FBE2",
  tinta: "#181C18",
  cinza: "#63685F",
  linha: "#C6C6B8",
  lula: "#C4122F",
  flavio: "#16418C",
  alerta: "#D96A1B",
  confirma: "#1E7A46",
};

export const ELEICAO_1T = Date.parse("2026-10-04T12:00:00-03:00");
export const ELEICAO_2T = Date.parse("2026-10-25T12:00:00-03:00");

/* Erro médio das pesquisas de véspera × urna em 2022 (votos válidos, agregado dos institutos).
   Importante: os erros NÃO se somam — o do 2ºT foi medido sobre pesquisas novas, refeitas após o 1ºT. */
export const ERRO_2022 = {
  t1: { lula: -1.0, flavio: 5.3, margem: 6.3 },  // véspera: margens de +7,1 a +14 (média +11,6) × urna +5,2
  t2: { lula: -1.6, flavio: 1.6, margem: 3.1 },  // véspera: margens de +0,8 a +8 (média +4,9) × urna +1,8
};
export const CENARIOS_VIES = [
  { vies: 0, rotulo: "sem viés", titulo: "Sem viés — pesquisas certas",
    desc: "O agregado de 2026 acerta na média: a vantagem de +4,7 p.p. é real. É o cenário-base do painel." },
  { vies: 3.1, rotulo: "réplica 2022", titulo: "Réplica 2022 — erro do 2ºT se repete",
    desc: "As pesquisas da DECISÃO erram +3,1 pró-Lula, o mesmo erro do 2º turno de 2022. A margem real cai para ~+1,6: Lula vence apertado — o filme de 2022 de novo." },
  { vies: 6.3, rotulo: "teste-limite +6,3", titulo: "Teste-limite — erro tamanho 1ºT-22 chega à decisão",
    desc: "Hipótese que NÃO ocorreu em 2022: o erro grande do 1º turno (+6,3) persistir até o dia decisivo, sem a recalibragem que os institutos fizeram entre os turnos. Como +6,3 passa do ponto de virada (+4,7), a corrida inverte." },
];

export const CANDIDATOS = [
  { nome: "Lula", partido: "PT", cor: "#C4122F" },
  { nome: "Flávio Bolsonaro", partido: "PL", cor: "#16418C" },
  { nome: "Renan Santos", partido: "Missão", cor: "#7C3AED" },
  { nome: "Ronaldo Caiado", partido: "PSD", cor: "#0E7C86" },
  { nome: "Romeu Zema", partido: "Novo", cor: "#E8791D" },
  { nome: "Augusto Cury", partido: "Avante", cor: "#A16207" },
  { nome: "Cabo Daciolo", partido: "Mobiliza", cor: "#0F766E" },
  { nome: "Samara Martins", partido: "UP", cor: "#B4236B" },
  { nome: "Joaquim Barbosa", partido: "DC", cor: "#4B5563" },
];

export const PARAMS_PADRAO = { meiaVida: 21, sigmaSys: 4.0, coefDeriva: 0.35, vies: 0 };



/* ---------------------- utilidades ---------------------- */
export const fmt = (v, d = 1) =>
  v == null || isNaN(v) ? "–" : Number(v).toFixed(d).replace(".", ",");
export const fmtSinal = (v, d = 1) => (v >= 0 ? "+" : "−") + fmt(Math.abs(v), d);
export const fmtData = (iso) => { if (!iso) return "–"; const [, m, d] = iso.split("-"); return `${d}/${m}`; };
export const pct = (p) => (p == null ? "–" : Math.round(p * 100) + "%");

export function normCdf(z) {
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989423 * Math.exp((-z * z) / 2);
  const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return z > 0 ? 1 - p : p;
}
export const meioCampo = (p) =>
  (Date.parse(p.inicio + "T12:00:00-03:00") + Date.parse(p.fim + "T12:00:00-03:00")) / 2;

/* Média ponderada em um instante t (recência conta a partir de t) */
export function mediaEm(t, polls, metric, meiaVida) {
  let sw = 0, sv = 0, k = 0;
  for (const p of polls) {
    const v = metric(p);
    const mid = meioCampo(p);
    if (v == null || mid > t) continue;
    const w = Math.exp((-Math.LN2 * ((t - mid) / 864e5)) / meiaVida) *
      Math.min(1.5, Math.sqrt((p.n || 1000) / 2000));
    sw += w; sv += w * v; k++;
  }
  return sw > 0 ? { valor: sv / sw, k } : null;
}

/* Tendência pareada: última rodada − rodada anterior do MESMO instituto (≤75 dias) */
export function tendenciaPareada(polls, metric) {
  const porInst = {};
  for (const p of polls) {
    if (metric(p) == null) continue;
    (porInst[p.instituto] = porInst[p.instituto] || []).push(p);
  }
  const deltas = [];
  for (const arr of Object.values(porInst)) {
    arr.sort((a, b) => meioCampo(a) - meioCampo(b));
    if (arr.length >= 2) {
      const ult = arr[arr.length - 1], ant = arr[arr.length - 2];
      if ((meioCampo(ult) - meioCampo(ant)) / 864e5 <= 75) deltas.push(metric(ult) - metric(ant));
    }
  }
  if (!deltas.length) return null;
  return { delta: deltas.reduce((a, b) => a + b, 0) / deltas.length, pares: deltas.length };
}

/* ---------------------- o modelo ---------------------- */
export function rodarModelo(pesquisas, params, hojeMs) {
  const com2T = pesquisas.filter((p) => p.t2 && p.t2.lula != null && p.t2.flavio != null);
  if (!com2T.length) return null;
  const { meiaVida, sigmaSys, coefDeriva } = params;
  const vies = params.vies || 0;

  const linhas = com2T.map((p) => {
    const idadeDias = Math.max(0, (hojeMs - meioCampo(p)) / 864e5);
    const w = Math.exp((-Math.LN2 * idadeDias) / meiaVida) *
      Math.min(1.5, Math.sqrt((p.n || 1000) / 2000));
    const margem2 = p.t2.lula - p.t2.flavio;
    return { ...p, idadeDias, w, margem2, empate2: Math.abs(margem2) <= 2 * (p.moe || 2) };
  }).sort((a, b) => meioCampo(a) - meioCampo(b));

  const somaW = linhas.reduce((s, l) => s + l.w, 0);
  const wm = (fn) => linhas.reduce((s, l) => s + l.w * fn(l), 0) / somaW;

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
  const int80 = [margemAj - z80 * sigmaDia2, margemAj + z80 * sigmaDia2];

  /* -------- 1º turno -------- */
  const t1raw = mediaEm(hojeMs, pesquisas, (p) => p.t1?.lula ?? null, meiaVida);
  const t1rawF = mediaEm(hojeMs, pesquisas, (p) => p.t1?.flavio ?? null, meiaVida);
  const t1valL = mediaEm(hojeMs, pesquisas,
    (p) => (p.t1 && p.t1.lula != null && p.t1.bnns != null ? (100 * p.t1.lula) / (100 - p.t1.bnns) : null), meiaVida);
  const t1valF = mediaEm(hojeMs, pesquisas,
    (p) => (p.t1 && p.t1.flavio != null && p.t1.bnns != null ? (100 * p.t1.flavio) / (100 - p.t1.bnns) : null), meiaVida);

  let p1 = null;
  if (t1valL && t1valF) {
    const sigShare = (base) => Math.sqrt((base / 2) ** 2 + 1.5 ** 2); // +realocação de indecisos
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
  const eleito = {
    hoje: { l: eleitoLhoje, f: 1 - eleitoLhoje },
    dia: { l: eleitoLdia, f: 1 - eleitoLdia },
  };

  /* -------- tendências pareadas (mesmo instituto, rodada vs anterior) -------- */
  const tend2 = {
    l: tendenciaPareada(pesquisas, (p) => p.t2?.lula ?? null),
    f: tendenciaPareada(pesquisas, (p) => p.t2?.flavio ?? null),
    m: tendenciaPareada(pesquisas, (p) => (p.t2 ? p.t2.lula - p.t2.flavio : null)),
  };
  const tend1 = {
    l: tendenciaPareada(pesquisas, (p) => p.t1?.lula ?? null),
    f: tendenciaPareada(pesquisas, (p) => p.t1?.flavio ?? null),
    m: tendenciaPareada(pesquisas, (p) => (p.t1 && p.t1.lula != null ? p.t1.lula - p.t1.flavio : null)),
  };

  /* -------- séries para o gráfico -------- */
  const fazSerie = (mL, mF) => {
    const t0 = meioCampo(linhas[0]);
    const pts = [];
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
  const serie2 = fazSerie((p) => p.t2?.lula ?? null, (p) => p.t2?.flavio ?? null);
  const serie1 = fazSerie((p) => p.t1?.lula ?? null, (p) => p.t1?.flavio ?? null);

  /* -------- veredito -------- */
  const liderNome = eleito.dia.l >= 0.5 ? "LULA" : "FLÁVIO BOLSONARO";
  const pLider = Math.max(eleito.dia.l, eleito.dia.f);
  let titulo, texto;
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
    linhas, seAgora, sdEntre, kEff,
    mediaL2, mediaF2, margem, margemAj, validoL2,
    t1raw, t1rawF, t1valL, t1valF, p1,
    sigmaHoje, sigmaDia1, sigmaDia2, deriva1, deriva2,
    pL2hoje, pL2dia, int80, p2Tacontece, eleito,
    tend2, tend1, serie1, serie2,
    dias1T: Math.ceil(dias1T), dias2T: Math.ceil(dias2T),
    titulo, texto, qtdEmpate, qtdRecentes,
  };
}



/* -------- derivados do componente (verbatim, sem React) -------- */

export function dadosDist(M) {
  if (!M) return [];
  const { margemAj, sigmaDia2 } = M;
  const pts = [];
  for (let i = 0; i <= 120; i++) {
    const x = margemAj - 4 * sigmaDia2 + (i / 120) * 8 * sigmaDia2;
    const pdf = Math.exp(-((x - margemAj) ** 2) / (2 * sigmaDia2 ** 2));
    pts.push({ x, lula: x > 0 ? pdf : 0, flavio: x <= 0 ? pdf : 0 });
  }
  return pts;
}

export function pontosGrafico(M, turnoGrafico) {
  if (!M) return [];
  return M.linhas
    .filter((l) => (turnoGrafico === 2 ? l.t2 : l.t1 && l.t1.lula != null))
    .map((l) => ({
      ...l, x: meioCampo(l),
      lVal: turnoGrafico === 2 ? l.t2.lula : l.t1.lula,
      fVal: turnoGrafico === 2 ? l.t2.flavio : l.t1.flavio,
    }));
}

export function calcVies(M, vies) {
  if (!M) return { vies, mA: 0, elD: 0.5, elH: 0.5 };
  const sigShare = (b) => Math.sqrt((b / 2) ** 2 + 1.5 ** 2);
  const mA = M.margem - vies;
  const pL2d = normCdf(mA / M.sigmaDia2);
  const pL2h = normCdf(mA / M.sigmaHoje);
  let elD = pL2d, elH = pL2h;
  if (M.t1valL && M.t1valF) {
    const vL = M.t1valL.valor - vies / 2, vF = M.t1valF.valor + vies / 2;
    const p1Ld = normCdf((vL - 50) / sigShare(M.sigmaDia1));
    const p1Fd = normCdf((vF - 50) / sigShare(M.sigmaDia1));
    const p1Lh = normCdf((vL - 50) / sigShare(M.sigmaHoje));
    const p1Fh = normCdf((vF - 50) / sigShare(M.sigmaHoje));
    elD = p1Ld + Math.max(0, 1 - p1Ld - p1Fd) * pL2d;
    elH = p1Lh + Math.max(0, 1 - p1Lh - p1Fh) * pL2h;
  }
  return { vies, mA, elD, elH };
}

export function serieSens(M) {
  if (!M) return [];
  const pts = [];
  for (let v = -3; v <= 10.001; v += 0.25) {
    const c = calcVies(M, v);
    pts.push({ v: Math.round(v * 100) / 100, l: c.elD * 100, f: (1 - c.elD) * 100 });
  }
  return pts;
}

export function replay(M) {
  if (!M || !M.t1valL || !M.t1valF) return null;
  const r1L = M.t1valL.valor + ERRO_2022.t1.lula;
  const r1F = M.t1valF.valor + ERRO_2022.t1.flavio;
  const r2L = M.validoL2 + ERRO_2022.t2.lula;
  const r2F = 100 - M.validoL2 + ERRO_2022.t2.flavio;
  /* Estimativa CONDICIONAL à réplica exata: o erro deixa de ser incerteza (fica fixado
     nos valores de 2022, turno a turno); resta apenas a deriva da opinião até a votação
     e o ruído amostral do agregado — sem o termo de erro sistemático. */
  const sig = (b) => Math.sqrt((b / 2) ** 2 + 1.5 ** 2);
  const seA = M.seAgora;
  const sD1c = Math.hypot(seA, M.deriva1), sD2c = Math.hypot(seA, M.deriva2);
  const mRep = M.margem - ERRO_2022.t2.margem;
  const p2d = normCdf(mRep / sD2c), p2h = normCdf(mRep / seA);
  const p1Ld = normCdf((r1L - 50) / sig(sD1c)), p1Fd = normCdf((r1F - 50) / sig(sD1c));
  const p1Lh = normCdf((r1L - 50) / sig(seA)), p1Fh = normCdf((r1F - 50) / sig(seA));
  const elRepD = p1Ld + Math.max(0, 1 - p1Ld - p1Fd) * p2d;
  const elRepH = p1Lh + Math.max(0, 1 - p1Lh - p1Fh) * p2h;
  /* probabilidades de cada quadro */
  const p2Trep = Math.max(0, 1 - p1Ld - p1Fd);            // 1ºT termina sem definição → há 2º turno
  const sM1 = Math.hypot(sD1c, 3.0);                       // margem do 1ºT: deriva + ruído + realocação de indecisos
  const pLider1 = normCdf((r1L - r1F) / sM1);              // Lula chega em 1º no 1º turno
  return { r1L, r1F, r2L, r2F, elRepD, elRepH,
    p1Ld, p2Trep, pLider1, pV2rep: p2d,
    pPainel: calcVies(M, ERRO_2022.t2.margem).elD };
}

export function cenBase(M, params) {
  if (!M || !M.t1valL || !M.t1valF || !M.p1) return null;
  const vies = params.vies || 0;
  const liderLula = M.eleito.dia.l >= 0.5;
  const lider = liderLula ? "LULA" : "FLÁVIO BOLSONARO";
  const pElei = Math.max(M.eleito.dia.l, M.eleito.dia.f);
  const pDireto = liderLula ? M.p1.lulaDia : M.p1.flavioDia;
  const pV2 = liderLula ? M.pL2dia : 1 - M.pL2dia;
  // líder da largada (1º colocado no 1º turno)
  const m1 = M.t1valL.valor - M.t1valF.valor - vies;
  const sM1 = Math.hypot(M.sigmaDia1, 3.0);
  const pLulaEm1 = normCdf(m1 / sM1);
  // bandas de margem do 2ºT sobre N(margemAj, sigmaDia2)
  const F = (x) => normCdf((x - M.margemAj) / M.sigmaDia2);
  const bandas = [
    { rot: "Flávio vence", p: F(0), cor: CORES.flavio },
    { rot: "Lula por 0–5 (apertada)", p: F(5) - F(0), cor: CORES.lula },
    { rot: "Lula por 5–10", p: F(10) - F(5), cor: "#D96A7A" },
    { rot: "Lula por 10+", p: Math.max(0, 1 - F(10)), cor: "#E8A4AE" },
  ];
  const modal = bandas.reduce((a, b) => (b.p > a.p ? b : a));
  const margemValid = (100 * M.margemAj) / (M.mediaL2 + M.mediaF2);
  const placarL = 50 + margemValid / 2;
  return { lider, liderLula, pElei, pDireto, pV2, pLulaEm1, bandas, modal, placarL };
}

export const valCand = (p, nome) =>
  nome === "Lula" ? (p.t1 ? p.t1.lula : null)
  : nome === "Flávio Bolsonaro" ? (p.t1 ? p.t1.flavio : null)
  : (p.outros1 ? (p.outros1[nome] ?? null) : null);

export function campoCompleto(pesquisas, params, hojeMs) {
  const linhas = CANDIDATOS.map((c) => {
    const r = mediaEm(hojeMs, pesquisas, (p) => valCand(p, c.nome), params.meiaVida);
    return { ...c, media: r ? r.valor : null, k: r ? r.k : 0 };
  }).filter((c) => c.media != null).sort((a, b) => b.media - a.media);
  if (!linhas.length) return null;
  const bn = mediaEm(hojeMs, pesquisas, (p) => (p.t1 ? p.t1.bnns : null), params.meiaVida);
  const top2 = linhas.slice(0, 2).map((c) => c.nome);
  const parPadrao = top2.includes("Lula") && top2.includes("Flávio Bolsonaro");
  const gap3 = linhas.length > 2 ? linhas[1].media - linhas[2].media : null;
  const pollsCampo = pesquisas
    .filter((p) => p.t1 && p.t1.lula != null)
    .sort((a, b) => meioCampo(b) - meioCampo(a))
    .slice(0, 7);
  return { linhas, bn: bn ? bn.valor : null, top2, parPadrao, gap3, pollsCampo };
}

