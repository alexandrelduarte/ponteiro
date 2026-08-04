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

  test("navegação do rodapé leva às outras páginas", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Metodologia", exact: true }).click();
    await expect(page).toHaveURL(/\/metodologia$/);
    await page.getByRole("link", { name: /voltar ao painel/ }).click();
    await expect(page).toHaveURL(/\/$/);
  });

  test("a marca leva de volta ao painel", async ({ page }) => {
    await page.goto("/metodologia");
    await page
      .getByRole("link", { name: /PONTEIRO/ })
      .first()
      .click();
    await expect(page).toHaveURL(/\/$/);
  });
});
