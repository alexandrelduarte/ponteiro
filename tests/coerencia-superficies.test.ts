/**
 * Coerência ENTRE SUPERFÍCIES — a trava que nasceu do susto do dono (o par
 * 84×82 do hero parecia contradição; é ponte: eleito = 1ºT direto + 2ºT).
 *
 * O modelo em si já é vigiado pelos golden tests (paridade 1e-9). AQUI o que
 * se vigia é a APRESENTAÇÃO: cada par publicado soma 100, cada superfície
 * deriva do mesmo resultado, e a ponte declarada na legenda fecha a conta.
 */
import { describe, expect, it } from "vitest";
import pesquisasSeed from "@/data/pesquisas.seed.json";
import { PARAMS_PADRAO } from "@/data/constantes";
import type { Pesquisa } from "@/data/tipos";
import { rodarModelo } from "@/lib/modelo";
import { montarEnxame } from "@/components/painel/enxame-nucleo";
import { parEmCem } from "@/components/ui/textos";

const SEED = pesquisasSeed as unknown as Pesquisa[];
const HOJE = Date.parse("2026-08-06T09:00:00-03:00");

describe("coerência entre superfícies publicadas", () => {
  const M = rodarModelo(SEED, PARAMS_PADRAO, HOJE)!;

  it("todo par publicado soma 100", () => {
    const [eleitoL, eleitoF] = parEmCem(M.eleito.dia.l);
    const [p2t, p1tDef] = parEmCem(M.p2Tacontece);
    const layout = montarEnxame(M.margemAj, M.sigmaDia2);
    expect(Number(eleitoL) + Number(eleitoF)).toBe(100);
    expect(Number(p2t) + Number(p1tDef)).toBe(100);
    expect(layout.nLula + layout.nFlavio).toBe(100);
  });

  it("manchete = 1ºT direto + p2T × chance no 2ºT (a ponte da legenda)", () => {
    const [eleitoL] = parEmCem(M.eleito.dia.l);
    const reconstruido = (M.p1 ? M.p1.lulaDia : 0) + M.p2Tacontece * M.pL2dia;
    expect(Math.round(reconstruido * 100)).toBe(Number(eleitoL));
  });

  it("o enxame desenha a decisão do 2ºT (pL2dia), não o eleito", () => {
    const layout = montarEnxame(M.margemAj, M.sigmaDia2);
    expect(Math.abs(layout.nLula - M.pL2dia * 100)).toBeLessThanOrEqual(1);
  });

  it("o medidor publica o MESMO inteiro da manchete", () => {
    const [eleitoL] = parEmCem(M.eleito.dia.l);
    expect(Math.round(M.eleito.dia.l * 100)).toBe(Number(eleitoL));
  });

  it("a soma das bolinhas de cada lado do enxame confere com o layout", () => {
    const layout = montarEnxame(M.margemAj, M.sigmaDia2);
    const total = layout.colunas.reduce((s, c) => s + c.qtd, 0);
    expect(total).toBe(100);
  });
});
