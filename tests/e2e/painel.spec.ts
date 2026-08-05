import { expect, manchete, painelPronto, test } from "./base";

test.describe("painel", () => {
  test("carrega com a manchete, o enxame e o disclaimer visíveis", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { level: 1 })).toContainText("Presidente 2026");
    // A manchete publica FREQUÊNCIA (um inteiro), não percentual solto.
    await expect(page.getByTestId("manchete-lula")).toHaveText(/^\d{1,3}$/);
    await expect(page.getByTestId("manchete-flavio")).toHaveText(/^\d{1,3}$/);

    // O elemento-assinatura: 100 bolinhas, prontas, sem esperar gráfico nenhum.
    const enxame = page.getByTestId("enxame");
    await expect(enxame).toBeVisible();
    expect(await enxame.locator("circle").count()).toBe(100);

    await expect(page.getByTestId("disclaimer")).toContainText("Isto não é previsão");
    await expect(page.getByTestId("veredito-titulo")).toBeVisible();
    await expect(page.getByTestId("selo-frescor")).toBeVisible();
    // Fora de simulação a faixa de modo de teste não existe.
    await expect(page.getByTestId("faixa-simulacao")).toHaveCount(0);
  });

  test("a manchete e o enxame vêm prontos do servidor (sem JavaScript)", async ({ browser }) => {
    const contexto = await browser.newContext({ javaScriptEnabled: false });
    const pagina = await contexto.newPage();
    await pagina.goto("/");
    await expect(pagina.getByTestId("manchete-lula")).toHaveText(/^\d{1,3}$/);
    await expect(pagina.getByTestId("disclaimer")).toBeVisible();
    expect(await pagina.getByTestId("enxame").locator("circle").count()).toBe(100);
    await contexto.close();
  });

  test("a faixa 'como ler esta página' abre e fecha", async ({ page }) => {
    await page.goto("/");
    await painelPronto(page);

    const alternar = page.getByTestId("como-ler-alternar");
    await expect(alternar).toHaveAttribute("aria-expanded", "false");
    await expect(page.getByTestId("como-ler-conteudo")).toHaveCount(0);

    await alternar.click();
    await expect(alternar).toHaveAttribute("aria-expanded", "true");
    await expect(page.getByTestId("como-ler-conteudo")).toBeVisible();

    await alternar.click();
    await expect(alternar).toHaveAttribute("aria-expanded", "false");
    await expect(page.getByTestId("como-ler-conteudo")).toHaveCount(0);
  });

  test("o chip de glossário abre e fecha só com o teclado", async ({ page }) => {
    await page.goto("/");
    await painelPronto(page);

    const chip = page.getByTestId("chip-glossario-chance");
    await chip.focus();
    await expect(chip).toHaveAttribute("aria-expanded", "false");

    await page.keyboard.press("Enter");
    await expect(chip).toHaveAttribute("aria-expanded", "true");
    const folha = page.getByRole("dialog", { name: "chance" });
    await expect(folha).toBeVisible();
    await expect(folha).toContainText("100 situações parecidas");

    await page.keyboard.press("Escape");
    await expect(chip).toHaveAttribute("aria-expanded", "false");
    await expect(page.getByRole("dialog", { name: "chance" })).toHaveCount(0);
    // O foco volta para quem abriu.
    await expect(chip).toBeFocused();
  });

  test("alterna o turno do gráfico de evolução", async ({ page }) => {
    await page.goto("/");
    await painelPronto(page);

    const primeiro = page.getByTestId("turno-grafico-1");
    const segundo = page.getByTestId("turno-grafico-2");
    await expect(segundo).toHaveAttribute("aria-selected", "true");

    await primeiro.click();
    await expect(primeiro).toHaveAttribute("aria-selected", "true");
    await expect(segundo).toHaveAttribute("aria-selected", "false");
    await expect(page.getByText(/No 1º turno a linha é mais curta/)).toBeVisible();
  });

  test("cartão de cenário 3,1 muda o painel inteiro", async ({ page }) => {
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

  test("a régua da puxada muda o número-manchete", async ({ page }) => {
    await page.goto("/");
    await painelPronto(page);
    const antes = await manchete(page);

    const regua = page.getByTestId("slider-vies");
    await regua.scrollIntoViewIfNeeded();
    await regua.fill("8");

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
    await expect(page.getByTestId("faixa-simulacao")).toContainText("não muda os dados oficiais");
    await expect(page.getByText("você adicionou nesta simulação").first()).toBeVisible();

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

  test("a aba «candidatos testados» mostra o ranking do 1º turno", async ({ page }) => {
    await page.goto("/");
    await painelPronto(page);

    await page.getByTestId("aba-todos").scrollIntoViewIfNeeded();
    await page.getByTestId("aba-todos").click();
    await expect(page.getByTestId("aba-todos")).toHaveAttribute("aria-selected", "true");
    await expect(page.getByRole("tabpanel", { name: /Candidatos testados/ })).toContainText(
      "disputa principal",
    );
  });

  test("em 390px a série vira cartões", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await painelPronto(page);

    await expect(page.getByTestId("disclaimer")).toBeVisible();
    await expect(page.getByRole("list", { name: "Pesquisas da série" })).toBeVisible();
  });

  /* ------------------------------------------------------------------ *
   * Fase 7 — o que a crítica da iteração 1 reprovou                      *
   * ------------------------------------------------------------------ */

  test("o cartão da simulação só diz «simulação» quando há simulação", async ({ page }) => {
    await page.goto("/");
    await painelPronto(page);

    // Estado padrão: réguas no padrão E série oficial → é o número OFICIAL.
    const oficial = page.getByTestId("resultado-oficial");
    await expect(oficial).toBeVisible();
    await expect(oficial).toContainText("Com as réguas no padrão");
    await expect(page.getByTestId("resultado-simulacao")).toHaveCount(0);

    // Mexer numa régua troca a chave, e o oficial vem junto na mesma frase.
    const regua = page.getByTestId("slider-vies");
    await regua.scrollIntoViewIfNeeded();
    await regua.fill("6");
    const simulado = page.getByTestId("resultado-simulacao");
    await expect(simulado).toContainText("Nesta simulação");
    await expect(simulado).toContainText("No painel oficial são");

    await page.getByTestId("restaurar-parametros").click();
    await expect(page.getByTestId("resultado-oficial")).toBeVisible();
  });

  test("a condição do rótulo é dupla: mexer só na lista já é simulação", async ({ page }) => {
    await page.goto("/");
    await painelPronto(page);

    await page.getByTestId("abrir-form-simulacao").scrollIntoViewIfNeeded();
    await page.getByTestId("abrir-form-simulacao").click();
    await page.getByTestId("campo-instituto").fill("Instituto de Teste");
    await page.getByTestId("campo-fim").fill("2026-08-01");
    await page.getByTestId("campo-l2").fill("38");
    await page.getByTestId("campo-f2").fill("52");
    await page.getByTestId("campo-n").fill("3000");
    await page.getByTestId("incluir-simulacao").click();

    // Réguas intocadas, série alterada → ainda é simulação (H7).
    await expect(page.getByTestId("restaurar-parametros")).toBeDisabled();
    await expect(page.getByTestId("resultado-simulacao")).toContainText("Nesta simulação");
    await expect(page.getByTestId("resultado-oficial")).toHaveCount(0);
  });

  test("o escrito ao lado de cada desenho é o desenhado (H3)", async ({ page }) => {
    await page.goto("/");
    await painelPronto(page);

    // Hero: os rótulos ancorados, a legenda e a contagem de bolinhas batem.
    const enxame = page.getByTestId("enxame");
    const azuis = await enxame.locator('circle[fill="var(--color-flavio)"]').count();
    const vermelhas = await enxame.locator('circle[fill="var(--color-lula)"]').count();
    expect(azuis + vermelhas).toBe(100);
    await expect(page.getByTestId("enxame-n-lula")).toHaveText(String(vermelhas));
    await expect(page.getByTestId("enxame-n-flavio")).toHaveText(String(azuis));
    await expect(page.getByTestId("legenda-enxame")).toContainText(
      `${vermelhas} do lado de Lula, ${azuis} do lado de Flávio`,
    );

    // Mini-enxame da simulação: a legenda usa o número do próprio desenho.
    const mini = page.getByTestId("enxame-simulacao");
    await mini.scrollIntoViewIfNeeded();
    const miniLula = await mini.locator('circle[fill="var(--color-lula)"]').count();
    const miniFlavio = await mini.locator('circle[fill="var(--color-flavio)"]').count();
    await expect(page.getByTestId("legenda-mini-enxame")).toContainText(
      `${miniLula} caem do lado de Lula e ${miniFlavio} do lado de Flávio`,
    );
  });

  test("a primeira dobra a 390 carrega dúvida", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");

    const DUVIDA = [
      "ainda pode mudar",
      "não é previsão",
      "não é certeza",
      "não é garantia",
      "pode mudar",
    ];
    const naDobra = await page.evaluate((termos) => {
      const achados: string[] = [];
      const it = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      let no: Node | null;
      while ((no = it.nextNode())) {
        const texto = (no.textContent ?? "").toLowerCase();
        if (!termos.some((t) => texto.includes(t))) continue;
        const alcance = document.createRange();
        alcance.selectNodeContents(no);
        const caixa = alcance.getBoundingClientRect();
        if (caixa.height > 0 && caixa.bottom <= 844) achados.push(texto.trim().slice(0, 60));
      }
      return achados;
    }, DUVIDA);

    expect(naDobra.length, "nenhuma palavra de dúvida dentro dos 844px").toBeGreaterThan(0);
  });

  /* ------------------------------------------------------------------ *
   * Fase 7 — o que a crítica da iteração 2 reprovou                      *
   * ------------------------------------------------------------------ */

  test("«isto não é previsão» cabe inteiro na dobra de 390, não só as ascendentes", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");

    // §5.1 lista os seis elementos do primeiro scroll "sem exceção"; este
    // começava em y=839 de 844 e a dobra o cortava pela primeira linha.
    const linhas = await page.getByTestId("disclaimer").evaluate((el) => {
      const alcance = document.createRange();
      alcance.selectNodeContents(el);
      return [...alcance.getClientRects()].map((r) => Math.round(r.bottom));
    });
    const dentro = linhas.filter((b) => b <= 844);
    expect(dentro.length, `linhas do parágrafo: ${linhas.join(", ")}`).toBeGreaterThanOrEqual(2);
  });

  test("a ponte «folga da medida — a margem de erro» é impressa nas duas superfícies", async ({
    page,
  }) => {
    // Quem chega com "margem de erro" na cabeça — que é como a TV fala —
    // precisa encostar o termo em algum lugar VISÍVEL, não só no glossário.
    await page.goto("/");
    await painelPronto(page);
    await expect(page.getByText("folga da medida — a margem de erro").first()).toBeVisible();

    await page.goto("/metodologia");
    await expect(page.getByText("folga da medida — a margem de erro").first()).toBeVisible();
  });

  test("a legenda do mini-enxame ensina a ler a LARGURA da pilha", async ({ page }) => {
    await page.goto("/");
    await painelPronto(page);
    await expect(page.getByTestId("legenda-mini-enxame")).toContainText(
      "A largura da pilha é o tamanho da dúvida",
    );
  });

  /**
   * `:visible` porque a barra passou a existir em duas árvores desde a v2.1 —
   * no ranking (abaixo de lg) e na matriz (lg+), sempre com só uma visível. O
   * viewport padrão da suíte é 1280, então quem responde aqui é a da matriz.
   */
  test("as barras dos candidatos usam régua fixa, não o líder", async ({ page }) => {
    await page.goto("/");
    await painelPronto(page);
    await page.getByTestId("aba-todos").scrollIntoViewIfNeeded();
    await page.getByTestId("aba-todos").click();

    const primeira = page.locator('[data-testid="barra-candidato-0"]:visible');
    await primeira.scrollIntoViewIfNeeded();
    const trilho = primeira.locator("..");
    const larguraBarra = (await primeira.boundingBox())!.width;
    const larguraTrilho = (await trilho.boundingBox())!.width;
    // O líder tem ~41% de 50% da régua: nunca o trilho inteiro. Normalizada
    // pelo líder, esta razão era exatamente 1.
    expect(larguraBarra / larguraTrilho).toBeGreaterThan(0.5);
    expect(larguraBarra / larguraTrilho).toBeLessThan(0.95);
  });
});
