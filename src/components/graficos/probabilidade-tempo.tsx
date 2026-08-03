"use client";

/**
 * Probabilidade de eleição ao longo do tempo (/historico) — um ponto por
 * snapshot gravado em `model_runs`. Sem banco, a página mostra o estado vazio
 * e este gráfico nem é montado.
 */
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { COR, MolduraDica, TICK, ddmmDeMs, type PropsDica } from "./comum";

export interface PontoProbabilidade {
  /** instante do snapshot (ms) */
  x: number;
  /** chance de Lula em % */
  l: number | null;
  /** chance de Flávio em % */
  f: number | null;
}

function Dica({ active, payload }: PropsDica) {
  if (!active || !payload?.length) return null;
  const pt = payload[0]?.payload;
  if (!pt) return null;
  const x = typeof pt.x === "number" ? pt.x : null;
  const l = typeof pt.l === "number" ? pt.l : null;
  const f = typeof pt.f === "number" ? pt.f : null;
  return (
    <MolduraDica>
      <div>{x === null ? "–" : ddmmDeMs(x)}</div>
      <div className="text-lula-claro">Lula: {l === null ? "–" : `${Math.round(l)}%`}</div>
      <div className="text-flavio-claro">Flávio: {f === null ? "–" : `${Math.round(f)}%`}</div>
    </MolduraDica>
  );
}

export default function GraficoProbabilidadeTempo({ dados }: { dados: PontoProbabilidade[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={dados} margin={{ top: 10, right: 10, bottom: 0, left: -18 }}>
        <CartesianGrid stroke={COR.linha} strokeDasharray="2 4" />
        <XAxis
          dataKey="x"
          type="number"
          domain={["dataMin", "dataMax"]}
          tickFormatter={(t: number) => ddmmDeMs(t)}
          tick={TICK}
          stroke={COR.linha}
          interval="preserveStartEnd"
          minTickGap={48}
        />
        <YAxis
          domain={[0, 100]}
          ticks={[0, 25, 50, 75, 100]}
          tickFormatter={(v: number) => `${v}%`}
          tick={TICK}
          stroke={COR.linha}
        />
        <Tooltip trigger="click" content={<Dica />} />
        <ReferenceLine y={50} stroke={COR.cinza} strokeDasharray="4 3" />
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
      </LineChart>
    </ResponsiveContainer>
  );
}
