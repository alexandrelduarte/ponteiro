/**
 * Fase 6 — varredura axe-core standalone (gate automático do loop).
 * Falha (exit 1) com qualquer violação serious/critical em qualquer página/viewport.
 * Pré-requisito: `pnpm build`. Sobe `next start` na porta 3101.
 */
import { spawn } from "node:child_process";
import { chromium } from "@playwright/test";
import { AxeBuilder } from "@axe-core/playwright";

const BASE = "http://localhost:3101";
const PAGINAS = [
  "/",
  "/historico",
  "/metodologia",
  "/admin",
  "/pesquisas",
  "/pesquisas/atlasintel-2026-07-27",
  "/quem-somos",
  "/privacidade",
];
const VIEWPORTS = [
  { width: 390, height: 844 },
  { width: 1440, height: 900 },
];

const servidor = spawn("pnpm", ["exec", "next", "start", "-p", "3101"], { stdio: "pipe" });
const esperar = async () => {
  for (let i = 0; i < 60; i++) {
    try {
      if ((await fetch(BASE)).ok) return;
    } catch {
      /* subindo */
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error("next start não respondeu");
};

let falhas = 0;
try {
  await esperar();
  const browser = await chromium.launch();
  for (const vp of VIEWPORTS) {
    const contexto = await browser.newContext({ viewport: vp });
    const page = await contexto.newPage();
    for (const caminho of PAGINAS) {
      await page.goto(BASE + caminho, { waitUntil: "networkidle" });
      await page.waitForTimeout(800);
      const resultado = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
        .analyze();
      const graves = resultado.violations.filter((v) =>
        ["serious", "critical"].includes(v.impact ?? ""),
      );
      for (const v of graves) {
        falhas++;
        console.error(
          `✗ ${caminho} @${vp.width}px — [${v.impact}] ${v.id}: ${v.help} (${v.nodes.length} nós)`,
        );
      }
      if (!graves.length) console.log(`✓ ${caminho} @${vp.width}px limpo`);
    }
    await contexto.close();
  }
  await browser.close();
} finally {
  servidor.kill("SIGTERM");
}
if (falhas > 0) {
  console.error(`\n${falhas} violação(ões) serious/critical`);
  process.exit(1);
}
console.log("\naxe: zero violações serious/critical");
