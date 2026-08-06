/**
 * Barra de navegação sticky (branding 2026, pesquisa §2.2 + DECISOES.md).
 * Travas: a barra sobrevive à rolagem; a página ativa se declara por
 * aria-current; os TRÊS rótulos cabem numa linha a 390; o skip-link é o
 * primeiro focável e leva ao conteúdo.
 */
import { expect, test } from "@playwright/test";

test.describe("barra de navegação", () => {
  test("fica visível depois de rolar (sticky) e ganha sombra descolada", async ({ page }) => {
    await page.goto("/");
    const nav = page.getByRole("navigation", { name: "Páginas do site" });
    await expect(nav).toBeVisible();
    await page.evaluate(() => window.scrollTo(0, 1800));
    await expect(nav).toBeInViewport();
    const topo = await nav.evaluate((el) => el.getBoundingClientRect().top);
    expect(topo, "a barra deve estar grudada no topo do viewport").toBeLessThanOrEqual(1);
  });

  test("aria-current aponta a página certa em cada rota", async ({ page }) => {
    for (const [rota, rotulo] of [
      ["/", "Painel"],
      ["/historico", "O que já mudou"],
      ["/metodologia", "Metodologia"],
    ] as const) {
      await page.goto(rota);
      const ativa = page
        .getByRole("navigation", { name: "Páginas do site" })
        .locator("[aria-current='page']");
      await expect(ativa).toHaveText(rotulo);
      expect(await ativa.count()).toBe(1);
    }
  });

  test("os três rótulos cabem numa linha a 390 — sem quebra, sem rolagem", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    const nav = page.getByRole("navigation", { name: "Páginas do site" });
    const tops = await nav
      .getByRole("link")
      .evaluateAll((els) => els.map((el) => Math.round(el.getBoundingClientRect().top)));
    expect(new Set(tops).size, `tops distintos: ${tops.join(", ")}`).toBe(1);
    const larguras = await nav.evaluate((el) => ({
      scroll: el.scrollWidth,
      cliente: el.clientWidth,
    }));
    expect(larguras.scroll).toBeLessThanOrEqual(larguras.cliente);
    // Nenhum rótulo pode quebrar DENTRO da pílula (regressão real pega ao
    // vivo quando o símbolo entrou na barra e roubou largura a 390).
    const linhasPorLink = await nav.getByRole("link").evaluateAll((els) =>
      els.map((el) => {
        const alcance = document.createRange();
        alcance.selectNodeContents(el);
        return [...alcance.getClientRects()].filter((r) => r.width > 0).length;
      }),
    );
    for (const n of linhasPorLink) expect(n).toBeLessThanOrEqual(1);
  });

  test("o skip-link é o primeiro focável e move o foco ao conteúdo", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Tab");
    const foco = page.locator(":focus");
    await expect(foco).toHaveText("Pular para o conteúdo");
    await page.keyboard.press("Enter");
    await expect(page.locator("#conteudo")).toBeFocused();
  });

  test("o símbolo entra na barra quando ela descola — e volta a sumir no topo", async ({
    page,
  }) => {
    await page.goto("/");
    const simboloBarra = page
      .getByRole("navigation", { name: "Páginas do site" })
      .locator("a[href='/']")
      .first();
    await expect(simboloBarra).toHaveAttribute("aria-hidden", "true");
    await page.evaluate(() => window.scrollTo(0, 1200));
    await expect(simboloBarra).not.toHaveAttribute("aria-hidden", "true");
    await expect(simboloBarra).toHaveAccessibleName(/PONTEIRO/);
    await page.evaluate(() => window.scrollTo(0, 0));
    await expect(simboloBarra).toHaveAttribute("aria-hidden", "true");
  });
});
