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
import { fmt, type PontoSens } from "@/lib/modelo";
import { COR, DicaSensibilidade, TICK } from "./comum";

/** Domínio do eixo x, em pontos de puxada suposta. */
const DOMINIO_X: [number, number] = [-3, 10];

/** Onde um valor de x cai no domínio, de 0 (borda esquerda) a 1 (direita). */
const fracaoX = (v: number) =>
  Math.min(1, Math.max(0, (v - DOMINIO_X[0]) / (DOMINIO_X[1] - DOMINIO_X[0])));

/**
 * Banda de anotação ACIMA da plotagem, em quatro fileiras.
 *
 * O que mudou na Fase 7, e por quê (todos eram colisões medidas no print):
 *
 *  1. **Cada rótulo é ancorado à sua vertical por um filete de chamada.** As
 *     três frases ficavam empilhadas e centralizadas acima do gráfico, sem
 *     nada ligando cada uma à linha que ela nomeia — e duas dessas linhas eram
 *     tracejados claros indistinguíveis da grade.
 *  2. **A âncora de texto sai da POSIÇÃO, não do índice da fileira.** Rótulo
 *     perto da borda esquerda alinha à esquerda; perto da direita, à direita;
 *     no meio, centralizado. Assim nenhum sai da área do cartão a 390px.
 *  3. **"onde você está" subiu para a banda**, na fileira mais alta: dentro da
 *     plotagem ele caía em cima da linha azul, e é justamente o rótulo que se
 *     move quando o leitor arrasta a régua.
 *  4. **O rótulo do ponto de virada saiu de dentro da plotagem** — ele cruzava
 *     as duas curvas e dois tracejados, com a palavra "virada" riscada por um
 *     deles. O ponto preto continua no lugar e a frase logo abaixo do gráfico
 *     já diz, com o mesmo número, o que ele é.
 */
const MARGEM_TOPO = 84;
const RECUO_FILEIRA = [66, 48, 30, 12] as const;

export interface CenarioMarcado {
  vies: number;
  rotulo: string;
}

interface CaixaRotulo {
  x?: number;
  y?: number;
  width?: number;
}

/**
 * Alinhamento do texto pela posição do rótulo no DOMÍNIO, não na geometria: a
 * fração vem do próprio valor de x contra `DOMINIO_X`, então não depende de
 * como o Recharts preenche o `viewBox` do rótulo em cada versão.
 */
function ancora(t: number): "start" | "middle" | "end" {
  if (t < 0.18) return "start";
  if (t > 0.82) return "end";
  return "middle";
}

function RotuloAncorado({
  viewBox,
  texto,
  fileira,
  cor,
  t,
}: {
  viewBox?: CaixaRotulo;
  texto: string;
  fileira: 0 | 1 | 2 | 3;
  cor: string;
  /** posição do rótulo no domínio do eixo x, de 0 a 1 */
  t: number;
}) {
  if (viewBox?.x == null || viewBox.y == null) return null;
  const y = viewBox.y - RECUO_FILEIRA[fileira];
  return (
    <g>
      {/* O filete de chamada: do rótulo até o topo da vertical que ele nomeia. */}
      <line x1={viewBox.x} y1={y + 4} x2={viewBox.x} y2={viewBox.y} stroke={cor} strokeWidth={1} />
      <text
        className="rotulo-grafico"
        x={viewBox.x}
        y={y}
        textAnchor={ancora(t)}
        fontSize={13}
        fill={cor}
      >
        {texto}
      </text>
    </g>
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
          domain={DOMINIO_X}
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

        {/* A metade a metade fica à DIREITA: à esquerda ela era atravessada
            pela vertical ameixa, que no padrão mora em x = 0. */}
        <ReferenceLine
          y={50}
          stroke={COR.tintaMedia}
          strokeDasharray="4 3"
          label={{
            value: "metade a metade",
            position: "insideBottomRight",
            fontSize: 13,
            fill: COR.tintaMedia,
            className: "rotulo-grafico",
          }}
        />
        {/* Verticais dos cenários em tinta média e tracejado longo: contra a
            grade (`grade`, 1px, 2 4) elas eram invisíveis. */}
        {cenarios.map((c, i) => (
          <ReferenceLine
            key={c.vies}
            x={c.vies}
            stroke={COR.tintaMedia}
            strokeWidth={1.5}
            strokeDasharray="6 3"
            label={
              <RotuloAncorado
                texto={c.rotulo}
                fileira={((i % 3) + 1) as 1 | 2 | 3}
                cor={COR.tintaMedia}
                t={fracaoX(c.vies)}
              />
            }
          />
        ))}
        <ReferenceDot
          x={Math.round(margem * 100) / 100}
          y={50}
          r={5}
          fill={COR.tinta}
          stroke={COR.placa}
          strokeWidth={2}
        />
        <ReferenceLine
          x={vies}
          stroke={COR.ameixa}
          strokeWidth={2}
          label={
            <RotuloAncorado texto="onde você está" fileira={0} cor={COR.ameixa} t={fracaoX(vies)} />
          }
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
