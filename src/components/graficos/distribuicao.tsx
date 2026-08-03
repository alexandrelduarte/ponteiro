"use client";

/**
 * Densidade da margem projetada (P5): mostra o FORMATO da incerteza e onde
 * fica o zero — a área do outro lado da linha é o "espaço de virada".
 */
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import { fmt, type PontoDist } from "@/lib/modelo";
import { COR, TICK } from "./comum";

export default function GraficoDistribuicao({ dados }: { dados: PontoDist[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={dados} margin={{ top: 10, right: 10, bottom: 0, left: -18 }}>
        <CartesianGrid stroke={COR.linha} strokeDasharray="2 4" />
        <XAxis
          dataKey="x"
          type="number"
          tickFormatter={(v: number) => fmt(v, 0)}
          domain={["dataMin", "dataMax"]}
          tick={TICK}
          stroke={COR.linha}
          interval="preserveStartEnd"
          minTickGap={48}
        />
        <YAxis hide />
        <ReferenceLine x={0} stroke={COR.cinza} strokeWidth={1.5} />
        <Area
          dataKey="flavio"
          stroke={COR.flavio}
          fill={COR.flavio}
          fillOpacity={0.35}
          type="monotone"
          isAnimationActive={false}
        />
        <Area
          dataKey="lula"
          stroke={COR.lula}
          fill={COR.lula}
          fillOpacity={0.35}
          type="monotone"
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
