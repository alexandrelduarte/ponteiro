import { defineConfig, devices } from "@playwright/test";

/**
 * Smoke de produção: roda contra `next build && next start`, nunca contra o dev
 * server — o que se quer verificar é o artefato que vai para o ar (HTML
 * estático com os números-manchete já dentro, gráficos carregados depois).
 */
const PORTA = 3100;
const BASE = `http://127.0.0.1:${PORTA}`;

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"]],
  timeout: 60_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL: BASE,
    locale: "pt-BR",
    timezoneId: "America/Sao_Paulo",
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 900 } },
    },
  ],
  webServer: {
    command: `pnpm build && pnpm exec next start -p ${PORTA}`,
    url: BASE,
    reuseExistingServer: !process.env.CI,
    timeout: 300_000,
    stdout: "pipe",
    stderr: "pipe",
  },
});
