/**
 * "Próximas pesquisas": janela de recência, variante única, teto de 25/10 e
 * calendário em SP — as condições de veto do carimbo §15, viradas em teste.
 */
import { describe, expect, it } from "vitest";
import { pesquisasDoSeed } from "@/lib/dados";
import { computarProximas, JANELA_RITMO_DIAS } from "@/lib/proximas";

const HOJE = Date.parse("2026-08-07T09:00:00-03:00");
const meioDia = (iso: string) => Date.parse(`${iso}T12:00:00-03:00`);

describe("computarProximas (com a base real do seed, hoje = 07/08/2026)", () => {
  const r = computarProximas(pesquisasDoSeed(), HOJE);

  it("a janela de 120 dias impede a mediana envenenada de janeiro (§15.1)", () => {
    // Sem a janela, Quaest publicava "a cada 92 dias · próxima 13/10" (depois
    // do 1º turno). Com ela, TODAS as previstas caem antes de 25/10 e nenhuma
    // casa publica ritmo acima de 60 dias.
    for (const i of r.institutos) {
      expect(i.ritmoDias).toBeLessThanOrEqual(60);
      expect(i.publicavel).toBe(true);
      expect(meioDia(i.previstaISO)).toBeLessThanOrEqual(meioDia("2026-10-25"));
    }
    const quaest = r.institutos.find((i) => i.institutoId === "quaest");
    expect(quaest).toBeDefined();
    expect(quaest!.ritmoDias).toBe(35); // só o intervalo 08/06→13/07 na janela
  });

  it("com 1 intervalo na janela, a variante é a única (hoje: as 4 casas)", () => {
    expect(r.institutos.length).toBe(4);
    for (const i of r.institutos) expect(i.unico).toBe(true);
  });

  it("casas com 1 pesquisa vão para semRitmo, em ordem alfabética", () => {
    expect(r.semRitmo).toEqual(["Gerp", "Indexa", "Nexus"]);
  });

  it("ordem fixa e neutra: prevista crescente, desempate alfabético", () => {
    for (let k = 1; k < r.institutos.length; k++) {
      const a = r.institutos[k - 1];
      const b = r.institutos[k];
      const cmp = meioDia(a.previstaISO) - meioDia(b.previstaISO);
      expect(cmp < 0 || (cmp === 0 && a.instituto.localeCompare(b.instituto, "pt-BR") <= 0)).toBe(
        true,
      );
    }
  });

  it("atrasada = prevista antes de hoje; e o ritmo é sempre inteiro (H14)", () => {
    for (const i of r.institutos) {
      expect(Number.isInteger(i.ritmoDias)).toBe(true);
      expect(i.atrasada).toBe(meioDia(i.previstaISO) < HOJE);
    }
  });

  it("calendário: dias corridos em SP (07/08 → 15/08 = 8 dias), passados somem", () => {
    const registro = r.eventos.find((e) => e.dataISO === "2026-08-15");
    expect(registro!.faltamDias).toBe(8);
    for (const e of r.eventos) expect(e.faltamDias).toBeGreaterThanOrEqual(0);
    // depois do 2º turno, o calendário zera sozinho
    const depois = computarProximas(pesquisasDoSeed(), meioDia("2026-10-26"));
    expect(depois.eventos.length).toBe(0);
  });

  it("prevista depois de 25/10 não é publicável (§15.6.4)", () => {
    // força o caso: uma casa com 2 pesquisas recentes e ritmo enorme
    const perto = meioDia("2026-10-20");
    const base = pesquisasDoSeed().filter((p) => p.slug!.startsWith("atlasintel"));
    const cenario = computarProximas(base, perto);
    if (cenario.institutos.length) {
      const i = cenario.institutos[0];
      expect(i.publicavel).toBe(meioDia(i.previstaISO) <= meioDia("2026-10-25"));
    }
  });

  it(`é determinístico e a janela é a registrada (${JANELA_RITMO_DIAS} dias)`, () => {
    const b = computarProximas(pesquisasDoSeed(), HOJE);
    expect(JSON.stringify(b)).toBe(JSON.stringify(r));
    expect(JANELA_RITMO_DIAS).toBe(120);
  });
});
