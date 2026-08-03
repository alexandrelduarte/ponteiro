"use client";

/**
 * Evolução — pontos por pesquisa + média ponderada, com alternância 1ºT/2ºT.
 * Domínio Y fixo ([30,55] / [20,50]) de propósito: é o que impede que 0,3 p.p.
 * pareçam um terremoto (P2).
 */
import {
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Scatter,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { PontoGrafico, PontoSerie } from "@/lib/modelo";
import { COR, DicaEvolucao, TICK, ddmmDeMs } from "./comum";

export default function GraficoEvolucao({
  serie,
  pontos,
  turno,
}: {
  serie: PontoSerie[];
  pontos: PontoGrafico[];
  turno: 1 | 2;
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={serie} margin={{ top: 10, right: 10, bottom: 0, left: -18 }}>
        <CartesianGrid stroke={COR.linha} strokeDasharray="2 4" />
        <XAxis
          dataKey="x"
          type="number"
          domain={["dataMin - 259200000", "dataMax + 259200000"]}
          tickFormatter={(t: number) => ddmmDeMs(t)}
          tick={TICK}
          stroke={COR.linha}
          interval="preserveStartEnd"
          minTickGap={48}
        />
        <YAxis
          domain={turno === 2 ? [30, 55] : [20, 50]}
          tickCount={5}
          tick={TICK}
          stroke={COR.linha}
        />
        <Tooltip trigger="click" content={<DicaEvolucao />} />
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
        <Scatter
          data={pontos}
          dataKey="lVal"
          fill={COR.lula}
          fillOpacity={0.55}
          stroke={COR.linhaForte}
          isAnimationActive={false}
        />
        <Scatter
          data={pontos}
          dataKey="fVal"
          fill={COR.flavio}
          fillOpacity={0.55}
          stroke={COR.linhaForte}
          isAnimationActive={false}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
