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
    // A navegação virou barra sticky IRMÃ do banner (branding 2026): landmark
    // próprio, com as TRÊS rotas — inclusive a volta visível ao Painel.
    const noCabecalho = page
      .getByRole("navigation", { name: "Páginas do site" })
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
  test("/metodologia usa as placas do sistema e respeita a medida de leitura", async ({ page }) => {
    // O desenho de coluna única sem placa (§5.7 original) foi REVOGADO pelo
    // dono na recomposição desktop das páginas institucionais (DECISOES.md):
    // as placas voltaram — na MESMA gramática do painel e do /historico — e a
    // prosa vive em duas colunas de leitura DENTRO delas.
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/metodologia");

    const placas = await page.locator("main .rounded-bloco").count();
    expect(placas, "a /metodologia perdeu a casca de placas do sistema").toBeGreaterThanOrEqual(2);

    // A medida de leitura continua valendo para a PROSA (títulos podem ocupar
    // a coluna do cabeçalho, 34rem): nenhum parágrafo passa de ~58ch.
    const larguras = await page.evaluate(() =>
      [...document.querySelectorAll("main p")]
        .map((el) => Math.round(el.getBoundingClientRect().width))
        .filter((w) => w > 0),
    );
    expect(Math.max(...larguras)).toBeLessThanOrEqual(520);
  });

  test("no máximo UM símbolo da marca visível por tela (handoff do bastão)", async ({ page }) => {
    // O símbolo existe 2× no DOM (cabeçalho de marca + barra sticky), mas
    // §6.6.10 vale para o que se VÊ: no topo só o do cabeçalho; rolado, o do
    // cabeçalho sai de cena e o da barra assume (decisão do dono, DECISOES.md).
    const visiveis = (page: import("@playwright/test").Page) =>
      page.locator('svg[viewBox="548 228 1240 1416"]').evaluateAll(
        (els) =>
          els.filter((el) => {
            const r = el.getBoundingClientRect();
            const dentro = r.bottom > 0 && r.top < window.innerHeight;
            let no: Element | null = el;
            while (no instanceof Element) {
              if (Number(getComputedStyle(no).opacity) === 0) return false;
              no = no.parentElement;
            }
            return dentro;
          }).length,
      );
    for (const rota of ["/", "/historico", "/metodologia"]) {
      await page.goto(rota);
      expect(await visiveis(page), `no topo de ${rota}`).toBe(1);
      await page.evaluate(() => window.scrollTo(0, 1200));
      await page.waitForTimeout(250);
      expect(await visiveis(page), `rolado em ${rota}`).toBe(1);
    }
  });
});
