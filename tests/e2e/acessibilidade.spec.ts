import AxeBuilder from "@axe-core/playwright";
import type { Page } from "@playwright/test";
import { expect, test } from "./base";

const TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

async function violacoes(page: Page) {
  const r = await new AxeBuilder({ page }).withTags(TAGS).analyze();
  return r.violations.map((v) => `${v.id} (${v.nodes.length}): ${v.help}`);
}

test.describe("acessibilidade (axe-core)", () => {
  for (const rota of ["/", "/historico", "/metodologia", "/admin"]) {
    test(`sem violações WCAG AA em ${rota}`, async ({ page }) => {
      await page.goto(rota);
      const encontradas = await violacoes(page);
      expect(encontradas, encontradas.join("\n")).toEqual([]);
    });
  }

  test("sem violações com o painel em simulação", async ({ page }) => {
    await page.goto("/?vies=6.3");
    // A faixa só aparece depois da hidratação + leitura da URL.
    await expect(page.getByTestId("faixa-simulacao")).toBeVisible();
    await page.getByTestId("aba-todos").click();
    await page.getByTestId("abrir-form-simulacao").scrollIntoViewIfNeeded();
    await page.getByTestId("abrir-form-simulacao").click();

    const encontradas = await violacoes(page);
    expect(encontradas, encontradas.join("\n")).toEqual([]);
  });
});
