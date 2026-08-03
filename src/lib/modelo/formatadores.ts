/**
 * Formatadores portados VERBATIM do protótipo `agregador-presidencial-2026.jsx`.
 *
 * Fazem parte da paridade numérica: as strings do veredito do modelo são montadas
 * com `fmt`/`fmtSinal`, então qualquer mudança aqui muda a saída de `rodarModelo`.
 * Não "arredonde melhor", não troque os traços: "–" é EN DASH (U+2013) e o sinal
 * negativo de `fmtSinal` é MINUS SIGN (U+2212), não hífen.
 */

/** Número com vírgula decimal e `d` casas; `null`/`NaN` viram "–" (U+2013). */
export const fmt = (v: number | null | undefined, d = 1): string =>
  v == null || isNaN(v) ? "–" : Number(v).toFixed(d).replace(".", ",");

/**
 * Número com sinal explícito ("+" ou "−" U+2212).
 * Quirks preservados do protótipo (a comparação é feita sem coerção de tipo):
 * `fmtSinal(null)` → "+0,0" (`null >= 0` é `true` e `Math.abs(null)` é 0) e
 * `fmtSinal(NaN)` → "−–" (`NaN >= 0` é `false`).
 */
export const fmtSinal = (v: number | null | undefined, d = 1): string =>
  ((v as number) >= 0 ? "+" : "−") + fmt(Math.abs(v as number), d);

/** "AAAA-MM-DD" → "DD/MM"; vazio/nulo → "–". */
export const fmtData = (iso: string | null | undefined): string => {
  if (!iso) return "–";
  const [, m, d] = iso.split("-");
  return `${d}/${m}`;
};

/** Probabilidade 0–1 → percentual inteiro ("47%"); `null` → "–". */
export const pct = (p: number | null | undefined): string =>
  p == null ? "–" : Math.round(p * 100) + "%";
