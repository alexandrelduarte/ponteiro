/**
 * Fase 4 — gera os derivados raster da marca a partir das fontes vetoriais.
 *
 *   node scripts/marca/gerar.mjs
 *
 * Entradas (versionadas, editáveis à mão):
 *   public/brand/simbolo.svg          símbolo isolado
 *   public/brand/logo-horizontal.svg  travamento horizontal
 *   src/app/icon.svg                  ícone do app (variante ótica pequena)
 *
 * Saídas:
 *   public/brand/simbolo{,-512,-128}.png   símbolo em raster, fundo transparente
 *   public/brand/og-base.png               cartão OG 1200×630 (base da Fase 6)
 *   src/app/apple-icon.png                 180px, quadrado cheio (o iOS mascara)
 *   src/app/favicon.ico                    16 + 32 + 48, PNG dentro do ICO
 *
 * Rasterização pelo Chromium do Playwright: é o mesmo motor que desenha o
 * ícone na aba, então o que se vê aqui é o que o navegador mostra.
 * A Lexend do cartão OG é baixada do Google Fonts NESTE script; o PNG final é
 * estático e o site não faz nenhuma requisição a terceiros em runtime.
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { chromium } from "@playwright/test";
import { otimizar, otimizarCorPlana } from "./png.mjs";

const RAIZ = process.cwd();
const BRAND = join(RAIZ, "public", "brand");
const APP = join(RAIZ, "src", "app");
mkdirSync(BRAND, { recursive: true });

const AMEIXA = "#5a3a66";
const BRUMA = "#efecf1";
const TINTA_MEDIA = "#5c5566";
const FILETE = "#d8d1dd";

const svgSimbolo = readFileSync(join(BRAND, "simbolo.svg"), "utf8");
const svgLogoH = readFileSync(join(BRAND, "logo-horizontal.svg"), "utf8");
const svgIcone = readFileSync(join(APP, "icon.svg"), "utf8");

/** Proporção da marca: largura ÷ altura, lida do viewBox do símbolo. */
function proporcao(svg) {
  const [, , w, h] = svg
    .match(/viewBox="([^"]+)"/)[1]
    .split(/\s+/)
    .map(Number);
  return w / h;
}

const navegador = await chromium.launch();
const contexto = await navegador.newContext({ deviceScaleFactor: 1 });

/** Rasteriza um documento HTML de tamanho exato, com fundo transparente. */
async function capturar(html, largura, altura, { transparente = true } = {}) {
  const pagina = await contexto.newPage();
  await pagina.setViewportSize({ width: largura, height: altura });
  await pagina.setContent(
    `<!doctype html><meta charset="utf-8"><style>
      *{margin:0;padding:0;box-sizing:border-box}
      html,body{width:${largura}px;height:${altura}px;overflow:hidden;background:${transparente ? "transparent" : BRUMA}}
    </style>${html}`,
    { waitUntil: "load" },
  );
  await pagina.evaluate(() => document.fonts.ready);
  const png = await pagina.screenshot({ omitBackground: transparente });
  await pagina.close();
  return otimizar(png);
}

/** Símbolo centrado num quadrado transparente, ocupando 88% da altura. */
async function simboloQuadrado(lado) {
  const alt = Math.round(lado * 0.88);
  const larg = Math.round(alt * proporcao(svgSimbolo));
  const html = `<div style="display:flex;align-items:center;justify-content:center;width:${lado}px;height:${lado}px">
    <img src="data:image/svg+xml;base64,${Buffer.from(svgSimbolo).toString("base64")}" width="${larg}" height="${alt}">
  </div>`;
  return otimizarCorPlana(await capturar(html, lado, lado), [0x5a, 0x3a, 0x66]);
}

/** Quadrado cheio de ameixa com o ícone dentro (apple-touch-icon). */
async function icone(lado, { margem = 0, fundo = null } = {}) {
  const html = `<div style="width:${lado}px;height:${lado}px;background:${fundo ?? "transparent"};display:flex;align-items:center;justify-content:center">
    <img src="data:image/svg+xml;base64,${Buffer.from(svgIcone).toString("base64")}" width="${lado - 2 * margem}" height="${lado - 2 * margem}">
  </div>`;
  return capturar(html, lado, lado, { transparente: !fundo });
}

/** Empacota PNGs num container ICO (o formato aceita PNG desde o Vista). */
function empacotarIco(imagens) {
  const cab = Buffer.alloc(6 + 16 * imagens.length);
  cab.writeUInt16LE(0, 0);
  cab.writeUInt16LE(1, 2);
  cab.writeUInt16LE(imagens.length, 4);
  let deslocamento = cab.length;
  imagens.forEach(({ lado, png }, i) => {
    const p = 6 + 16 * i;
    cab.writeUInt8(lado >= 256 ? 0 : lado, p);
    cab.writeUInt8(lado >= 256 ? 0 : lado, p + 1);
    cab.writeUInt8(0, p + 2);
    cab.writeUInt8(0, p + 3);
    cab.writeUInt16LE(1, p + 4);
    cab.writeUInt16LE(32, p + 6);
    cab.writeUInt32LE(png.length, p + 8);
    cab.writeUInt32LE(deslocamento, p + 12);
    deslocamento += png.length;
  });
  return Buffer.concat([cab, ...imagens.map((i) => i.png)]);
}

/** Baixa a Lexend (woff2, latino) do Google Fonts — só em tempo de geração. */
async function lexend() {
  const css = await fetch(
    "https://fonts.googleapis.com/css2?family=Lexend:wght@400;500&display=swap",
    {
      headers: {
        "user-agent": "Mozilla/5.0 (Macintosh) AppleWebKit/537.36 Chrome/140 Safari/537.36",
      },
    },
  ).then((r) => r.text());
  const blocos = [...css.matchAll(/@font-face\s*{[^}]+}/g)].map((m) => m[0]);
  const latinos = blocos.filter((b) => /U\+0000-00FF/.test(b));
  const faces = [];
  for (const bloco of latinos) {
    const peso = bloco.match(/font-weight:\s*(\d+)/)[1];
    const url = bloco.match(/url\((https:[^)]+\.woff2)\)/)[1];
    const dados = Buffer.from(await fetch(url).then((r) => r.arrayBuffer())).toString("base64");
    faces.push(
      `@font-face{font-family:Lexend;font-style:normal;font-weight:${peso};src:url(data:font/woff2;base64,${dados}) format("woff2")}`,
    );
  }
  if (!faces.length) throw new Error("Google Fonts não devolveu nenhuma face latina da Lexend");
  return faces.join("");
}

/** Cartão OG 1200×630: barra de marca, logo, tagline e linha de procedência. */
async function ogBase() {
  const fontes = await lexend();
  const html = `<style>${fontes}
    .cartao{width:1200px;height:630px;background:${BRUMA};font-family:Lexend,sans-serif;
      display:flex;flex-direction:column;padding:0 72px 56px}
    .barra{position:absolute;inset:0 0 auto 0;height:12px;background:${AMEIXA}}
    .topo{padding-top:84px}
    .logo{display:block;height:96px;width:auto}
    .tagline{margin-top:44px;font-size:44px;font-weight:400;line-height:1.15;color:${AMEIXA};
      letter-spacing:-0.01em}
    .rodape{margin-top:auto;padding-top:28px;border-top:2px solid ${FILETE};
      font-size:25px;font-weight:400;line-height:1.35;color:${TINTA_MEDIA}}
  </style>
  <div class="cartao"><div class="barra"></div>
    <div class="topo"><img class="logo" src="data:image/svg+xml;base64,${Buffer.from(svgLogoH).toString("base64")}"></div>
    <p class="tagline">Para onde apontam as pesquisas.</p>
    <p class="rodape">Agregador de pesquisas presidenciais 2026 · Lula × Flávio Bolsonaro<br>Só pesquisas com registro no TSE. Não é previsão.</p>
  </div>`;
  return capturar(html, 1200, 630, { transparente: false });
}

const saidas = [];
function gravar(caminho, buffer) {
  writeFileSync(caminho, buffer);
  saidas.push([caminho.replace(RAIZ + "/", ""), buffer.length]);
}

gravar(join(BRAND, "simbolo.png"), await simboloQuadrado(2160));
gravar(join(BRAND, "simbolo-512.png"), await simboloQuadrado(512));
gravar(join(BRAND, "simbolo-128.png"), await simboloQuadrado(128));
gravar(join(APP, "apple-icon.png"), await icone(180, { margem: 18, fundo: AMEIXA }));
gravar(
  join(APP, "favicon.ico"),
  empacotarIco(
    await Promise.all([16, 32, 48].map(async (lado) => ({ lado, png: await icone(lado) }))),
  ),
);
gravar(join(BRAND, "og-base.png"), await ogBase());

await contexto.close();
await navegador.close();

for (const [nome, bytes] of saidas) {
  console.log(nome.padEnd(34), (bytes / 1024).toFixed(1).padStart(7) + " KB");
}
