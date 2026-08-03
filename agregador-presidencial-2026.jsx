import { useState, useMemo } from "react";
import {
  ComposedChart, Scatter, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, ReferenceDot, ResponsiveContainer, AreaChart, Area,
} from "recharts";

/* ============================================================
   AGREGADOR PRESIDENCIAL 2026 — Lula (PT) × Flávio Bolsonaro (PL)
   Série histórica de pesquisas registradas no TSE (jan–jul/2026)
   Modelo: média ponderada · tendência pareada por instituto ·
   probabilidade no cenário atual e projetada para o dia da votação
   ============================================================ */

const ULTIMA_ATUALIZACAO = "03/08/2026";

const CORES = {
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

const ELEICAO_1T = Date.parse("2026-10-04T12:00:00-03:00");
const ELEICAO_2T = Date.parse("2026-10-25T12:00:00-03:00");

/* ---------------- Série de pesquisas (registro no TSE) ---------------- */
/* t1/t2: intenção de voto (%). bnns = branco/nulo + não sabe. null = não divulgado na fonte. */
const PESQUISAS_OFICIAIS = [
  // ---- rodadas de julho/2026 (mais recentes) ----
  { id: "atlas-jul", instituto: "AtlasIntel", contratante: "Próprio instituto / Bloomberg",
    inicio: "2026-07-22", fim: "2026-07-27", n: 5021, moe: 1.0, tse: "BR-08602/2026",
    t1: { lula: 44.9, flavio: 35.8, bnns: 1.6 },
    outros1: { "Renan Santos": 7.8, "Ronaldo Caiado": 3.1, "Romeu Zema": 2.8, "Samara Martins": 2.1, "Augusto Cury": 1.6, "Cabo Daciolo": 0.1 },
    t2: { lula: 49.2, flavio: 42.9, bnns: 7.9 },
    fonte: "https://www.gazetadopovo.com.br/eleicoes/2026/pesquisa-eleitoral-2026/atlasintel-presidente-julho-2026-2/" },
  { id: "poder-jul", instituto: "PoderData", contratante: "Próprio instituto",
    inicio: "2026-07-26", fim: "2026-07-28", n: 2400, moe: 2.0, tse: "BR-07845/2026",
    t1: { lula: 41, flavio: 35, bnns: 9 },
    outros1: { "Ronaldo Caiado": 5, "Renan Santos": 4, "Romeu Zema": 3, "Augusto Cury": 3 },
    t2: { lula: 46, flavio: 43, bnns: 11 },
    fonte: "https://www.gazetadopovo.com.br/eleicoes/2026/pesquisa-eleitoral-2026/poderdata-presidente-pesquisa-julho-2026/" },
  { id: "nexus-jul", instituto: "Nexus", contratante: "Banco BTG Pactual",
    inicio: "2026-07-24", fim: "2026-07-26", n: 2004, moe: 2.0, tse: "BR-01489/2026",
    t1: { lula: 42, flavio: 33, bnns: 8 },
    outros1: { "Ronaldo Caiado": 6, "Renan Santos": 5, "Romeu Zema": 3, "Augusto Cury": 2, "Cabo Daciolo": 1 },
    t2: { lula: 47, flavio: 43, bnns: 10 },
    fonte: "https://www.gazetadopovo.com.br/eleicoes/2026/pesquisa-eleitoral-2026/nexus-btg-pactual-presidente-julho-2026-2/" },
  { id: "dataf-jul", instituto: "Datafolha", contratante: "Grupo Folha",
    inicio: "2026-07-22", fim: "2026-07-24", n: 2004, moe: 2.0, tse: "BR-01166/2026",
    t1: { lula: 40, flavio: 32, bnns: null }, t2: { lula: 48, flavio: 43, bnns: 9 },
    fonte: "https://www.gazetadopovo.com.br/eleicoes/2026/datafolha-presidente-julho-2026/" },
  { id: "gerp-jul", instituto: "Gerp", contratante: "Próprio instituto",
    inicio: "2026-07-15", fim: "2026-07-17", n: 2000, moe: 2.19, tse: "BR-05026/2026",
    t1: { lula: 38, flavio: 38, bnns: 12 },
    outros1: { "Romeu Zema": 3, "Renan Santos": 3, "Ronaldo Caiado": 3, "Samara Martins": 1, "Cabo Daciolo": 1, "Joaquim Barbosa": 1, "Augusto Cury": 1 },
    t2: { lula: 45, flavio: 46, bnns: 9 },
    fonte: "https://www.gazetadopovo.com.br/eleicoes/2026/pesquisa-eleitoral-2026/gerp-presidente-julho-2026-2/" },
  { id: "indexa-jul", instituto: "Indexa", contratante: "Próprio instituto",
    inicio: "2026-07-16", fim: "2026-07-19", n: 2000, moe: 2.2, tse: "BR-02094/2026",
    t1: { lula: 41, flavio: 30, bnns: 15 },
    outros1: { "Ronaldo Caiado": 6, "Romeu Zema": 3, "Renan Santos": 3, "Joaquim Barbosa": 1, "Augusto Cury": 1 },
    t2: { lula: 46, flavio: 39, bnns: 15 },
    fonte: "https://www.gazetadopovo.com.br/eleicoes/2026/pesquisa-eleitoral-2026/indexa-pesquisas-presidente-julho-2026/" },
  { id: "quaest-jul", instituto: "Genial/Quaest", contratante: "Banco Genial",
    inicio: "2026-07-10", fim: "2026-07-13", n: 2004, moe: 2.0, tse: "BR-07181/2026",
    t1: { lula: 40, flavio: 28, bnns: 19 },
    outros1: { "Ronaldo Caiado": 4, "Renan Santos": 3, "Romeu Zema": 2, "Cabo Daciolo": 1, "Augusto Cury": 1, "Joaquim Barbosa": 1, "Samara Martins": 1 },
    t2: { lula: 45, flavio: 37, bnns: 18 },
    fonte: "https://www.gazetadopovo.com.br/eleicoes/2026/pesquisa-eleitoral-2026/genial-quaest-presidente-julho-2026/" },
  // ---- rodadas anteriores (série histórica p/ tendência) ----
  { id: "atlas-jun", instituto: "AtlasIntel", contratante: "Próprio instituto / Bloomberg",
    inicio: "2026-06-26", fim: "2026-06-30", n: 4999, moe: 1.0, tse: "BR-04582/2026",
    t1: null, t2: { lula: 48.8, flavio: 42.3, bnns: 8.9 },
    fonte: "https://exame.com/brasil/atlasintel-lula-tem-488-e-flavio-bolsonaro-423-no-2o-turno/" },
  { id: "poder-jun", instituto: "PoderData", contratante: "Próprio instituto",
    inicio: "2026-06-21", fim: "2026-06-24", n: 2400, moe: 2.0, tse: "BR-05722/2026",
    t1: null, t2: { lula: 46, flavio: 43, bnns: 11 },
    fonte: "https://www.cnnbrasil.com.br/eleicoes/poderdata-lula-empata-com-flavio-zema-e-caiado-no-2o-turno/" },
  { id: "dataf-jun", instituto: "Datafolha", contratante: "Grupo Folha",
    inicio: "2026-06-17", fim: "2026-06-18", n: 2004, moe: 2.0, tse: "BR-09956/2026",
    t1: null, t2: { lula: 47, flavio: 43, bnns: 10 },
    fonte: "https://www.cnnbrasil.com.br/eleicoes/no-2o-turno-lula-tem-47-contra-43-de-flavio-bolsonaro-diz-datafolha/" },
  { id: "quaest-jun", instituto: "Genial/Quaest", contratante: "Banco Genial",
    inicio: "2026-06-05", fim: "2026-06-08", n: 2004, moe: 2.0, tse: "BR-07661/2026",
    t1: { lula: 39, flavio: 29, bnns: 19 },
    outros1: { "Renan Santos": 3, "Ronaldo Caiado": 3, "Aécio Neves": 2, "Romeu Zema": 2, "Augusto Cury": 1, "Joaquim Barbosa": 1, "Samara Martins": 1 },
    t2: { lula: 44, flavio: 38, bnns: 18 },
    fonte: "https://www.gazetadopovo.com.br/eleicoes/2026/pesquisa-eleitoral-2026/genial-quaest-presidente-junho-2026/" },
  { id: "dataf-mar", instituto: "Datafolha", contratante: "Grupo Folha",
    inicio: "2026-03-03", fim: "2026-03-05", n: 2004, moe: 2.0, tse: "registrada (nº n/d na fonte)",
    t1: null, t2: { lula: 46, flavio: 43, bnns: 11 },
    fonte: "https://www.yahoo.com/news/articles/flavio-bolsonaro-draws-even-lula-161733328.html" },
  { id: "quaest-jan", instituto: "Genial/Quaest", contratante: "Banco Genial",
    inicio: "2026-01-08", fim: "2026-01-11", n: 2004, moe: 2.0, tse: "BR-00835/2026",
    t1: { lula: 36, flavio: 23, bnns: null }, t2: { lula: 45, flavio: 38, bnns: 17 },
    fonte: "https://www.aol.com/articles/brazils-lula-leads-wing-rivals-133832563.html" },
];

/* ---------------- Contexto social medido (não é opinião) ---------------- */
const CONTEXTO = [
  {
    titulo: "Aprovação do governo (jul/26)",
    dado: "48%×47% (Quaest) · 46%×50% (RTBD) · 47,6%×51,2% (Atlas) · 42%×51% (PoderData)",
    leitura: "País dividido. A Quaest registrou o 1º saldo positivo de Lula desde dez/2024 — consistente com a leve melhora do presidente na série de intenção de voto. Aprovação na faixa de 42–48% historicamente indica incumbente competitivo, não dominante.",
    fonte: "https://www.poder360.com.br/poder-eleicoes-2026/governo-lula-e-aprovado-por-48-e-desaprovado-por-47-diz-quaest/",
  },
  {
    titulo: "Rejeição e teto de voto",
    dado: "Não votaria de jeito nenhum: Lula 47–53% · Flávio 46–57% (conforme instituto). Potencial de voto (Quaest jul): Lula 47% × Flávio 38%.",
    leitura: "Rejeição mútua altíssima comprime os tetos: a disputa se decide na faixa de ~8–15% de indecisos e brancos. Pelo dado de potencial, o teto de Flávio hoje é menor que o de Lula — é o nº que a campanha do PL precisa mover.",
    fonte: "https://www.gazetadopovo.com.br/eleicoes/2026/pesquisa-eleitoral-2026/genial-quaest-presidente-julho-2026/",
  },
  {
    titulo: "Piso firme (comprometimento)",
    dado: "«É o único em que votaria»: Lula 36% × Flávio 31% (PoderData, jul).",
    leitura: "Dois terços do eleitorado de cada um é voto fechado. Eleitorado polarizado tende a oscilar pouco — por isso a série de 2026 se move em décimos, não em saltos.",
    fonte: "https://www.gazetadopovo.com.br/eleicoes/2026/pesquisa-eleitoral-2026/poderdata-presidente-pesquisa-julho-2026/",
  },
  {
    titulo: "Calendário que ainda pesa",
    dado: "16/08 abertura da campanha de Lula · convenção do PL confirmou Flávio · rádio/TV a partir do fim de agosto · debates na TV · 04/10 e 25/10.",
    leitura: "A maior parte da comunicação de massa ainda não aconteceu. É o fundamento matemático da «deriva» do modelo: quanto mais longe do voto, maior a chance de o quadro se mover.",
    fonte: "https://www.gazetadopovo.com.br/eleicoes/2026/pesquisa-eleitoral-2026/gerp-presidente-julho-2026-2/",
  },
  {
    titulo: "Pano de fundo da disputa",
    dado: "Jair Bolsonaro preso (pena de 27 anos) e inelegível até 2030 · tarifa de 25% dos EUA sobre produtos brasileiros em vigor desde 22/07, mobilizada pelas duas campanhas.",
    leitura: "Dois choques exógenos com efeito eleitoral ainda incerto: a ausência do ex-presidente reorganizou a direita em torno do filho; o tarifaço virou disputa de narrativa econômica e nacional.",
    fonte: "https://www.gazetadopovo.com.br/eleicoes/2026/pesquisa-eleitoral-2026/nexus-btg-pactual-presidente-julho-2026-2/",
  },
];

/* ---------------- Histórico de erros das pesquisas (urna × véspera) ---------------- */
const HISTORICO_ERROS = [
  { pleito: "2018 · 1º turno", urna: "Bolsonaro 46,0% dos válidos",
    pesq: "Ibope e Datafolha na véspera: ~36%",
    erro: "direita subestimada em ~10 p.p. — o maior erro recente" },
  { pleito: "2018 · 2º turno", urna: "Bolsonaro 55,1% × Haddad 44,9%",
    pesq: "Datafolha 55×45 · Ibope 54×46",
    erro: "acerto (erro ≈ 0–1 p.p.)" },
  { pleito: "2022 · 1º turno", urna: "Lula +5,2 p.p. (48,4% × 43,2%)",
    pesq: "Datafolha e Ipec na véspera: Lula +14 p.p.",
    erro: "margem inflada ~9 p.p. pró-esquerda; os mais próximos: Paraná (+7,1) e AtlasIntel (+9,2)" },
  { pleito: "2022 · 2º turno", urna: "Lula +1,8 p.p. (50,9% × 49,1%)",
    pesq: "erros de 0,4 a 6,2 p.p. conforme o instituto",
    erro: "pequeno a moderado; quando errou, errou pró-esquerda (Datafolha e Quaest, 52×48, acertaram na margem)" },
  { pleito: "2024 · SP (teste pós-correção)", urna: "1ºT: empate triplo confirmado · 2ºT: Nunes 59,4% × Boulos 40,6%",
    pesq: "véspera do 2ºT: Datafolha 57×43 · Quaest 55×45 · Futura 59,7×40,3",
    erro: "dois anos após a «correção», Datafolha e Quaest subestimaram a direita de novo (4,7 e 8,7 p.p. na margem); Futura cravou — correção parcial e desigual entre casas" },
];
/* Erro médio das pesquisas de véspera × urna em 2022 (votos válidos, agregado dos institutos).
   Importante: os erros NÃO se somam — o do 2ºT foi medido sobre pesquisas novas, refeitas após o 1ºT. */
const ERRO_2022 = {
  t1: { lula: -1.0, flavio: 5.3, margem: 6.3 },  // véspera: margens de +7,1 a +14 (média +11,6) × urna +5,2
  t2: { lula: -1.6, flavio: 1.6, margem: 3.1 },  // véspera: margens de +0,8 a +8 (média +4,9) × urna +1,8
};
const CENARIOS_VIES = [
  { vies: 0, rotulo: "sem viés", titulo: "Sem viés — pesquisas certas",
    desc: "O agregado de 2026 acerta na média: a vantagem de +4,7 p.p. é real. É o cenário-base do painel." },
  { vies: 3.1, rotulo: "réplica 2022", titulo: "Réplica 2022 — erro do 2ºT se repete",
    desc: "As pesquisas da DECISÃO erram +3,1 pró-Lula, o mesmo erro do 2º turno de 2022. A margem real cai para ~+1,6: Lula vence apertado — o filme de 2022 de novo." },
  { vies: 6.3, rotulo: "teste-limite +6,3", titulo: "Teste-limite — erro tamanho 1ºT-22 chega à decisão",
    desc: "Hipótese que NÃO ocorreu em 2022: o erro grande do 1º turno (+6,3) persistir até o dia decisivo, sem a recalibragem que os institutos fizeram entre os turnos. Como +6,3 passa do ponto de virada (+4,7), a corrida inverte." },
];
const FONTES_ERROS = [
  { nome: "Metrópoles — erros de 13 a 23,5 pts no 1ºT/2022; 0,4 a 6,2 no 2ºT", url: "https://www.metropoles.com/colunas/guilherme-amado/institutos-de-pesquisa-erraram-de-13-a-235-pontos-no-1o-turno-em-2022" },
  { nome: "CNN — números da véspera do 1ºT/2022 (Datafolha 50×36; Ipec 51×37)", url: "https://www.cnnbrasil.com.br/politica/resultados-das-urnas-divergem-de-pesquisas-eleitorais/" },
  { nome: "Congresso em Foco — quem acertou o 2ºT/2022 e o 2ºT/2018", url: "https://www.congressoemfoco.com.br/noticia/10860/quatro-pesquisas-acertaram-a-votacao-de-lula-e-bolsonaro-veja-quais" },
  { nome: "Estado de Minas — resultado oficial do 1ºT/2022 × pesquisas", url: "https://www.em.com.br/app/noticia/politica/2022/10/02/interna_politica,1401855/pesquisas-erraram-projecoes-para-bolsonaro-e-aliados.shtml" },
  { nome: "Gazeta — Datafolha véspera do 2ºT-SP/2024 (57×43; urna deu 59,4×40,6)", url: "https://www.gazetadopovo.com.br/eleicoes/2024/pesquisa-eleitoral/datafolha-sao-paulo-sp-outubro-2024-vespera/" },
  { nome: "Wikipédia — eleição SP-2024: vésperas (Quaest 55×45; Futura 59,7×40,3) e resultado", url: "https://pt.wikipedia.org/wiki/Elei%C3%A7%C3%A3o_municipal_em_S%C3%A3o_Paulo_em_2024" },
];

const CANDIDATOS = [
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

const PARAMS_PADRAO = { meiaVida: 21, sigmaSys: 4.0, coefDeriva: 0.35, vies: 0 };

/* Prompt da busca automática (botão «Atualizar agora») */
const montarPromptBusca = (desde) => `Você é um coletor de dados de pesquisas eleitorais brasileiras. Use a busca na web para localizar pesquisas NACIONAIS de intenção de voto para PRESIDENTE do Brasil 2026 (cenário Lula × Flávio Bolsonaro) divulgadas por institutos (AtlasIntel, Datafolha, Genial/Quaest, PoderData, Nexus, Gerp, Indexa, Ipec, Real Time Big Data, Paraná Pesquisas ou outros), com registro no TSE e com trabalho de campo encerrado DEPOIS de ${desde}.

Responda APENAS com um array JSON válido, sem markdown, sem comentários, sem texto antes ou depois. Máximo de 6 itens (os mais recentes). Cada item:
{"instituto":"...","inicio":"AAAA-MM-DD","fim":"AAAA-MM-DD","n":2000,"moe":2.0,"tse":"BR-XXXXX/2026","l1":40,"f1":32,"bn1":12,"l2":47,"f2":43,"fonte":"https://..."}

Regras: l1/f1 = 1º turno estimulado Lula/Flávio; bn1 = branco/nulo + não sabe do 1º turno; l2/f2 = 2º turno Lula × Flávio. Use null quando o dado não foi divulgado. Inclua SOMENTE pesquisas que você realmente encontrou na busca, com a URL real da fonte — nunca invente números nem registros. Se não houver pesquisa nova após ${desde}, responda [].`;

/* ---------------------- utilidades ---------------------- */
const fmt = (v, d = 1) =>
  v == null || isNaN(v) ? "–" : Number(v).toFixed(d).replace(".", ",");
const fmtSinal = (v, d = 1) => (v >= 0 ? "+" : "−") + fmt(Math.abs(v), d);
const fmtData = (iso) => { if (!iso) return "–"; const [, m, d] = iso.split("-"); return `${d}/${m}`; };
const pct = (p) => (p == null ? "–" : Math.round(p * 100) + "%");

function normCdf(z) {
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989423 * Math.exp((-z * z) / 2);
  const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return z > 0 ? 1 - p : p;
}
const meioCampo = (p) =>
  (Date.parse(p.inicio + "T12:00:00-03:00") + Date.parse(p.fim + "T12:00:00-03:00")) / 2;

/* Média ponderada em um instante t (recência conta a partir de t) */
function mediaEm(t, polls, metric, meiaVida) {
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
function tendenciaPareada(polls, metric) {
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
function rodarModelo(pesquisas, params, hojeMs) {
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

/* ---------------------- componentes ---------------------- */
function Cartao({ titulo, children, destaque, className }) {
  return (
    <div className={"rounded-md p-4 md:p-5 " + (className || "")}
      style={{ background: CORES.cartao, border: `1px solid ${CORES.linha}`,
        borderTop: destaque ? `3px solid ${destaque}` : `1px solid ${CORES.linha}` }}>
      <div className="text-xs uppercase mb-3"
        style={{ fontFamily: "'IBM Plex Mono', monospace", letterSpacing: "0.12em", color: CORES.cinza }}>
        {titulo}
      </div>
      {children}
    </div>
  );
}

function Tendencia({ t, rotulo }) {
  let corpo, cor = CORES.cinza;
  if (!t) { corpo = "sem base p/ tendência"; }
  else if (Math.abs(t.delta) < 0.8) { corpo = `▬ estável (${fmtSinal(t.delta)})`; }
  else if (t.delta > 0) { corpo = `▲ ${fmtSinal(t.delta)}`; cor = CORES.confirma; }
  else { corpo = `▼ ${fmtSinal(t.delta)}`; cor = CORES.alerta; }
  return (
    <span className="inline-flex items-baseline gap-1 text-xs"
      style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
      <span style={{ color: CORES.cinza }}>{rotulo}</span>
      <span className="font-semibold" style={{ color: cor }}>{corpo}</span>
      {t && <span style={{ color: CORES.cinza }}>· {t.pares} par{t.pares > 1 ? "es" : ""}</span>}
    </span>
  );
}

function Deslizador({ rotulo, valor, min, max, passo, onChange, sufixo, dica }) {
  return (
    <label className="block">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-sm font-semibold" style={{ color: CORES.tinta }}>{rotulo}</span>
        <span className="text-sm" style={{ fontFamily: "'IBM Plex Mono', monospace", color: CORES.confirma }}>
          {fmt(valor, passo < 0.1 ? 2 : passo < 1 ? 1 : 0)}{sufixo}
        </span>
      </div>
      <input type="range" min={min} max={max} step={passo} value={valor}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full mt-1" style={{ accentColor: CORES.confirma }} />
      <p className="text-xs mt-1 leading-snug" style={{ color: CORES.cinza }}>{dica}</p>
    </label>
  );
}

function DicaGrafico({ active, payload }) {
  if (!active || !payload || !payload.length) return null;
  const pt = payload[0].payload;
  if (pt.instituto) {
    return (
      <div className="rounded px-3 py-2 text-xs shadow"
        style={{ background: CORES.tinta, color: "#F2F2EA", fontFamily: "'IBM Plex Mono', monospace" }}>
        <div className="font-semibold">{pt.instituto}</div>
        <div>campo {fmtData(pt.inicio)}–{fmtData(pt.fim)}</div>
        <div style={{ color: "#FF9AA8" }}>Lula {fmt(pt.lVal)}%</div>
        <div style={{ color: "#9FC0FF" }}>Flávio {fmt(pt.fVal)}%</div>
      </div>
    );
  }
  const d = new Date(pt.x);
  return (
    <div className="rounded px-3 py-2 text-xs shadow"
      style={{ background: CORES.tinta, color: "#F2F2EA", fontFamily: "'IBM Plex Mono', monospace" }}>
      <div>média em {String(d.getDate()).padStart(2, "0")}/{String(d.getMonth() + 1).padStart(2, "0")}</div>
      <div style={{ color: "#FF9AA8" }}>Lula {fmt(pt.l)}%</div>
      <div style={{ color: "#9FC0FF" }}>Flávio {fmt(pt.f)}%</div>
    </div>
  );
}

/* ---------------------- aplicação ---------------------- */
function DicaSens({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  const l = payload.find((p) => p.dataKey === "l");
  const f = payload.find((p) => p.dataKey === "f");
  return (
    <div className="rounded px-3 py-2 text-xs shadow"
      style={{ background: CORES.tinta, color: "#F2F2EA", fontFamily: "'IBM Plex Mono', monospace" }}>
      <div>viés {fmtSinal(label)} p.p.</div>
      {l && <div style={{ color: "#FF9AA8" }}>Lula eleito: {Math.round(l.value)}%</div>}
      {f && <div style={{ color: "#9FC0FF" }}>Flávio eleito: {Math.round(f.value)}%</div>}
      <div style={{ opacity: 0.7 }}>clique para aplicar ao painel</div>
    </div>
  );
}

export default function AgregadorPresidencial2026() {
  const hojeMs = useMemo(() => Date.now(), []);
  const [pesquisas, setPesquisas] = useState(PESQUISAS_OFICIAIS);
  const [params, setParams] = useState(PARAMS_PADRAO);
  const [turnoGrafico, setTurnoGrafico] = useState(2);
  const [aba, setAba] = useState("principal");
  const [formAberto, setFormAberto] = useState(false);
  const [busca, setBusca] = useState({ estado: "idle", msg: "" });

  async function atualizarTudo() {
    if (busca.estado === "buscando") return;
    setBusca({ estado: "buscando", msg: "buscando rodadas novas nos institutos… (até ~1 min)" });
    try {
      const desde = pesquisas.reduce((m, p) => (p.fim > m ? p.fim : m), "2026-01-01");
      const resp = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1000,
          messages: [{ role: "user", content: montarPromptBusca(desde) }],
          tools: [{ type: "web_search_20250305", name: "web_search" }],
        }),
      });
      const data = await resp.json();
      if (data && data.error) throw new Error(data.error.message || "erro na API");
      const texto = (data.content || [])
        .filter((b) => b.type === "text")
        .map((b) => b.text)
        .join("\n");
      const limpo = texto.replace(/```json|```/g, "").trim();
      const ini = limpo.indexOf("["), fim = limpo.lastIndexOf("]");
      if (ini < 0 || fim <= ini) throw new Error("resposta sem JSON");
      const arr = JSON.parse(limpo.slice(ini, fim + 1));
      const num = (v) => (v == null || v === "" || isNaN(+v) ? null : +v);
      const novas = [];
      for (const q of Array.isArray(arr) ? arr : []) {
        if (!q || !q.instituto || !q.fim || num(q.l2) == null || num(q.f2) == null) continue;
        const l2 = num(q.l2), f2 = num(q.f2);
        if (l2 < 20 || l2 > 70 || f2 < 20 || f2 > 70) continue; // sanidade
        const dup = pesquisas.some(
          (p) => p.instituto.toLowerCase().trim() === String(q.instituto).toLowerCase().trim() &&
            String(p.fim) === String(q.fim)
        );
        if (dup) continue;
        novas.push({
          id: "auto-" + q.instituto + "-" + q.fim,
          instituto: String(q.instituto), contratante: q.contratante || "—",
          inicio: q.inicio || q.fim, fim: q.fim,
          n: num(q.n) || 2000, moe: num(q.moe) || 2, tse: q.tse || "—",
          t1: num(q.l1) != null ? { lula: num(q.l1), flavio: num(q.f1), bnns: num(q.bn1) } : null,
          t2: { lula: l2, flavio: f2, bnns: null },
          fonte: typeof q.fonte === "string" && q.fonte.startsWith("http") ? q.fonte : null,
          auto: true,
        });
      }
      if (novas.length) {
        setPesquisas((ps) => [...ps, ...novas]);
        setBusca({ estado: "ok", msg: `${novas.length} pesquisa(s) nova(s) incluída(s) — marcadas (auto); confira as fontes na tabela. Cálculos refeitos.` });
      } else {
        setBusca({ estado: "ok", msg: `nenhuma rodada nova encontrada após ${fmtData(desde)} — série já está em dia.` });
      }
    } catch (e) {
      setBusca({ estado: "erro", msg: "falha na busca automática (" + (e?.message || "erro") + "). Tente de novo ou digite «atualizar» no chat para eu buscar e conferir manualmente." });
    }
  }
  const [form, setForm] = useState({
    instituto: "", fim: "", n: "", moe: "", tse: "",
    l1: "", f1: "", bnns1: "", l2: "", f2: "",
  });

  const M = useMemo(() => rodarModelo(pesquisas, params, hojeMs), [pesquisas, params, hojeMs]);

  const dadosDist = useMemo(() => {
    if (!M) return [];
    const { margemAj, sigmaDia2 } = M;
    const pts = [];
    for (let i = 0; i <= 120; i++) {
      const x = margemAj - 4 * sigmaDia2 + (i / 120) * 8 * sigmaDia2;
      const pdf = Math.exp(-((x - margemAj) ** 2) / (2 * sigmaDia2 ** 2));
      pts.push({ x, lula: x > 0 ? pdf : 0, flavio: x <= 0 ? pdf : 0 });
    }
    return pts;
  }, [M]);

  const pontosGrafico = useMemo(() => {
    if (!M) return [];
    return M.linhas
      .filter((l) => (turnoGrafico === 2 ? l.t2 : l.t1 && l.t1.lula != null))
      .map((l) => ({
        ...l, x: meioCampo(l),
        lVal: turnoGrafico === 2 ? l.t2.lula : l.t1.lula,
        fVal: turnoGrafico === 2 ? l.t2.flavio : l.t1.flavio,
      }));
  }, [M, turnoGrafico]);

  const calcVies = (vies) => {
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
  };

  const serieSens = useMemo(() => {
    if (!M) return [];
    const pts = [];
    for (let v = -3; v <= 10.001; v += 0.25) {
      const c = calcVies(v);
      pts.push({ v: Math.round(v * 100) / 100, l: c.elD * 100, f: (1 - c.elD) * 100 });
    }
    return pts;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [M]);

  const replay = useMemo(() => {
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
      pPainel: calcVies(ERRO_2022.t2.margem).elD };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [M]);

  const cenBase = useMemo(() => {
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
  }, [M, params.vies]);

  const valCand = (p, nome) =>
    nome === "Lula" ? (p.t1 ? p.t1.lula : null)
    : nome === "Flávio Bolsonaro" ? (p.t1 ? p.t1.flavio : null)
    : (p.outros1 ? (p.outros1[nome] ?? null) : null);

  const campoCompleto = useMemo(() => {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pesquisas, params.meiaVida, hojeMs]);

  const adicionarPesquisa = () => {
    const num = (v) => (v === "" ? null : parseFloat(String(v).replace(",", ".")));
    const l2 = num(form.l2), f2 = num(form.f2);
    if (!form.instituto || !form.fim || l2 == null || f2 == null) return;
    const nova = {
      id: "user-" + Date.now(), instituto: form.instituto, contratante: "Adicionada pelo usuário",
      inicio: form.fim, fim: form.fim, n: num(form.n) || 2000, moe: num(form.moe) || 2,
      tse: form.tse || "—",
      t1: num(form.l1) != null ? { lula: num(form.l1), flavio: num(form.f1), bnns: num(form.bnns1) } : null,
      t2: { lula: l2, flavio: f2, bnns: null }, usuario: true,
    };
    setPesquisas((ps) => [...ps, nova]);
    setForm({ instituto: "", fim: "", n: "", moe: "", tse: "", l1: "", f1: "", bnns1: "", l2: "", f2: "" });
    setFormAberto(false);
  };

  if (!M) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8" style={{ background: CORES.papel }}>
        <button onClick={() => setPesquisas(PESQUISAS_OFICIAIS)}
          className="px-4 py-2 rounded text-sm font-semibold"
          style={{ background: CORES.confirma, color: "#fff" }}>
          ↺ Restaurar dados oficiais
        </button>
      </div>
    );
  }

  const campoForm = (chave, rotulo, largo) => (
    <label className={largo ? "col-span-2" : ""}>
      <span className="text-xs block mb-1"
        style={{ color: CORES.cinza, fontFamily: "'IBM Plex Mono', monospace" }}>{rotulo}</span>
      <input value={form[chave]}
        onChange={(e) => setForm((f) => ({ ...f, [chave]: e.target.value }))}
        type={chave === "fim" ? "date" : "text"}
        className="w-full rounded px-2 py-1.5 text-sm"
        style={{ border: `1px solid ${CORES.linha}`, background: "#fff", color: CORES.tinta }} />
    </label>
  );

  const linhaProb = (rotulo, pl, destaqueGrande) => (
    <div className={destaqueGrande ? "" : "opacity-90"}>
      <div className="text-xs uppercase"
        style={{ fontFamily: "'IBM Plex Mono', monospace", color: CORES.fosforo, letterSpacing: "0.1em" }}>
        {rotulo}
      </div>
      <div className="flex items-end justify-between gap-3 mt-1">
        <div className="font-semibold leading-none"
          style={{ fontFamily: "'IBM Plex Mono', monospace",
            fontSize: destaqueGrande ? "clamp(2.4rem, 8vw, 4.4rem)" : "clamp(1.3rem, 4vw, 2rem)",
            color: CORES.fosforoForte }}>
          {pct(pl)}
        </div>
        <div className="h-2.5 rounded-full overflow-hidden flex flex-1 mb-2" style={{ background: "#0A1A12" }}>
          <div style={{ width: `${Math.round(pl * 100)}%`, background: CORES.lula }} />
          <div style={{ width: `${100 - Math.round(pl * 100)}%`, background: CORES.flavio }} />
        </div>
        <div className="font-semibold leading-none text-right"
          style={{ fontFamily: "'IBM Plex Mono', monospace",
            fontSize: destaqueGrande ? "clamp(2.4rem, 8vw, 4.4rem)" : "clamp(1.3rem, 4vw, 2rem)",
            color: CORES.fosforoForte }}>
          {pct(1 - pl)}
        </div>
      </div>
    </div>
  );

  const padraoAtivo =
    params.meiaVida === PARAMS_PADRAO.meiaVida &&
    params.sigmaSys === PARAMS_PADRAO.sigmaSys &&
    params.coefDeriva === PARAMS_PADRAO.coefDeriva &&
    params.vies === PARAMS_PADRAO.vies;

  return (
    <div className="min-h-screen pb-16"
      style={{ background: CORES.papel, color: CORES.tinta, fontFamily: "'Archivo', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Archivo:wght@400;600;700;900&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
        @keyframes pisca { 0%,49%{opacity:1} 50%,100%{opacity:0} }
        .cursor-urna { animation: pisca 1.1s infinite; }
        @media (prefers-reduced-motion: reduce){ .cursor-urna{ animation:none } }
        details > summary { cursor: pointer; }
        input:focus-visible, button:focus-visible, a:focus-visible { outline: 2px solid ${CORES.confirma}; outline-offset: 2px; }
      `}</style>

      {/* ---------- cabeçalho ---------- */}
      <header className="max-w-5xl mx-auto px-4 pt-8 pb-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-xs uppercase"
              style={{ fontFamily: "'IBM Plex Mono', monospace", letterSpacing: "0.18em", color: CORES.confirma }}>
              Apuração de pesquisas · registro obrigatório no TSE
            </div>
            <h1 className="font-black leading-none mt-1"
              style={{ fontSize: "clamp(1.8rem, 5vw, 3rem)", letterSpacing: "-0.02em" }}>
              PRESIDENTE <span style={{ color: CORES.cinza }}>2026</span>
            </h1>
            <p className="text-sm mt-1" style={{ color: CORES.cinza }}>
              Lula (PT) × Flávio Bolsonaro (PL) · {pesquisas.length} pesquisas na série ·
              base editorial de <b style={{ color: CORES.tinta }}>{ULTIMA_ATUALIZACAO}</b>
            </p>
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <button onClick={atualizarTudo} disabled={busca.estado === "buscando"}
                className="px-4 py-2 rounded text-sm font-black uppercase tracking-wide"
                style={{ background: busca.estado === "buscando" ? "#7BA88D" : CORES.confirma,
                  color: "#fff", letterSpacing: "0.06em",
                  cursor: busca.estado === "buscando" ? "wait" : "pointer",
                  boxShadow: "0 2px 0 rgba(0,0,0,0.25)" }}>
                {busca.estado === "buscando" ? "⏳ Buscando…" : "▶ Atualizar agora"}
              </button>
              <span className="text-xs" style={{ color: CORES.cinza }}>
                busca as rodadas novas de todos os institutos e refaz os cálculos ·
                ou digite <b style={{ color: CORES.confirma }}>«atualizar»</b> no chat
              </span>
            </div>
            {busca.msg && (
              <div className="mt-2 text-xs rounded px-3 py-2 inline-block"
                style={{ fontFamily: "'IBM Plex Mono', monospace",
                  background: busca.estado === "erro" ? "#F7E4D2" : "#DFF0E5",
                  color: busca.estado === "erro" ? "#8A4510" : "#155A34",
                  border: `1px solid ${busca.estado === "erro" ? CORES.alerta : CORES.confirma}` }}>
                {busca.msg}
              </div>
            )}
          </div>
          <div className="flex gap-2 text-center" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
            <div className="rounded px-3 py-2" style={{ background: CORES.cartao, border: `1px solid ${CORES.linha}` }}>
              <div className="text-xl font-semibold leading-none">{M.dias1T}</div>
              <div className="text-xs mt-1" style={{ color: CORES.cinza }}>dias p/ 1º turno<br />04/10</div>
            </div>
            <div className="rounded px-3 py-2" style={{ background: CORES.cartao, border: `1px solid ${CORES.linha}` }}>
              <div className="text-xl font-semibold leading-none">{M.dias2T}</div>
              <div className="text-xs mt-1" style={{ color: CORES.cinza }}>dias p/ 2º turno<br />25/10</div>
            </div>
          </div>
        </div>
      </header>

      {/* ---------- tela da urna: chance de eleição ---------- */}
      <section className="max-w-5xl mx-auto px-4">
        <div className="rounded-lg p-5 md:p-7"
          style={{ background: CORES.tela, border: `1px solid ${CORES.telaBorda}`,
            boxShadow: "inset 0 0 60px rgba(0,0,0,0.55), 0 2px 0 rgba(255,255,255,0.35)" }}>
          <div className="flex items-center justify-between text-xs uppercase"
            style={{ fontFamily: "'IBM Plex Mono', monospace", color: CORES.fosforo, letterSpacing: "0.14em" }}>
            <span>CHANCE DE SER ELEITO · LULA (esq.) × FLÁVIO (dir.)</span>
            <span className="hidden sm:inline">LEITURA DOS DADOS · NÃO É PREVISÃO<span className="cursor-urna">▊</span></span>
          </div>

          <div className="mt-4 space-y-5">
            {linhaProb(`Projetado para o dia da votação (04–25/10, incerteza ±${fmt(M.sigmaDia2)} p.p.)`, M.eleito.dia.l, true)}
            {linhaProb(`No cenário atual — se a votação fosse hoje (incerteza ±${fmt(M.sigmaHoje)} p.p.)`, M.eleito.hoje.l, false)}
          </div>

          {params.vies !== 0 && (
            <div className="mt-3 text-xs" style={{ fontFamily: "'IBM Plex Mono', monospace", color: "#F0B27A" }}>
              ⚠ cenário com viés assumido de {fmt(params.vies)} p.p. pró-direita nas pesquisas
              (média bruta {fmtSinal(M.margem)} → margem efetiva {fmtSinal(M.margemAj)} p.p.)
            </div>
          )}

          <div className="mt-5 pt-4" style={{ borderTop: `1px dashed ${CORES.telaBorda}` }}>
            <div className="font-black uppercase"
              style={{ color: CORES.fosforoForte, letterSpacing: "0.02em", fontSize: "clamp(1.05rem, 3vw, 1.5rem)" }}>
              {M.titulo}
            </div>
            <p className="text-sm mt-1 max-w-3xl" style={{ color: CORES.fosforo, lineHeight: 1.5 }}>
              {M.texto} Caminho mais provável: {pct(M.p2Tacontece)} de chance de decisão no 2º turno em 25/10;
              definição já no 1º turno tem {pct(M.p1 ? M.p1.lulaDia + M.p1.flavioDia : null)} de probabilidade.
            </p>
          </div>
        </div>
        <p className="text-xs mt-2" style={{ color: CORES.cinza }}>
          A diferença entre as duas linhas é o tempo: a projeção para outubro soma a «deriva» da opinião pública
          (campanha de TV, debates, fatos novos) à incerteza de hoje. Probabilidade não é previsão — é a fração de
          cenários compatíveis com os dados em que cada candidato termina eleito.
        </p>
      </section>

      {/* ---------- abas: disputa principal × todos os candidatos ---------- */}
      <section className="max-w-5xl mx-auto px-4 mt-6">
        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex rounded overflow-hidden" style={{ border: `1px solid ${CORES.tinta}` }}>
            <button onClick={() => setAba("principal")}
              className="px-4 py-2 text-sm font-bold"
              style={{ background: aba === "principal" ? CORES.tinta : "transparent",
                color: aba === "principal" ? "#fff" : CORES.tinta }}>
              Disputa principal · {campoCompleto ? campoCompleto.top2.map((n) => n.split(" ")[0]).join(" × ") : "Lula × Flávio"}
            </button>
            <button onClick={() => setAba("todos")}
              className="px-4 py-2 text-sm font-bold"
              style={{ background: aba === "todos" ? CORES.tinta : "transparent",
                color: aba === "todos" ? "#fff" : CORES.tinta,
                borderLeft: `1px solid ${CORES.tinta}` }}>
              Todos os candidatos{campoCompleto ? ` (${campoCompleto.linhas.length})` : ""}
            </button>
          </div>
          <span className="text-xs" style={{ color: CORES.cinza }}>
            o par da disputa principal é <b>definido pelos dados</b> (os dois primeiros do 1º turno), não fixado —
            se o ranking mudar, o painel avisa.
          </span>
        </div>
        {campoCompleto && !campoCompleto.parPadrao && (
          <div className="mt-2 text-xs rounded px-3 py-2"
            style={{ background: "#F7E4D2", color: "#8A4510", border: `1px solid ${CORES.alerta}` }}>
            ⚠ O par líder mudou para <b>{campoCompleto.top2.join(" × ")}</b>. Os módulos de 2º turno seguem
            Lula × Flávio até haver simulações registradas do novo confronto — adicione-as na tabela ou digite «atualizar».
          </div>
        )}
      </section>

      {aba === "principal" && (<>
      {/* ---------- 1º turno × 2º turno ---------- */}
      <section className="max-w-5xl mx-auto px-4 mt-6 grid gap-4 md:grid-cols-2">
        <Cartao titulo="1º turno · 04 de outubro" destaque={CORES.confirma}>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black" style={{ color: CORES.lula }}>{fmt(M.t1raw?.valor)}%</span>
            <span className="text-lg" style={{ color: CORES.cinza }}>×</span>
            <span className="text-3xl font-black" style={{ color: CORES.flavio }}>{fmt(M.t1rawF?.valor)}%</span>
            <span className="text-xs ml-1" style={{ color: CORES.cinza }}>média ponderada (estimulada)</span>
          </div>
          <div className="flex flex-col gap-1 mt-2">
            <Tendencia t={M.tend1.l} rotulo="Lula" />
            <Tendencia t={M.tend1.f} rotulo="Flávio" />
            <Tendencia t={M.tend1.m} rotulo="Margem" />
          </div>
          <div className="text-sm mt-3 pt-3" style={{ color: CORES.cinza, borderTop: `1px dashed ${CORES.linha}` }}>
            Em votos válidos, Lula tem ≈<b style={{ color: CORES.tinta }}>{fmt(M.t1valL?.valor)}%</b> — abaixo dos 50% que evitariam o 2º turno.
            <div className="mt-2 grid grid-cols-2 gap-2 text-center" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
              <div className="rounded p-2" style={{ background: "#EFEFE6" }}>
                <div className="text-lg font-semibold" style={{ color: CORES.tinta }}>{pct(M.p1?.lulaHoje)}</div>
                <div className="text-xs">definição no 1ºT · hoje</div>
              </div>
              <div className="rounded p-2" style={{ background: "#EFEFE6" }}>
                <div className="text-lg font-semibold" style={{ color: CORES.tinta }}>{pct(M.p1?.lulaDia)}</div>
                <div className="text-xs">definição no 1ºT · em 04/10</div>
              </div>
            </div>
            <p className="text-xs mt-2">Chance de Flávio vencer no 1º turno: {pct(M.p1?.flavioDia)} (precisa de mais de 50% dos válidos).</p>
          </div>
        </Cartao>

        <Cartao titulo="2º turno · 25 de outubro (disputa decisiva)" destaque={CORES.lula}>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black" style={{ color: CORES.lula }}>{fmt(M.mediaL2)}%</span>
            <span className="text-lg" style={{ color: CORES.cinza }}>×</span>
            <span className="text-3xl font-black" style={{ color: CORES.flavio }}>{fmt(M.mediaF2)}%</span>
            <span className="text-xs ml-1" style={{ color: CORES.cinza }}>
              margem {fmtSinal(M.margem)} p.p. · válidos {fmt(M.validoL2)}%×{fmt(100 - M.validoL2)}%
            </span>
          </div>
          <div className="flex flex-col gap-1 mt-2">
            <Tendencia t={M.tend2.l} rotulo="Lula" />
            <Tendencia t={M.tend2.f} rotulo="Flávio" />
            <Tendencia t={M.tend2.m} rotulo="Margem" />
          </div>
          <div className="text-sm mt-3 pt-3" style={{ color: CORES.cinza, borderTop: `1px dashed ${CORES.linha}` }}>
            {M.qtdEmpate} de {M.qtdRecentes} pesquisas recentes apontam empate técnico; a Gerp chega a mostrar Flávio à frente.
            Dispersão entre institutos: ±{fmt(M.sdEntre)} p.p.
            <div className="mt-2 grid grid-cols-2 gap-2 text-center" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
              <div className="rounded p-2" style={{ background: "#EFEFE6" }}>
                <div className="text-lg font-semibold" style={{ color: CORES.tinta }}>{pct(M.pL2hoje)}</div>
                <div className="text-xs">vitória de Lula no 2ºT · hoje</div>
              </div>
              <div className="rounded p-2" style={{ background: "#EFEFE6" }}>
                <div className="text-lg font-semibold" style={{ color: CORES.tinta }}>{pct(M.pL2dia)}</div>
                <div className="text-xs">vitória de Lula no 2ºT · em 25/10</div>
              </div>
            </div>
            <p className="text-xs mt-2">
              Faixa provável (80%) da margem final: {fmt(M.int80[0])} a {fmtSinal(M.int80[1])} p.p. —
              inclui vitória apertada de Flávio no limite inferior.
            </p>
          </div>
        </Cartao>
      </section>

      {/* ---------- gráficos ---------- */}
      <section className="max-w-5xl mx-auto px-4 mt-6 grid gap-4 lg:grid-cols-2">
        <Cartao titulo={
          <span className="flex items-center gap-3">
            Evolução — pontos por pesquisa + média ponderada
            <span className="inline-flex rounded overflow-hidden" style={{ border: `1px solid ${CORES.cinza}` }}>
              {[1, 2].map((t) => (
                <button key={t} onClick={() => setTurnoGrafico(t)}
                  className="px-2 py-0.5 text-xs font-semibold"
                  style={{ background: turnoGrafico === t ? CORES.tinta : "transparent",
                    color: turnoGrafico === t ? "#fff" : CORES.tinta }}>
                  {t}º turno
                </button>
              ))}
            </span>
          </span>
        }>
          <div style={{ width: "100%", height: 270 }}>
            <ResponsiveContainer>
              <ComposedChart data={turnoGrafico === 2 ? M.serie2 : M.serie1}
                margin={{ top: 10, right: 10, bottom: 0, left: -18 }}>
                <CartesianGrid stroke={CORES.linha} strokeDasharray="2 4" />
                <XAxis dataKey="x" type="number" domain={["dataMin - 259200000", "dataMax + 259200000"]}
                  tickFormatter={(t) => { const d = new Date(t);
                    return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`; }}
                  tick={{ fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", fill: CORES.cinza }}
                  stroke={CORES.linha} />
                <YAxis domain={turnoGrafico === 2 ? [30, 55] : [20, 50]}
                  tick={{ fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", fill: CORES.cinza }}
                  stroke={CORES.linha} />
                <Tooltip content={<DicaGrafico />} />
                <Line dataKey="l" stroke={CORES.lula} strokeWidth={2.5} dot={false} type="monotone" isAnimationActive={false} />
                <Line dataKey="f" stroke={CORES.flavio} strokeWidth={2.5} dot={false} type="monotone" isAnimationActive={false} />
                <Scatter data={pontosGrafico} dataKey="lVal" fill={CORES.lula} fillOpacity={0.55} isAnimationActive={false} />
                <Scatter data={pontosGrafico} dataKey="fVal" fill={CORES.flavio} fillOpacity={0.55} isAnimationActive={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs mt-1" style={{ color: CORES.cinza }}>
            Vermelho: Lula · Azul: Flávio. Linhas = média ponderada por recência e amostra; pontos = pesquisas individuais.
            {turnoGrafico === 1 && " Nem todo instituto divulgou o 1º turno nas rodadas antigas — a série é mais curta."}
          </p>
        </Cartao>

        <Cartao titulo="Distribuição projetada da margem no dia da eleição (2º turno)">
          <div style={{ width: "100%", height: 270 }}>
            <ResponsiveContainer>
              <AreaChart data={dadosDist} margin={{ top: 10, right: 10, bottom: 0, left: -18 }}>
                <CartesianGrid stroke={CORES.linha} strokeDasharray="2 4" />
                <XAxis dataKey="x" type="number" tickFormatter={(v) => fmt(v, 0)} domain={["dataMin", "dataMax"]}
                  tick={{ fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", fill: CORES.cinza }}
                  stroke={CORES.linha} />
                <YAxis hide />
                <ReferenceLine x={0} stroke={CORES.cinza} strokeWidth={1.5} />
                <Area dataKey="flavio" stroke={CORES.flavio} fill={CORES.flavio} fillOpacity={0.35} type="monotone" isAnimationActive={false} />
                <Area dataKey="lula" stroke={CORES.lula} fill={CORES.lula} fillOpacity={0.35} type="monotone" isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs mt-1" style={{ color: CORES.cinza }}>
            Eixo: margem Lula−Flávio (p.p.). Área vermelha = cenários em que Lula vence o 2º turno ({pct(M.pL2dia)});
            azul = Flávio ({pct(1 - M.pL2dia)}). A área azul existente à esquerda do zero é exatamente o
            «espaço de virada» que os dados ainda comportam.
          </p>
        </Cartao>
      </section>
      </>)}

      {aba === "todos" && campoCompleto && (
        <section className="max-w-5xl mx-auto px-4 mt-6">
          <Cartao titulo="Todos os candidatos · 1º turno estimulado (média ponderada por recência e amostra)" destaque={CORES.confirma}>
            <div className="space-y-2">
              {campoCompleto.linhas.map((c, i) => {
                const larg = (100 * c.media) / campoCompleto.linhas[0].media;
                return (
                  <div key={c.nome}>
                    <div className="flex items-baseline justify-between text-sm">
                      <span>
                        <b>{i + 1}º · {c.nome}</b>{" "}
                        <span className="text-xs" style={{ color: CORES.cinza }}>({c.partido})</span>
                        {i < 2 && <span className="ml-1 text-xs font-semibold" style={{ color: CORES.confirma }}>● disputa principal</span>}
                      </span>
                      <span className="font-semibold" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                        {fmt(c.media)}%{" "}
                        <span className="text-xs font-normal" style={{ color: CORES.cinza }}>· {c.k} pesq.</span>
                      </span>
                    </div>
                    <div className="h-4 rounded overflow-hidden mt-0.5" style={{ background: "#EFEFE6", border: `1px solid ${CORES.linha}` }}>
                      <div className="h-full" style={{ width: `${larg}%`, background: c.cor }} />
                    </div>
                  </div>
                );
              })}
              <div className="text-xs pt-1" style={{ color: CORES.cinza }}>
                Branco/nulo + não sabe (média): <b style={{ color: CORES.tinta }}>{fmt(campoCompleto.bn)}%</b> ·
                demais nomes testados (Hertz Dias, Rui C. Pimenta, Edmilson Costa, Heró Bezerra) somam ≤1% cada.
              </div>
            </div>

            <div className="overflow-x-auto -mx-1 mt-4">
              <table className="w-full text-xs" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                <thead>
                  <tr className="text-left uppercase" style={{ color: CORES.cinza }}>
                    <th className="py-2 pr-3 font-medium">Candidato</th>
                    {campoCompleto.pollsCampo.map((p) => (
                      <th key={p.id} className="py-2 pr-3 font-medium whitespace-nowrap">
                        {p.instituto.split("/")[0].slice(0, 7)}<br />{fmtData(p.fim)}
                      </th>
                    ))}
                    <th className="py-2 font-medium">Média</th>
                  </tr>
                </thead>
                <tbody>
                  {campoCompleto.linhas.map((c) => (
                    <tr key={c.nome} style={{ borderTop: `1px solid ${CORES.linha}` }}>
                      <td className="py-1.5 pr-3 font-semibold whitespace-nowrap" style={{ fontFamily: "'Archivo', sans-serif", color: c.cor }}>
                        {c.nome}
                      </td>
                      {campoCompleto.pollsCampo.map((p) => {
                        const v = valCand(p, c.nome);
                        return <td key={p.id} className="py-1.5 pr-3">{v != null ? fmt(v, v % 1 ? 1 : 0) : "–"}</td>;
                      })}
                      <td className="py-1.5 font-semibold">{fmt(c.media)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="text-sm mt-4" style={{ color: CORES.cinza, lineHeight: 1.55 }}>
              <b style={{ color: CORES.tinta }}>Por que o painel modela só o confronto líder:</b>{" "}
              o 3º colocado ({campoCompleto.linhas[2]?.nome}, {fmt(campoCompleto.linhas[2]?.media)}%) está{" "}
              <b style={{ color: CORES.tinta }}>{fmt(campoCompleto.gap3)} pontos</b> atrás do 2º — uma distância sem
              precedente de reversão na série de 2026. Enquanto isso valer, a eleição se decide entre os dois primeiros,
              e é para esse par que os institutos simulam o 2º turno. «–» na tabela = nome não testado ou não divulgado
              naquela rodada (a Datafolha, por exemplo, só divulgou os dois líderes em julho).
            </p>
          </Cartao>
        </section>
      )}

      {/* ---------- contexto social medido ---------- */}
      <section className="max-w-5xl mx-auto px-4 mt-6">
        <Cartao titulo="Contexto social — indicadores medidos que sustentam a leitura (não é achismo)" destaque={CORES.alerta}>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {CONTEXTO.map((c) => (
              <div key={c.titulo} className="rounded p-3" style={{ background: "#EFEFE6", border: `1px solid ${CORES.linha}` }}>
                <div className="text-sm font-bold">{c.titulo}</div>
                <div className="text-xs mt-1" style={{ fontFamily: "'IBM Plex Mono', monospace", color: CORES.tinta }}>
                  {c.dado}
                </div>
                <p className="text-xs mt-2 leading-snug" style={{ color: CORES.cinza }}>{c.leitura}</p>
                <a href={c.fonte} target="_blank" rel="noreferrer"
                  className="text-xs underline decoration-dotted underline-offset-2"
                  style={{ color: CORES.confirma }}>fonte</a>
              </div>
            ))}
            <div className="rounded p-3 flex flex-col justify-center" style={{ background: CORES.tela }}>
              <div className="text-xs uppercase" style={{ fontFamily: "'IBM Plex Mono', monospace", color: CORES.fosforo, letterSpacing: "0.1em" }}>
                Síntese do contexto
              </div>
              <p className="text-sm mt-2 leading-snug" style={{ color: CORES.fosforoForte }}>
                Eleitorado polarizado, rejeições altas e piso firme dos dois lados explicam por que a série se move pouco.
                O que ainda pode mover: os ~10% disponíveis, a campanha de massa a partir do fim de agosto e choques
                exógenos (economia, tarifaço, fatos judiciais).
              </p>
            </div>
          </div>
        </Cartao>
      </section>

      {/* ---------- parâmetros do modelo ---------- */}
      <section className="max-w-5xl mx-auto px-4 mt-6">
        <Cartao titulo="Parâmetros do modelo (ajuste as premissas) — calibrados pelo histórico de erros logo abaixo" destaque={CORES.confirma}>
          <div className="grid gap-x-8 gap-y-5 md:grid-cols-2">
            <Deslizador rotulo="Meia-vida da recência" valor={params.meiaVida} min={7} max={45} passo={1} sufixo=" dias"
              onChange={(v) => setParams((p) => ({ ...p, meiaVida: v }))}
              dica="A cada X dias, o peso de uma pesquisa cai pela metade. Menor = agregado reage mais rápido; as rodadas antigas seguem na série apenas para a tendência." />
            <Deslizador rotulo="Erro sistemático histórico" valor={params.sigmaSys} min={0} max={6} passo={0.5} sufixo=" p.p."
              onChange={(v) => setParams((p) => ({ ...p, sigmaSys: v }))}
              dica="Âncoras de 2022: +3,1 foi o erro do estado CALIBRADO (2ºT, depois do gabarito do 1º turno); +6,3 foi o do estado não calibrado (1ºT). As pesquisas que alimentam o painel hoje ainda não passaram por calibragem — o padrão 4,0 fica entre os dois, descontando a parte do 6,3 que foi movimento de véspera (já coberto pela deriva)." />
            <Deslizador rotulo="Deriva da opinião pública" valor={params.coefDeriva} min={0.1} max={0.7} passo={0.05} sufixo=" ×√dias"
              onChange={(v) => setParams((p) => ({ ...p, coefDeriva: v }))}
              dica="Quanto a corrida pode se mover até a votação (TV, debates, fatos novos). Afeta APENAS a projeção para o dia da eleição — é o que separa as duas linhas da tela." />
            <Deslizador rotulo="Viés direcional das pesquisas" valor={params.vies} min={-3} max={10} passo={0.1} sufixo=" p.p."
              onChange={(v) => setParams((p) => ({ ...p, vies: v }))}
              dica="Positivo = pesquisas superestimando Lula. Calibração 2022 (agregado de véspera × urna): +6,3 no 1º turno, +3,1 no 2º — os erros não se somam: o do 2ºT já foi medido sobre pesquisas novas, refeitas após o choque do 1º. Negativo = superestimando Flávio." />
          </div>
          <div className="text-xs rounded p-3 space-y-1 mt-4"
            style={{ background: "#EFEFE6", color: CORES.cinza, fontFamily: "'IBM Plex Mono', monospace" }}>
            <div>margem: bruta {fmtSinal(M.margem)} − viés {fmt(params.vies)} = <b style={{ color: CORES.tinta }}>{fmtSinal(M.margemAj)} p.p.</b></div>
            <div>hoje: √({fmt(M.seAgora)}² + {fmt(params.sigmaSys)}²) = <b style={{ color: CORES.tinta }}>±{fmt(M.sigmaHoje)} p.p.</b></div>
            <div>dia da votação: √(hoje² + {fmt(M.deriva2)}²) = <b style={{ color: CORES.tinta }}>±{fmt(M.sigmaDia2)} p.p.</b></div>
          </div>
          <button onClick={() => setParams(PARAMS_PADRAO)} disabled={padraoAtivo}
            className="w-full px-3 py-2 rounded text-sm font-semibold mt-3"
            style={padraoAtivo
              ? { background: "transparent", color: CORES.cinza, border: `1px dashed ${CORES.linha}`, cursor: "default", opacity: 0.7 }
              : { background: "transparent", color: CORES.tinta, border: `1px solid ${CORES.alerta}` }}>
            {padraoAtivo
              ? "✓ Parâmetros no padrão"
              : "↺ Restaurar parâmetros padrão (meia-vida 21 · σ 4,0 · deriva 0,35 · viés 0)"}
          </button>
        </Cartao>
      </section>

      {/* ---------- histórico de erros das pesquisas ---------- */}
      <section className="max-w-5xl mx-auto px-4 mt-6">
        <Cartao titulo="Histórico de erros das pesquisas (urna × véspera) — e se repetir em 2026?" destaque={CORES.tinta}>
          <div className="overflow-x-auto -mx-1">
            <table className="w-full text-xs" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
              <thead>
                <tr className="text-left uppercase" style={{ color: CORES.cinza }}>
                  <th className="py-2 pr-3 font-medium">Pleito</th>
                  <th className="py-2 pr-3 font-medium">Urna (válidos)</th>
                  <th className="py-2 pr-3 font-medium">Pesquisas de véspera</th>
                  <th className="py-2 font-medium">Erro</th>
                </tr>
              </thead>
              <tbody>
                {HISTORICO_ERROS.map((h) => (
                  <tr key={h.pleito} style={{ borderTop: `1px solid ${CORES.linha}` }}>
                    <td className="py-2 pr-3 font-semibold whitespace-nowrap" style={{ fontFamily: "'Archivo', sans-serif" }}>{h.pleito}</td>
                    <td className="py-2 pr-3">{h.urna}</td>
                    <td className="py-2 pr-3">{h.pesq}</td>
                    <td className="py-2">{h.erro}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid gap-3 md:grid-cols-2 mt-4 text-sm" style={{ lineHeight: 1.5 }}>
            <div className="rounded p-3" style={{ background: "#F7E4D2", border: `1px solid ${CORES.alerta}` }}>
              <b>Por que pode se repetir:</b>{" "}
              <span style={{ color: "#6B3A0E" }}>
                o padrão é estrutural, não pontual — em 2018 e 2022 as pesquisas subestimaram a direita
                (recusa de resposta desse eleitorado, decisão de última hora, voto útil no 1º turno).
                A polarização e o método das casas seguem parecidos, e nada garante que a correção veio.
              </span>
            </div>
            <div className="rounded p-3" style={{ background: "#DFF0E5", border: `1px solid ${CORES.confirma}` }}>
              <b>Por que pode ser menor:</b>{" "}
              <span style={{ color: "#155A34" }}>
                a disputa decisiva de 2026 é o 2º turno — onde o erro histórico é muito menor
                (0,4–6,2 p.p. em 2022; quase zero em 2018). O candidato da direita é outro (Flávio, não Jair),
                a transferência do «voto envergonhado» é incerta, e a direção do erro não é lei.
              </span>
            </div>
          </div>

          <div className="mt-3 rounded p-3" style={{ background: "#EFEFE6", border: `1px dashed ${CORES.cinza}` }}>
            <div className="text-sm font-bold" style={{ color: CORES.tinta }}>
              Por que o erro do 1º turno importa AGORA (mesmo sendo o do 2ºT o menor)
            </div>
            <p className="text-xs mt-1 leading-relaxed" style={{ color: CORES.cinza }}>
              O erro pequeno da decisão de 2022 (+3,1) só existiu porque, entre os turnos, os institutos ganharam um
              gabarito perfeito — o resultado real do 1º turno — e recalibraram com ele. <b style={{ color: CORES.tinta }}>As
              pesquisas que alimentam este painel hoje ainda não passaram por calibragem nenhuma</b>: são o mesmo tipo de
              instrumento que produziu o +6,3. Por isso o erro do 1ºT entra três vezes no modelo: (1) ancora a incerteza
              sistemática do retrato atual, pré-calibragem (padrão 4,0, entre os estados calibrado e não calibrado);
              (2) muda a cara do 1º turno projetado — folga de ~9 p.p. vira chegada de ~2,5, alterando a chance de
              definição em 04/10 e a dinâmica da campanha; (3) define o teto observado do erro do setor, usado no
              cartão «teste-limite». O +3,1 só vira a referência certa depois de 04/10, quando o gabarito voltar a existir.
            </p>
            <p className="text-xs mt-2 leading-relaxed" style={{ color: CORES.cinza }}>
              <b style={{ color: CORES.tinta }}>E as correções persistem entre eleições?</b> O histórico diz: só em parte.
              Ajustes estruturais (pesos de escolaridade, religião, amostragem) são permanentes — mas a arma que salvou o
              2ºT de 2022, reponderar pelo voto real recém-apurado, não é portátil: o gabarito envelhece e o viés de
              não-resposta é alvo móvel. Os dois testes disponíveis: <b style={{ color: CORES.tinta }}>2018→2022</b> —
              apesar dos ajustes pós-2018, o erro do 1º turno voltou em 2022, na mesma direção e tamanho parecido;
              e <b style={{ color: CORES.tinta }}>2024 (SP, 2ºT)</b> — dois anos após a correção, Datafolha e Quaest
              subestimaram a margem de Nunes em 4,7 e 8,7 p.p. (Futura cravou). Correção parcial e desigual, não
              regressão total nem cura. Traduzindo em crença → número (chance de Lula no dia da votação):
              <b style={{ color: CORES.tinta }}> correção mantida (σ≈3) → ~86% · parcial (σ=4, padrão) → ~83% ·
              regressão ao 1ºT (σ≈6) → ~79%</b>. Escolha a sua no slider de erro sistemático, logo acima.
            </p>
          </div>

          <div className="mt-4">
            <div className="text-xs uppercase mb-2"
              style={{ fontFamily: "'IBM Plex Mono', monospace", letterSpacing: "0.1em", color: CORES.cinza }}>
              Curva de sensibilidade — chance de ser eleito (dia da votação) conforme o viés assumido. Clique no gráfico para aplicar:
            </div>
            <div style={{ width: "100%", height: 260 }}>
              <ResponsiveContainer>
                <ComposedChart data={serieSens} margin={{ top: 18, right: 10, bottom: 0, left: -22 }}
                  onClick={(e) => {
                    if (e && e.activeLabel != null) {
                      const v = Math.round(Number(e.activeLabel) * 10) / 10;
                      setParams((p) => ({ ...p, vies: v }));
                    }
                  }} style={{ cursor: "pointer" }}>
                  <CartesianGrid stroke={CORES.linha} strokeDasharray="2 4" />
                  <XAxis dataKey="v" type="number" domain={[-3, 10]} ticks={[-2, 0, 2, 4, 6, 8, 10]}
                    tickFormatter={(v) => fmt(v, 0)}
                    tick={{ fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", fill: CORES.cinza }}
                    stroke={CORES.linha} />
                  <YAxis domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} tickFormatter={(v) => v + "%"}
                    tick={{ fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", fill: CORES.cinza }}
                    stroke={CORES.linha} />
                  <Tooltip content={<DicaSens />} />
                  <ReferenceLine y={50} stroke={CORES.cinza} strokeDasharray="4 3" />
                  {CENARIOS_VIES.map((c) => (
                    <ReferenceLine key={c.vies} x={c.vies} stroke={CORES.tinta} strokeDasharray="3 3"
                      label={{ value: c.rotulo, position: "top", fontSize: 9, fill: CORES.cinza }} />
                  ))}
                  <ReferenceDot x={Math.round(M.margem * 100) / 100} y={50} r={5}
                    fill={CORES.tinta} stroke="#fff" strokeWidth={1.5}
                    label={{ value: `virada (${fmtSinal(M.margem)})`, position: "bottom", fontSize: 9, fill: CORES.tinta }} />
                  <ReferenceLine x={params.vies} stroke={CORES.confirma} strokeWidth={2}
                    label={{ value: "◆ atual", position: "insideBottom", fontSize: 10, fill: CORES.confirma }} />
                  <Line dataKey="l" stroke={CORES.lula} strokeWidth={2.5} dot={false} type="monotone" isAnimationActive={false} />
                  <Line dataKey="f" stroke={CORES.flavio} strokeWidth={2.5} dot={false} type="monotone" isAnimationActive={false} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
            <div className="grid gap-2 md:grid-cols-3 mt-3">
              {CENARIOS_VIES.map((c) => {
                const r = calcVies(c.vies);
                const pl = Math.round(r.elD * 100);
                const ativo = Math.abs(params.vies - c.vies) < 0.05;
                return (
                  <button key={c.vies} onClick={() => setParams((p) => ({ ...p, vies: c.vies }))}
                    className="rounded p-3 text-left"
                    style={{ background: "#EFEFE6",
                      border: ativo ? `2px solid ${CORES.tinta}` : `1px solid ${CORES.linha}`,
                      boxShadow: ativo ? "0 1px 0 rgba(0,0,0,0.2)" : "none" }}
                    aria-pressed={ativo}>
                    <div className="text-sm font-bold" style={{ color: CORES.tinta }}>
                      {ativo ? "▶ " : ""}{c.titulo}
                    </div>
                    <div className="text-sm mt-0.5 font-semibold"
                      style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                      viés {fmtSinal(c.vies)} → <span style={{ color: CORES.lula }}>{pl}%</span>
                      ×<span style={{ color: CORES.flavio }}>{100 - pl}%</span>
                    </div>
                    <p className="text-xs mt-1 leading-snug" style={{ color: CORES.cinza }}>{c.desc}</p>
                  </button>
                );
              })}
            </div>
            <p className="text-xs mt-2" style={{ color: CORES.cinza }}>
              <span style={{ color: CORES.lula }}>■</span> Lula · <span style={{ color: CORES.flavio }}>■</span> Flávio.
              O ponto preto é a <b>virada</b>: as linhas cruzam os 50% quando o viés assumido iguala a margem bruta
              ({fmtSinal(M.margem)} p.p.) — qualquer erro pró-Lula maior que isso na disputa decisiva inverte o favorito.
              Clique no gráfico ou nos cartões para aplicar o cenário ao painel inteiro.
            </p>
          </div>

          {replay && (
            <div className="mt-4 rounded-md p-4" style={{ background: CORES.tela, border: `1px solid ${CORES.telaBorda}` }}>
              <div className="text-xs uppercase"
                style={{ fontFamily: "'IBM Plex Mono', monospace", color: CORES.fosforo, letterSpacing: "0.12em" }}>
                Replay 2022 — e se os erros se repetissem exatamente?
              </div>
              <div className="grid gap-3 md:grid-cols-3 mt-3 text-sm">
                <div className="rounded p-3" style={{ background: "#0A1A12" }}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="text-xs uppercase" style={{ fontFamily: "'IBM Plex Mono', monospace", color: CORES.fosforo }}>
                      1º turno · erro do 1ºT-2022 aplicado
                    </div>
                    <span className="text-xs rounded px-1.5 py-0.5 whitespace-nowrap font-semibold"
                      style={{ fontFamily: "'IBM Plex Mono', monospace", color: CORES.fosforoForte, border: `1px solid ${CORES.telaBorda}` }}>
                      vai a 2ºT: {Math.round(replay.p2Trep * 100)}%
                    </span>
                  </div>
                  <div className="mt-1 font-semibold" style={{ fontFamily: "'IBM Plex Mono', monospace", color: CORES.fosforoForte, fontSize: "1.25rem" }}>
                    <span style={{ color: "#FF9AA8" }}>{fmt(replay.r1L)}%</span> × <span style={{ color: "#9FC0FF" }}>{fmt(replay.r1F)}%</span>
                  </div>
                  <p className="text-xs mt-1" style={{ color: CORES.fosforo, lineHeight: 1.45 }}>
                    dos válidos (Lula −1,0 · Flávio +5,3). Ninguém chega a 50%: <b>2º turno confirmado</b>, com chegada
                    apertada ({fmtSinal(replay.r1L - replay.r1F)} p.p.) em vez dos {fmtSinal(M.t1valL.valor - M.t1valF.valor)} das pesquisas.
                    Probabilidade de Lula ainda chegar em 1º lugar: {Math.round(replay.pLider1 * 100)}%.
                  </p>
                </div>
                <div className="rounded p-3" style={{ background: "#0A1A12" }}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="text-xs uppercase" style={{ fontFamily: "'IBM Plex Mono', monospace", color: CORES.fosforo }}>
                      2º turno · erro do 2ºT-2022 aplicado
                    </div>
                    <span className="text-xs rounded px-1.5 py-0.5 whitespace-nowrap font-semibold"
                      style={{ fontFamily: "'IBM Plex Mono', monospace", color: CORES.fosforoForte, border: `1px solid ${CORES.telaBorda}` }}>
                      Lula vence: {Math.round(replay.pV2rep * 100)}%
                    </span>
                  </div>
                  <div className="mt-1 font-semibold" style={{ fontFamily: "'IBM Plex Mono', monospace", color: CORES.fosforoForte, fontSize: "1.25rem" }}>
                    <span style={{ color: "#FF9AA8" }}>{fmt(replay.r2L)}%</span> × <span style={{ color: "#9FC0FF" }}>{fmt(replay.r2F)}%</span>
                  </div>
                  <p className="text-xs mt-1" style={{ color: CORES.fosforo, lineHeight: 1.45 }}>
                    dos válidos (±1,6). <b>Vitória apertada de Lula por {fmtSinal(replay.r2L - replay.r2F)} p.p.</b> — réplica
                    quase exata do placar real de 2022 (50,9×49,1).
                  </p>
                </div>
                <div className="rounded p-3" style={{ background: "#0A1A12", border: `1px solid ${CORES.confirma}` }}>
                  <div className="text-xs uppercase" style={{ fontFamily: "'IBM Plex Mono', monospace", color: CORES.fosforo }}>
                    Estimativa de vitória · condicional à réplica exata
                  </div>
                  <div className="mt-1 font-semibold" style={{ fontFamily: "'IBM Plex Mono', monospace", color: CORES.fosforoForte, fontSize: "1.25rem" }}>
                    <span style={{ color: "#FF9AA8" }}>{Math.round(replay.elRepD * 100)}%</span> × <span style={{ color: "#9FC0FF" }}>{100 - Math.round(replay.elRepD * 100)}%</span>
                  </div>
                  <div className="text-xs mt-0.5" style={{ fontFamily: "'IBM Plex Mono', monospace", color: CORES.fosforo }}>
                    = {fmt(replay.p1Ld * 100, 0)}% (direto no 1ºT) + {Math.round(replay.p2Trep * 100)}% × {Math.round(replay.pV2rep * 100)}% (2ºT)
                  </div>
                  <p className="text-xs mt-1" style={{ color: CORES.fosforo, lineHeight: 1.45 }}>
                    projeção p/ o dia da votação: o erro vira premissa fixa (turno a turno, como em 2022) e a única
                    incerteza que sobra é o movimento da opinião até outubro. Se a votação fosse hoje sob a réplica,
                    o placar ~{fmt(replay.r2L, 0)}×{fmt(replay.r2F, 0)} seria quase certo (Lula ≈{Math.round(replay.elRepH * 100)}%).
                  </p>
                  <button onClick={() => setParams((p) => ({ ...p, vies: ERRO_2022.t2.margem }))}
                    className="mt-2 px-2.5 py-1 rounded text-xs font-semibold"
                    style={{ background: CORES.confirma, color: "#fff" }}>
                    aplicar réplica (viés +3,1) ao painel
                  </button>
                </div>
              </div>
              <p className="text-xs mt-3" style={{ color: CORES.fosforo, opacity: 0.85, lineHeight: 1.5 }}>
                Calibração: erro médio «pesquisas de véspera × urna» de 2022 em votos válidos — 1º turno: margens de
                +7,1 a +14 (média +11,6) contra +5,2 real; 2º turno: margens de +0,8 a +8 (média +4,9) contra +1,8 real.
                Por que os erros não se somam: em 2022, as pesquisas do 2º turno foram refeitas depois do choque do 1º
                — o erro remanescente na decisão foi só +3,1. A réplica fiel, portanto, <b>ainda elege Lula por pouco,
                como em 2022</b>. No painel principal esse mesmo cenário aparece como ≈{Math.round(replay.pPainel * 100)}%,
                porque lá a incerteza sobre o próprio viés é mantida. A inversão da corrida exige uma hipótese que NÃO
                aconteceu em 2022: o erro do 1º turno persistir intacto na decisão — é o cartão «teste-limite +6,3»
                acima, além do ponto de virada ({fmtSinal(M.margem)}).
              </p>
            </div>
          )}

          <details className="mt-3 text-xs">
            <summary className="font-semibold" style={{ color: CORES.cinza }}>Fontes do histórico de erros</summary>
            <ul className="mt-1 space-y-1" style={{ color: CORES.cinza, fontFamily: "'IBM Plex Mono', monospace" }}>
              {FONTES_ERROS.map((f) => (
                <li key={f.url}>
                  <a href={f.url} target="_blank" rel="noreferrer"
                    className="underline decoration-dotted underline-offset-2">{f.nome}</a>
                </li>
              ))}
            </ul>
          </details>
        </Cartao>
      </section>

      {/* ---------- cenário-base (mais provável) ---------- */}
      {cenBase && (
        <section className="max-w-5xl mx-auto px-4 mt-6">
          <Cartao titulo="Cenário-base — o desfecho mais provável segundo o modelo (recalcula com seus parâmetros)" destaque={CORES.tinta}>
            <div className="font-black uppercase leading-snug" style={{ fontSize: "clamp(1rem, 2.6vw, 1.35rem)" }}>
              {cenBase.liderLula ? "Reeleição de Lula" : "Vitória de Flávio Bolsonaro"} decidida no 2º turno,
              por margem {Math.abs(M.margemAj) < 5 ? "apertada" : "moderada"} —
              probabilidade combinada: <span style={{ color: cenBase.liderLula ? CORES.lula : CORES.flavio }}>{pct(cenBase.pElei)}</span>
            </div>

            {/* linha do tempo modal */}
            <div className="grid gap-2 md:grid-cols-3 mt-4 text-sm" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
              <div className="rounded p-3" style={{ background: "#EFEFE6", border: `1px solid ${CORES.linha}` }}>
                <div className="text-xs uppercase" style={{ color: CORES.cinza }}>04/10 · 1º turno</div>
                <div className="mt-1 font-semibold">Sem definição → 2º turno</div>
                <div className="text-xs mt-1" style={{ color: CORES.cinza }}>
                  P(ir a 2ºT): <b style={{ color: CORES.tinta }}>{pct(M.p2Tacontece)}</b> ·
                  {" "}Lula em 1º: <b style={{ color: CORES.tinta }}>{pct(cenBase.pLulaEm1)}</b>
                </div>
              </div>
              <div className="rounded p-3" style={{ background: "#EFEFE6", border: `1px solid ${CORES.linha}` }}>
                <div className="text-xs uppercase" style={{ color: CORES.cinza }}>25/10 · 2º turno</div>
                <div className="mt-1 font-semibold">{cenBase.liderLula ? "Lula" : "Flávio"} vence a decisão</div>
                <div className="text-xs mt-1" style={{ color: CORES.cinza }}>
                  P(vitória na decisão): <b style={{ color: CORES.tinta }}>{pct(cenBase.pV2)}</b> ·
                  {" "}combinada = {fmt(cenBase.pDireto * 100, 0)}% + {pct(M.p2Tacontece)}×{pct(cenBase.pV2)}
                </div>
              </div>
              <div className="rounded p-3" style={{ background: "#EFEFE6", border: `1px solid ${CORES.linha}` }}>
                <div className="text-xs uppercase" style={{ color: CORES.cinza }}>Placar central projetado</div>
                <div className="mt-1 font-semibold">
                  <span style={{ color: CORES.lula }}>{fmt(cenBase.placarL)}%</span> × <span style={{ color: CORES.flavio }}>{fmt(100 - cenBase.placarL)}%</span>
                </div>
                <div className="text-xs mt-1" style={{ color: CORES.cinza }}>
                  dos válidos · faixa 80% da margem: {fmt(M.int80[0])} a {fmtSinal(M.int80[1])} p.p.
                </div>
              </div>
            </div>

            {/* bandas de margem */}
            <div className="mt-4">
              <div className="text-xs uppercase mb-1"
                style={{ fontFamily: "'IBM Plex Mono', monospace", letterSpacing: "0.1em", color: CORES.cinza }}>
                Como a distribuição do 2º turno se reparte (banda modal em destaque):
              </div>
              <div className="h-6 rounded overflow-hidden flex" style={{ border: `1px solid ${CORES.linha}` }}>
                {cenBase.bandas.map((b) => (
                  <div key={b.rot} className="flex items-center justify-center text-xs font-bold"
                    style={{ width: `${Math.max(b.p * 100, 0)}%`, background: b.cor, color: "#fff" }}>
                    {b.p >= 0.12 ? Math.round(b.p * 100) + "%" : ""}
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs" style={{ color: CORES.cinza }}>
                {cenBase.bandas.map((b) => (
                  <span key={b.rot}>
                    <span style={{ color: b.cor }}>■</span> {b.rot}: {Math.round(b.p * 100)}%
                    {b === cenBase.modal ? <b style={{ color: CORES.tinta }}> ● mais provável</b> : null}
                  </span>
                ))}
              </div>
            </div>

            {/* por quê */}
            <div className="mt-4 text-sm" style={{ lineHeight: 1.6 }}>
              <b>Por que este é o cenário-base:</b>{" "}
              <span style={{ color: CORES.cinza }}>
                (1) a vantagem é consistente — 6 dos 7 institutos de julho mostram Lula à frente ou empatado, margem
                agregada de {fmtSinal(M.margem)} p.p., tendência pareada estável com leve inclinação pró-Lula;
                (2) o contexto medido favorece o incumbente competitivo — aprovação ~empatada (1º saldo positivo na
                Quaest desde dez/24), rejeição de Flávio igual ou maior que a de Lula em todos os institutos, potencial
                de voto 47%×38%; (3) a estrutura polarizada, com ~2/3 de voto fechado de cada lado, faz a série andar em
                décimos — virar exige movimento fora do padrão de 2026; (4) mas a margem fica «apertada» no placar
                central porque a direção histórica do erro (2018, 2022 e Datafolha/Quaest em SP-2024) é subestimar a
                direita, e a réplica fiel de 2022 entrega exatamente ~51×49. O que derrubaria o cenário: novas rodadas
                levando a margem bruta para baixo de ~+2 (viraria «leve favoritismo»), três institutos seguidos com
                Flávio à frente fora da margem, ou um erro de pesquisa acima do já observado no estado calibrado.
              </span>
            </div>

            <details className="mt-3 text-sm">
              <summary className="font-semibold">Metodologia desta seção</summary>
              <p className="mt-1 text-sm" style={{ color: CORES.cinza, lineHeight: 1.55 }}>
                O cenário-base é o <b>caminho modal</b> da árvore de probabilidades do próprio modelo, nos parâmetros
                atuais do painel: em cada bifurcação, o ramo mais provável — definição no 1º turno? (não, {pct(M.p2Tacontece)});
                quem lidera a largada? ({cenBase.pLulaEm1 >= 0.5 ? "Lula" : "Flávio"}, {pct(Math.max(cenBase.pLulaEm1, 1 - cenBase.pLulaEm1))});
                quem vence a decisão? ({cenBase.liderLula ? "Lula" : "Flávio"}, {pct(cenBase.pV2)}); em qual faixa de margem?
                (banda modal acima). As bandas vêm da distribuição normal projetada N(margem ajustada; ±{fmt(M.sigmaDia2)}),
                a mesma do gráfico de distribuição; a probabilidade combinada soma o caminho direto no 1º turno com o
                caminho via 2º turno. Nada aqui é opinião fixa: mude o viés para +6,3 no painel de parâmetros e esta
                seção passará, sozinha, a descrever a vitória de Flávio — o «cenário mais provável» é uma função dos
                dados e das premissas, não um palpite.
              </p>
            </details>

            <p className="text-xs mt-3 rounded p-2" style={{ background: "#EFEFE6", color: CORES.cinza }}>
              Leitura estatística do agregado — não é previsão determinística nem endosso. Um cenário com {pct(1 - cenBase.pElei)} de
              probabilidade contrária acontece, no longo prazo, 1 vez a cada {Math.max(2, Math.round(1 / Math.max(0.01, 1 - cenBase.pElei)))} eleições parecidas.
            </p>
          </Cartao>
        </section>
      )}

      {/* ---------- tabela de pesquisas ---------- */}
      <section className="max-w-5xl mx-auto px-4 mt-6">
        <Cartao titulo={`Série de pesquisas (${pesquisas.length}) · da mais recente para a mais antiga`}>
          <div className="overflow-x-auto -mx-1">
            <table className="w-full text-sm" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
              <thead>
                <tr className="text-left text-xs uppercase" style={{ color: CORES.cinza }}>
                  <th className="py-2 pr-3 font-medium">Instituto</th>
                  <th className="py-2 pr-3 font-medium">Campo</th>
                  <th className="py-2 pr-3 font-medium">n</th>
                  <th className="py-2 pr-3 font-medium">±MoE</th>
                  <th className="py-2 pr-3 font-medium">1ºT L×F</th>
                  <th className="py-2 pr-3 font-medium">2ºT L×F</th>
                  <th className="py-2 pr-3 font-medium">Leitura 2ºT</th>
                  <th className="py-2 pr-3 font-medium">Peso</th>
                  <th className="py-2 pr-3 font-medium">Registro TSE</th>
                  <th className="py-2 font-medium" aria-label="remover" />
                </tr>
              </thead>
              <tbody>
                {[...M.linhas].reverse().map((l) => (
                  <tr key={l.id} style={{ borderTop: `1px solid ${CORES.linha}`, opacity: l.w < 0.15 ? 0.55 : 1 }}>
                    <td className="py-2 pr-3 font-semibold" style={{ fontFamily: "'Archivo', sans-serif" }}>
                      {l.fonte ? (
                        <a href={l.fonte} target="_blank" rel="noreferrer"
                          className="underline decoration-dotted underline-offset-2">{l.instituto}</a>
                      ) : l.instituto}
                      {l.usuario && <span className="ml-1 text-xs" style={{ color: CORES.alerta }}>(usuário)</span>}
                      {l.auto && <span className="ml-1 text-xs" style={{ color: CORES.alerta }}>(auto — confira a fonte)</span>}
                    </td>
                    <td className="py-2 pr-3 whitespace-nowrap">{fmtData(l.inicio)}–{fmtData(l.fim)}</td>
                    <td className="py-2 pr-3">{l.n?.toLocaleString("pt-BR")}</td>
                    <td className="py-2 pr-3">{fmt(l.moe, 1)}</td>
                    <td className="py-2 pr-3 whitespace-nowrap">
                      {l.t1 && l.t1.lula != null
                        ? <><span style={{ color: CORES.lula }}>{fmt(l.t1.lula)}</span>×<span style={{ color: CORES.flavio }}>{fmt(l.t1.flavio)}</span></>
                        : "n/d"}
                    </td>
                    <td className="py-2 pr-3 whitespace-nowrap">
                      <span style={{ color: CORES.lula }}>{fmt(l.t2.lula)}</span>×<span style={{ color: CORES.flavio }}>{fmt(l.t2.flavio)}</span>
                    </td>
                    <td className="py-2 pr-3">
                      <span className="inline-block rounded-full px-2 py-0.5 text-xs"
                        style={l.empate2
                          ? { background: "#F7E4D2", color: "#8A4510", border: `1px solid ${CORES.alerta}` }
                          : { background: "#DFF0E5", color: "#155A34", border: `1px solid ${CORES.confirma}` }}>
                        {l.empate2 ? "empate técnico" : (l.margem2 >= 0 ? "Lula à frente" : "Flávio à frente")}
                      </span>
                    </td>
                    <td className="py-2 pr-3">{fmt(l.w, 2)}</td>
                    <td className="py-2 pr-3 whitespace-nowrap text-xs">{l.tse}</td>
                    <td className="py-2 text-right">
                      <button onClick={() => setPesquisas((ps) => ps.filter((p) => p.id !== l.id))}
                        aria-label={`Remover ${l.instituto}`} title="Remover do agregado"
                        className="px-2 rounded" style={{ color: CORES.cinza }}>×</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap gap-2 mt-4">
            <button onClick={() => setFormAberto((v) => !v)}
              className="px-3 py-1.5 rounded text-sm font-semibold"
              style={{ background: CORES.confirma, color: "#fff" }}>
              {formAberto ? "Fechar formulário" : "+ Adicionar nova pesquisa"}
            </button>
            <button onClick={() => setPesquisas(PESQUISAS_OFICIAIS)}
              className="px-3 py-1.5 rounded text-sm font-semibold"
              style={{ background: "transparent", color: CORES.tinta, border: `1px solid ${CORES.cinza}` }}>
              ↺ Restaurar dados oficiais
            </button>
          </div>

          {formAberto && (
            <div className="mt-4 rounded-md p-4" style={{ background: "#EFEFE6", border: `1px dashed ${CORES.cinza}` }}>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {campoForm("instituto", "Instituto*", true)}
                {campoForm("fim", "Data final do campo*")}
                {campoForm("n", "Amostra (n)")}
                {campoForm("moe", "Margem de erro (p.p.)")}
                {campoForm("tse", "Registro TSE")}
                {campoForm("l2", "2ºT · Lula %*")}
                {campoForm("f2", "2ºT · Flávio %*")}
                {campoForm("l1", "1ºT · Lula %")}
                {campoForm("f1", "1ºT · Flávio %")}
                {campoForm("bnns1", "1ºT · Branco/nulo + NS %")}
              </div>
              <div className="flex items-center gap-3 mt-3">
                <button onClick={adicionarPesquisa}
                  className="px-3 py-1.5 rounded text-sm font-semibold"
                  style={{ background: CORES.tinta, color: "#fff" }}>
                  Incluir no agregado
                </button>
                <span className="text-xs" style={{ color: CORES.cinza }}>
                  * obrigatórios. Use apenas pesquisas com registro no TSE. Edições valem só nesta sessão.
                </span>
              </div>
            </div>
          )}
        </Cartao>
      </section>

      {/* ---------- metodologia ---------- */}
      <section className="max-w-5xl mx-auto px-4 mt-6">
        <Cartao titulo="Metodologia e limitações">
          <div className="space-y-2 text-sm" style={{ lineHeight: 1.55 }}>
            <details>
              <summary className="font-semibold">Média, pesos e as duas probabilidades</summary>
              <p className="mt-1" style={{ color: CORES.cinza }}>
                Peso = recência (decaimento exponencial) × √(amostra/2000), teto 1,5. A probabilidade «no cenário atual»
                usa a incerteza de hoje (dispersão entre institutos + erro sistemático possível de todo o setor).
                A probabilidade «no dia da votação» soma a deriva da opinião, que cresce com a raiz do tempo restante —
                por isso ela é sempre menos cravada que a de hoje. A chance de eleição combina os caminhos:
                vitória direta no 1º turno (mais de 50% dos válidos) ou vitória no 2º turno.
              </p>
            </details>
            <details>
              <summary className="font-semibold">Como a tendência é calculada</summary>
              <p className="mt-1" style={{ color: CORES.cinza }}>
                Para evitar que diferenças de metodologia entre institutos virem «tendência» falsa, o indicador compara
                cada instituto com ele mesmo: última rodada menos a rodada anterior (até 75 dias), e tira a média desses
                pares. |Δ| menor que 0,8 p.p. é tratado como estável. As linhas do gráfico são a média ponderada
                recalculada ao longo do tempo.
              </p>
            </details>
            <details>
              <summary className="font-semibold">Classificação dos cenários</summary>
              <p className="mt-1" style={{ color: CORES.cinza }}>
                Sobre a chance de eleição projetada: 50–60% empate técnico projetado · 60–75% leve favoritismo ·
                75–90% favorito · 90%+ amplamente favorito. Em cada pesquisa isolada, «empate técnico» = diferença ≤ 2×
                margem de erro. O modelo assume que os dois primeiros colocados vão ao 2º turno — nas pesquisas atuais o
                3º colocado tem no máximo 8%.
              </p>
            </details>
            <details>
              <summary className="font-semibold">Limitações que você deve conhecer</summary>
              <p className="mt-1" style={{ color: CORES.cinza }}>
                Pesquisas são retratos. Em 2022 parte dos institutos subestimou a votação da direita — o erro sistemático
                do modelo existe por isso e é ajustável. O erro sistemático padrão (4,0) é ancorado no estado
                não calibrado dos institutos: o gabarito que reduziu o erro para +3,1 em 2022 — o resultado real do
                1º turno — só existirá depois de 04/10/2026. Cenários estimulados variam (lista de nomes, presencial ×
                telefone × on-line). Rodadas antigas de alguns institutos não divulgaram o 1º turno ou o detalhe de
                brancos/nulos (marcadas n/d) — elas entram só onde há dado. A Datafolha de julho não detalhou
                brancos/nulos do 1º turno, então fica fora do cálculo de votos válidos do 1º turno.
              </p>
            </details>
            <details>
              <summary className="font-semibold">Botão «Atualizar agora» e o viés histórico</summary>
              <p className="mt-1" style={{ color: CORES.cinza }}>
                O botão dispara uma consulta de IA com busca na web que procura rodadas novas dos institutos
                (posteriores à pesquisa mais recente da série), retorna os números em formato estruturado e os inclui
                automaticamente, com deduplicação por instituto e data e checagens de sanidade. Entradas automáticas são
                marcadas «(auto)» com link da fonte — confira antes de citar; a atualização via chat («atualizar») segue
                sendo a via conferida manualmente. O parâmetro de viés direcional aplica ao agregado o padrão de erro
                observado em 2018/2022 (subestimação da direita), permitindo responder quantitativamente à pergunta
                «e se as pesquisas estiverem erradas de novo?».
              </p>
            </details>
            <details>
              <summary className="font-semibold">Fontes da série (registro no TSE)</summary>
              <ul className="mt-1 space-y-1 text-xs"
                style={{ color: CORES.cinza, fontFamily: "'IBM Plex Mono', monospace" }}>
                {PESQUISAS_OFICIAIS.map((p) => (
                  <li key={p.id}>
                    <a href={p.fonte} target="_blank" rel="noreferrer"
                      className="underline decoration-dotted underline-offset-2">{p.instituto}</a>
                    {" "}· campo {fmtData(p.inicio)}–{fmtData(p.fim)}/2026 · {p.tse}
                  </li>
                ))}
              </ul>
            </details>
          </div>
        </Cartao>
      </section>

      {/* ---------- rodapé ---------- */}
      <footer className="max-w-5xl mx-auto px-4 mt-8">
        <div className="rounded-md p-4 text-xs"
          style={{ background: "#F3E7D9", border: `1px solid ${CORES.alerta}`, color: "#6B3A0E", lineHeight: 1.6 }}>
          <b>Aviso:</b> ferramenta estatística e educacional, sem vínculo com candidatos, partidos ou institutos.
          Os números pertencem aos respectivos institutos, registrados no TSE sob os números indicados.
          Probabilidades dependem das premissas — teste-as antes de concluir. Para atualizar a série com as próximas
          rodadas, digite <b>«atualizar»</b> no chat: as pesquisas novas serão buscadas, adicionadas e todos os
          cálculos refeitos. Eleições: 1º turno 04/10/2026 · 2º turno 25/10/2026.
        </div>
      </footer>
    </div>
  );
}
