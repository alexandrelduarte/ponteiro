"use client";

/** Casca cliente do gráfico de probabilidade no tempo (o Recharts precisa medir o DOM). */
import { ALTURA, CaixaGrafico } from "@/components/graficos/comum";
import { ProbabilidadeTempoLazy } from "@/components/graficos/carregados";
import type { PontoProbabilidade } from "@/components/graficos/probabilidade-tempo";

export function GraficoHistorico({ dados }: { dados: PontoProbabilidade[] }) {
  return (
    <CaixaGrafico altura={ALTURA.historico}>
      <ProbabilidadeTempoLazy dados={dados} />
    </CaixaGrafico>
  );
}
