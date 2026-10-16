/**
 * Constantes extraídas do protótipo `agregador-presidencial-2026.jsx` (fonte da verdade).
 * NÃO altere números sem registrar em DECISOES.md — o modelo estatístico depende deles
 * com paridade numérica exata (golden tests).
 */
import type { Candidato, CenarioVies, ParamsModelo } from "./tipos";

/** Data da última carga verificada do seed (a UI de produção usa o selo de frescor do banco). */
export const ULTIMA_ATUALIZACAO = "16/10/2026";

/** Paleta original do protótipo — em componentes use SEMPRE os tokens de tokens.css. */
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
} as const;

export const ELEICAO_1T = Date.parse("2026-10-04T12:00:00-03:00");
export const ELEICAO_2T = Date.parse("2026-10-25T12:00:00-03:00");

/** Erro médio das pesquisas de véspera × urna em 2022 (votos válidos, agregado dos institutos).
    Importante: os erros NÃO se somam — o do 2ºT foi medido sobre pesquisas novas, refeitas após o 1ºT. */
export const ERRO_2022 = {
  t1: { lula: -1.0, flavio: 5.3, margem: 6.3 }, // véspera: margens de +7,1 a +14 (média +11,6) × urna +5,2
  t2: { lula: -1.6, flavio: 1.6, margem: 3.1 }, // véspera: margens de +0,8 a +8 (média +4,9) × urna +1,8
} as const;

export const CENARIOS_VIES: CenarioVies[] = [
  {
    vies: 0,
    rotulo: "sem viés",
    titulo: "Sem viés — pesquisas certas",
    desc: "O agregado de 2026 acerta na média: a vantagem de +4,7 p.p. é real. É o cenário-base do painel.",
  },
  {
    vies: 3.1,
    rotulo: "réplica 2022",
    titulo: "Réplica 2022 — erro do 2ºT se repete",
    desc: "As pesquisas da DECISÃO erram +3,1 pró-Lula, o mesmo erro do 2º turno de 2022. A margem real cai para ~+1,6: Lula vence apertado — o filme de 2022 de novo.",
  },
  {
    vies: 6.3,
    rotulo: "teste-limite +6,3",
    titulo: "Teste-limite — erro tamanho 1ºT-22 chega à decisão",
    desc: "Hipótese que NÃO ocorreu em 2022: o erro grande do 1º turno (+6,3) persistir até o dia decisivo, sem a recalibragem que os institutos fizeram entre os turnos. Como +6,3 passa do ponto de virada (+4,7), a corrida inverte.",
  },
];

export const CANDIDATOS: Candidato[] = [
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

export const PARAMS_PADRAO: ParamsModelo = {
  meiaVida: 21,
  sigmaSys: 4.0,
  coefDeriva: 0.35,
  vies: 0,
};

/**
 * Prompt da busca automática de pesquisas (usado só no servidor). Reescrito para o
 * 2º turno (DECISOES.md): data de hoje e fase da eleição explícitas, votos TOTAIS
 * pedidos com todas as letras (o modelo não aceita válidos), branco/nulo do 2º turno
 * e até 12 itens — o volume de pesquisas da reta final passa de 6 por semana.
 */
export const montarPromptBusca = (
  desde: string,
  hoje: string,
) => `Você é um coletor de dados de pesquisas eleitorais brasileiras. Hoje é ${hoje}. A eleição presidencial de 2026 teve 1º turno em 2026-10-04 (resultado oficial do TSE: Flávio Bolsonaro 47,03% × Lula 45,16% dos votos válidos) e o 2º turno, entre Lula (PT) e Flávio Bolsonaro (PL), é em 2026-10-25.

Use a busca na web para localizar pesquisas NACIONAIS de intenção de voto para PRESIDENTE com o cenário Lula × Flávio Bolsonaro no 2º turno, divulgadas por institutos (AtlasIntel, Datafolha, Quaest, PoderData, Nexus, Gerp, Indexa, Ipec, Real Time Big Data, Paraná Pesquisas, Futura, MDA, Palver, Vox Brasil, Ideia, Ipespe, DataTrends ou outros), com registro no TSE e com trabalho de campo encerrado a partir de ${desde} (inclusive) até hoje. Prefira as páginas do Poder360, da Gazeta do Povo, do G1, da Folha ou do próprio instituto.

Responda APENAS com um array JSON válido, sem markdown, sem comentários, sem citações, sem texto antes ou depois. Máximo de 12 itens (os mais recentes). Cada item:
{"instituto":"...","contratante":"...","inicio":"AAAA-MM-DD","fim":"AAAA-MM-DD","n":2000,"moe":2.0,"tse":"BR-XXXXX/2026","l1":null,"f1":null,"bn1":null,"l2":45,"f2":47,"bn2":8,"l2v":49,"f2v":51,"fonte":"https://..."}

Regras:
- l2/f2 = 2º turno Lula/Flávio em VOTOS TOTAIS (o número com branco, nulo e indecisos na base). NUNCA ponha votos válidos em l2/f2.
- bn2 = branco/nulo + não sabe/indecisos do 2º turno (o que falta para 100 nos votos totais).
- l2v/f2v = votos válidos do 2º turno, se o instituto divulgou; senão null.
- l1/f1/bn1 = 1º turno estimulado, SÓ para pesquisas com campo encerrado antes de 2026-10-04; nas demais, null.
- n = número inteiro de entrevistas (2004, não "2.004"). Use null quando o dado não foi divulgado.
- Inclua SOMENTE pesquisas que você realmente encontrou na busca, com a URL real da fonte — nunca invente números nem registros. Se não houver pesquisa nova no período, responda [].`;
