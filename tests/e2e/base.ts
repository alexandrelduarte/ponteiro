import { test as base, expect, type Page } from "@playwright/test";

/**
 * Fixture com asserção de console limpo: qualquer `console.error`,
 * `console.warn` ou exceção não tratada reprova o teste. Aviso no console é
 * bug em produção — mismatch de hidratação aparece exatamente assim.
 */
export const test = base.extend<{ consoleLimpo: void }>({
  consoleLimpo: [
    async ({ page }, use) => {
      const problemas: string[] = [];

      page.on("console", (msg) => {
        const tipo = msg.type();
        if (tipo === "error" || tipo === "warning") {
          problemas.push(`[console.${tipo}] ${msg.text()}`);
        }
      });
      page.on("pageerror", (erro) => {
        problemas.push(`[pageerror] ${erro.message}`);
      });

      await use();

      expect(problemas, `console sujo:\n${problemas.join("\n")}`).toEqual([]);
    },
    { auto: true },
  ],
});

export { expect };

/**
 * O número da manchete: em quantas de 100 eleições parecidas Lula é eleito.
 * A v2 publica FREQUÊNCIA, não percentual solto — por isso é só o inteiro.
 */
export async function manchete(page: Page): Promise<string> {
  return (await page.getByTestId("manchete-lula").innerText()).trim();
}

/** Espera o painel estar interativo (hidratado) antes de clicar em algo. */
export async function painelPronto(page: Page): Promise<void> {
  await expect(page.getByTestId("manchete-lula")).toBeVisible();
  // O botão de voltar as réguas ao padrão só reage depois da hidratação.
  await expect(page.getByTestId("restaurar-parametros")).toBeDisabled();
}

/** Larguras auditadas: o viewport onde o conceito nasce, md e lg. */
export const LARGURAS = [390, 768, 1440] as const;

/** Rolagem horizontal da PÁGINA — tem de ser zero em toda largura. */
export async function sobraHorizontal(page: Page): Promise<number> {
  return page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
}
