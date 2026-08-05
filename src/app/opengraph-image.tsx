/**
 * Cartão de compartilhamento (1200×630), composto sobre `public/brand/og-base.png`.
 *
 * O cartão base já traz a marca, a tagline, a moldura e a procedência, e foi
 * desenhado com ~170px de bruma livre no meio exatamente para esta fase
 * sobrepor o número-manchete sem redesenhar nada (MARCA.md §6.9, decisão 6).
 *
 * O número publicado é o MESMO da manchete da página: a chance de SER ELEITO
 * (`eleito.dia`), com os dois lados somando 100 e a ordem fixa Lula → Flávio.
 * Tipográfico: nenhuma foto de pessoa, partido ou bandeira (R4).
 *
 * NOTA SOBRE HEX LITERAL — este é o único arquivo do produto que escreve cor em
 * hexadecimal, e por necessidade: o `next/og` (Satori) renderiza fora do
 * navegador, sem CSS, sem Tailwind e sem `var(--color-*)`. Os valores abaixo são
 * cópia EXATA dos tokens de `src/app/tokens.css`; qualquer mudança lá precisa
 * ser espelhada aqui.
 */
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { PARAMS_PADRAO } from "@/data/constantes";
import { getPesquisasPublicadas } from "@/lib/dados";
import { rodarModelo } from "@/lib/modelo";

export const runtime = "nodejs";
// Gerada UMA vez, no build: os arquivos são lidos do repositório durante o
// prerender e a imagem vira asset estático — nada de I/O em runtime.
export const dynamic = "force-static";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt =
  "PONTEIRO: em 100 eleições parecidas com esta, em quantas Lula e Flávio Bolsonaro terminam " +
  "eleitos, segundo as pesquisas registradas no TSE. Não é previsão.";

/** Espelho literal de tokens.css — ver nota no topo. */
const COR = {
  tinta: "#211C26",
  tintaMedia: "#5C5566",
  lula: "#BE1745",
  flavio: "#26418B",
};

const PASTA_FONTES = join(process.cwd(), "src", "app", "_og", "fontes");
const BASE_OG = join(process.cwd(), "public", "brand", "og-base.png");

/**
 * `fetch(new URL(..., import.meta.url))` não funciona sob o Turbopack (fetch de
 * `file:` não é implementado), então lemos os arquivos do disco durante o
 * prerender. Com `dynamic = "force-static"` isso acontece só no build.
 */
async function carregarFontes() {
  const [serif, lexend, lexendForte] = await Promise.all([
    readFile(join(PASTA_FONTES, "Newsreader-400.ttf")),
    readFile(join(PASTA_FONTES, "Lexend-400.ttf")),
    readFile(join(PASTA_FONTES, "Lexend-600.ttf")),
  ]);
  return [
    { name: "Newsreader", data: serif, weight: 400 as const, style: "normal" as const },
    { name: "Lexend", data: lexend, weight: 400 as const, style: "normal" as const },
    { name: "Lexend", data: lexendForte, weight: 600 as const, style: "normal" as const },
  ];
}

export default async function Imagem() {
  const [fonts, base] = await Promise.all([carregarFontes(), readFile(BASE_OG)]);
  const fundo = `data:image/png;base64,${base.toString("base64")}`;

  let lula = 50;
  let ok = false;
  try {
    const pesquisas = await getPesquisasPublicadas();
    const m = rodarModelo(pesquisas, PARAMS_PADRAO, Date.now());
    if (m) {
      // Arredonda UM e complementa o outro: os dois somam 100 (H3).
      lula = Math.round(m.eleito.dia.l * 100);
      ok = true;
    }
  } catch (erro) {
    console.error("[og] modelo indisponível, usando o cartão base:", erro);
  }
  const flavio = 100 - lula;

  return new ImageResponse(
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        display: "flex",
        fontFamily: "Lexend",
      }}
    >
      {/* Satori não conhece next/image: aqui `img` é o elemento certo. */}
      <img src={fundo} alt="" width={1200} height={630} style={{ position: "absolute" }} />

      {ok ? (
        <div
          style={{
            position: "absolute",
            left: 72,
            right: 72,
            top: 296,
            height: 172,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <div style={{ display: "flex", fontSize: 28, color: COR.tintaMedia }}>
            Em 100 eleições parecidas com esta, cada um termina eleito em:
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              marginTop: 14,
              fontFamily: "Newsreader",
              fontSize: 84,
              color: COR.tinta,
            }}
          >
            <span style={{ color: COR.lula }}>Lula&nbsp;{lula}</span>
            <span style={{ color: COR.tintaMedia, margin: "0 24px", fontSize: 56 }}>×</span>
            <span style={{ color: COR.flavio }}>Flávio&nbsp;{flavio}</span>
          </div>
        </div>
      ) : null}
    </div>,
    { ...size, fonts },
  );
}
