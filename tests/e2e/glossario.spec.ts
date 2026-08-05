import { expect, test } from "./base";

/**
 * O gesto-assinatura do glossário (aprendizado da iter-8 do loop v2):
 * a definição aberta NUNCA pode fechar na mão de quem a lê. O defeito original
 * era um transform persistido no ancestral virando bloco contentor do painel —
 * o toque caía em elemento vizinho pintado por cima e `aoTocarFora` disparava.
 * O painel agora vive em portal no <body>; estes testes travam a regressão.
 */
test.describe("glossário — folha/popover", () => {
  test("tocar DENTRO da definição não a fecha; fora fecha; Esc devolve o foco", async ({
    page,
  }) => {
    await page.goto("/");
    const chip = page.getByTestId("chip-glossario-chance");
    await chip.click();

    const dialogo = page.getByRole("dialog");
    await expect(dialogo).toBeVisible();
    // portal: o painel é filho direto do body (nenhum ancestral pode prendê-lo)
    expect(await dialogo.evaluate((el) => el.parentElement?.tagName)).toBe("BODY");

    // toque no meio do conteúdo da definição → sobrevive
    const caixa = await dialogo.boundingBox();
    if (!caixa) throw new Error("dialogo sem caixa");
    await page.mouse.click(caixa.x + caixa.width / 2, caixa.y + Math.min(caixa.height / 2, 100));
    await expect(dialogo).toBeVisible();

    // toque fora → fecha
    await page.mouse.click(5, 5);
    await expect(dialogo).toBeHidden();

    // Esc fecha e devolve o foco ao chip
    await chip.click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toBeHidden();
    await expect(chip).toBeFocused();
  });

  test("a 768 o painel nunca estoura a página, mesmo no pior chip", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto("/");
    const pior = page.getByRole("button", { name: /votos válidos/i }).first();
    await pior.scrollIntoViewIfNeeded();
    await pior.click();
    await expect(page.getByRole("dialog")).toBeVisible();
    const larguras = await page.evaluate(() => ({
      sw: document.documentElement.scrollWidth,
      cw: document.documentElement.clientWidth,
    }));
    expect(larguras.sw).toBe(larguras.cw);
  });

  test("nome acessível do chip contém o rótulo visível (WCAG 2.5.3)", async ({ page }) => {
    await page.goto("/");
    // o caso que quebrava: chip visível "folga da medida" com aria de "margem de erro"
    const chips = page.locator('button[aria-expanded][aria-label^="o que é"]');
    const n = await chips.count();
    expect(n).toBeGreaterThan(0);
    for (let i = 0; i < n; i++) {
      const chip = chips.nth(i);
      const visivel = ((await chip.innerText()) ?? "").replace(/\s*\?\s*$/, "").trim();
      const aria = (await chip.getAttribute("aria-label")) ?? "";
      expect(aria.toLowerCase(), `chip "${visivel}"`).toContain(visivel.toLowerCase());
    }
  });
});
