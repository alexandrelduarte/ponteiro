import { expect, manchete, painelPronto, test } from "./base";

test.describe("painel", () => {
  test("carrega com a manchete e o disclaimer visíveis", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { name: /PRESIDENTE/ })).toBeVisible();
    await expect(page.getByTestId("manchete-lula")).toHaveText(/^\d{1,3}%$/);
    await expect(page.getByTestId("manchete-flavio")).toHaveText(/^\d{1,3}%$/);
    await expect(page.getByTestId("disclaimer")).toBeVisible();
    await expect(page.getByTestId("veredito-titulo")).toBeVisible();
    await expect(page.getByTestId("selo-frescor")).toBeVisible();
    // Fora de simulação a faixa de aviso não existe.
    await expect(page.getByTestId("faixa-simulacao")).toHaveCount(0);
  });

  test("a manchete vem pronta no HTML do servidor (sem JavaScript)", async ({ browser }) => {
    const contexto = await browser.newContext({ javaScriptEnabled: false });
    const pagina = await contexto.newPage();
    await pagina.goto("/");
    await expect(pagina.getByTestId("manchete-lula")).toHaveText(/^\d{1,3}%$/);
    await contexto.close();
  });

  test("alterna o turno do gráfico de evolução", async ({ page }) => {
    await page.goto("/");
    await painelPronto(page);

    const primeiro = page.getByTestId("turno-grafico-1");
    const segundo = page.getByTestId("turno-grafico-2");
    await expect(segundo).toHaveAttribute("aria-pressed", "true");

    await primeiro.click();
    await expect(primeiro).toHaveAttribute("aria-pressed", "true");
    await expect(segundo).toHaveAttribute("aria-pressed", "false");
    await expect(page.getByText(/a série é mais curta/)).toBeVisible();
  });

  test("cartão de cenário +3,1 muda o painel inteiro", async ({ page }) => {
    await page.goto("/");
    await painelPronto(page);
    const antes = await manchete(page);

    const cartao = page.getByTestId("cenario-vies-3-1");
    await cartao.scrollIntoViewIfNeeded();
    await cartao.click();

    await expect(cartao).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByTestId("manchete-lula")).not.toHaveText(antes);
    await expect(page.getByTestId("aviso-vies")).toBeVisible();
    await expect(page.getByTestId("faixa-simulacao")).toBeVisible();

    // O link compartilhável reflete o cenário.
    await expect(page).toHaveURL(/vies=3\.1/);
  });

  test("slider de viés muda o número-manchete", async ({ page }) => {
    await page.goto("/");
    await painelPronto(page);
    const antes = await manchete(page);

    const slider = page.getByTestId("slider-vies");
    await slider.scrollIntoViewIfNeeded();
    await slider.fill("8");

    await expect(page.getByTestId("manchete-lula")).not.toHaveText(antes);
    await expect(page.getByTestId("restaurar-parametros")).toBeEnabled();

    await page.getByTestId("restaurar-parametros").click();
    await expect(page.getByTestId("manchete-lula")).toHaveText(antes);
  });

  test("URL com ?vies=6.3 abre com o cenário aplicado", async ({ page }) => {
    await page.goto("/");
    await painelPronto(page);
    const oficial = await manchete(page);

    await page.goto("/?vies=6.3");
    await expect(page.getByTestId("aviso-vies")).toBeVisible();
    await expect(page.getByTestId("aviso-vies")).toContainText("6,3");
    await expect(page.getByTestId("manchete-lula")).not.toHaveText(oficial);
    await expect(page.getByTestId("faixa-simulacao")).toBeVisible();
    await expect(page.getByTestId("cenario-vies-6-3")).toHaveAttribute("aria-pressed", "true");
  });

  test("simulação: adicionar pesquisa muda o número e restaurar volta ao oficial", async ({
    page,
  }) => {
    await page.goto("/");
    await painelPronto(page);
    const oficial = await manchete(page);

    await page.getByTestId("abrir-form-simulacao").scrollIntoViewIfNeeded();
    await page.getByTestId("abrir-form-simulacao").click();

    await page.getByTestId("campo-instituto").fill("Instituto de Teste");
    await page.getByTestId("campo-fim").fill("2026-08-01");
    await page.getByTestId("campo-l2").fill("38");
    await page.getByTestId("campo-f2").fill("52");
    await page.getByTestId("campo-n").fill("3000");
    await page.getByTestId("incluir-simulacao").click();

    await expect(page.getByTestId("manchete-lula")).not.toHaveText(oficial);
    await expect(page.getByTestId("faixa-simulacao")).toBeVisible();
    await expect(page.getByTestId("faixa-simulacao")).toContainText("não altera a base oficial");
    await expect(page.getByText("(usuário)").first()).toBeVisible();

    await page.getByTestId("restaurar-serie").click();
    await expect(page.getByTestId("manchete-lula")).toHaveText(oficial);
    await expect(page.getByTestId("faixa-simulacao")).toHaveCount(0);
  });

  test("validação do formulário de simulação recusa entrada inválida", async ({ page }) => {
    await page.goto("/");
    await painelPronto(page);
    const oficial = await manchete(page);

    await page.getByTestId("abrir-form-simulacao").scrollIntoViewIfNeeded();
    await page.getByTestId("abrir-form-simulacao").click();
    await page.getByTestId("campo-instituto").fill("X");
    await page.getByTestId("campo-l2").fill("abc");
    await page.getByTestId("incluir-simulacao").click();

    await expect(page.getByTestId("erros-form")).toBeVisible();
    await expect(page.getByTestId("manchete-lula")).toHaveText(oficial);
  });

  test("aba «todos os candidatos» mostra o ranking do 1º turno", async ({ page }) => {
    await page.goto("/");
    await painelPronto(page);

    await page.getByTestId("aba-todos").click();
    await expect(page.getByTestId("aba-todos")).toHaveAttribute("aria-selected", "true");
    await expect(page.getByRole("tabpanel")).toContainText("disputa principal");
  });

  test("em 390px a série vira cartões e a página não rola na horizontal", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await painelPronto(page);

    await expect(page.getByTestId("disclaimer")).toBeVisible();
    await expect(page.getByRole("list", { name: "Série de pesquisas" })).toBeVisible();

    const rolagem = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(rolagem).toBeLessThanOrEqual(1);
  });
});
