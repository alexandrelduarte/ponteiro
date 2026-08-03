/**
 * Fase 6 — Lighthouse mobile na home (gate automático do loop).
 * Exige: performance ≥ 90 · accessibility ≥ 95 · best-practices ≥ 95 · seo ≥ 95.
 * Uso: node scripts/qa/lighthouse.mjs <N>  (guarda o JSON em .qa/iter-N/lighthouse.json)
 * Pré-requisito: `pnpm build`. Sobe `next start` na porta 3102 e usa o Chromium do Playwright.
 */
import { spawn, execSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { chromium } from "@playwright/test";

const ITER = process.argv[2] ?? "1";
const BASE = "http://localhost:3102";
const DIR = join(process.cwd(), ".qa", `iter-${ITER}`);
mkdirSync(DIR, { recursive: true });
const SAIDA = join(DIR, "lighthouse.json");

const PISOS = {
  performance: 90,
  accessibility: 95,
  "best-practices": 95,
  seo: 95,
};

const servidor = spawn("pnpm", ["exec", "next", "start", "-p", "3102"], { stdio: "pipe" });
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

try {
  await esperar();
  // Lighthouse padrão = emulação mobile (Moto G Power + rede 4G lenta)
  execSync(
    `pnpm exec lighthouse ${BASE} --output=json --output-path=${JSON.stringify(SAIDA)} ` +
      `--chrome-flags="--headless=new" --quiet ` +
      `--only-categories=performance,accessibility,best-practices,seo`,
    { stdio: "inherit", env: { ...process.env, CHROME_PATH: chromium.executablePath() } },
  );
  const { default: relatorio } = await import(SAIDA, { with: { type: "json" } });
  let falhou = false;
  for (const [cat, piso] of Object.entries(PISOS)) {
    const nota = Math.round((relatorio.categories[cat]?.score ?? 0) * 100);
    const ok = nota >= piso;
    if (!ok) falhou = true;
    console.log(`${ok ? "✓" : "✗"} ${cat}: ${nota} (piso ${piso})`);
  }
  const metricas = relatorio.audits;
  console.log(
    `LCP ${metricas["largest-contentful-paint"]?.displayValue} · ` +
      `CLS ${metricas["cumulative-layout-shift"]?.displayValue} · ` +
      `TBT ${metricas["total-blocking-time"]?.displayValue}`,
  );
  if (falhou) process.exit(1);
} finally {
  servidor.kill("SIGTERM");
}
