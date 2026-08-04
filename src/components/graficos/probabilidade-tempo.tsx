"use client";

/**
 * Chance de ser eleito ao longo do tempo (/historico) — um ponto por retrato
 * gravado em `model_runs`. Sem banco, a página mostra o estado vazio e este
 * gráfico nem é montado.
 *
 * NOTA DE HONESTIDADE: não há faixa de dúvida aqui porque o retrato exposto ao
 * leitor público (`getSerieRuns`) guarda só as duas chances do dia, sem a
 * dúvida daquele dia. Desenhar uma faixa a partir de um número que o modelo não
 * publicou seria fabricar precisão (H11/H14) — então a referência que fica é a
 * régua de "metade a metade", em tinta, como no resto do produto.
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
  /** instante do retrato (ms) */
  x: number;
  /** chance de Lula, em cada 100 */
  l: number | null;
  /** chance de Flávio, em cada 100 */
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
      <div className="mt-1 numeros">
        <span className="text-lula">Lula: {l === null ? "–" : `${Math.round(l)} em 100`}</span>
        {" · "}
        <span className="text-flavio">Flávio: {f === null ? "–" : `${Math.round(f)} em 100`}</span>
      </div>
    </MolduraDica>
  );
}

export default function GraficoProbabilidadeTempo({ dados }: { dados: PontoProbabilidade[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={dados} margin={{ top: 10, right: 26, bottom: 0, left: -6 }}>
        <CartesianGrid stroke={COR.grade} strokeDasharray="2 4" />
        <XAxis
          dataKey="x"
          type="number"
          domain={["dataMin", "dataMax"]}
          tickFormatter={(t: number) => ddmmDeMs(t)}
          tick={TICK}
          stroke={COR.contorno}
          interval="preserveStartEnd"
          minTickGap={52}
        />
        <YAxis
          domain={[0, 100]}
          ticks={[0, 25, 50, 75, 100]}
          tick={TICK}
          stroke={COR.contorno}
          width={44}
        />
        <Tooltip trigger="click" content={<Dica />} />
        <ReferenceLine
          y={50}
          stroke={COR.tinta}
          strokeWidth={2}
          label={{
            value: "metade a metade",
            position: "insideBottomLeft",
            fontSize: 13,
            fill: COR.tinta,
            className: "rotulo-grafico",
          }}
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
      </LineChart>
    </ResponsiveContainer>
  );
}
