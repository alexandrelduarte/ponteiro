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

/**
 * Marcas redondas COM o zero — o zero é o cruzamento de que o gráfico inteiro
 * trata, e o `preserveStartEnd` do Recharts entregava −16, −1, 14, 25: o leitor
 * não conseguia localizar a virada no eixo. Como 0 é múltiplo de qualquer passo,
 * escolher o passo já garante que ele apareça.
 */
function ticksComZero(min: number, max: number, alvo = 5): number[] {
  const passos = [1, 2, 5, 10, 20, 25, 50];
  const passo = passos.find((p) => (max - min) / p <= alvo) ?? passos[passos.length - 1];
  const saida: number[] = [];
  for (let v = Math.ceil(min / passo) * passo; v <= max; v += passo) saida.push(v);
  return saida;
}

export default function GraficoDistribuicao({ dados }: { dados: PontoDist[] }) {
  const xs = dados.map((d) => d.x);
  const ticks = xs.length ? ticksComZero(Math.min(...xs), Math.max(...xs)) : undefined;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={dados} margin={{ top: 18, right: 10, bottom: 0, left: -18 }}>
        <CartesianGrid stroke={COR.linha} strokeDasharray="2 4" />
        <XAxis
          dataKey="x"
          type="number"
          tickFormatter={(v: number) => fmt(v, 0)}
          domain={["dataMin", "dataMax"]}
          ticks={ticks}
          tick={TICK}
          stroke={COR.linha}
        />
        <YAxis hide />
        <ReferenceLine
          x={0}
          stroke={COR.cinza}
          strokeWidth={1.5}
          label={{
            value: "0 · virada",
            position: "top",
            fontSize: 12,
            fill: COR.tinta,
            className: "rotulo-grafico",
          }}
        />
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
