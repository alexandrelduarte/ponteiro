"use client";

/** Casca cliente do gráfico de probabilidade no tempo (o Recharts precisa medir o DOM). */
import { ALTURA, CaixaGrafico } from "@/components/graficos/comum";
import { ProbabilidadeTempoLazy } from "@/components/graficos/carregados";
import type { PontoHistoricoPlotado } from "@/components/historico/serie";

export function GraficoHistorico({
  dados,
  fronteiraMs,
}: {
  dados: PontoHistoricoPlotado[];
  fronteiraMs: number | null;
}) {
  return (
    <CaixaGrafico altura={ALTURA.historico}>
      <ProbabilidadeTempoLazy dados={dados} fronteiraMs={fronteiraMs} />
    </CaixaGrafico>
  );
}
