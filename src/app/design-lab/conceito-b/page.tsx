import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";
import { fmt, fmtSinal } from "@/lib/modelo";
import { montarRetrato, type Retrato } from "../_lib/retrato";
import { FichaDoConceito, type Ficha } from "../_lib/ficha";
import { Figura, Rotulo } from "../_lib/svg";

/**
 * CONCEITO B — "ENXAME".
 *
 * Conversa: blocos arredondados e generosos, sem borda e sem filete, boiando
 * numa página tingida de ameixa; cada bloco abre com uma frase que CONCLUI e
 * só depois mostra o número. Marca em ameixa (família terceira, fria).
 * Elemento-assinatura: O ENXAME DE 100 (quantile dotplot sobre a diferença).
 *
 * Style tile: estilo inline/arbitrário é deliberado (laboratório).
 */

const PALETA: CSSProperties = {
  "--fundo": "#EFECF1",
  "--placa": "#FFFFFF",
  "--tinta": "#211C26",
  "--tinta2": "#5C5566",
  "--ident": "#5A3A66",
  "--vazio": "#E2D8E8",
  "--lula": "#BE1745",
  "--lula-tenue": "#F7DCE4",
  "--flavio": "#26418B",
  "--flavio-tenue": "#DDE3F2",
  "--atencao": "#8F5407",
  fontFamily: "var(--fonte-b-texto)",
} as CSSProperties;

const FICHA: Ficha = {
  nome: "B · ENXAME",
  frase:
    "Conversa: blocos arredondados e generosos, sem borda nem filete, boiando numa página tingida de ameixa — cada bloco abre com uma frase que conclui e só depois mostra o número.",
  assinatura:
    "O ENXAME DE 100 — cem bolinhas empilhadas sobre a régua da diferença; a pilha inteira É a incerteza (a forma vem antes da linha) e a coluna do zero se chama «empate».",
  motion:
    "As cem bolinhas caem e assentam na pilha em 300 ms, escalonadas por coluna, só com translateY e opacity — o gesto mostra que a nuvem é acumulada, não desenhada; some inteiro em prefers-reduced-motion.",
  tipografia: [
    ["Display", "Instrument Serif (400) — só em corpo grande"],
    ["Texto", "Lexend (400/500/600), desenhada para leitura"],
  ],
  cores: [
    ["ameixa · identidade", "#5A3A66", "9,41:1 na placa · 8,04:1 no fundo"],
    ["bruma-ameixa · fundo", "#EFECF1", "1,17:1 contra a placa"],
    ["placa · superfície", "#FFFFFF", "—"],
    ["tinta · texto", "#211C26", "16,68:1 na placa · 14,25:1 no fundo"],
    ["carmim · Lula", "#BE1745", "6,18:1 na placa · OKLCH L 0,518"],
    ["naval · Flávio", "#26418B", "9,50:1 na placa · OKLCH L 0,399"],
    ["âmbar-queimado · atenção", "#8F5407", "6,11:1 na placa (é tinta, não fundo)"],
  ],
  deltaL:
    "ΔL(OKLCH) entre os dois candidatos = 0,119 — e no enxame a informação nem depende de cor: quem está de que lado é POSIÇÃO em relação ao «empate».",
};

/* ------------------------------------------------------------------ *
 * O ENXAME DE 100 — o elemento-assinatura                             *
 * ------------------------------------------------------------------ */

const E = { W: 660, H: 230, ml: 10, mr: 10, base: 190, vMin: -11, vMax: 21 };

function Enxame({ r }: { r: Retrato }) {
  const larguraUtil = E.W - E.ml - E.mr;
  const px = (v: number) => E.ml + ((v - E.vMin) / (E.vMax - E.vMin)) * larguraUtil;
  const raio = (larguraUtil / (E.vMax - E.vMin)) * 0.42;
  const fx = (x: number) => x / E.W;
  const fy = (y: number) => y / E.H;
  const x0 = px(0);

  const bolinhas: ReactNode[] = [];
  for (const col of r.enxame) {
    for (let k = 0; k < col.n; k += 1) {
      bolinhas.push(
        <circle
          key={`${col.centro}-${k}`}
          cx={px(col.centro)}
          cy={E.base - raio - k * (2 * raio + 2.5)}
          r={raio}
          fill={col.flavio ? "var(--flavio)" : "var(--lula)"}
        />,
      );
    }
  }

  const marcas = [-10, -5, 0, 5, 10, 15, 20];

  return (
    <Figura>
      <svg
        viewBox={`0 0 ${E.W} ${E.H}`}
        role="img"
        aria-label={`Cem bolinhas, uma por cenário: ${r.flavioMargemEm100} caem do lado de Flávio e ${r.lulaMargemEm100} do lado de Lula.`}
        style={{ display: "block", width: "100%", height: "auto" }}
      >
        {bolinhas}
        <line
          x1={E.ml}
          y1={E.base + 6}
          x2={E.W - E.mr}
          y2={E.base + 6}
          stroke="var(--vazio)"
          strokeWidth={3}
        />
        <line x1={x0} y1={10} x2={x0} y2={E.base + 14} stroke="var(--tinta)" strokeWidth={3.5} />
      </svg>
      <Rotulo x={fx(x0 + 12)} y={fy(18)} cor="var(--tinta)" peso={700}>
        empate
      </Rotulo>
      {marcas.map((v) => (
        <Rotulo key={v} x={fx(px(v))} y={fy(E.base + 24)} ancora="meio" cor="var(--tinta2)">
          {v === 0 ? "0" : fmtSinal(v, 0)}
        </Rotulo>
      ))}
    </Figura>
  );
}

/* ------------------------------------------------------------------ *
 * Gráfico: a média das pesquisas, com a dúvida em volta               *
 * ------------------------------------------------------------------ */

const S = { W: 660, H: 300, ml: 10, mr: 10, mt: 30, mb: 30, yMin: -4, yMax: 14 };

function SerieComFaixa({ r }: { r: Retrato }) {
  const x0 = r.serie[0].x;
  const x1 = r.serie[r.serie.length - 1].x;
  const px = (x: number) => S.ml + ((x - x0) / (x1 - x0)) * (S.W - S.ml - S.mr);
  const py = (v: number) => S.mt + ((S.yMax - v) / (S.yMax - S.yMin)) * (S.H - S.mt - S.mb);
  const fx = (x: number) => x / S.W;
  const fy = (y: number) => y / S.H;
  const zero = py(0);
  const atual = r.serie[r.serie.length - 1].margem;
  const topo = r.serie.map((p) => `${px(p.x).toFixed(1)},${py(p.margem + r.bandaHoje).toFixed(1)}`);
  const baixo = r.serie
    .slice()
    .reverse()
    .map((p) => `${px(p.x).toFixed(1)},${py(p.margem - r.bandaHoje).toFixed(1)}`);

  return (
    <Figura>
      <svg
        viewBox={`0 0 ${S.W} ${S.H}`}
        role="img"
        aria-label={`Média ponderada da diferença entre janeiro e hoje: hoje em ${fmtSinal(atual)} ponto percentual, com a faixa da dúvida atravessando a linha do empate o tempo todo.`}
        style={{ display: "block", width: "100%", height: "auto" }}
      >
        {/* a faixa é a forma principal; a média é uma linha DENTRO dela (P4) */}
        <polygon points={[...topo, ...baixo].join(" ")} fill="var(--vazio)" />
        <line x1={S.ml} y1={zero} x2={S.W - S.mr} y2={zero} stroke="var(--tinta)" strokeWidth={3} />
        <polyline
          points={r.serie.map((p) => `${px(p.x).toFixed(1)},${py(p.margem).toFixed(1)}`).join(" ")}
          fill="none"
          stroke="var(--ident)"
          strokeWidth={3.5}
          strokeLinejoin="round"
        />
        <circle cx={px(x1)} cy={py(atual)} r={7} fill="var(--ident)" />
      </svg>
      <Rotulo x={fx(16)} y={fy(16)} cor="var(--lula)" peso={600}>
        Lula na frente ↑
      </Rotulo>
      <Rotulo x={fx(16)} y={fy(zero - 16)} cor="var(--tinta)" peso={700}>
        empate
      </Rotulo>
      <Rotulo x={fx(16)} y={fy(S.H - 12)} cor="var(--flavio)" peso={600}>
        Flávio na frente ↓
      </Rotulo>
      <Rotulo x={fx(S.W - 14)} y={fy(py(atual) - 22)} ancora="fim" cor="var(--ident)" peso={700}>
        {fmtSinal(atual)}
      </Rotulo>
    </Figura>
  );
}

/* ------------------------------------------------------------------ *
 * Página                                                              *
 * ------------------------------------------------------------------ */

export default async function ConceitoB() {
  const r = await montarRetrato();

  return (
    <div
      style={{ ...PALETA, background: "var(--fundo)", color: "var(--tinta)", minHeight: "100vh" }}
    >
      <main className="mx-auto w-full max-w-[1080px] px-4 py-8 md:px-8 md:py-16">
        <header className="mb-6 flex items-center gap-3">
          <AgulhaAmeixa />
          <div>
            <p
              className="text-[30px] leading-none md:text-[36px]"
              style={{
                fontFamily: "var(--fonte-b-display)",
                fontWeight: 400,
                letterSpacing: "-0.01em",
              }}
            >
              PONTEIRO
            </p>
            <p className="mt-1 text-[15px] md:text-[16px]" style={{ color: "var(--ident)" }}>
              Para onde apontam as pesquisas.
            </p>
          </div>
        </header>

        {/* ---------------- HERO ---------------- */}
        <section className="rounded-[24px] p-5 md:p-10" style={{ background: "var(--placa)" }}>
          <p
            className="text-[14px] md:text-[15px]"
            style={{ color: "var(--tinta2)", fontVariantNumeric: "tabular-nums" }}
          >
            2º turno · 25 de outubro · faltam {r.dias2T} dias
          </p>

          <h1
            className="mt-3 max-w-[17ch] text-[40px] leading-[1.03] md:max-w-[21ch] md:text-[72px]"
            style={{
              fontFamily: "var(--fonte-b-display)",
              fontWeight: 400,
              letterSpacing: "-0.015em",
            }}
          >
            Em 100 eleições parecidas com esta, Lula fica na frente em{" "}
            <span style={{ color: "var(--lula)" }}>{r.lulaMargemEm100}</span> e Flávio em{" "}
            <span style={{ color: "var(--flavio)" }}>{r.flavioMargemEm100}</span>.
          </h1>

          <div className="mt-8 md:mt-12">
            <Enxame r={r} />
            <div
              className="mt-3 flex justify-between text-[13px] md:text-[15px]"
              style={{ color: "var(--tinta2)" }}
            >
              <span style={{ color: "var(--flavio)" }}>← Flávio na frente</span>
              <span style={{ color: "var(--lula)" }}>Lula na frente →</span>
            </div>
          </div>

          <p
            className="mt-6 max-w-[58ch] text-[16px] leading-[1.6] md:text-[18px]"
            style={{ color: "var(--tinta2)" }}
          >
            Cada bolinha é uma eleição possível. Somando o caminho de vitória já no 1º turno, a
            chance de Lula ser eleito chega a{" "}
            <strong style={{ color: "var(--tinta)" }}>{r.lulaEm100} em 100</strong>. Não é previsão:
            é o que as {r.totalPesquisas} pesquisas registradas no TSE dizem hoje.
          </p>
        </section>

        {/* ---------------- CARTÃO DE DADO + GRÁFICO ---------------- */}
        <section className="mt-4 grid gap-4 md:mt-6 md:grid-cols-2">
          <div className="rounded-[24px] p-5 md:p-8" style={{ background: "var(--placa)" }}>
            <h2
              className="max-w-[26ch] text-[21px] leading-[1.25] md:text-[25px]"
              style={{ fontWeight: 600 }}
            >
              Lula está na frente por {fmt(Math.abs(r.margem))} pontos — menos do que a dúvida.
            </h2>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <ValorCandidato
                nome="Lula"
                valor={`${fmt(r.mediaLula)}%`}
                cor="var(--lula)"
                tenue="var(--lula-tenue)"
              />
              <ValorCandidato
                nome="Flávio"
                valor={`${fmt(r.mediaFlavio)}%`}
                cor="var(--flavio)"
                tenue="var(--flavio-tenue)"
              />
            </div>
            <p className="mt-5 text-[16px] leading-[1.6]">
              A diferença hoje é de{" "}
              <strong style={{ fontVariantNumeric: "tabular-nums" }}>
                {fmtSinal(r.margem)} p.p.
              </strong>{" "}
              e a dúvida até o dia da votação é de{" "}
              <strong style={{ fontVariantNumeric: "tabular-nums" }}>
                ±{fmt(r.incerteza)} p.p.
              </strong>{" "}
              — por isso a virada continua no mapa.
            </p>
            <p className="mt-4 text-[16px] leading-[1.7]">
              <ChipGlossario termo="empate técnico" /> {r.qtdEmpate} das {r.qtdRecentes} pesquisas
              do último mês estão nessa situação.
            </p>
          </div>

          <div className="rounded-[24px] p-5 md:p-8" style={{ background: "var(--placa)" }}>
            <h2
              className="max-w-[26ch] text-[21px] leading-[1.25] md:text-[25px]"
              style={{ fontWeight: 600 }}
            >
              Desde janeiro a diferença encolheu — e nunca saiu da faixa da dúvida.
            </h2>
            <div className="mt-5">
              <SerieComFaixa r={r} />
              <div
                className="mt-2 flex justify-between text-[13px] md:text-[14px]"
                style={{ color: "var(--tinta2)" }}
              >
                <span>janeiro</span>
                <span>hoje</span>
              </div>
            </div>
            <p className="mt-4 text-[15px] leading-[1.6]" style={{ color: "var(--tinta2)" }}>
              A faixa cinza é o tamanho da dúvida: em 8 de cada 10 vezes a diferença verdadeira cai
              dentro dela.
            </p>
          </div>
        </section>

        {/* ---------------- BOTÕES ---------------- */}
        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            className="min-h-12 rounded-full px-6 text-[16px] transition-colors duration-150 hover:bg-[var(--tinta)]"
            style={{ background: "var(--ident)", color: "var(--placa)", fontWeight: 600 }}
          >
            Ver as {r.totalPesquisas} pesquisas
          </button>
          <button
            type="button"
            className="min-h-12 rounded-full px-6 text-[16px] transition-colors duration-150 hover:bg-[var(--vazio)]"
            style={{
              background: "var(--placa)",
              color: "var(--ident)",
              boxShadow: "inset 0 0 0 2px var(--ident)",
              fontWeight: 600,
            }}
          >
            Como a conta é feita
          </button>
        </div>

        <FichaDoConceito ficha={FICHA} />

        <p className="mt-8 text-[15px]">
          <Link href="/design-lab" className="underline underline-offset-4">
            ← voltar ao laboratório
          </Link>
        </p>
      </main>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Peças menores                                                       *
 * ------------------------------------------------------------------ */

/** Marca ESTÁTICA (DECISOES.md): agulha dentro de um disco. Nunca é medidor. */
function AgulhaAmeixa() {
  return (
    <svg
      viewBox="0 0 44 44"
      width="44"
      height="44"
      aria-hidden="true"
      style={{ display: "block", flex: "none" }}
    >
      <circle cx="22" cy="22" r="21" fill="var(--vazio)" />
      <path d="M22 31 L31 14" stroke="var(--ident)" strokeWidth={4} strokeLinecap="round" />
      <circle cx="22" cy="31" r="4.5" fill="var(--tinta)" />
    </svg>
  );
}

function ValorCandidato({
  nome,
  valor,
  cor,
  tenue,
}: {
  nome: string;
  valor: string;
  cor: string;
  tenue: string;
}) {
  return (
    <div className="rounded-[16px] px-4 py-3" style={{ background: tenue }}>
      <p className="text-[15px]" style={{ color: cor, fontWeight: 600 }}>
        {nome}
      </p>
      <p
        className="text-[32px] leading-tight md:text-[38px]"
        style={{
          fontFamily: "var(--fonte-b-display)",
          fontWeight: 400,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {valor}
      </p>
    </div>
  );
}

function ChipGlossario({ termo }: { termo: string }) {
  return (
    <span
      className="inline-flex min-h-8 items-center gap-1.5 rounded-full px-3 align-middle text-[15px]"
      style={{
        background: "var(--fundo)",
        color: "var(--atencao)",
        boxShadow: "inset 0 0 0 2px var(--atencao)",
        fontWeight: 600,
      }}
    >
      {termo}
      <span aria-hidden="true">?</span>
    </span>
  );
}
