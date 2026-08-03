import { expect, test } from "./base";

test.describe("páginas de apoio", () => {
  test("/historico carrega com o estado vazio bem escrito", async ({ page }) => {
    await page.goto("/historico");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("HISTÓRICO");
    await expect(page.getByText(/rastreabilidade/)).toBeVisible();
    // Sem banco configurado, as duas seções mostram estado vazio — não erro.
    await expect(
      page.getByText(/Nenhuma alteração registrada|Linha do tempo/).first(),
    ).toBeVisible();
  });

  test("/metodologia carrega com as fontes da série", async ({ page }) => {
    await page.goto("/metodologia");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("METODOLOGIA");
    await expect(page.getByRole("heading", { name: /Fontes da série/ })).toBeVisible();
    await expect(page.getByRole("link", { name: /AtlasIntel/ }).first()).toBeVisible();
  });

  test("/admin sem sessão mostra o estado sem configuração", async ({ page }) => {
    await page.goto("/admin");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("ADMINISTRAÇÃO");
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
});
