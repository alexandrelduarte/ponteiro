"use client";

/**
 * Curva da puxada suposta — "e se as pesquisas estiverem puxando para um
 * lado?". CLICÁVEL: o toque aplica aquela puxada ao painel inteiro. O caminho
 * acessível equivalente são os três cartões de cenário logo abaixo (botões com
 * `aria-pressed` e alvo ≥44px), porque clique em curva é afordância invisível.
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
import { fmt, fmtSinal, type PontoSens } from "@/lib/modelo";
import { COR, DicaSensibilidade, TICK } from "./comum";

/**
 * Banda de anotação acima da plotagem, em TRÊS fileiras.
 *
 * Os rótulos dos cenários passaram a ser as frases do leitor ("As pesquisas
 * estão certas"), que são mais longas que os rótulos técnicos da v1. Com as
 * três na mesma altura elas se atropelam a 390px; uma fileira para cada, mais
 * a âncora de texto puxada para dentro nas pontas, mantém as três inteiras nos
 * três viewports — nenhuma palavra é encurtada.
 */
const MARGEM_TOPO = 62;
const RECUO_FILEIRA = [48, 30, 12] as const;
const ANCORA = ["start", "middle", "end"] as const;

export interface CenarioMarcado {
  vies: number;
  rotulo: string;
}

interface CaixaRotulo {
  x?: number;
  y?: number;
}

function RotuloCenario({
  viewBox,
  texto,
  fileira,
}: {
  viewBox?: CaixaRotulo;
  texto: string;
  fileira: 0 | 1 | 2;
}) {
  if (viewBox?.x == null || viewBox.y == null) return null;
  return (
    <text
      className="rotulo-grafico"
      x={viewBox.x}
      y={viewBox.y - RECUO_FILEIRA[fileira]}
      textAnchor={ANCORA[fileira]}
      fontSize={13}
      fill={COR.tintaMedia}
    >
      {texto}
    </text>
  );
}

export default function GraficoSensibilidade({
  serie,
  margem,
  vies,
  cenarios,
  onAplicar,
}: {
  serie: PontoSens[];
  margem: number;
  vies: number;
  cenarios: CenarioMarcado[];
  onAplicar: (v: number) => void;
}) {
  const aoClicar = (estado: MouseHandlerDataParam) => {
    const bruto = estado?.activeLabel;
    const v = typeof bruto === "number" ? bruto : Number(bruto);
    if (!Number.isFinite(v)) return;
    onAplicar(Math.round(v * 10) / 10);
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart
        data={serie}
        margin={{ top: MARGEM_TOPO, right: 12, bottom: 0, left: -6 }}
        onClick={aoClicar}
        style={{ cursor: "pointer" }}
      >
        <CartesianGrid stroke={COR.grade} strokeDasharray="2 4" />
        <XAxis
          dataKey="v"
          type="number"
          domain={[-3, 10]}
          ticks={[-2, 0, 2, 4, 6, 8, 10]}
          tickFormatter={(v: number) => fmt(v, 0)}
          tick={TICK}
          stroke={COR.contorno}
        />
        <YAxis
          domain={[0, 100]}
          ticks={[0, 25, 50, 75, 100]}
          tick={TICK}
          stroke={COR.contorno}
          width={44}
        />
        <Tooltip trigger="click" content={<DicaSensibilidade />} />

        <ReferenceLine
          y={50}
          stroke={COR.tintaMedia}
          strokeDasharray="4 3"
          label={{
            value: "metade a metade",
            position: "insideBottomLeft",
            fontSize: 13,
            fill: COR.tintaMedia,
            className: "rotulo-grafico",
          }}
        />
        {cenarios.map((c, i) => (
          <ReferenceLine
            key={c.vies}
            x={c.vies}
            stroke={COR.contorno}
            strokeDasharray="3 3"
            label={<RotuloCenario texto={c.rotulo} fileira={(i % 3) as 0 | 1 | 2} />}
          />
        ))}
        <ReferenceDot
          x={Math.round(margem * 100) / 100}
          y={50}
          r={5}
          fill={COR.tinta}
          stroke={COR.placa}
          strokeWidth={2}
          label={{
            value: `ponto de virada: perto de ${fmtSinal(margem)}`,
            position: "bottom",
            fontSize: 13,
            fill: COR.tinta,
            className: "rotulo-grafico",
          }}
        />
        <ReferenceLine
          x={vies}
          stroke={COR.ameixa}
          strokeWidth={2}
          label={{
            value: "◆ onde você está",
            position: "insideBottom",
            fontSize: 13,
            fill: COR.ameixa,
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
