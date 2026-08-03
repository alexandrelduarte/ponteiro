"use client";

/**
 * Gráficos carregados sob demanda.
 *
 * `ssr: false` de propósito: o Recharts mede o contêiner para desenhar, então
 * no servidor ele renderiza vazio e reclamaria de largura 0. O esqueleto tem a
 * altura exata do gráfico, então a troca não move nada na página (CLS 0) — e
 * nenhum NÚMERO do painel depende disto: a manchete já veio do servidor.
 */
import dynamic from "next/dynamic";
import { EsqueletoGrafico } from "./comum";

export const EvolucaoLazy = dynamic(() => import("./evolucao"), {
  ssr: false,
  loading: EsqueletoGrafico,
});

export const DistribuicaoLazy = dynamic(() => import("./distribuicao"), {
  ssr: false,
  loading: EsqueletoGrafico,
});

export const SensibilidadeLazy = dynamic(() => import("./sensibilidade"), {
  ssr: false,
  loading: EsqueletoGrafico,
});

export const ProbabilidadeTempoLazy = dynamic(() => import("./probabilidade-tempo"), {
  ssr: false,
  loading: EsqueletoGrafico,
});
