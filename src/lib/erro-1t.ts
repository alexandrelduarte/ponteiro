/**
 * ERRO DAS PESQUISAS NO 1º TURNO DE 2026 — pesquisas de véspera × urna.
 *
 * Regra fixa e pública (DECISOES.md, /metodologia): média SIMPLES, em votos
 * válidos, das pesquisas oficiais com campo encerrado na última semana antes do
 * 1º turno (27/09 a 03/10/2026) que divulgaram Lula, Flávio e branco/nulo/não
 * sabe. Média simples, e não a ponderada do painel, para ser a mesma conta que
 * mediu o erro de 2022 (ERRO_2022) — comparável, auditável à mão.
 *
 * Puro: depende só da lista de pesquisas e do resultado oficial.
 */
import type { Pesquisa } from "@/data/tipos";
import { pct1T } from "@/data/resultado-1t";

export const JANELA_VESPERA_1T = { de: "2026-09-27", ate: "2026-10-03" } as const;

export interface Erro1T {
  /** quantas pesquisas entraram na média */
  k: number;
  /** média das pesquisas, em votos válidos */
  pesqL: number;
  pesqF: number;
  /** urna, em votos válidos */
  urnaL: number;
  urnaF: number;
  /** erro na DIFERENÇA (pesquisas − urna), em pontos; positivo = puxada a favor de Lula */
  erroMargem: number;
}

export function calcErro1T(pesquisas: readonly Pesquisa[]): Erro1T | null {
  const vespera = pesquisas.filter(
    (p) =>
      !p.usuario &&
      p.fim >= JANELA_VESPERA_1T.de &&
      p.fim <= JANELA_VESPERA_1T.ate &&
      p.t1 != null &&
      p.t1.lula != null &&
      p.t1.flavio != null &&
      p.t1.bnns != null &&
      p.t1.bnns < 100,
  );
  if (!vespera.length) return null;
  const validos = vespera.map((p) => {
    const base = 100 - (p.t1!.bnns as number);
    return { l: (100 * (p.t1!.lula as number)) / base, f: (100 * (p.t1!.flavio as number)) / base };
  });
  const pesqL = validos.reduce((s, v) => s + v.l, 0) / validos.length;
  const pesqF = validos.reduce((s, v) => s + v.f, 0) / validos.length;
  const urnaL = pct1T("Lula");
  const urnaF = pct1T("Flávio Bolsonaro");
  return {
    k: validos.length,
    pesqL,
    pesqF,
    urnaL,
    urnaF,
    erroMargem: pesqL - pesqF - (urnaL - urnaF),
  };
}
