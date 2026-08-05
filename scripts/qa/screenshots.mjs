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

/** Âncoras da home (títulos-pergunta da v2): rola até o texto e captura a janela. */
const ANCORAS = [
  { nome: "hero", texto: "Em 100 eleições parecidas" },
  { nome: "frente", texto: "Quem está na frente?" },
  { nome: "virar", texto: "Isso ainda pode virar?" },
  { nome: "evolucao", texto: "Como a diferença mudou com o tempo?" },
  { nome: "pesquisas", texto: "pesquisas?" },
  { nome: "erro2022", texto: "errarem como em 2022?" },
  { nome: "simulacao", texto: "Quer mexer nos números você mesmo?" },
  { nome: "cenario-base", texto: "mais provável acontecer em outubro?" },
];

// A porta PRECISA estar livre: um `next start` zumbi de execução anterior
// responde 200 com BUILD VELHO e a captura fotografa o produto errado.
try {
  await fetch(BASE);
  console.error(`porta 3100 já ocupada — mate o servidor antigo (lsof -ti :3100 | xargs kill).`);
  process.exit(1);
} catch {
  /* livre — é o que queremos */
}

// sobe o servidor de produção
const servidor = spawn("pnpm", ["exec", "next", "start", "-p", "3100"], {
  stdio: "pipe",
  detached: false,
});

/** Falhas de captura: evidência ausente NUNCA pode parecer evidência limpa
    (condição 2 do qa-critic, iter-7) — o processo termina com código ≠ 0. */
let falhasDeCaptura = 0;
const falhou = (mensagem) => {
  falhasDeCaptura++;
  console.warn(`FALHA DE CAPTURA: ${mensagem}`);
};

/** Abre os disclosures de CONTEÚDO da página (details e reveladores de bloco).
    Popovers/folhas de glossário ficam de fora (veredito da iter-8): 29 cliques
    num tique é estado inalcançável por humano — escondeu um MAJOR real por seis
    iterações e depois fabricou um defeito que não existe. O estado de popover é
    auditado pelos prints DIRIGIDOS (chip-chance/chip-tse/chip-pior/popover). */
const abrirTudo = async (page) => {
  await page.evaluate(async () => {
    const passo = window.innerHeight * 0.8;
    for (let y = 0; y < document.body.scrollHeight; y += passo) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 100));
    }
    document.querySelectorAll("details").forEach((d) => {
      d.open = true;
    });
    document
      .querySelectorAll('[aria-expanded="false"]:not([aria-label^="o que é"])')
      .forEach((el) => el.click());
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(800);
};
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
  // --lang define a locale da UI do navegador — é ela (não `locale` do contexto)
  // que os controles nativos como <input type="date"> seguem para a máscara.
  const browser = await chromium.launch({ args: ["--lang=pt-BR"] });
  for (const vp of VIEWPORTS) {
    const page = await browser.newPage({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 1,
      locale: "pt-BR",
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
        .catch(() => falhou(`gráficos não pintaram em ${pg.nome}-${vp.nome}`));
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
            falhou(`âncora não encontrada: ${a.nome} em ${vp.nome}px`);
          }
        }
        // aba "Todos os candidatos" (contrastes das 9 cores; §5.5 do DESIGN)
        try {
          await page.evaluate(() => window.scrollTo(0, 0));
          await page.getByRole("tab", { name: /Candidatos testados/ }).click();
          await page.waitForTimeout(600);
          await page.screenshot({
            path: join(DIR, `home-${vp.nome}-candidatos.png`),
            fullPage: true,
          });
        } catch {
          falhou(`aba candidatos não capturada em ${vp.nome}px`);
        }
        // home com TODOS os disclosures abertos (o conteúdo escondido também é auditado)
        await page.goto(BASE + "/", { waitUntil: "networkidle" });
        await abrirTudo(page);
        await page.screenshot({
          path: join(DIR, `home-${vp.nome}-full-aberto.png`),
          fullPage: true,
        });
        // UM popover aberto por gesto real (o estado que um humano alcança):
        // o primeiro chip de glossário da página, clicado de verdade.
        try {
          // `load` + espera fixa: depois do abrirTudo, networkidle nunca chega
          // (alguma atividade de rede fica sem os 500ms de silêncio) e o goto
          // estourava 30s — era a origem dos flakes da iter-7/8.
          await page.goto(BASE + "/", { waitUntil: "load" });
          await page.waitForTimeout(700);
          const chip = page.locator('[aria-expanded="false"]').first();
          await chip.scrollIntoViewIfNeeded();
          await chip.click();
          await page.waitForTimeout(500);
          await page.screenshot({ path: join(DIR, `home-${vp.nome}-popover.png`) });
        } catch (e) {
          falhou(`popover não capturado em ${vp.nome}px — ${String(e).split("\n")[0]}`);
        }
        // Evidência DIRIGIDA dos chips nomeados (condição 3 do qa-critic, iter-7):
        // chance (colado à manchete/LCP) e registro no TSE nos 3 viewports; a 768
        // também o pior caso do clamp (votos válidos, deslocamento −117px).
        const chipsDirigidos = [
          { nome: "chip-chance", localizar: () => page.getByTestId("chip-glossario-chance") },
          {
            nome: "chip-tse",
            localizar: () => page.getByRole("button", { name: /registro no TSE/i }).first(),
          },
          ...(vp.nome === "768"
            ? [
                {
                  nome: "chip-pior",
                  localizar: () => page.getByRole("button", { name: /votos válidos/i }).first(),
                },
              ]
            : []),
        ];
        for (const c of chipsDirigidos) {
          try {
            await page.goto(BASE + "/", { waitUntil: "load" });
            await page.waitForTimeout(700);
            const alvo = c.localizar();
            await alvo.scrollIntoViewIfNeeded();
            await alvo.click();
            await page.waitForTimeout(500);
            await page.screenshot({ path: join(DIR, `home-${vp.nome}-${c.nome}.png`) });
          } catch (e) {
            falhou(`${c.nome} não capturado em ${vp.nome}px — ${String(e).split("\n")[0]}`);
          }
        }
      }
      if (pg.nome === "metodologia") {
        // o estado "Explicação técnica" fotografado nos três viewports
        try {
          await page.getByTestId("modo-tecnica").click();
          await page.waitForTimeout(500);
          await page.screenshot({
            path: join(DIR, `metodologia-${vp.nome}-tecnica.png`),
            fullPage: true,
          });
        } catch {
          falhou(`estado técnica não capturado em ${vp.nome}px`);
        }
        // /metodologia e /historico também com disclosures abertos
        await page.goto(BASE + "/metodologia", { waitUntil: "networkidle" });
        await abrirTudo(page);
        await page.screenshot({
          path: join(DIR, `metodologia-${vp.nome}-full-aberto.png`),
          fullPage: true,
        });
      }
      if (pg.nome === "historico") {
        await abrirTudo(page);
        await page.screenshot({
          path: join(DIR, `historico-${vp.nome}-full-aberto.png`),
          fullPage: true,
        });
      }
    }
    await page.close();
  }
  await browser.close();
  if (falhasDeCaptura > 0) {
    console.error(`${falhasDeCaptura} captura(s) faltando — a evidência NÃO está completa.`);
    process.exitCode = 1;
  } else {
    console.log(`ok: screenshots em .qa/iter-${ITER}/`);
  }
} finally {
  servidor.kill("SIGTERM");
}
