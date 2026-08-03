"use client";

/**
 * Peças compartilhadas dos gráficos (docs/DESIGN.md §7.6).
 *
 * Regras duras: `isAnimationActive={false}` em tudo (P3 — nada de movimento a
 * serviço de dado), tick de 12px no mínimo (§4.2), tooltip escuro em mono e
 * acionável por TOQUE (`trigger="click"`), cor sempre por `var(--color-*)`
 * porque o Recharts recebe cor por prop, fora do alcance do Tailwind.
 */
import type { ReactNode } from "react";
import { Esqueleto } from "@/components/ui/basicos";
import { fmt, fmtData } from "@/lib/modelo";

/** Alturas por breakpoint — o esqueleto usa AS MESMAS classes (CLS 0). */
export const ALTURA = {
  evolucao: "h-[220px] md:h-[260px] lg:h-[300px]",
  distribuicao: "h-[200px] md:h-[240px]",
  sensibilidade: "h-[200px] md:h-[240px]",
  historico: "h-[220px] md:h-[260px]",
} as const;

export const COR = {
  lula: "var(--color-lula)",
  flavio: "var(--color-flavio)",
  linha: "var(--color-linha)",
  linhaForte: "var(--color-linha-forte)",
  cinza: "var(--color-cinza)",
  tinta: "var(--color-tinta)",
  confirma: "var(--color-confirma)",
} as const;

export const TICK = {
  fontSize: 12,
  fontFamily: "var(--font-mono)",
  fill: COR.cinza,
} as const;

/** dd/mm no fuso de Brasília (−03:00 fixo; o país não tem horário de verão). */
export function ddmmDeMs(ms: number): string {
  const d = new Date(ms - 3 * 3600e3);
  return `${String(d.getUTCDate()).padStart(2, "0")}/${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

/* ------------------------------------------------------------------ *
 * Tooltips                                                           *
 * ------------------------------------------------------------------ */

export interface EntradaDica {
  dataKey?: string | number | ((obj: unknown) => unknown);
  value?: unknown;
  payload?: Record<string, unknown>;
}

export interface PropsDica {
  active?: boolean;
  label?: string | number;
  payload?: ReadonlyArray<EntradaDica>;
}

export function MolduraDica({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-controle bg-tinta px-3 py-2 font-mono text-xs text-texto-inverso shadow-tip">
      {children}
    </div>
  );
}

const num = (v: unknown): number | null => (typeof v === "number" && isFinite(v) ? v : null);
const texto = (v: unknown): string | null => (typeof v === "string" ? v : null);

/** Tooltip da evolução: ponto de pesquisa (com instituto) ou média da série. */
export function DicaEvolucao({ active, payload }: PropsDica) {
  if (!active || !payload?.length) return null;
  const comInstituto = payload.find((p) => typeof p.payload?.instituto === "string")?.payload;

  if (comInstituto) {
    return (
      <MolduraDica>
        <div className="font-semibold">{String(comInstituto.instituto)}</div>
        <div>
          campo {fmtData(texto(comInstituto.inicio))}–{fmtData(texto(comInstituto.fim))}
        </div>
        <div className="text-lula-claro">Lula {fmt(num(comInstituto.lVal))}%</div>
        <div className="text-flavio-claro">Flávio {fmt(num(comInstituto.fVal))}%</div>
      </MolduraDica>
    );
  }

  const pt = payload[0]?.payload;
  if (!pt) return null;
  const x = num(pt.x);
  return (
    <MolduraDica>
      <div>média em {x === null ? "–" : ddmmDeMs(x)}</div>
      <div className="text-lula-claro">Lula {fmt(num(pt.l))}%</div>
      <div className="text-flavio-claro">Flávio {fmt(num(pt.f))}%</div>
    </MolduraDica>
  );
}

/** Tooltip da curva de sensibilidade — anuncia que o clique aplica o viés. */
export function DicaSensibilidade({ active, payload, label }: PropsDica) {
  if (!active || !payload?.length) return null;
  const l = num(payload.find((p) => p.dataKey === "l")?.value);
  const f = num(payload.find((p) => p.dataKey === "f")?.value);
  const v = typeof label === "number" ? label : Number(label);
  return (
    <MolduraDica>
      <div>viés {Number.isFinite(v) ? (v >= 0 ? "+" : "−") + fmt(Math.abs(v)) : "–"} p.p.</div>
      {l !== null ? <div className="text-lula-claro">Lula eleito: {Math.round(l)}%</div> : null}
      {f !== null ? <div className="text-flavio-claro">Flávio eleito: {Math.round(f)}%</div> : null}
      <div className="opacity-70">toque ou clique para aplicar ao painel</div>
    </MolduraDica>
  );
}

/* ------------------------------------------------------------------ *
 * Carregando                                                         *
 * ------------------------------------------------------------------ */

/**
 * Esqueleto do gráfico: preenche o contêiner, que já tem a altura fixa de
 * `ALTURA.*`. Mesma caixa antes e depois → CLS 0, sem shimmer (§8.1).
 */
export function EsqueletoGrafico() {
  return <Esqueleto className="h-full w-full" rotulo="Carregando o gráfico…" />;
}

/** Contêiner de altura fixa comum ao gráfico e ao seu esqueleto. */
export function CaixaGrafico({ altura, children }: { altura: string; children: ReactNode }) {
  return <div className={`w-full ${altura}`}>{children}</div>;
}
