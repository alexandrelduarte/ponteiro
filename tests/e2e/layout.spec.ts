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

  /**
   * E o hero é SEMPRE o maior. A correção do mini a 1440 tinha invertido a
   * hierarquia: o hero dividia a placa com a micro-legenda e ficava em 16px
   * contra 20px do enxame de "Isso ainda pode virar?" — 25% menor no lugar
   * onde ele assina a página. Ele também não pode ENCOLHER quando o viewport
   * cresce (era 18px a 768 e 16px a 1440).
   */
  const diametro = async (page: import("@playwright/test").Page, id: string) => {
    const alvo = page.getByTestId(id);
    await alvo.scrollIntoViewIfNeeded();
    return alvo
      .locator("circle")
      .first()
      .evaluate((c) => c.getBoundingClientRect().width);
  };

  for (const largura of [768, 1440] as const) {
    test(`o hero é a maior instância do enxame a ${largura}px`, async ({ page }) => {
      await page.setViewportSize({ width: largura, height: 900 });
      await page.goto("/");
      await painelPronto(page);

      const hero = await diametro(page, "enxame");
      const virada = await diametro(page, "enxame-virada");
      const mini = await diametro(page, "enxame-simulacao");

      expect(hero, `hero ${hero} < virada ${virada}`).toBeGreaterThan(virada);
      expect(virada, `virada ${virada} < mini ${mini}`).toBeGreaterThan(mini);
    });
  }

  test("a bolinha do hero cresce com o viewport, nunca encolhe", async ({ page }) => {
    const medidas: number[] = [];
    for (const largura of [390, 768, 1440] as const) {
      await page.setViewportSize({ width: largura, height: 900 });
      await page.goto("/");
      await painelPronto(page);
      medidas.push(await diametro(page, "enxame"));
    }
    expect(medidas[1], `390→768: ${medidas.join(" → ")}`).toBeGreaterThan(medidas[0]);
    expect(medidas[2], `768→1440: ${medidas.join(" → ")}`).toBeGreaterThan(medidas[1]);
  });
});

/**
 * Rótulo de régua tem de cair EM CIMA da marca que nomeia. Os dois casos
 * medidos como mentirosos na iteração 2 viram invariante aqui.
 */
test.describe("os rótulos das réguas caem sobre a marca", () => {
  for (const largura of LARGURAS) {
    test(`"25%" fica sobre a marca da metade a ${largura}px`, async ({ page }) => {
      await page.setViewportSize({ width: largura, height: 900 });
      await page.goto("/");
      await painelPronto(page);
      await page.getByTestId("aba-todos").scrollIntoViewIfNeeded();
      await page.getByTestId("aba-todos").click();
      await page.getByTestId("lista-candidatos").scrollIntoViewIfNeeded();

      const desvio = await page.evaluate(() => {
        const lista = document.querySelector('[data-testid="lista-candidatos"]')!;
        const regua = lista.previousElementSibling!;
        const rotulo = [...regua.querySelectorAll("span")]
          .find((s) => s.textContent?.trim() === "25%")!
          .getBoundingClientRect();
        const trilho = document.querySelector('[data-testid="barra-candidato-0"]')!.parentElement!;
        const marca = trilho.querySelector("span")!.getBoundingClientRect();
        return Math.abs(rotulo.left + rotulo.width / 2 - (marca.left + marca.width / 2));
      });
      expect(desvio).toBeLessThanOrEqual(2);
    });
  }

  test('o "empate" da régua cai sobre a régua de tinta de cada coluna a 768', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 900 });
    await page.goto("/");
    await painelPronto(page);
    await page.getByRole("list", { name: "Pesquisas da série" }).scrollIntoViewIfNeeded();

    const { rotulos, tinta } = await page.evaluate(() => {
      const centro = (r: DOMRect) => +(r.left + r.width / 2).toFixed(1);
      const reguas = [...document.querySelectorAll("p")].filter(
        (p) =>
          p.textContent?.includes("empate") &&
          p.textContent.includes("Flávio na frente") &&
          p.getBoundingClientRect().width > 0,
      );
      const rotulos = reguas.map((p) =>
        centro(
          [...p.querySelectorAll("span")]
            .find((s) => s.textContent?.trim() === "empate")!
            .getBoundingClientRect(),
        ),
      );
      const tinta = [...document.querySelectorAll('[aria-label="Pesquisas da série"] > li')].map(
        (li) => centro([...li.querySelectorAll('[role="img"] > span')][1].getBoundingClientRect()),
      );
      return { rotulos, tinta };
    });

    // Duas colunas ⇒ duas réguas, e cada barra encontra a sua a menos de 2px.
    expect(rotulos.length).toBe(2);
    for (const x of tinta) {
      const perto = Math.min(...rotulos.map((r) => Math.abs(r - x)));
      expect(perto, `barra em ${x} contra réguas ${rotulos.join(", ")}`).toBeLessThanOrEqual(2);
    }
  });
});
