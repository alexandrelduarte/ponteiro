import { LARGURAS, expect, painelPronto, sobraHorizontal, test } from "./base";

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

/**
 * Rolagem horizontal DENTRO de um wrapper também é gesto obrigatório: a 768 a
 * tabela da série cortava o registro no TSE no meio da string ("BR- / 07845/")
 * e a matriz de candidatos rolava de lado a 390. Nem uma coisa nem outra.
 */
test.describe("nenhum conteúdo escondido atrás de rolagem lateral", () => {
  for (const largura of [390, 768] as const) {
    test(`a home a ${largura}px não esconde nada de lado`, async ({ page }) => {
      await page.setViewportSize({ width: largura, height: 900 });
      await page.goto("/");
      await painelPronto(page);
      await page.getByTestId("aba-todos").scrollIntoViewIfNeeded();
      await page.getByTestId("aba-todos").click();

      const estourando = await page.evaluate(() =>
        [...document.querySelectorAll<HTMLElement>("*")]
          .filter((el) => {
            const estilo = getComputedStyle(el);
            const rola = /(auto|scroll)/.test(estilo.overflowX);
            return rola && el.scrollWidth - el.clientWidth > 1;
          })
          .map((el) => `${el.tagName}.${el.className}`.slice(0, 90)),
      );
      expect(estourando, estourando.join("\n")).toEqual([]);
    });
  }

  test("o registro no TSE está inteiro e visível a 768", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 900 });
    await page.goto("/");
    await painelPronto(page);

    const registro = page.getByText(/Registro no TSE BR-\d{5}\/2026/).first();
    await registro.scrollIntoViewIfNeeded();
    const caixa = (await registro.boundingBox())!;
    expect(caixa.x).toBeGreaterThanOrEqual(0);
    expect(caixa.x + caixa.width).toBeLessThanOrEqual(768);
  });
});

/**
 * O elemento-assinatura tem de escalar junto com o contêiner nas DUAS
 * instâncias: a 1440 o mini-enxame ficava travado em 8px contra 20px do hero.
 */
test.describe("o enxame escala em todas as larguras", () => {
  for (const [largura, piso] of [
    [390, 8],
    [1440, 12],
  ] as const) {
    test(`bolinha do mini-enxame ≥ ${piso}px a ${largura}px`, async ({ page }) => {
      await page.setViewportSize({ width: largura, height: 900 });
      await page.goto("/");
      await painelPronto(page);

      const mini = page.getByTestId("enxame-simulacao");
      await mini.scrollIntoViewIfNeeded();
      const diametro = await mini
        .locator("circle")
        .first()
        .evaluate((c) => c.getBoundingClientRect().width);
      expect(diametro).toBeGreaterThanOrEqual(piso);
    });
  }
});
