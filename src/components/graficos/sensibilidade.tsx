"use client";

/**
 * Curva de sensibilidade ao viés — "e se as pesquisas estiverem erradas de
 * novo?". CLICÁVEL: o clique (ou toque) aplica aquele viés ao painel inteiro.
 * O caminho acessível equivalente são os 3 cartões de cenário logo abaixo.
 */
import {
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceDot,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { MouseHandlerDataParam } from "recharts/types/synchronisation/types";
import { CENARIOS_VIES } from "@/data/constantes";
import { fmt, fmtSinal, type PontoSens } from "@/lib/modelo";
import { COR, DicaSensibilidade, TICK } from "./comum";

export default function GraficoSensibilidade({
  serie,
  margem,
  vies,
  onAplicarVies,
}: {
  serie: PontoSens[];
  margem: number;
  vies: number;
  onAplicarVies: (v: number) => void;
}) {
  const aoClicar = (estado: MouseHandlerDataParam) => {
    const bruto = estado?.activeLabel;
    const v = typeof bruto === "number" ? bruto : Number(bruto);
    if (!Number.isFinite(v)) return;
    onAplicarVies(Math.round(v * 10) / 10);
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart
        data={serie}
        margin={{ top: 18, right: 10, bottom: 0, left: -22 }}
        onClick={aoClicar}
        style={{ cursor: "pointer" }}
      >
        <CartesianGrid stroke={COR.linha} strokeDasharray="2 4" />
        <XAxis
          dataKey="v"
          type="number"
          domain={[-3, 10]}
          ticks={[-2, 0, 2, 4, 6, 8, 10]}
          tickFormatter={(v: number) => fmt(v, 0)}
          tick={TICK}
          stroke={COR.linha}
        />
        <YAxis
          domain={[0, 100]}
          ticks={[0, 25, 50, 75, 100]}
          tickFormatter={(v: number) => `${v}%`}
          tick={TICK}
          stroke={COR.linha}
        />
        <Tooltip trigger="click" content={<DicaSensibilidade />} />
        <ReferenceLine y={50} stroke={COR.cinza} strokeDasharray="4 3" />
        {CENARIOS_VIES.map((c) => (
          <ReferenceLine
            key={c.vies}
            x={c.vies}
            stroke={COR.tinta}
            strokeDasharray="3 3"
            label={{ value: c.rotulo, position: "top", fontSize: 12, fill: COR.cinza }}
          />
        ))}
        <ReferenceDot
          x={Math.round(margem * 100) / 100}
          y={50}
          r={5}
          fill={COR.tinta}
          stroke={COR.linha}
          strokeWidth={1.5}
          label={{
            value: `virada (${fmtSinal(margem)})`,
            position: "bottom",
            fontSize: 12,
            fill: COR.tinta,
          }}
        />
        <ReferenceLine
          x={vies}
          stroke={COR.confirma}
          strokeWidth={2}
          label={{ value: "◆ atual", position: "insideBottom", fontSize: 12, fill: COR.confirma }}
        />
        <Line
          dataKey="l"
          stroke={COR.lula}
          strokeWidth={2.5}
          dot={false}
          type="monotone"
          isAnimationActive={false}
        />
        <Line
          dataKey="f"
          stroke={COR.flavio}
          strokeWidth={2.5}
          dot={false}
          type="monotone"
          isAnimationActive={false}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
