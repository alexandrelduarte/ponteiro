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
      // Os gráficos só montam ao entrar no viewport (IntersectionObserver):
      // rola a página inteira em passos para disparar todos e volta ao topo.
      await page.evaluate(async () => {
        const passo = window.innerHeight * 0.8;
        for (let y = 0; y < document.body.scrollHeight; y += passo) {
          window.scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 120));
        }
        window.scrollTo(0, 0);
      });
      // espera TODOS os canvases do Recharts terem conteúdo desenhado
      await page
        .waitForFunction(
          () => {
            const superficies = document.querySelectorAll(".recharts-surface");
            if (!superficies.length) return true; // página sem gráfico
            return [...superficies].every((s) => s.querySelector("path"));
          },
          { timeout: 15000 },
        )
        .catch(() => console.warn(`gráficos não pintaram em ${pg.nome}-${vp.nome}`));
      await page.waitForTimeout(400);
      await page.screenshot({
        path: join(DIR, `${pg.nome}-${vp.nome}-full.png`),
        fullPage: true,
      });
      if (pg.nome === "home") {
        for (const a of ANCORAS) {
          const alvo = page.getByText(a.texto, { exact: false }).first();
          try {
            await alvo.scrollIntoViewIfNeeded();
            await page.waitForTimeout(350);
            await page.screenshot({ path: join(DIR, `home-${vp.nome}-${a.nome}.png`) });
          } catch {
            console.warn(`âncora não encontrada: ${a.nome} em ${vp.nome}px`);
          }
        }
        // aba "Todos os candidatos" (contrastes das 9 cores; §5.5 do DESIGN)
        try {
          await page.evaluate(() => window.scrollTo(0, 0));
          await page.getByRole("button", { name: /Todos os candidatos/ }).click();
          await page.waitForTimeout(400);
          const ranking = page.getByText("disputa principal", { exact: false }).first();
          await ranking.scrollIntoViewIfNeeded();
          await page.waitForTimeout(250);
          await page.screenshot({
            path: join(DIR, `home-${vp.nome}-candidatos.png`),
            fullPage: true,
          });
        } catch {
          console.warn(`aba candidatos não capturada em ${vp.nome}px`);
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
