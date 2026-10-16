/**
 * Fases da eleição e contagem de dias — o calendário que decide o que o painel
 * pode afirmar (1º turno pendente, entre turnos, votação encerrada).
 */
import { describe, expect, it } from "vitest";
import { diasAte2T, diasCorridos, faseEleitoral, primeiroTurnoPendente } from "@/lib/modelo";

const em = (iso: string) => Date.parse(iso);

describe("faseEleitoral", () => {
  it("vira no meio-dia do 1º turno e no fechamento das urnas do 2º (17h de Brasília)", () => {
    expect(faseEleitoral(em("2026-10-04T11:59:00-03:00"))).toBe("pre1T");
    expect(faseEleitoral(em("2026-10-04T12:00:00-03:00"))).toBe("entreTurnos");
    expect(faseEleitoral(em("2026-10-16T09:00:00-03:00"))).toBe("entreTurnos");
    expect(faseEleitoral(em("2026-10-25T16:59:00-03:00"))).toBe("entreTurnos");
    expect(faseEleitoral(em("2026-10-25T17:00:00-03:00"))).toBe("encerrada");
    expect(primeiroTurnoPendente(em("2026-10-03T12:00:00-03:00"))).toBe(true);
    expect(primeiroTurnoPendente(em("2026-10-16T12:00:00-03:00"))).toBe(false);
  });
});

describe("dias corridos em America/Sao_Paulo", () => {
  it("conta DATAS, não instantes: no domingo da votação, de manhã, é 0", () => {
    expect(diasAte2T(em("2026-10-16T09:00:00-03:00"))).toBe(9);
    expect(diasAte2T(em("2026-10-24T23:30:00-03:00"))).toBe(1);
    expect(diasAte2T(em("2026-10-25T07:00:00-03:00"))).toBe(0);
    // 01:00 UTC de 25/10 ainda é 24/10 em Brasília
    expect(diasAte2T(em("2026-10-25T01:00:00Z"))).toBe(1);
    expect(diasCorridos("2026-10-02", em("2026-10-16T12:00:00-03:00"))).toBe(-14);
  });
});
