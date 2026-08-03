/**
 * Textos e formatos que precisam ser IDÊNTICOS em mais de um lugar da interface.
 *
 * Nada aqui entra no modelo: `src/lib/modelo` tem paridade byte a byte com o
 * protótipo e não pode mudar. Isto é camada de apresentação.
 */

/**
 * Definição operacional de «empate técnico» (docs/DESIGN.md P7).
 * Carrega sentido: sai da mesma string na /metodologia e no resumo do painel.
 */
export const DEF_EMPATE_TECNICO = "«empate técnico» = diferença ≤ 2× a margem de erro";

/**
 * Percentual com PISO para prosa: um painel cuja tese é que nada está fechado
 * não imprime zero absoluto. `pct()` (paridade com o protótipo) continua
 * arredondando para inteiro — este piso é só de apresentação e vale apenas nas
 * frases; os números-manchete da urna seguem em `pct()`.
 *
 *   0 < p < 0,5%  → "<1%"      (improbabilidade não é impossibilidade)
 *   99,5% < p < 1 → ">99%"     (espelho, R4)
 */
export function pctComPiso(p: number | null | undefined): string {
  if (p == null || !isFinite(p)) return "–";
  if (p > 0 && p < 0.005) return "<1%";
  if (p < 1 && p > 0.995) return ">99%";
  return Math.round(p * 100) + "%";
}
