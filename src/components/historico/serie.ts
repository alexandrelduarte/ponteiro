/**
 * Preparação PURA da série do /historico: separa o trecho reconstituído
 * (tracejado) do registrado ao vivo (linha cheia) e encontra a fronteira.
 *
 * A COSTURA: o primeiro ponto registrado é duplicado também nas chaves do
 * tracejado (`lR/fR`) — com `connectNulls={false}` no Recharts, é isso que faz
 * o tracejado terminar exatamente SOBRE o primeiro ponto da linha cheia, sem
 * buraco e sem segmento cheio atravessando a fronteira.
 *
 * Se TODOS os pontos forem reconstituídos (estado transitório possível), a
 * fronteira é `null` e tudo vai para o tracejado — o gráfico nunca mente que
 * houve registro ao vivo.
 */
import type { PontoRun } from "@/lib/dados";

export interface PontoHistoricoPlotado {
  /** instante (ms) */
  x: number;
  /** linha CHEIA — registrado no dia */
  l: number | null;
  f: number | null;
  /** linha TRACEJADA — recalculado depois */
  lR: number | null;
  fR: number | null;
  /** para o tooltip dizer a origem */
  retro: boolean;
}

export interface SerieHistorico {
  dados: PontoHistoricoPlotado[];
  /** x do primeiro ponto REGISTRADO; `null` quando tudo é reconstituído */
  fronteiraMs: number | null;
  nRegistrados: number;
  nReconstituidos: number;
}

export function prepararSerieHistorico(runs: readonly PontoRun[]): SerieHistorico {
  const validos = runs
    .filter((r) => r.lula !== null && r.flavio !== null)
    .map((r) => ({
      x: Date.parse(r.em),
      lula: (r.lula as number) * 100,
      flavio: (r.flavio as number) * 100,
      retro: r.origem === "retroativo",
    }))
    .filter((p) => Number.isFinite(p.x))
    .sort((a, b) => a.x - b.x);

  const primeiroRegistrado = validos.find((p) => !p.retro) ?? null;
  const fronteiraMs = primeiroRegistrado ? primeiroRegistrado.x : null;

  const dados: PontoHistoricoPlotado[] = validos.map((p) => ({
    x: p.x,
    l: p.retro ? null : p.lula,
    f: p.retro ? null : p.flavio,
    lR: p.retro || p.x === fronteiraMs ? p.lula : null,
    fR: p.retro || p.x === fronteiraMs ? p.flavio : null,
    retro: p.retro,
  }));

  return {
    dados,
    fronteiraMs,
    nRegistrados: validos.filter((p) => !p.retro).length,
    nReconstituidos: validos.filter((p) => p.retro).length,
  };
}
