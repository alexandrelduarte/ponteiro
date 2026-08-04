import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";
import { fmt, fmtSinal } from "@/lib/modelo";
import { montarRetrato, type PesquisaPlotada, type Retrato } from "../_lib/retrato";
import { FichaDoConceito, type Ficha } from "../_lib/ficha";

/**
 * CONCEITO C — "CHUMBO".
 *
 * Página de tipografia: nenhum cartão, nenhum raio, nenhum filete capilar —
 * blocos chapados separados por réguas grossas de 4 px, manchete gigante e o
 * campo de 100 quadrados ocupando a largura. A aposta: SÓ os dois candidatos
 * têm direito a matiz; a marca é chumbo (família terceira, acromática).
 * Elemento-assinatura: O CAMPO DE 100 (grade 10×10 com contorno em degrau).
 *
 * Style tile: estilo inline/arbitrário é deliberado (laboratório).
 */

const PALETA: CSSProperties = {
  "--fundo": "#F3F4F3",
  "--placa": "#FFFFFF",
  "--tinta": "#111312",
  "--tinta2": "#585D5B",
  "--ident": "#3B3E3D",
  "--vazio": "#DEE1E0",
  "--lula": "#AE0F38",
  "--lula-tenue": "#F2D6DE",
  "--flavio": "#20356B",
  "--flavio-tenue": "#D9DFEE",
  "--atencao": "#A35A0A",
  fontFamily: "var(--fonte-c-texto)",
} as CSSProperties;

const FICHA: Ficha = {
  nome: "C · CHUMBO",
  frase:
    "Página de tipografia: nenhum cartão e nenhum raio — blocos chapados separados por réguas grossas de 4 px, manchete gigante e o campo de 100 quadrados ocupando a largura inteira.",
  assinatura:
    "O CAMPO DE 100 — grade 10×10 de quadrados contáveis, com o ordinal de cada dezena escrito dentro da casa e o contorno em degrau que separa as 83 casas de Lula das 17 de Flávio.",
  motion:
    "O campo é imóvel; a única coisa que se move é o contorno em degrau, que desliza uma casa em 180 ms ease-out quando o número muda — o movimento existe só para dizer «isto mudou», e é o primeiro a sumir em prefers-reduced-motion.",
  tipografia: [
    ["Display", "Schibsted Grotesk (700/800/900), grotesca de notícia"],
    ["Texto", "Atkinson Hyperlegible Next — desenhada para baixa visão"],
  ],
  cores: [
    ["chumbo · identidade", "#3B3E3D", "10,81:1 na placa · acromática por decisão"],
    ["placa · página", "#FFFFFF", "—"],
    ["gelo · bloco", "#F3F4F3", "1,10:1 contra a placa"],
    ["tinta · texto", "#111312", "18,65:1 na placa · 16,92:1 no gelo"],
    ["carmim · Lula", "#AE0F38", "7,18:1 na placa · OKLCH L 0,482"],
    ["naval · Flávio", "#20356B", "11,78:1 na placa · OKLCH L 0,344"],
    ["ocre · atenção", "#A35A0A", "branco em cima 5,22:1 (bloco cheio)"],
  ],
  deltaL:
    "ΔL(OKLCH) entre os dois candidatos = 0,138 — o maior dos três; além da cor há o contorno em degrau e o ordinal dentro da casa.",
};

/* ------------------------------------------------------------------ *
 * O CAMPO DE 100 — o elemento-assinatura                              *
 * ------------------------------------------------------------------ */

function CampoDeCem({ corte }: { corte: number }) {
  const casas: ReactNode[] = [];
  for (let i = 1; i <= 100; i += 1) {
    const linha = Math.floor((i - 1) / 10);
    const coluna = (i - 1) % 10;
    const daLula = i <= corte;
    casas.push(
      <rect
        key={`q${i}`}
        x={coluna * 100 + 7}
        y={linha * 100 + 7}
        width={86}
        height={86}
        fill={daLula ? "var(--lula)" : "var(--flavio)"}
      />,
    );
    if (i % 10 === 0) {
      casas.push(
        <text
          key={`n${i}`}
          x={coluna * 100 + 50}
          y={linha * 100 + 64}
          textAnchor="middle"
          fontSize="40"
          fontWeight={700}
          fill="var(--placa)"
          style={{ fontFamily: "var(--fonte-c-display)", fontVariantNumeric: "tabular-nums" }}
        >
          {i}
        </text>,
      );
    }
  }

  /* Contorno em degrau: a fronteira REAL entre as duas regiões. */
  const linhaCorte = Math.floor(corte / 10);
  const colunaCorte = corte % 10;
  const contorno = `M 0 ${(linhaCorte + 1) * 100} H ${colunaCorte * 100} V ${linhaCorte * 100} H 1000`;

  return (
    <svg
      viewBox="-8 -8 1016 1016"
      role="img"
      aria-label={`Campo de cem casas: ${corte} são de Lula e ${100 - corte} de Flávio.`}
      style={{ display: "block", width: "100%", height: "auto" }}
    >
      {casas}
      <path d={contorno} fill="none" stroke="var(--ident)" strokeWidth={14} strokeLinejoin="miter" />
    </svg>
  );
}

/* ------------------------------------------------------------------ *
 * Gráfico: as 13 pesquisas contra a linha do empate                   *
 * ------------------------------------------------------------------ */

const V_MIN = -7;
const V_MAX = 13;
const frac = (v: number) => ((v - V_MIN) / (V_MAX - V_MIN)) * 100;

function LinhaPesquisa({ p }: { p: PesquisaPlotada }) {
  const lo = p.margem - 2 * p.moe;
  const hi = p.margem + 2 * p.moe;
  const esq = frac(lo);
  const larg = frac(hi) - esq;
  const parteFlavio = lo < 0 ? ((0 - lo) / (hi - lo)) * 100 : 0;
  return (
    <div className="grid grid-cols-[92px_1fr] items-center gap-2 md:grid-cols-[168px_1fr_64px] md:gap-3">
      <span className="truncate text-[13px] md:text-[15px]" style={{ color: "var(--tinta)" }}>
        {p.instituto}
      </span>
      <div className="relative h-7">
        {/* a régua do empate atravessa TODAS as linhas: fica atrás da barra */}
        <div
          aria-hidden="true"
          className="absolute top-0 bottom-0 w-[3px] -translate-x-1/2"
          style={{ left: `${frac(0)}%`, background: "var(--ident)" }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 overflow-hidden"
          style={{
            left: `${esq}%`,
            width: `${larg}%`,
            height: 14,
            background: "var(--lula-tenue)",
            boxShadow: "inset 0 0 0 1.5px var(--tinta2)",
          }}
        >
          {parteFlavio > 0 ? (
            <div
              style={{
                position: "absolute",
                inset: "0 auto 0 0",
                width: `${parteFlavio}%`,
                background: "var(--flavio-tenue)",
              }}
            />
          ) : null}
        </div>
        <div
          className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            left: `${frac(p.margem)}%`,
            background: p.margem >= 0 ? "var(--lula)" : "var(--flavio)",
            boxShadow: "0 0 0 2px var(--placa)",
          }}
        />
      </div>
      <span
        className="hidden text-[13px] md:block"
        style={{ color: "var(--tinta2)", fontVariantNumeric: "tabular-nums" }}
      >
        {p.fim}
      </span>
    </div>
  );
}

function GraficoPesquisas({ r }: { r: Retrato }) {
  return (
    <div>
      <div className="grid">
        {r.pesquisas.map((p) => (
          <LinhaPesquisa key={p.id} p={p} />
        ))}
      </div>
      <div className="mt-3 grid grid-cols-[92px_1fr] gap-2 md:grid-cols-[168px_1fr_64px] md:gap-3">
        <span />
        <div className="relative h-5 text-[12px] md:text-[13px]" style={{ color: "var(--tinta2)" }}>
          {[-5, 0, 5, 10].map((v) => (
            <span
              key={v}
              className="absolute -translate-x-1/2 whitespace-nowrap"
              style={{ left: `${frac(v)}%`, fontVariantNumeric: "tabular-nums" }}
            >
              {v === 0 ? "empate" : fmtSinal(v, 0)}
            </span>
          ))}
        </div>
        <span className="hidden md:block" />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Página                                                              *
 * ------------------------------------------------------------------ */

export default async function ConceitoC() {
  const r = await montarRetrato();

  return (
    <div
      style={{ ...PALETA, background: "var(--placa)", color: "var(--tinta)", minHeight: "100vh" }}
    >
      <main className="mx-auto w-full max-w-[1120px] px-4 py-8 md:px-8 md:py-14">
        <header>
          <div className="flex items-center gap-3">
            <AgulhaChumbo />
            <p
              className="text-[36px] leading-none md:text-[52px]"
              style={{
                fontFamily: "var(--fonte-c-display)",
                fontWeight: 900,
                letterSpacing: "-0.045em",
              }}
            >
              PONTEIRO
            </p>
          </div>
          <p className="mt-2 text-[16px] md:text-[19px]" style={{ color: "var(--tinta2)" }}>
            Para onde apontam as pesquisas.
          </p>
          <Regua />
        </header>

        {/* ---------------- HERO ---------------- */}
        <section className="grid gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,520px)] md:items-start md:gap-10">
          <div>
            <p
              className="text-[13px] tracking-[0.02em] md:text-[14px]"
              style={{ color: "var(--tinta2)", fontVariantNumeric: "tabular-nums" }}
            >
              projeção para o 2º turno · 25 de outubro · faltam {r.dias2T} dias
            </p>
            <p
              className="mt-2 text-[72px] leading-[0.86] md:text-[112px]"
              style={{
                fontFamily: "var(--fonte-c-display)",
                fontWeight: 900,
                letterSpacing: "-0.05em",
              }}
            >
              {r.lulaEm100}
              <span
                className="text-[34px] md:text-[50px]"
                style={{ color: "var(--tinta2)", letterSpacing: "-0.02em", marginLeft: "0.16em" }}
              >
                em 100
              </span>
            </p>
            <h1 className="mt-4 max-w-[26ch] text-[21px] leading-[1.35] md:text-[26px]">
              Lula é eleito em <strong style={{ color: "var(--lula)" }}>{r.lulaEm100}</strong> de
              cada 100 eleições parecidas com esta. Flávio, em{" "}
              <strong style={{ color: "var(--flavio)" }}>{r.flavioEm100}</strong>.
            </h1>
            <p className="mt-3 max-w-[46ch] text-[16px] leading-[1.6]" style={{ color: "var(--tinta2)" }}>
              Não é previsão. É a conta do que as {r.totalPesquisas} pesquisas registradas no TSE
              dizem hoje, esticada até o dia da votação.
            </p>
          </div>

          {/* -------- ELEMENTO-ASSINATURA -------- */}
          <div>
            <CampoDeCem corte={r.lulaEm100} />
            <div className="mt-4 grid grid-cols-2 gap-3">
              <Quadro cor="var(--lula)" nome="Lula" valor={`${r.lulaEm100} casas`} />
              <Quadro cor="var(--flavio)" nome="Flávio" valor={`${r.flavioEm100} casas`} alinhar />
            </div>
          </div>
        </section>

        <Regua />

        {/* ---------------- CARTÃO DE DADO ---------------- */}
        <section className="grid gap-8 md:grid-cols-2 md:gap-10">
          <div>
            <h2
              className="flex items-center gap-2 text-[14px] tracking-[0.01em] md:text-[15px]"
              style={{ color: "var(--ident)", fontWeight: 700 }}
            >
              <span aria-hidden="true" className="inline-block h-3 w-3 flex-none" style={{ background: "var(--ident)" }} />
              2º turno · média das {r.totalPesquisas} pesquisas
            </h2>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <ValorCandidato nome="Lula" valor={`${fmt(r.mediaLula)}%`} cor="var(--lula)" />
              <ValorCandidato nome="Flávio" valor={`${fmt(r.mediaFlavio)}%`} cor="var(--flavio)" />
            </div>
            <dl className="mt-5 grid grid-cols-2 gap-4">
              <ParDado etiqueta="diferença hoje" valor={`${fmtSinal(r.margem)} p.p.`} />
              <ParDado etiqueta="incerteza até 25/10" valor={`±${fmt(r.incerteza)} p.p.`} />
            </dl>
            <p className="mt-4 max-w-[48ch] text-[16px] leading-[1.6]">
              No dia da votação a diferença cabe entre {fmtSinal(r.int80[0])} e {fmtSinal(r.int80[1])}{" "}
              p.p. Número negativo quer dizer Flávio na frente.
            </p>
            <p className="mt-4 max-w-[48ch] text-[16px] leading-[1.8]">
              <ChipGlossario termo="empate técnico" /> {r.qtdEmpate} das {r.qtdRecentes} pesquisas do
              último mês estão nessa situação.
            </p>

            {/* -------- BOTÕES -------- */}
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                className="min-h-11 px-5 text-[16px] transition-colors duration-150 hover:bg-[var(--tinta)]"
                style={{ background: "var(--ident)", color: "var(--placa)", fontWeight: 700 }}
              >
                Ver as {r.totalPesquisas} pesquisas
              </button>
              <button
                type="button"
                className="min-h-11 px-5 text-[16px] transition-colors duration-150 hover:bg-[var(--fundo)]"
                style={{
                  background: "var(--placa)",
                  color: "var(--tinta)",
                  boxShadow: "inset 0 0 0 3px var(--tinta)",
                  fontWeight: 700,
                }}
              >
                Como a conta é feita
              </button>
            </div>
          </div>

          {/* ---------------- GRÁFICO ---------------- */}
          <div className="p-4 md:p-6" style={{ background: "var(--fundo)" }}>
            <h2
              className="flex items-center gap-2 text-[14px] tracking-[0.01em] md:text-[15px]"
              style={{ color: "var(--ident)", fontWeight: 700 }}
            >
              <span aria-hidden="true" className="inline-block h-3 w-3 flex-none" style={{ background: "var(--ident)" }} />
              cada pesquisa contra a linha do empate
            </h2>
            <p className="mt-1 mb-5 max-w-[44ch] text-[15px] leading-[1.5]">
              A barra é a margem de erro dobrada. Quando ela atravessa a régua do empate, o resultado
              daquela pesquisa é indistinguível de um empate.
            </p>
            <GraficoPesquisas r={r} />
          </div>
        </section>

        <Regua />

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

function Regua() {
  return <div aria-hidden="true" className="my-7 h-[4px] w-full md:my-10" style={{ background: "var(--ident)" }} />;
}

/** Marca ESTÁTICA (DECISOES.md): agulha dentro de um quadrado. Nunca é medidor. */
function AgulhaChumbo() {
  return (
    <svg viewBox="0 0 40 40" width="40" height="40" aria-hidden="true" style={{ display: "block", flex: "none" }}>
      <rect x="0" y="0" width="40" height="40" fill="var(--ident)" />
      <path d="M20 30 L30 12" stroke="var(--placa)" strokeWidth={5} strokeLinecap="butt" />
      <rect x="16" y="26" width="8" height="8" fill="var(--placa)" />
    </svg>
  );
}

function Quadro({ cor, nome, valor, alinhar }: { cor: string; nome: string; valor: string; alinhar?: boolean }) {
  return (
    <div className={alinhar ? "text-right" : undefined}>
      <span
        aria-hidden="true"
        className="mb-1 inline-block h-3 w-6"
        style={{ background: cor }}
      />
      <p className="text-[15px] md:text-[16px]" style={{ color: cor, fontWeight: 700 }}>
        {nome}
      </p>
      <p
        className="text-[20px] md:text-[24px]"
        style={{
          fontFamily: "var(--fonte-c-display)",
          fontWeight: 800,
        }}
      >
        {valor}
      </p>
    </div>
  );
}

function ValorCandidato({ nome, valor, cor }: { nome: string; valor: string; cor: string }) {
  return (
    <div style={{ boxShadow: `inset 0 4px 0 0 ${cor}`, paddingTop: 12 }}>
      <p className="text-[14px]" style={{ color: cor, fontWeight: 700 }}>
        {nome}
      </p>
      <p
        className="text-[30px] leading-tight md:text-[36px]"
        style={{
          fontFamily: "var(--fonte-c-display)",
          fontWeight: 900,
          letterSpacing: "-0.03em",
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
          fontFamily: "var(--fonte-c-display)",
          fontWeight: 800,
        }}
      >
        {valor}
      </dd>
    </div>
  );
}

function ChipGlossario({ termo }: { termo: string }) {
  return (
    <span
      className="inline-flex min-h-8 items-center gap-1.5 px-2 align-middle text-[15px]"
      style={{ background: "var(--atencao)", color: "var(--placa)", fontWeight: 700 }}
    >
      {termo}
      <span aria-hidden="true">?</span>
    </span>
  );
}
