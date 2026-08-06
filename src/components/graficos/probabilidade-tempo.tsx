"use client";

/**
 * Chance de ser eleito ao longo do tempo (/historico) — um ponto por retrato
 * em `model_runs`. Sem banco, a página mostra o estado vazio e este gráfico
 * nem é montado.
 *
 * DUAS ORIGENS, DOIS TRAÇOS (missão da série retroativa, DECISOES.md):
 * a linha CHEIA é registro feito no próprio dia; a TRACEJADA foi calculada
 * depois (o painel não existia): a mesma conta rodada em cada data passada só
 * com as pesquisas conhecidas até ali. A fronteira entre as duas é uma linha de referência
 * rotulada — o mesmo padrão observado × projetado do gráfico de evolução da
 * home. A costura (o tracejado encostar na cheia) vem de `serie.ts`, que
 * duplica o ponto-fronteira nas duas séries.
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
import type { PontoHistoricoPlotado } from "@/components/historico/serie";
import { parEmCem } from "@/components/ui/textos";
import {
  COR,
  CURSOR_DICA,
  MolduraDica,
  PONTO_ATIVO,
  TICK,
  ddmmDeMs,
  gatilhoDica,
  type PropsDica,
} from "./comum";

function Dica({ active, payload }: PropsDica) {
  if (!active || !payload?.length) return null;
  const pt = payload[0]?.payload as PontoHistoricoPlotado | undefined;
  if (!pt) return null;
  const x = typeof pt.x === "number" ? pt.x : null;
  const l = pt.l ?? pt.lR;
  // Par publicado soma SEMPRE 100 (H3): arredonda um lado e complementa o
  // outro, com piso/teto de prosa nos extremos (H13) — carimbo §13.4.
  const [lTxt, fTxt] = parEmCem(l === null ? null : l / 100);
  return (
    <MolduraDica>
      <div>{x === null ? "–" : ddmmDeMs(x)}</div>
      <div className="mt-1 numeros">
        <span className="text-lula">Lula: {lTxt} em 100</span>
        {" · "}
        <span className="text-flavio">Flávio: {fTxt} em 100</span>
      </div>
      <div className="mt-1 text-tinta-media">
        {pt.retro ? "calculado depois, com as pesquisas conhecidas até esta data" : "registrado no dia"}
      </div>
    </MolduraDica>
  );
}

export default function GraficoProbabilidadeTempo({
  dados,
  fronteiraMs,
}: {
  dados: PontoHistoricoPlotado[];
  fronteiraMs: number | null;
}) {
  const temReconstituido = dados.some((p) => p.retro);
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
        <Tooltip trigger={gatilhoDica()} cursor={CURSOR_DICA} content={<Dica />} />
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
        {/* A fronteira só existe quando há as DUAS origens na tela. */}
        {fronteiraMs !== null && temReconstituido ? (
          <ReferenceLine
            x={fronteiraMs}
            stroke={COR.ameixaClara}
            strokeWidth={1.5}
            label={{
              value: "daqui em diante, registrado no dia",
              position: "insideTopRight",
              fontSize: 13,
              fill: COR.ameixa,
              className: "rotulo-grafico",
            }}
          />
        ) : null}
        {/* Tracejadas por baixo, cheias por cima; connectNulls false + costura
            em serie.ts fazem a emenda exata na fronteira. */}
        <Line
          dataKey="lR"
          stroke={COR.lula}
          strokeWidth={2.5}
          strokeDasharray="5 4"
          dot={false}
          activeDot={{ ...PONTO_ATIVO, fill: COR.lula }}
          type="monotone"
          connectNulls={false}
          isAnimationActive={false}
        />
        <Line
          dataKey="fR"
          stroke={COR.flavio}
          strokeWidth={2.5}
          strokeDasharray="5 4"
          dot={false}
          activeDot={{ ...PONTO_ATIVO, fill: COR.flavio }}
          type="monotone"
          connectNulls={false}
          isAnimationActive={false}
        />
        <Line
          dataKey="l"
          stroke={COR.lula}
          strokeWidth={2.5}
          dot={false}
          activeDot={{ ...PONTO_ATIVO, fill: COR.lula }}
          type="monotone"
          connectNulls={false}
          isAnimationActive={false}
        />
        <Line
          dataKey="f"
          stroke={COR.flavio}
          strokeWidth={2.5}
          dot={false}
          activeDot={{ ...PONTO_ATIVO, fill: COR.flavio }}
          type="monotone"
          connectNulls={false}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
