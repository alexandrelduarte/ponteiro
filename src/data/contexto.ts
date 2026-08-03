/**
 * Contexto social medido (não é opinião) — extraído do protótipo, textos preservados.
 */
import type { ItemContexto } from "./tipos";

export const CONTEXTO: ItemContexto[] = [
  {
    titulo: "Aprovação do governo (jul/26)",
    dado: "48%×47% (Quaest) · 46%×50% (RTBD) · 47,6%×51,2% (Atlas) · 42%×51% (PoderData)",
    leitura:
      "País dividido. A Quaest registrou o 1º saldo positivo de Lula desde dez/2024 — consistente com a leve melhora do presidente na série de intenção de voto. Aprovação na faixa de 42–48% historicamente indica incumbente competitivo, não dominante.",
    fonte:
      "https://www.poder360.com.br/poder-eleicoes-2026/governo-lula-e-aprovado-por-48-e-desaprovado-por-47-diz-quaest/",
  },
  {
    titulo: "Rejeição e teto de voto",
    dado: "Não votaria de jeito nenhum: Lula 47–53% · Flávio 46–57% (conforme instituto). Potencial de voto (Quaest jul): Lula 47% × Flávio 38%.",
    leitura:
      "Rejeição mútua altíssima comprime os tetos: a disputa se decide na faixa de ~8–15% de indecisos e brancos. Pelo dado de potencial, o teto de Flávio hoje é menor que o de Lula — é o nº que a campanha do PL precisa mover.",
    fonte:
      "https://www.gazetadopovo.com.br/eleicoes/2026/pesquisa-eleitoral-2026/genial-quaest-presidente-julho-2026/",
  },
  {
    titulo: "Piso firme (comprometimento)",
    dado: "«É o único em que votaria»: Lula 36% × Flávio 31% (PoderData, jul).",
    leitura:
      "Dois terços do eleitorado de cada um é voto fechado. Eleitorado polarizado tende a oscilar pouco — por isso a série de 2026 se move em décimos, não em saltos.",
    fonte:
      "https://www.gazetadopovo.com.br/eleicoes/2026/pesquisa-eleitoral-2026/poderdata-presidente-pesquisa-julho-2026/",
  },
  {
    titulo: "Calendário que ainda pesa",
    dado: "16/08 abertura da campanha de Lula · convenção do PL confirmou Flávio · rádio/TV a partir do fim de agosto · debates na TV · 04/10 e 25/10.",
    leitura:
      "A maior parte da comunicação de massa ainda não aconteceu. É o fundamento matemático da «deriva» do modelo: quanto mais longe do voto, maior a chance de o quadro se mover.",
    fonte:
      "https://www.gazetadopovo.com.br/eleicoes/2026/pesquisa-eleitoral-2026/gerp-presidente-julho-2026-2/",
  },
  {
    titulo: "Pano de fundo da disputa",
    dado: "Jair Bolsonaro preso (pena de 27 anos) e inelegível até 2030 · tarifa de 25% dos EUA sobre produtos brasileiros em vigor desde 22/07, mobilizada pelas duas campanhas.",
    leitura:
      "Dois choques exógenos com efeito eleitoral ainda incerto: a ausência do ex-presidente reorganizou a direita em torno do filho; o tarifaço virou disputa de narrativa econômica e nacional.",
    fonte:
      "https://www.gazetadopovo.com.br/eleicoes/2026/pesquisa-eleitoral-2026/nexus-btg-pactual-presidente-julho-2026-2/",
  },
];

/** Texto do cartão "Síntese do contexto" (tela verde) — preservado do protótipo. */
export const SINTESE_CONTEXTO =
  "Eleitorado polarizado, rejeições altas e piso firme dos dois lados explicam por que a série se move pouco. O que ainda pode mover: os ~10% disponíveis, a campanha de massa a partir do fim de agosto e choques exógenos (economia, tarifaço, fatos judiciais).";
