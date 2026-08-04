/**
 * O histórico de erros e as fontes, ditos em português — camada de tela.
 *
 * `src/data/historico-erros.ts` e `src/data/fontes-erros.ts` são o dado
 * extraído do protótipo e não mudam. O texto deles, porém, é v1 verbatim e
 * chegava CRU a uma superfície pública: "p.p." oito vezes, "1ºT/2ºT" seis,
 * "pró-esquerda", "Futura cravou", "pts", aspas angulares. VOZ §5.1 bane
 * "p.p." sem explicação, §5.2 bane "cravado", §5.3 bane "urna", §8 proíbe
 * "1T/2T" fora da /metodologia técnica e §4 proíbe enquadramento de torcida.
 *
 * A tradução mora aqui, keyed pelo mesmo identificador do dado (o pleito e a
 * URL), com FALLBACK para o texto original: se um item novo entrar no dado
 * sem tradução, ele aparece — nunca some da tela.
 *
 * O que mudou, item a item do checklist de VOZ §9:
 *  - "p.p." → "pontos" (e, na primeira aparição do bloco, a tradução em
 *    pessoas já está no corpo da seção);
 *  - "1ºT"/"2ºT" → "1º turno"/"2º turno";
 *  - "margem inflada ~9 p.p. pró-esquerda" → "a diferença publicada estava
 *    cerca de 9 pontos maior que a real, a favor de Lula" (o fato, sem lado);
 *  - "direita subestimada" → "as pesquisas ficaram abaixo do que ele teve";
 *  - "Futura cravou" → "a Futura acertou";
 *  - "urna deu" → "o resultado real foi";
 *  - «…» → “…”.
 */
import { FONTES_ERROS } from "@/data/fontes-erros";
import { HISTORICO_ERROS } from "@/data/historico-erros";
import type { ErroPleito, FonteErro } from "@/data/tipos";

const PLEITOS: Record<string, ErroPleito> = {
  "2018 · 1º turno": {
    pleito: "2018 · 1º turno",
    urna: "Bolsonaro 46,0% dos votos válidos",
    pesq: "Ibope e Datafolha na véspera: cerca de 36%",
    erro: "as pesquisas ficaram cerca de 10 pontos abaixo do que ele teve — o maior erro recente",
  },
  "2018 · 2º turno": {
    pleito: "2018 · 2º turno",
    urna: "Bolsonaro 55,1% × Haddad 44,9%",
    pesq: "Datafolha 55 × 45 · Ibope 54 × 46",
    erro: "acertaram: o erro ficou entre 0 e 1 ponto",
  },
  "2022 · 1º turno": {
    pleito: "2022 · 1º turno",
    urna: "Lula 48,4% × Bolsonaro 43,2% — diferença de 5,2 pontos",
    pesq: "Datafolha e Ipec na véspera: Lula 14 pontos à frente",
    erro:
      "a diferença publicada estava cerca de 9 pontos maior que a real, a favor de Lula; os que " +
      "chegaram mais perto foram Paraná Pesquisas (7,1) e AtlasIntel (9,2)",
  },
  "2022 · 2º turno": {
    pleito: "2022 · 2º turno",
    urna: "Lula 50,9% × Bolsonaro 49,1% — diferença de 1,8 ponto",
    pesq: "erros de 0,4 a 6,2 pontos, conforme o instituto",
    erro:
      "pequeno a médio; quando erraram, foi a favor de Lula. Datafolha e Quaest (52 × 48) " +
      "acertaram a diferença",
  },
  "2024 · SP (teste pós-correção)": {
    pleito: "2024 · São Paulo (o teste depois da correção)",
    urna: "1º turno: empate triplo confirmado · 2º turno: Nunes 59,4% × Boulos 40,6%",
    pesq: "véspera do 2º turno: Datafolha 57 × 43 · Quaest 55 × 45 · Futura 59,7 × 40,3",
    erro:
      "dois anos depois da correção, Datafolha e Quaest ficaram de novo abaixo do que a direita " +
      "teve (4,7 e 8,7 pontos na diferença); a Futura acertou — a correção veio pela metade, e " +
      "desigual entre as casas",
  },
};

const FONTES: Record<string, string> = {
  "https://www.metropoles.com/colunas/guilherme-amado/institutos-de-pesquisa-erraram-de-13-a-235-pontos-no-1o-turno-em-2022":
    "Metrópoles — erros de 13 a 23,5 pontos no 1º turno de 2022; de 0,4 a 6,2 no 2º turno",
  "https://www.cnnbrasil.com.br/politica/resultados-das-urnas-divergem-de-pesquisas-eleitorais/":
    "CNN — os números da véspera do 1º turno de 2022 (Datafolha 50 × 36; Ipec 51 × 37)",
  "https://www.congressoemfoco.com.br/noticia/10860/quatro-pesquisas-acertaram-a-votacao-de-lula-e-bolsonaro-veja-quais":
    "Congresso em Foco — quem acertou o 2º turno de 2022 e o de 2018",
  "https://www.em.com.br/app/noticia/politica/2022/10/02/interna_politica,1401855/pesquisas-erraram-projecoes-para-bolsonaro-e-aliados.shtml":
    "Estado de Minas — o resultado real do 1º turno de 2022 comparado com as pesquisas",
  "https://www.gazetadopovo.com.br/eleicoes/2024/pesquisa-eleitoral/datafolha-sao-paulo-sp-outubro-2024-vespera/":
    "Gazeta do Povo — Datafolha na véspera do 2º turno em São Paulo, 2024 (57 × 43; o resultado real foi 59,4 × 40,6)",
  "https://pt.wikipedia.org/wiki/Elei%C3%A7%C3%A3o_municipal_em_S%C3%A3o_Paulo_em_2024":
    "Wikipédia — a eleição de São Paulo em 2024: as pesquisas de véspera (Quaest 55 × 45; Futura 59,7 × 40,3) e o resultado",
};

/** Os cinco pleitos, na ordem do dado, com o texto já traduzido. */
export const ERROS_TRADUZIDOS: ErroPleito[] = HISTORICO_ERROS.map((h) => PLEITOS[h.pleito] ?? h);

/** As fontes, na ordem do dado, com o nome já traduzido. */
export const FONTES_TRADUZIDAS: FonteErro[] = FONTES_ERROS.map((f) => ({
  url: f.url,
  nome: FONTES[f.url] ?? f.nome,
}));
