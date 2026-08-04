import { LARGURAS, expect, sobraHorizontal, test } from "./base";

/**
 * A página nunca rola na horizontal — em nenhuma das quatro superfícies e em
 * nenhuma das três larguras auditadas. 390px não é breakpoint: é o viewport
 * onde o conceito nasce e o piso de todo cálculo.
 */
test.describe("nenhuma rolagem horizontal", () => {
  for (const rota of ["/", "/historico", "/metodologia", "/admin"]) {
    for (const largura of LARGURAS) {
      test(`${rota} a ${largura}px`, async ({ page }) => {
        await page.setViewportSize({ width: largura, height: 900 });
        await page.goto(rota);
        await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
        expect(await sobraHorizontal(page)).toBeLessThanOrEqual(1);
      });
    }
  }
});
