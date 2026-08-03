/**
 * Serialização dos parâmetros do modelo na URL — links compartilháveis
 * (`?vies=3.1&sys=4&meia=21&deriva=0.35`).
 *
 * Regras:
 *  - só entram na query os parâmetros DIFERENTES do padrão (URL curta e o
 *    link "/" continua sendo o painel oficial);
 *  - a leitura é hostil: valor fora da faixa do slider é ignorado (volta ao
 *    padrão), nunca "clampado silenciosamente" para um número inventado;
 *  - o passo do slider é respeitado no arredondamento, então o link recebido
 *    produz exatamente um estado alcançável pela interface.
 */
import { PARAMS_PADRAO } from "@/data/constantes";
import type { ParamsModelo } from "@/data/tipos";

export interface FaixaSlider {
  min: number;
  max: number;
  passo: number;
  /** casas decimais para exibição e para a URL */
  casas: number;
}

/** Faixas dos 4 sliders — idênticas às do protótipo. */
export const FAIXAS = {
  meiaVida: { min: 7, max: 45, passo: 1, casas: 0 },
  sigmaSys: { min: 0, max: 6, passo: 0.5, casas: 1 },
  coefDeriva: { min: 0.1, max: 0.7, passo: 0.05, casas: 2 },
  vies: { min: -3, max: 10, passo: 0.1, casas: 1 },
} as const satisfies Record<keyof ParamsModelo, FaixaSlider>;

/** Chave curta de cada parâmetro na query string. */
export const CHAVE_URL = {
  vies: "vies",
  sigmaSys: "sys",
  meiaVida: "meia",
  coefDeriva: "deriva",
} as const satisfies Record<keyof ParamsModelo, string>;

const CAMPOS = ["vies", "sigmaSys", "meiaVida", "coefDeriva"] as const;

/** Remove ruído de ponto flutuante mantendo a granularidade do slider. */
export function normalizar(valor: number, faixa: FaixaSlider): number {
  return Number(valor.toFixed(faixa.casas + 1));
}

/** Query string dos parâmetros fora do padrão (vazia quando tudo é padrão). */
export function paramsParaQuery(params: ParamsModelo): string {
  const q = new URLSearchParams();
  for (const campo of CAMPOS) {
    const valor = normalizar(params[campo], FAIXAS[campo]);
    if (valor === PARAMS_PADRAO[campo]) continue;
    q.set(CHAVE_URL[campo], String(valor));
  }
  const s = q.toString();
  return s ? `?${s}` : "";
}

/** Lê os parâmetros de uma query string, descartando valores inválidos. */
export function paramsDaQuery(busca: URLSearchParams): ParamsModelo {
  const saida: ParamsModelo = { ...PARAMS_PADRAO };
  for (const campo of CAMPOS) {
    const bruto = busca.get(CHAVE_URL[campo]);
    if (bruto === null || bruto.trim() === "") continue;
    const n = Number(bruto.replace(",", "."));
    if (!Number.isFinite(n)) continue;
    const faixa = FAIXAS[campo];
    if (n < faixa.min || n > faixa.max) continue;
    saida[campo] = normalizar(n, faixa);
  }
  return saida;
}

/** `true` quando os parâmetros são exatamente os padrão. */
export function ehPadrao(params: ParamsModelo): boolean {
  return CAMPOS.every((c) => params[c] === PARAMS_PADRAO[c]);
}
