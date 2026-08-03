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

/** Número da manchete (chance de Lula projetada para o dia da votação). */
export async function manchete(page: Page): Promise<string> {
  return (await page.getByTestId("manchete-lula").innerText()).trim();
}

/** Espera o painel estar interativo (hidratado) antes de clicar em algo. */
export async function painelPronto(page: Page): Promise<void> {
  await expect(page.getByTestId("manchete-lula")).toBeVisible();
  // O botão de restaurar só reage depois da hidratação.
  await expect(page.getByTestId("restaurar-parametros")).toBeDisabled();
}
