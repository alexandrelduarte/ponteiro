"use client";

/**
 * Peças compartilhadas dos gráficos (docs/DESIGN-V2.md §5.3 e §7.2).
 *
 * Regras duras:
 *  - `isAnimationActive={false}` em TUDO. Movimento a serviço de dado é
 *    proibido, e o custo de animar num Android barato sai do orçamento de INP.
 *  - tick nunca abaixo de 13px (`--text-micro`), e em Lexend: mono não volta.
 *  - cor sempre por `var(--color-*)` — o Recharts recebe cor por prop, fora do
 *    alcance do scanner do Tailwind, e por isso `@theme static` emite tudo.
 *  - a DÚVIDA é sempre o lilás da faixa, com borda obrigatória: é a borda que
 *    cumpre o 3:1 de objeto gráfico sem transformar a dúvida num campo pesado.
 *  - o tooltip flutua acima do conteúdo, então pode ter sombra (§3.5).
 */
import type { ReactNode } from "react";
import { Esqueleto } from "@/components/ui/blocos";
import { fmt, fmtData } from "@/lib/modelo";

/** Alturas por breakpoint — o esqueleto usa AS MESMAS classes (CLS 0). */
export const ALTURA = {
  evolucao: "h-[240px] md:h-[280px] lg:h-[320px]",
  sensibilidade: "h-[264px] md:h-[300px]",
  historico: "h-[220px] md:h-[260px]",
} as const;

export const COR = {
  lula: "var(--color-lula)",
  flavio: "var(--color-flavio)",
  ameixa: "var(--color-ameixa)",
  ameixaClara: "var(--color-ameixa-clara)",
  tinta: "var(--color-tinta)",
  tintaMedia: "var(--color-tinta-media)",
  contorno: "var(--color-contorno)",
  grade: "var(--color-grade)",
  faixa: "var(--color-faixa)",
  faixaBorda: "var(--color-faixa-borda)",
  placa: "var(--color-placa)",
} as const;

export const TICK = {
  fontSize: 13,
  fontFamily: "var(--font-texto)",
  fill: COR.tintaMedia,
} as const;

/**
 * O leitor tem ponteiro que PAIRA e é fino (mouse, trackpad)?
 *
 * O gesto do tooltip é decidido por CAPACIDADE, nunca por largura de tela: um
 * tablet de 1024 é dedo, um laptop de 1024 é mouse, e a mesma media query que
 * o Tailwind usa em `hover:` responde certo nos dois. Com ponteiro fino o
 * tooltip abre ao passar (`trigger="hover"`); no toque continua sendo clique,
 * porque `:hover` grudado num dedo é o defeito clássico.
 *
 * Ler `matchMedia` direto no render é seguro AQUI e só aqui: os três gráficos
 * são `next/dynamic` com `ssr: false` (ver `carregados.tsx`), então não existe
 * HTML de servidor para divergir na hidratação.
 */
export function ponteiroFino(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false;
  return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
}

/** Como o tooltip abre, por capacidade do ponteiro. */
export const gatilhoDica = (): "hover" | "click" => (ponteiroFino() ? "hover" : "click");

/**
 * O ponto que aparece sob o ponteiro. É ESTADO de interação, não animação de
 * série: `isAnimationActive={false}` continua valendo em tudo (§7.2) — o que
 * este ponto faz é dizer QUAL dado está sendo lido, e ele nasce e some com o
 * ponteiro, sem percorrer trajeto nenhum.
 */
export const PONTO_ATIVO = { r: 5, strokeWidth: 2, stroke: COR.placa } as const;

/** Vertical de leitura que acompanha o ponteiro — a mesma tinta da grade. */
export const CURSOR_DICA = {
  stroke: COR.contorno,
  strokeWidth: 1,
  strokeDasharray: "4 3",
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
    <div className="rounded-nicho bg-placa px-4 py-3 text-micro text-tinta shadow-erguido">
      {children}
    </div>
  );
}

const num = (v: unknown): number | null => (typeof v === "number" && isFinite(v) ? v : null);
const texto = (v: unknown): string | null => (typeof v === "string" ? v : null);

/** Tooltip da evolução: uma pesquisa (com instituto) ou a média do painel. */
export function DicaEvolucao({ active, payload }: PropsDica) {
  if (!active || !payload?.length) return null;
  const comInstituto = payload.find((p) => typeof p.payload?.instituto === "string")?.payload;

  if (comInstituto) {
    return (
      <MolduraDica>
        <div className="font-semibold">
          {String(comInstituto.instituto)} · pesquisa feita de {fmtData(texto(comInstituto.inicio))}
          –{fmtData(texto(comInstituto.fim))}
        </div>
        <div className="mt-1 numeros">
          <span className="text-lula">Lula {fmt(num(comInstituto.lVal))}%</span>
          {" · "}
          <span className="text-flavio">Flávio {fmt(num(comInstituto.fVal))}%</span>
        </div>
      </MolduraDica>
    );
  }

  const pt = payload[0]?.payload;
  if (!pt) return null;
  const x = num(pt.x);
  return (
    <MolduraDica>
      <div>média do painel em {x === null ? "–" : ddmmDeMs(x)}</div>
      <div className="mt-1 numeros">
        <span className="text-lula">Lula {fmt(num(pt.l))}%</span>
        {" · "}
        <span className="text-flavio">Flávio {fmt(num(pt.f))}%</span>
      </div>
    </MolduraDica>
  );
}

/** Tooltip da curva de sensibilidade — anuncia que o toque aplica a puxada. */
export function DicaSensibilidade({ active, payload, label }: PropsDica) {
  if (!active || !payload?.length) return null;
  const l = num(payload.find((p) => p.dataKey === "l")?.value);
  const f = num(payload.find((p) => p.dataKey === "f")?.value);
  const v = typeof label === "number" ? label : Number(label);
  return (
    <MolduraDica>
      <div className="numeros">
        puxada suposta: {Number.isFinite(v) ? (v >= 0 ? "+" : "−") + fmt(Math.abs(v)) : "–"} pontos
      </div>
      {l !== null ? <div className="text-lula numeros">Lula: {Math.round(l)} em 100</div> : null}
      {f !== null ? (
        <div className="text-flavio numeros">Flávio: {Math.round(f)} em 100</div>
      ) : null}
      <div className="mt-1 text-tinta-media">toque para aplicar ao painel</div>
    </MolduraDica>
  );
}

/* ------------------------------------------------------------------ *
 * Carregando                                                         *
 * ------------------------------------------------------------------ */

/** Esqueleto: mesma caixa antes e depois → CLS 0, sem shimmer (§5.9). */
export function EsqueletoGrafico() {
  return <Esqueleto className="h-full w-full" rotulo="Carregando o gráfico." />;
}

/** Contêiner de altura fixa comum ao gráfico e ao seu esqueleto. */
export function CaixaGrafico({ altura, children }: { altura: string; children: ReactNode }) {
  return <div className={`w-full ${altura}`}>{children}</div>;
}
