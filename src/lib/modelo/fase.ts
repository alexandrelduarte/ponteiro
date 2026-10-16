/**
 * FASE ELEITORAL — em que ponto do calendário o painel está, a partir de `hojeMs`.
 *
 * Puro e determinístico (mesma regra do núcleo: nada lê o relógio). Os marcos são os
 * instantes oficiais de `ELEICAO_1T` / `ELEICAO_2T` (meio-dia de Brasília do dia da
 * votação) — a partir deles o turno conta como realizado.
 *
 * - `pre1T`       — antes de 04/10: dois caminhos (1º turno direto OU 2º turno).
 * - `entreTurnos` — de 04/10 a 25/10: o 1º turno já aconteceu, só o 2º turno decide.
 * - `encerrada`   — a partir de 25/10: a votação acabou; o resultado é o oficial do TSE.
 */
import { ELEICAO_1T, ELEICAO_2T } from "@/data/constantes";

export type FaseEleitoral = "pre1T" | "entreTurnos" | "encerrada";

export function faseEleitoral(hojeMs: number): FaseEleitoral {
  if (hojeMs < ELEICAO_1T) return "pre1T";
  if (hojeMs < ELEICAO_2T) return "entreTurnos";
  return "encerrada";
}

/** O 1º turno ainda está por vir (o caminho "ganhar direto em 04/10" existe). */
export const primeiroTurnoPendente = (hojeMs: number): boolean => hojeMs < ELEICAO_1T;
