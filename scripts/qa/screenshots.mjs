/**
 * Fase 6 — captura de screenshots para o loop de qualidade visual.
 * Uso: node scripts/qa/screenshots.mjs <N>   (salva em .qa/iter-N/)
 * Pré-requisito: `pnpm build` já executado. O script sobe `next start` na porta 3100.
 */
import { spawn } from "node:child_process";
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { chromium } from "@playwright/test";

const ITER = process.argv[2] ?? "1";
const BASE = `http://localhost:3100`;
const DIR = join(process.cwd(), ".qa", `iter-${ITER}`);
mkdirSync(DIR, { recursive: true });

const VIEWPORTS = [
  { nome: "390", width: 390, height: 844 },
  { nome: "768", width: 768, height: 1024 },
  { nome: "1440", width: 1440, height: 900 },
];

const PAGINAS = [
  { nome: "home", caminho: "/" },
  { nome: "historico", caminho: "/historico" },
  { nome: "metodologia", caminho: "/metodologia" },
];

/** Âncoras da home: rola até o texto e captura a janela (o que o usuário vê). */
const ANCORAS = [
  { nome: "urna", texto: "CHANCE DE SER ELEITO" },
  { nome: "graficos", texto: "Evolução" },
  { nome: "sensibilidade", texto: "sensibilidade" },
  { nome: "replay", texto: "Replay 2022" },
  { nome: "tabela", texto: "Série de pesquisas" },
  { nome: "parametros", texto: "Parâmetros do modelo" },
];

// sobe o servidor de produção
const servidor = spawn("pnpm", ["exec", "next", "start", "-p", "3100"], {
  stdio: "pipe",
  detached: false,
});
const esperarServidor = async () => {
  for (let i = 0; i < 60; i++) {
    try {
      const r = await fetch(BASE);
      if (r.ok) return;
    } catch {
      /* ainda subindo */
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error("next start não respondeu em 30s");
};

try {
  await esperarServidor();
  const browser = await chromium.launch();
  for (const vp of VIEWPORTS) {
    const page = await browser.newPage({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 1,
    });
    for (const pg of PAGINAS) {
      await page.goto(BASE + pg.caminho, { waitUntil: "networkidle" });
      // espera os gráficos hidratarem (skeletons saem)
      await page.waitForTimeout(1200);
      await page.screenshot({
        path: join(DIR, `${pg.nome}-${vp.nome}-full.png`),
        fullPage: true,
      });
      if (pg.nome === "home") {
        for (const a of ANCORAS) {
          const alvo = page.getByText(a.texto, { exact: false }).first();
          try {
            await alvo.scrollIntoViewIfNeeded();
            await page.waitForTimeout(250);
            await page.screenshot({ path: join(DIR, `home-${vp.nome}-${a.nome}.png`) });
          } catch {
            console.warn(`âncora não encontrada: ${a.nome} em ${vp.nome}px`);
          }
        }
      }
    }
    await page.close();
  }
  await browser.close();
  console.log(`ok: screenshots em .qa/iter-${ITER}/`);
} finally {
  servidor.kill("SIGTERM");
}
