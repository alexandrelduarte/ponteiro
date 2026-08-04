import { expect, test } from "./base";

test.describe("páginas de apoio", () => {
  test("/historico carrega com o estado vazio bem escrito", async ({ page }) => {
    await page.goto("/historico");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("O que já mudou");
    await expect(page.getByText(/Toda pesquisa que entrou ou saiu/)).toBeVisible();
    // Sem banco configurado, as duas seções mostram estado vazio — não erro.
    await expect(page.getByText(/Nenhuma mudança registrada/)).toBeVisible();
  });

  test("/metodologia troca entre explicação simples e técnica", async ({ page }) => {
    await page.goto("/metodologia");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("De onde vêm os números");

    const simples = page.getByTestId("modo-simples");
    const tecnica = page.getByTestId("modo-tecnica");
    await expect(simples).toHaveAttribute("aria-checked", "true");

    // Modo simples: a abertura em linguagem comum aparece; o jargão não.
    await expect(page.getByText(/mais nova e com mais gente ouvida pesa mais/)).toBeVisible();
    await expect(page.getByText(/decaimento exponencial/)).toBeHidden();

    await tecnica.click();
    await expect(tecnica).toHaveAttribute("aria-checked", "true");
    // Modo técnico: o texto original, palavra por palavra.
    await expect(page.getByText(/decaimento exponencial/)).toBeVisible();

    await expect(
      page.getByRole("heading", { name: /pesquisas que alimentam o painel/ }),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: /AtlasIntel/ }).first()).toBeVisible();
  });

  test("/admin sem sessão mostra o estado sem configuração", async ({ page }) => {
    await page.goto("/admin");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Administração");
    await expect(page.getByRole("status")).toContainText(
      /admin indisponível sem configuração|link de acesso/,
    );
  });

  test("robots e sitemap respondem", async ({ request }) => {
    const robots = await request.get("/robots.txt");
    expect(robots.status()).toBe(200);
    expect(await robots.text()).toContain("Sitemap");

    const sitemap = await request.get("/sitemap.xml");
    expect(sitemap.status()).toBe(200);
    expect(await sitemap.text()).toContain("/metodologia");
  });

  test("a imagem de compartilhamento é gerada", async ({ request }) => {
    const og = await request.get("/opengraph-image");
    expect(og.status()).toBe(200);
    expect(og.headers()["content-type"]).toContain("image/png");
  });

  test("navegação leva às outras páginas, do cabeçalho e do rodapé", async ({ page }) => {
    await page.goto("/");
    // O cabeçalho ganhou saída visível na primeira dobra (era só wordmark).
    const noCabecalho = page
      .getByRole("banner")
      .getByRole("link", { name: "Metodologia", exact: true });
    await expect(noCabecalho).toBeVisible();
    await noCabecalho.click();
    await expect(page).toHaveURL(/\/metodologia$/);
    await page.getByRole("link", { name: /voltar ao painel/ }).click();
    await expect(page).toHaveURL(/\/$/);

    await page
      .getByRole("contentinfo")
      .getByRole("link", { name: "Metodologia", exact: true })
      .click();
    await expect(page).toHaveURL(/\/metodologia$/);
  });

  test("o link da fórmula abre a metodologia já na explicação técnica", async ({ page }) => {
    await page.goto("/metodologia#explicacao-tecnica");
    await expect(page.getByTestId("modo-tecnica")).toHaveAttribute("aria-checked", "true");
    await expect(page.getByText(/decaimento exponencial/)).toBeVisible();
  });

  test("a marca leva de volta ao painel", async ({ page }) => {
    await page.goto("/metodologia");
    await page
      .getByRole("link", { name: /PONTEIRO/ })
      .first()
      .click();
    await expect(page).toHaveURL(/\/$/);
  });

  /**
   * O aviso legal é UMA FONTE SÓ por página. Ele vinha em dois textos
   * empilhados no mesmo rodapé — "Antes de sair, três coisas" e o "Aviso:" —
   * com 40 palavras verbatim em comum, nas três páginas públicas.
   */
  test("o aviso do rodapé não se repete na mesma tela", async ({ page }) => {
    const FRASES = [
      "uma vez a cada cinco disputas parecidas",
      "A lista só cresce",
      "sem vínculo com candidatos",
    ];
    for (const rota of ["/", "/historico", "/metodologia"]) {
      await page.goto(rota);
      const texto = (await page.getByRole("contentinfo").innerText()).replace(/\s+/g, " ");
      for (const frase of FRASES) {
        const vezes = texto.split(frase).length - 1;
        expect(vezes, `"${frase}" aparece ${vezes}× no rodapé de ${rota}`).toBeLessThanOrEqual(1);
      }
    }
  });

  /** §5.7: /metodologia é prosa em coluna de leitura, ZERO cartão decorativo. */
  test("/metodologia não tem cartão decorativo e respeita a medida de leitura", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/metodologia");

    const placas = await page.locator("main .rounded-bloco").count();
    expect(placas, "a /metodologia voltou a empilhar placas").toBe(0);

    const larguras = await page.evaluate(() =>
      [...document.querySelectorAll("main p, main h1, main h2")]
        .map((el) => Math.round(el.getBoundingClientRect().width))
        .filter((w) => w > 0),
    );
    // 512px é `--container-texto`; a folga cobre o arredondamento do zoom.
    expect(Math.max(...larguras)).toBeLessThanOrEqual(520);
  });

  test("o símbolo da marca aparece uma vez por tela", async ({ page }) => {
    for (const rota of ["/", "/historico", "/metodologia"]) {
      await page.goto(rota);
      // O símbolo é o único SVG com este viewBox; MARCA.md §6.6.10.
      const simbolos = page.locator('svg[viewBox="0 0 200 220.49"]');
      expect(await simbolos.count(), `símbolo repetido em ${rota}`).toBe(1);
    }
  });
});
