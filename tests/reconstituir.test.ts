/**
 * Reconstituição retroativa — núcleo puro e orquestração mockada.
 *
 * A premissa central sob teste: o modelo NUNCA pode enxergar pesquisa cujo
 * campo terminou depois da data reconstituída (o agregado 2ºT não filtra o
 * futuro sozinho), e o backfill NUNCA toca snapshots que não sejam
 * `retroativo`.
 */
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const mocks = vi.hoisted(() => ({
  criarClienteAdmin: vi.fn(),
  registrarAuditoria: vi.fn(async () => undefined),
  getPesquisasPublicadasDoBanco: vi.fn(),
}));
vi.mock("@/lib/supabase/admin", () => ({
  criarClienteAdmin: mocks.criarClienteAdmin,
  registrarAuditoria: mocks.registrarAuditoria,
}));
vi.mock("@/lib/dados", () => ({
  getPesquisasPublicadasDoBanco: mocks.getPesquisasPublicadasDoBanco,
}));

import pesquisasSeed from "@/data/pesquisas.seed.json";
import { PARAMS_PADRAO } from "@/data/constantes";
import type { Pesquisa } from "@/data/tipos";
import { rodarModelo } from "@/lib/modelo";
import {
  executarReconstituicao,
  gerarDatasAlvo,
  HORA_SNAPSHOT,
  reconstituirSerie,
  TETO_PONTOS,
} from "@/lib/reconstituir";

const SEED = pesquisasSeed as unknown as Pesquisa[];

describe("gerarDatasAlvo", () => {
  it("diária: conta os dias certos e para na véspera da fronteira", () => {
    const datas = gerarDatasAlvo("2026-01-11", "2026-01-15", "diaria");
    expect(datas).toEqual(["2026-01-11", "2026-01-12", "2026-01-13", "2026-01-14"]);
  });

  it("semanal: passo de 7 dias e SEMPRE inclui a véspera (costura)", () => {
    const datas = gerarDatasAlvo("2026-01-11", "2026-01-28", "semanal");
    expect(datas[0]).toBe("2026-01-11");
    expect(datas).toContain("2026-01-18");
    expect(datas[datas.length - 1]).toBe("2026-01-27");
  });

  it("fronteira igual ou anterior ao primeiro fim → vazio", () => {
    expect(gerarDatasAlvo("2026-01-11", "2026-01-11", "diaria")).toEqual([]);
    expect(gerarDatasAlvo("2026-01-11", "2025-12-01", "diaria")).toEqual([]);
  });

  it("estourar o teto lança em vez de gravar uma série absurda", () => {
    expect(() => gerarDatasAlvo("2024-01-01", "2026-08-01", "diaria")).toThrow(
      new RegExp(String(TETO_PONTOS)),
    );
  });
});

describe("reconstituirSerie (puro)", () => {
  it("em 2026-02-01 só a pesquisa de janeiro é conhecida — e o resultado é o do modelo com ELA", () => {
    const [ponto] = reconstituirSerie(SEED, PARAMS_PADRAO, ["2026-02-01"]);
    expect(ponto.nPesquisas).toBe(1);
    const conhecidas = SEED.filter((p) => p.fim <= "2026-02-01");
    const direto = rodarModelo(conhecidas, PARAMS_PADRAO, Date.parse(`2026-02-01${HORA_SNAPSHOT}`));
    expect(ponto.resultado).toEqual(direto);
  });

  it("pesquisa com campo encerrando DEPOIS da data não entra (o filtro é o teste)", () => {
    const [antes] = reconstituirSerie(SEED, PARAMS_PADRAO, ["2026-03-04"]);
    const [depois] = reconstituirSerie(SEED, PARAMS_PADRAO, ["2026-03-05"]);
    expect(depois.nPesquisas).toBe(antes.nPesquisas + 1);
    expect(antes.resultado.eleito.dia.l).not.toBe(depois.resultado.eleito.dia.l);
  });

  it("datas antes da primeira pesquisa não geram ponto nenhum", () => {
    expect(reconstituirSerie(SEED, PARAMS_PADRAO, ["2026-01-05", "2026-01-10"])).toEqual([]);
  });

  it("todo executadoEm cai às 12:00Z (09:00 em Brasília)", () => {
    const pontos = reconstituirSerie(SEED, PARAMS_PADRAO, ["2026-06-10", "2026-07-01"]);
    for (const p of pontos) expect(p.executadoEm).toMatch(/T12:00:00\.000Z$/);
  });

  it("é determinística: duas chamadas produzem saídas idênticas", () => {
    const datas = ["2026-06-10", "2026-06-20", "2026-07-10"];
    const a = reconstituirSerie(SEED, PARAMS_PADRAO, datas);
    const b = reconstituirSerie(SEED, PARAMS_PADRAO, datas);
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
  });
});

describe("executarReconstituicao (orquestração mockada)", () => {
  interface Chamada {
    tipo: "delete" | "insert";
    linhas?: Record<string, unknown>[];
  }
  let chamadas: Chamada[];

  function clienteFalso(primeiroRegistrado: string | null) {
    return {
      from: (tabela: string) => {
        expect(tabela).toBe("model_runs");
        return {
          select: (colunas: string) => ({
            neq: (col: string, val: string) => {
              expect([col, val]).toEqual(["gatilho", "retroativo"]);
              return {
                order: () => ({
                  limit: () => ({
                    returns: () =>
                      Promise.resolve({
                        data: primeiroRegistrado ? [{ executado_em: primeiroRegistrado }] : [],
                        error: null,
                      }),
                  }),
                }),
              };
            },
            _colunas: colunas,
          }),
          delete: () => ({
            eq: (col: string, val: string) => {
              expect([col, val]).toEqual(["gatilho", "retroativo"]);
              chamadas.push({ tipo: "delete" });
              return {
                select: () => ({
                  returns: () => Promise.resolve({ data: [{ id: "x" }], error: null }),
                }),
              };
            },
          }),
          insert: (linhas: Record<string, unknown>[]) => {
            chamadas.push({ tipo: "insert", linhas });
            return Promise.resolve({ error: null });
          },
        };
      },
    };
  }

  beforeEach(() => {
    chamadas = [];
    vi.clearAllMocks();
  });

  it("aborta sem escrever quando a série do banco está indisponível (nunca usa o seed)", async () => {
    mocks.criarClienteAdmin.mockReturnValue(clienteFalso("2026-08-05T12:00:00Z"));
    mocks.getPesquisasPublicadasDoBanco.mockResolvedValue(null);
    const resumo = await executarReconstituicao("teste");
    expect(resumo.ok).toBe(false);
    expect(chamadas).toEqual([]);
    expect(mocks.registrarAuditoria).not.toHaveBeenCalled();
  });

  it("delete dos retroativos vem ANTES dos inserts; lotes têm gatilho e executado_em explícitos", async () => {
    mocks.criarClienteAdmin.mockReturnValue(clienteFalso("2026-08-05T12:00:00.000Z"));
    mocks.getPesquisasPublicadasDoBanco.mockResolvedValue(SEED);
    const resumo = await executarReconstituicao("teste", "diaria");

    expect(resumo.ok).toBe(true);
    expect(chamadas[0].tipo).toBe("delete");
    const inserts = chamadas.filter((c) => c.tipo === "insert");
    expect(inserts.length).toBeGreaterThan(1); // lotes de 50
    for (const c of inserts) {
      expect(c.linhas!.length).toBeLessThanOrEqual(50);
      for (const linha of c.linhas!) {
        expect(linha.gatilho).toBe("retroativo");
        expect(typeof linha.executado_em).toBe("string");
        expect(linha.n_pesquisas).toBeGreaterThan(0);
      }
    }
    // série diária 11/01 → 04/08 (véspera da fronteira em SP)
    expect(resumo.de).toBe("2026-01-11");
    expect(resumo.ate).toBe("2026-08-04");
    expect(resumo.inseridos).toBeGreaterThan(190);

    expect(mocks.registrarAuditoria).toHaveBeenCalledWith(
      expect.objectContaining({
        acao: "reconstituicao",
        entidade: "model_runs",
        detalhes: expect.objectContaining({ cadencia: "diaria", pontos: resumo.inseridos }),
      }),
    );
  });

  it("sem banco configurado → falha limpa", async () => {
    mocks.criarClienteAdmin.mockReturnValue(null);
    const resumo = await executarReconstituicao("teste");
    expect(resumo).toEqual({ ok: false, motivo: "banco não configurado" });
  });
});
