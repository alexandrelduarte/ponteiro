/**
 * FASE ELEITORAL — em que ponto do calendário o painel está, a partir de `hojeMs`.
 *
 * Puro e determinístico (mesma regra do núcleo: nada lê o relógio). Os marcos são os
 * instantes oficiais de `ELEICAO_1T` / `ELEICAO_2T` (meio-dia de Brasília do dia da
 * votação) — a partir deles o turno conta como realizado.
 *
 * - `pre1T`       — antes de 04/10: dois caminhos (1º turno direto OU 2º turno).
 * - `entreTurnos` — de 04/10 a 25/10: o 1º turno já aconteceu, só o 2º turno decide.
 * - `encerrada`   — a partir das 17h de 25/10 (urnas fechadas, horário de Brasília): a
 *                   votação acabou; o resultado que vale é o oficial do TSE.
 */
import { ELEICAO_1T } from "@/data/constantes";

/** Primeiro dia de campo encerrado que conta como pesquisa PÓS-1º turno. */
export const INICIO_POS_1T = "2026-10-04";

/** Fechamento das urnas do 2º turno (17h de Brasília). */
export const FIM_VOTACAO_2T = Date.parse("2026-10-25T17:00:00-03:00");

export type FaseEleitoral = "pre1T" | "entreTurnos" | "encerrada";

export function faseEleitoral(hojeMs: number): FaseEleitoral {
  if (hojeMs < ELEICAO_1T) return "pre1T";
  if (hojeMs < FIM_VOTACAO_2T) return "entreTurnos";
  return "encerrada";
}

/** O 1º turno ainda está por vir (o caminho "ganhar direto em 04/10" existe). */
export const primeiroTurnoPendente = (hojeMs: number): boolean => hojeMs < ELEICAO_1T;

const DIA_MS = 86_400_000;

/** A data (AAAA-MM-DD) de um instante, no fuso do produto. */
function diaSP(ms: number): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(ms));
}

/**
 * Dias corridos de calendário (America/Sao_Paulo) entre hoje e a data `iso`:
 * positivo no futuro, 0 no próprio dia, negativo no passado. Diferença de DATAS,
 * nunca de instantes — no domingo da votação de manhã a resposta é 0, não 1.
 */
export function diasCorridos(iso: string, hojeMs: number): number {
  const meioDia = (d: string) => Date.parse(`${d}T12:00:00-03:00`);
  return Math.round((meioDia(iso) - meioDia(diaSP(hojeMs))) / DIA_MS);
}

/** Dias corridos até o 2º turno (25/10/2026). */
export const diasAte2T = (hojeMs: number): number => diasCorridos("2026-10-25", hojeMs);
