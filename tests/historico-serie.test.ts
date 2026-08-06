/**
 * Preparação da série do /historico — a costura tracejado/cheio e a fronteira.
 */
import { describe, expect, it } from "vitest";
import { prepararSerieHistorico } from "@/components/historico/serie";
import type { PontoRun } from "@/lib/dados";

function run(em: string, l: number, f: number, origem: PontoRun["origem"]): PontoRun {
  return { em, lula: l, flavio: f, origem };
}

describe("prepararSerieHistorico", () => {
  const MISTA = [
    run("2026-08-05T12:00:00Z", 0.84, 0.16, "registrado"),
    run("2026-01-11T12:00:00Z", 0.6, 0.4, "retroativo"),
    run("2026-08-04T12:00:00Z", 0.83, 0.17, "retroativo"),
    run("2026-08-06T12:00:00Z", 0.85, 0.15, "registrado"),
  ];

  it("fronteira é o primeiro REGISTRADO e a série sai ordenada", () => {
    const s = prepararSerieHistorico(MISTA);
    expect(s.fronteiraMs).toBe(Date.parse("2026-08-05T12:00:00Z"));
    expect(s.dados.map((p) => p.x)).toEqual([...s.dados.map((p) => p.x)].sort((a, b) => a - b));
    expect(s.nRegistrados).toBe(2);
    expect(s.nReconstituidos).toBe(2);
  });

  it("costura: o ponto-fronteira vive nas DUAS séries; os demais em uma só", () => {
    const s = prepararSerieHistorico(MISTA);
    const fronteira = s.dados.find((p) => p.x === s.fronteiraMs)!;
    expect(fronteira.l).toBe(84);
    expect(fronteira.lR).toBe(84); // duplicado: o tracejado encosta aqui
    expect(fronteira.retro).toBe(false);

    const retro = s.dados[0];
    expect(retro.l).toBeNull();
    expect(retro.lR).toBe(60);

    const ultimo = s.dados[s.dados.length - 1];
    expect(ultimo.l).toBe(85);
    expect(ultimo.lR).toBeNull();
  });

  it("tudo reconstituído → fronteira null e nada na linha cheia", () => {
    const s = prepararSerieHistorico([
      run("2026-01-11T12:00:00Z", 0.6, 0.4, "retroativo"),
      run("2026-01-12T12:00:00Z", 0.61, 0.39, "retroativo"),
    ]);
    expect(s.fronteiraMs).toBeNull();
    expect(s.dados.every((p) => p.l === null && p.lR !== null)).toBe(true);
  });

  it("pontos com valor nulo são descartados", () => {
    const s = prepararSerieHistorico([
      { em: "2026-08-05T12:00:00Z", lula: null, flavio: 0.2, origem: "registrado" },
      run("2026-08-06T12:00:00Z", 0.85, 0.15, "registrado"),
    ]);
    expect(s.dados.length).toBe(1);
  });
});
