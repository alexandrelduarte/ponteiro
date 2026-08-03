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

/**
 * Banda de anotação acima da plotagem, em DUAS fileiras.
 *
 * Com os três rótulos na mesma altura, «réplica 2022» e «teste-limite +6,3» se
 * sobrepunham a 390px (−8px de folga medidos, e a troca para mono os alarga
 * ainda mais). Descer o rótulo do meio uma fileira separa exatamente o par que
 * colide e preserva os três textos inteiros nos três viewports — nenhuma
 * palavra é encurtada. O deslocamento é fixo em px, não depende da largura.
 *
 * `MARGEM_TOPO` é a altura da banda; as duas fileiras se assentam a partir do
 * topo da plotagem (`viewBox.y`), então mexer na margem move as duas juntas.
 * A altura do contêiner (`ALTURA.sensibilidade`) já foi acrescida da mesma
 * folga, para a área de plotagem não encolher.
 */
const MARGEM_TOPO = 44;
const RECUO_FILEIRA = [30, 4] as const;
/** Fileira de cada cenário, na ordem de `CENARIOS_VIES` (o do meio desce). */
const FILEIRA_CENARIO = [0, 1, 0] as const;

interface CaixaRotulo {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

function RotuloCenario({
  viewBox,
  texto,
  fileira,
}: {
  viewBox?: CaixaRotulo;
  texto: string;
  fileira: 0 | 1;
}) {
  if (viewBox?.x == null || viewBox.y == null) return null;
  return (
    <text
      className="rotulo-grafico"
      x={viewBox.x}
      y={viewBox.y - RECUO_FILEIRA[fileira]}
      textAnchor="middle"
      fontSize={12}
      fill={COR.cinza}
    >
      {texto}
    </text>
  );
}

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
        margin={{ top: MARGEM_TOPO, right: 10, bottom: 0, left: -22 }}
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
        {CENARIOS_VIES.map((c, i) => (
          <ReferenceLine
            key={c.vies}
            x={c.vies}
            stroke={COR.tinta}
            strokeDasharray="3 3"
            label={<RotuloCenario texto={c.rotulo} fileira={FILEIRA_CENARIO[i] ?? 0} />}
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
            className: "rotulo-grafico",
          }}
        />
        <ReferenceLine
          x={vies}
          stroke={COR.confirma}
          strokeWidth={2}
          label={{
            value: "◆ atual",
            position: "insideBottom",
            fontSize: 12,
            fill: COR.confirma,
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
      </ComposedChart>
    </ResponsiveContainer>
  );
}
