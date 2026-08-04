"use client";

/**
 * Evolução da DIFERENÇA no tempo, com a faixa da dúvida dominante
 * (docs/DESIGN-V2.md §5.3).
 *
 * O que mudou em relação à v1, e por quê: a v1 desenhava dois níveis de
 * intenção de voto (30–55%), e ali "empate" não é altura nenhuma — os dois
 * números não somam 100. Aqui o eixo é a DIFERENÇA, então o zero é literalmente
 * o empate, "Lula na frente ↑" e "Flávio na frente ↓" são verdade geométrica,
 * e a mesma régua do enxame reaparece deitada. Os dados são os mesmos: a média
 * ponderada do painel ponto a ponto e cada pesquisa como um ponto.
 *
 * A FAIXA é a forma principal; a média é uma linha ameixa DENTRO dela. A faixa
 * tem borda obrigatória (é ela que cumpre o 3:1 de objeto gráfico), e a borda
 * vira TRACEJADA depois de hoje para separar observado de projetado — sem
 * nenhum token de cor novo.
 *
 * A projeção não inventa número: o centro é a margem ajustada que o painel já
 * publica, e a largura cresce pela MESMA fórmula do modelo,
 * `hypot(sigmaHoje, coefDeriva × √dias)`, que fecha exatamente em `sigmaDia`
 * no dia da votação.
 */
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { PontoGrafico, PontoSerie } from "@/lib/modelo";
import { COR, DicaEvolucao, TICK, ddmmDeMs } from "./comum";

export interface PropsEvolucao {
  serie: PontoSerie[];
  pontos: PontoGrafico[];
  /** instante de referência do modelo (fim do observado) */
  hojeMs: number;
  /** dia da votação do turno exibido */
  eleicaoMs: number;
  /** centro da projeção: a diferença ajustada pela puxada suposta */
  centroProjetado: number;
  /** dúvida de hoje (± pontos) */
  sigmaHoje: number;
  /** coeficiente da deriva — o quanto a corrida ainda pode andar */
  coefDeriva: number;
}

interface PontoPlotado {
  x: number;
  /** diferença observada (Lula − Flávio) */
  dif?: number;
  l?: number;
  f?: number;
  faixa?: [number, number];
  proj?: [number, number];
}

const PASSOS_PROJECAO = 8;

export default function GraficoEvolucao({
  serie,
  pontos,
  hojeMs,
  eleicaoMs,
  centroProjetado,
  sigmaHoje,
  coefDeriva,
}: PropsEvolucao) {
  const observado: PontoPlotado[] = serie.map((p) => ({
    x: p.x,
    dif: p.l - p.f,
    l: p.l,
    f: p.f,
    faixa: [p.l - p.f - sigmaHoje, p.l - p.f + sigmaHoje],
  }));

  const projetado: PontoPlotado[] = [];
  if (eleicaoMs > hojeMs) {
    for (let i = 0; i <= PASSOS_PROJECAO; i++) {
      const t = hojeMs + ((eleicaoMs - hojeMs) * i) / PASSOS_PROJECAO;
      const dias = Math.max(0, (eleicaoMs - t) / 864e5);
      const restante = Math.max(0, (eleicaoMs - hojeMs) / 864e5) - dias;
      const sigma = Math.hypot(sigmaHoje, coefDeriva * Math.sqrt(restante));
      projetado.push({ x: t, proj: [centroProjetado - sigma, centroProjetado + sigma] });
    }
  }

  const dados = [...observado, ...projetado].sort((a, b) => a.x - b.x);

  const extremos = dados.flatMap((d) => [
    ...(d.faixa ?? []),
    ...(d.proj ?? []),
    ...(d.dif !== undefined ? [d.dif] : []),
  ]);
  const dosPontos = pontos.map((p) => p.lVal - p.fVal);
  const todos = [...extremos, ...dosPontos, 0];
  const folga = 1.5;
  const dominio: [number, number] = [Math.min(...todos) - folga, Math.max(...todos) + folga];

  const scatter = pontos.map((p) => ({ ...p, dif: p.lVal - p.fVal }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={dados} margin={{ top: 12, right: 26, bottom: 0, left: -14 }}>
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
          domain={dominio}
          tickFormatter={(v: number) => String(Math.round(v))}
          tick={TICK}
          stroke={COR.contorno}
          width={40}
        />
        <Tooltip trigger="click" content={<DicaEvolucao />} />

        {/* A dúvida, observada: campo lilás com borda. */}
        <Area
          dataKey="faixa"
          fill={COR.faixa}
          fillOpacity={1}
          stroke={COR.faixaBorda}
          strokeWidth={1.5}
          type="monotone"
          connectNulls={false}
          isAnimationActive={false}
        />
        {/* A dúvida, projetada: mesma faixa, borda TRACEJADA. */}
        <Area
          dataKey="proj"
          fill={COR.faixa}
          fillOpacity={1}
          stroke={COR.faixaBorda}
          strokeWidth={1.5}
          strokeDasharray="5 4"
          type="monotone"
          connectNulls={false}
          isAnimationActive={false}
        />

        {/* A régua do empate: a referência do produto inteiro, em tinta. */}
        <ReferenceLine
          y={0}
          stroke={COR.tinta}
          strokeWidth={2}
          label={{
            value: "empate",
            position: "insideTopLeft",
            fontSize: 13,
            fill: COR.tinta,
            className: "rotulo-grafico",
          }}
        />

        {/* A leitura do painel sobre a evidência — ameixa, dentro da faixa. */}
        <Line
          dataKey="dif"
          stroke={COR.ameixa}
          strokeWidth={2.5}
          dot={false}
          type="monotone"
          connectNulls={false}
          isAnimationActive={false}
        />

        {/* Cada pesquisa, do lado em que ela caiu. Duas séries em vez de uma
            forma customizada: a cor sai do LADO da régua, não de um `if` dentro
            do desenho — e o halo em placa garante o limite discernível. */}
        <Scatter
          data={scatter.filter((p) => p.dif >= 0)}
          dataKey="dif"
          fill={COR.lula}
          stroke={COR.placa}
          strokeWidth={2}
          isAnimationActive={false}
        />
        <Scatter
          data={scatter.filter((p) => p.dif < 0)}
          dataKey="dif"
          fill={COR.flavio}
          stroke={COR.placa}
          strokeWidth={2}
          isAnimationActive={false}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
