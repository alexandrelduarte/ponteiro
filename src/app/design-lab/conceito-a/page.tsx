import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";
import { fmt, fmtSinal } from "@/lib/modelo";
import { montarRetrato, type Retrato } from "../_lib/retrato";
import { FichaDoConceito, type Ficha } from "../_lib/ficha";
import { Figura, Rotulo } from "../_lib/svg";

/**
 * CONCEITO A — "LATÃO".
 *
 * Mesa de instrumento: uma placa branca única sobre bruma fria, dividida por
 * blocos de tinta chapada (nunca por filete), com a marca em latão.
 * Elemento-assinatura: A RÉGUA DE 100 GRADUAÇÕES.
 *
 * Style tile: estilo inline/arbitrário é deliberado (laboratório) — a
 * tokenização só acontece depois de o conceito vencedor ser escolhido.
 */

const PALETA: CSSProperties = {
  "--fundo": "#EDEFEE",
  "--placa": "#FFFFFF",
  "--tinta": "#15181A",
  "--tinta2": "#565C5C",
  "--ident": "#6B4A11",
  "--vazio": "#E4E7E6",
  "--lula": "#B4123C",
  "--lula-tenue": "#F3D9E0",
  "--flavio": "#243C7E",
  "--flavio-tenue": "#DCE2F1",
  "--atencao": "#C9860B",
  "--atencao-tenue": "#FBEFD6",
  fontFamily: "var(--fonte-a-texto)",
} as CSSProperties;

const FICHA: Ficha = {
  nome: "A · LATÃO",
  frase:
    "Mesa de instrumento: uma placa branca única sobre bruma fria, dividida por blocos de tinta chapada — nunca por filete —, com a régua de 100 graduações atravessando a largura inteira.",
  assinatura:
    "A RÉGUA DE 100 GRADUAÇÕES — uma escala de instrumento com cem traços contáveis, agrupados de dez em dez (nunca encostados: o vão é sempre maior que o traço, para não virar barra), e um portão de tinta exatamente entre a graduação 83 e a 84.",
  motion:
    "As cem graduações acendem da esquerda para a direita em 240 ms ease-out, só por opacity, na ordem em que devem ser contadas — a animação É a contagem; desliga inteira em prefers-reduced-motion.",
  tipografia: [
    ["Display", "Bricolage Grotesque (eixos opsz · wdth · wght)"],
    ["Texto", "Public Sans (400/500/600, tabular-nums)"],
  ],
  cores: [
    ["latão · identidade", "#6B4A11", "8,04:1 na placa · 6,96:1 na bruma"],
    ["bruma · fundo", "#EDEFEE", "1,15:1 contra a placa"],
    ["placa · superfície", "#FFFFFF", "—"],
    ["tinta · texto", "#15181A", "17,84:1 na placa · 15,44:1 na bruma"],
    ["carmim · Lula", "#B4123C", "6,79:1 na placa · OKLCH L 0,495"],
    ["naval · Flávio", "#243C7E", "10,38:1 na placa · OKLCH L 0,376"],
    ["âmbar · atenção", "#C9860B", "3,04:1 na placa · tinta em cima 5,86:1"],
  ],
  deltaL:
    "ΔL(OKLCH) entre os dois candidatos = 0,119 — o par sobrevive ao P&B e ao filtro de daltonismo; a cor nunca vem sozinha (portão + rótulo + posição).",
};

/* ------------------------------------------------------------------ *
 * A RÉGUA DE 100 — o elemento-assinatura                              *
 * ------------------------------------------------------------------ */

const PASSO = 11;
const TICK = 4;
const FOLGA = 24;
const BASE = 60;
const VB_TOPO = -34;
const VB_ALTURA = 112;

function posicaoX(i: number, inicio: number) {
  const j = i - inicio;
  return j * PASSO + Math.floor(j / 10) * FOLGA;
}

function Regua({ inicio, fim, corte }: { inicio: number; fim: number; corte: number }) {
  const largura = posicaoX(fim, inicio) + TICK;
  const caixa = largura + 12;
  const fx = (x: number) => (x + 6) / caixa;
  const fy = (y: number) => (y - VB_TOPO) / VB_ALTURA;

  const traços: ReactNode[] = [];
  const rotulos: ReactNode[] = [];
  for (let i = inicio; i <= fim; i += 1) {
    const alto = i % 10 === 0 ? 46 : i % 5 === 0 ? 32 : 22;
    traços.push(
      <rect
        key={i}
        x={posicaoX(i, inicio)}
        y={BASE - alto}
        width={TICK}
        height={alto}
        fill={i <= corte ? "var(--lula)" : "var(--flavio)"}
      />,
    );
    if (i % 10 === 0) {
      rotulos.push(
        <Rotulo
          key={i}
          x={fx(posicaoX(i, inicio) + TICK / 2)}
          y={fy(80)}
          ancora="meio"
          cor="var(--tinta2)"
        >
          {i}
        </Rotulo>,
      );
    }
  }

  const temPortao = corte >= inicio && corte < fim;
  const xg = temPortao ? (posicaoX(corte, inicio) + TICK + posicaoX(corte + 1, inicio)) / 2 : 0;

  return (
    <Figura>
      <svg
        viewBox={`-6 ${VB_TOPO} ${caixa} ${VB_ALTURA}`}
        role="img"
        aria-label={`Régua de cem cenários: graduações ${inicio} a ${fim}.`}
        style={{ display: "block", width: "100%", height: "auto" }}
      >
        <rect x={-6} y={BASE} width={caixa} height={2} fill="var(--vazio)" />
        {traços}
        {temPortao ? (
          <rect x={xg - 2} y={-4} width={4} height={BASE + 8} fill="var(--tinta)" />
        ) : null}
      </svg>
      {rotulos}
      {temPortao ? (
        <Rotulo
          x={fx(xg)}
          y={fy(-18)}
          ancora="meio"
          cor="var(--tinta)"
          peso={700}
          classe="text-[13px] md:text-[15px]"
        >
          {corte} | {100 - corte}
        </Rotulo>
      ) : null}
    </Figura>
  );
}

function ReguaDeCem({ corte }: { corte: number }) {
  return (
    <>
      <div className="grid gap-6 md:hidden">
        <Regua inicio={1} fim={50} corte={corte} />
        <Regua inicio={51} fim={100} corte={corte} />
      </div>
      <div className="hidden md:block">
        <Regua inicio={1} fim={100} corte={corte} />
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ *
 * Gráfico: a faixa que se abre até 25/10                              *
 * ------------------------------------------------------------------ */

const G = { W: 660, H: 360, ml: 10, mr: 10, mt: 40, mb: 18, yMin: -5, yMax: 14 };

function FaixaProjetada({ r }: { r: Retrato }) {
  const px = (d: number) => G.ml + (d / r.dias2T) * (G.W - G.ml - G.mr);
  const py = (v: number) => G.mt + ((G.yMax - v) / (G.yMax - G.yMin)) * (G.H - G.mt - G.mb);
  const fx = (x: number) => x / G.W;
  const fy = (y: number) => y / G.H;
  const y0 = py(0);
  const topo = r.faixa.map((p) => `${px(p.d).toFixed(1)},${py(p.hi).toFixed(1)}`);
  const baixo = r.faixa
    .slice()
    .reverse()
    .map((p) => `${px(p.d).toFixed(1)},${py(p.lo).toFixed(1)}`);

  return (
    <Figura>
      <svg
        viewBox={`0 0 ${G.W} ${G.H}`}
        role="img"
        aria-label={`A diferença hoje é de ${fmtSinal(r.margem)} ponto percentual; até 25 de outubro a faixa do que ainda pode acontecer abre para o intervalo entre ${fmtSinal(r.int80[0])} e ${fmtSinal(r.int80[1])}.`}
        style={{ display: "block", width: "100%", height: "auto" }}
      >
        <defs>
          <clipPath id="faixa-a">
            <polygon points={[...topo, ...baixo].join(" ")} />
          </clipPath>
        </defs>
        {/* A INCERTEZA É A FORMA PRINCIPAL (P4): a área lidera; a média é um traço. */}
        <g clipPath="url(#faixa-a)">
          <rect x={0} y={0} width={G.W} height={y0} fill="var(--lula-tenue)" />
          <rect x={0} y={y0} width={G.W} height={G.H - y0} fill="var(--flavio-tenue)" />
        </g>
        <polyline points={topo.join(" ")} fill="none" stroke="var(--lula)" strokeWidth={2.5} />
        <polyline
          points={r.faixa.map((p) => `${px(p.d).toFixed(1)},${py(p.lo).toFixed(1)}`).join(" ")}
          fill="none"
          stroke="var(--flavio)"
          strokeWidth={2.5}
        />
        <line x1={G.ml} y1={y0} x2={G.W - G.mr} y2={y0} stroke="var(--tinta)" strokeWidth={2.5} />
        <line
          x1={px(0)}
          y1={py(r.margem)}
          x2={px(r.dias2T)}
          y2={py(r.margem)}
          stroke="var(--tinta2)"
          strokeWidth={1.5}
          strokeDasharray="6 5"
        />
        <circle cx={px(0)} cy={py(r.margem)} r={6} fill="var(--tinta)" />
        <circle cx={px(r.dias2T)} cy={py(r.int80[1])} r={5} fill="var(--lula)" />
        <circle cx={px(r.dias2T)} cy={py(r.int80[0])} r={5} fill="var(--flavio)" />
      </svg>

      <Rotulo x={fx(16)} y={fy(18)} cor="var(--lula)" peso={600}>
        Lula na frente ↑
      </Rotulo>
      <Rotulo
        x={fx(G.W - 16)}
        y={fy(py(r.int80[1]) - 22)}
        ancora="fim"
        cor="var(--tinta)"
        peso={600}
      >
        de {fmtSinal(r.int80[0])} a {fmtSinal(r.int80[1])}
      </Rotulo>
      <Rotulo x={fx(px(0) + 16)} y={fy(py(r.margem) - 20)} cor="var(--tinta)" peso={700}>
        hoje {fmtSinal(r.margem)}
      </Rotulo>
      <Rotulo x={fx(16)} y={fy(y0 - 16)} cor="var(--tinta)" peso={700}>
        empate
      </Rotulo>
      <Rotulo x={fx(16)} y={fy(G.H - 16)} cor="var(--flavio)" peso={600}>
        Flávio na frente ↓
      </Rotulo>
    </Figura>
  );
}

/* ------------------------------------------------------------------ *
 * Página                                                              *
 * ------------------------------------------------------------------ */

export default async function ConceitoA() {
  const r = await montarRetrato();
  const moldura = { background: "var(--placa)", boxShadow: "0 0 0 1px var(--vazio)" };

  return (
    <div
      style={{ ...PALETA, background: "var(--fundo)", color: "var(--tinta)", minHeight: "100vh" }}
    >
      <main className="mx-auto w-full max-w-[1120px] px-4 py-8 md:px-8 md:py-14">
        <header className="mb-5 flex flex-wrap items-center gap-x-4 gap-y-1">
          <span
            className="inline-flex items-center gap-2 text-[26px] leading-none md:text-[32px]"
            style={{
              fontFamily: "var(--fonte-a-display)",
              fontWeight: 800,
              letterSpacing: "-0.035em",
            }}
          >
            <AgulhaLatao />
            PONTEIRO
          </span>
          <span className="text-[15px] md:text-[17px]" style={{ color: "var(--ident)" }}>
            Para onde apontam as pesquisas.
          </span>
        </header>

        {/* ---------------- HERO ---------------- */}
        <section className="rounded-[6px] p-4 md:p-8" style={moldura}>
          <p
            className="mb-3 text-[13px] md:text-[14px]"
            style={{ color: "var(--tinta2)", fontVariantNumeric: "tabular-nums" }}
          >
            projeção para o 2º turno · 25 de outubro · faltam {r.dias2T} dias
          </p>

          <h1
            className="max-w-[20ch] text-[32px] leading-[1.06] md:max-w-[26ch] md:text-[54px]"
            style={{
              fontFamily: "var(--fonte-a-display)",
              fontWeight: 700,
              letterSpacing: "-0.03em",
            }}
          >
            Em 100 eleições parecidas com esta, Lula vence{" "}
            <span style={{ color: "var(--lula)" }}>{r.lulaEm100}</span> e Flávio vence{" "}
            <span style={{ color: "var(--flavio)" }}>{r.flavioEm100}</span>.
          </h1>

          <p
            className="mt-3 max-w-[54ch] text-[16px] leading-[1.55] md:text-[18px]"
            style={{ color: "var(--tinta2)" }}
          >
            Não é previsão. É a conta do que as {r.totalPesquisas} pesquisas registradas no TSE
            dizem hoje, esticada até o dia da votação.
          </p>

          {/* -------- ELEMENTO-ASSINATURA -------- */}
          <div className="mt-8 md:mt-12">
            <ReguaDeCem corte={r.lulaEm100} />
            <div className="mt-5 flex items-start justify-between gap-3">
              <Legenda cor="var(--lula)" nome="Lula" valor={`${r.lulaEm100} em 100`} />
              <Legenda
                cor="var(--flavio)"
                nome="Flávio"
                valor={`${r.flavioEm100} em 100`}
                alinhar
              />
            </div>
          </div>
        </section>

        {/* ---------------- CARTÃO DE DADO + GRÁFICO ---------------- */}
        <section className="mt-4 grid gap-4 md:mt-6 md:grid-cols-2">
          <div className="rounded-[6px] p-4 md:p-6" style={moldura}>
            <h2
              className="text-[13px] md:text-[14px]"
              style={{ color: "var(--ident)", fontWeight: 600 }}
            >
              2º turno · média das {r.totalPesquisas} pesquisas
            </h2>
            <div className="mt-4 grid grid-cols-2 gap-3">
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
            <dl className="mt-5 grid grid-cols-2 gap-4">
              <ParDado etiqueta="diferença hoje" valor={`${fmtSinal(r.margem)} p.p.`} />
              <ParDado etiqueta="incerteza até 25/10" valor={`±${fmt(r.incerteza)} p.p.`} />
            </dl>
            <p className="mt-4 text-[15px] leading-[1.55]" style={{ color: "var(--tinta2)" }}>
              No dia da votação a diferença cabe entre {fmtSinal(r.int80[0])} e{" "}
              {fmtSinal(r.int80[1])} p.p. Número negativo quer dizer Flávio na frente.
            </p>
            <p className="mt-3 text-[15px] leading-[1.6]">
              <ChipGlossario termo="empate técnico" /> {r.qtdEmpate} das {r.qtdRecentes} pesquisas
              do último mês estão nessa situação.
            </p>
          </div>

          <div className="rounded-[6px] p-4 md:p-6" style={moldura}>
            <h2
              className="text-[13px] md:text-[14px]"
              style={{ color: "var(--ident)", fontWeight: 600 }}
            >
              a dúvida cresce com o tempo
            </h2>
            <p className="mt-1 mb-4 max-w-[46ch] text-[15px] leading-[1.5]">
              A diferença de hoje é {fmtSinal(r.margem)}. Quanto mais longe o dia da votação, mais
              larga a faixa do que ainda pode acontecer.
            </p>
            <FaixaProjetada r={r} />
            <div
              className="mt-2 flex justify-between text-[12px] md:text-[13px]"
              style={{ color: "var(--tinta2)" }}
            >
              <span>hoje</span>
              <span>25 de outubro</span>
            </div>
          </div>
        </section>

        {/* ---------------- BOTÕES ---------------- */}
        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            className="min-h-11 rounded-[6px] px-5 text-[16px] transition-colors duration-150 hover:bg-[var(--tinta)]"
            style={{ background: "var(--ident)", color: "var(--placa)", fontWeight: 600 }}
          >
            Ver as {r.totalPesquisas} pesquisas
          </button>
          <button
            type="button"
            className="min-h-11 rounded-[6px] px-5 text-[16px] transition-colors duration-150 hover:bg-[var(--vazio)]"
            style={{
              background: "var(--placa)",
              color: "var(--tinta)",
              boxShadow: "inset 0 0 0 2px var(--tinta)",
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

/** Marca ESTÁTICA (DECISOES.md): agulha dentro de um arco. Nunca é medidor. */
function AgulhaLatao() {
  return (
    <svg
      viewBox="0 0 32 32"
      width="26"
      height="26"
      aria-hidden="true"
      style={{ display: "block", flex: "none" }}
    >
      <path
        d="M4 23a12 12 0 0 1 24 0"
        fill="none"
        stroke="var(--ident)"
        strokeWidth={3}
        strokeLinecap="round"
      />
      <path d="M16 23 L24 11" stroke="var(--tinta)" strokeWidth={3} strokeLinecap="round" />
      <circle cx="16" cy="23" r="3" fill="var(--ident)" />
    </svg>
  );
}

function Legenda({
  cor,
  nome,
  valor,
  alinhar,
}: {
  cor: string;
  nome: string;
  valor: string;
  alinhar?: boolean;
}) {
  return (
    <div className={alinhar ? "text-right" : undefined}>
      <p className="text-[15px] md:text-[16px]" style={{ color: cor, fontWeight: 600 }}>
        {nome}
      </p>
      <p
        className="text-[20px] md:text-[24px]"
        style={{
          fontFamily: "var(--fonte-a-display)",
          fontWeight: 700,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {valor}
      </p>
    </div>
  );
}

function ParDado({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div>
      <dt className="text-[13px]" style={{ color: "var(--tinta2)" }}>
        {etiqueta}
      </dt>
      <dd
        className="text-[24px] leading-tight"
        style={{
          fontFamily: "var(--fonte-a-display)",
          fontWeight: 700,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {valor}
      </dd>
    </div>
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
    <div className="rounded-[4px] px-3 py-2" style={{ background: tenue }}>
      <p className="text-[14px]" style={{ color: cor, fontWeight: 600 }}>
        {nome}
      </p>
      <p
        className="text-[28px] leading-tight md:text-[32px]"
        style={{
          fontFamily: "var(--fonte-a-display)",
          fontWeight: 700,
          letterSpacing: "-0.02em",
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
      className="inline-flex min-h-8 items-center gap-1.5 rounded-[4px] px-2 align-middle text-[14px]"
      style={{
        background: "var(--atencao-tenue)",
        color: "var(--tinta)",
        boxShadow: "inset 0 0 0 1.5px var(--atencao)",
        fontWeight: 600,
      }}
    >
      {termo}
      <span aria-hidden="true" style={{ color: "var(--atencao)" }}>
        ?
      </span>
    </span>
  );
}
