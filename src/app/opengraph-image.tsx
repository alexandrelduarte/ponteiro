/**
 * Imagem de compartilhamento (1200×630), gerada a partir dos números reais do
 * modelo. Tipográfica: nenhuma foto de pessoa, partido ou bandeira (R4).
 *
 * NOTA SOBRE HEX LITERAL — este é o único arquivo do produto que escreve cor em
 * hexadecimal, e por necessidade: o `next/og` (Satori) renderiza fora do
 * navegador, sem CSS, sem Tailwind e sem `var(--color-*)`. Os valores abaixo são
 * cópia EXATA dos tokens de `src/app/tokens.css`; qualquer mudança lá precisa
 * ser espelhada aqui.
 *
 * As fontes são lidas de arquivos locais do repositório (`./_og/fontes`), então
 * não existe request externo em runtime.
 */
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { PARAMS_PADRAO } from "@/data/constantes";
import { getPesquisasPublicadas } from "@/lib/dados";
import { rodarModelo } from "@/lib/modelo";

export const runtime = "nodejs";
// Gerada UMA vez, no build: os .ttf são lidos do repositório durante o
// prerender e a imagem vira asset estático — nada de I/O em runtime.
export const dynamic = "force-static";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt =
  "Agregador Presidencial 2026: chance de eleição de Lula e de Flávio Bolsonaro " +
  "projetada para o dia da votação, segundo o agregado de pesquisas registradas no TSE.";

/** Espelho literal de tokens.css — ver nota no topo. */
const COR = {
  papel: "#E8E8DF",
  tinta: "#181C18",
  cinza: "#63685F",
  linha: "#C6C6B8",
  tela: "#0E241A",
  telaBorda: "#1E3A2C",
  telaFundo: "#0A1A12",
  fosforo: "#A7EFBB",
  fosforoForte: "#D8FBE2",
  lula: "#C4122F",
  flavio: "#16418C",
  confirmaTexto: "#155A34",
};

const PASTA_FONTES = join(process.cwd(), "src", "app", "_og", "fontes");

/**
 * `fetch(new URL(..., import.meta.url))` não funciona sob o Turbopack (fetch de
 * `file:` não é implementado), então lemos os arquivos do disco durante o
 * prerender. Com `dynamic = "force-static"` isso acontece só no build.
 */
async function carregarFontes() {
  const [archivo, mono] = await Promise.all([
    readFile(join(PASTA_FONTES, "Archivo-900.ttf")),
    readFile(join(PASTA_FONTES, "IBMPlexMono-600.ttf")),
  ]);
  return [
    { name: "Archivo", data: archivo, weight: 900 as const, style: "normal" as const },
    { name: "PlexMono", data: mono, weight: 600 as const, style: "normal" as const },
  ];
}

function ddmm(ms: number): string {
  const d = new Date(ms - 3 * 3600e3);
  return `${String(d.getUTCDate()).padStart(2, "0")}/${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

export default async function Imagem() {
  const fonts = await carregarFontes();
  const hojeMs = Date.now();

  let lula = 50;
  let ok = false;
  try {
    const pesquisas = await getPesquisasPublicadas();
    const m = rodarModelo(pesquisas, PARAMS_PADRAO, hojeMs);
    if (m) {
      lula = Math.round(m.eleito.dia.l * 100);
      ok = true;
    }
  } catch (erro) {
    console.error("[og] modelo indisponível, usando cartão estático:", erro);
  }
  const flavio = 100 - lula;

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: COR.papel,
        padding: 56,
        fontFamily: "Archivo",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div
          style={{
            fontFamily: "PlexMono",
            fontSize: 22,
            letterSpacing: 4,
            color: COR.confirmaTexto,
          }}
        >
          APURAÇÃO DE PESQUISAS · REGISTRO OBRIGATÓRIO NO TSE
        </div>
        <div style={{ display: "flex", fontSize: 74, color: COR.tinta, marginTop: 6 }}>
          <span>PRESIDENTE&nbsp;</span>
          <span style={{ color: COR.cinza }}>2026</span>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          background: COR.tela,
          border: `2px solid ${COR.telaBorda}`,
          borderRadius: 12,
          padding: 36,
        }}
      >
        <div
          style={{
            fontFamily: "PlexMono",
            fontSize: 22,
            letterSpacing: 4,
            color: COR.fosforo,
          }}
        >
          {ok ? "CHANCE DE SER ELEITO · LULA (esq.) × FLÁVIO (dir.)" : "LEITURA DOS DADOS"}
        </div>

        {ok ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginTop: 18,
            }}
          >
            <div
              style={{
                fontFamily: "PlexMono",
                fontSize: 108,
                color: COR.fosforoForte,
              }}
            >
              {`${lula}%`}
            </div>
            <div
              style={{
                display: "flex",
                flex: 1,
                height: 22,
                margin: "0 28px",
                borderRadius: 999,
                overflow: "hidden",
                background: COR.telaFundo,
              }}
            >
              <div style={{ width: `${lula}%`, background: COR.lula }} />
              <div style={{ width: `${flavio}%`, background: COR.flavio }} />
            </div>
            <div
              style={{
                fontFamily: "PlexMono",
                fontSize: 108,
                color: COR.fosforoForte,
              }}
            >
              {`${flavio}%`}
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", fontSize: 52, color: COR.fosforoForte, marginTop: 18 }}>
            Agregado de pesquisas · Lula × Flávio Bolsonaro
          </div>
        )}

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontFamily: "PlexMono",
            fontSize: 24,
            color: COR.fosforo,
            marginTop: 10,
          }}
        >
          <span>LULA (PT)</span>
          <span>FLÁVIO BOLSONARO (PL)</span>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontFamily: "PlexMono",
          fontSize: 24,
          color: COR.cinza,
          borderTop: `2px solid ${COR.linha}`,
          paddingTop: 18,
        }}
      >
        <span>projeção para o dia da votação · 25/10</span>
        <span>{`atualizado ${ddmm(hojeMs)} · NÃO É PREVISÃO`}</span>
      </div>
    </div>,
    { ...size, fonts },
  );
}
