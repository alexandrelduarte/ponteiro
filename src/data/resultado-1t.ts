/**
 * Resultado OFICIAL do 1º turno de 2026 (TSE, 100% das seções apuradas).
 *
 * É fato, não estimativa: entra no painel como gabarito do 1º turno (o que as
 * pesquisas de véspera diziam × o que a urna disse). Percentuais sobre votos
 * válidos, como o TSE publica. NÃO editar sem fonte — registrar em DECISOES.md.
 */

export interface Candidato1T {
  nome: string;
  partido: string;
  votos: number;
  /** % dos votos válidos */
  pctValidos: number;
}

export interface Resultado1T {
  /** AAAA-MM-DD */
  data: string;
  /** página oficial de resultados */
  fonte: string;
  /** comparecimento sobre o eleitorado apto (%) */
  comparecimentoPct: number | null;
  /** do mais votado ao menos votado */
  candidatos: Candidato1T[];
}

export const RESULTADO_1T: Resultado1T = {
  data: "2026-10-04",
  fonte: "https://resultados.tse.jus.br/oficial/app/index.html",
  // Totalização do TSE encerrada em 05/10/2026 12:51 (100% das seções instaladas):
  // eleitorado 158.745.502 · comparecimento 125.275.835 · válidos 119.300.788 ·
  // brancos 2.300.798 · nulos 3.674.249 (dados: br-c0001-e006257-u.json e
  // br-e006257-ab.json em resultados.tse.jus.br/oficial/ele2026/6257/dados/br/).
  comparecimentoPct: 78.92,
  candidatos: [
    { nome: "Flávio Bolsonaro", partido: "PL", votos: 56_104_503, pctValidos: 47.03 },
    { nome: "Lula", partido: "PT", votos: 53_879_538, pctValidos: 45.16 },
    { nome: "Augusto Cury", partido: "Avante", votos: 3_448_569, pctValidos: 2.89 },
    { nome: "Renan Santos", partido: "Missão", votos: 2_675_887, pctValidos: 2.24 },
    { nome: "Ronaldo Caiado", partido: "PSD", votos: 2_605_148, pctValidos: 2.18 },
    { nome: "Romeu Zema", partido: "Novo", votos: 326_488, pctValidos: 0.27 },
    { nome: "Samara Martins", partido: "UP", votos: 122_911, pctValidos: 0.1 },
    { nome: "Hertz Dias", partido: "PSTU", votos: 43_103, pctValidos: 0.04 },
    { nome: "Clariana Barão", partido: "DC", votos: 40_043, pctValidos: 0.03 },
    { nome: "Edmilson Costa", partido: "PCB", votos: 22_693, pctValidos: 0.02 },
    { nome: "Wilson Grassi", partido: "Democrata", votos: 16_881, pctValidos: 0.01 },
    { nome: "Rui Costa Pimenta", partido: "PCO", votos: 15_024, pctValidos: 0.01 },
  ],
};

/** Percentual de um dos dois finalistas (Lula / Flávio Bolsonaro). */
export function pct1T(nome: "Lula" | "Flávio Bolsonaro"): number {
  const c = RESULTADO_1T.candidatos.find((x) => x.nome === nome);
  if (!c) throw new Error(`resultado do 1º turno sem ${nome}`);
  return c.pctValidos;
}
