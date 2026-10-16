/**
 * GOLDEN TESTS DO MODELO — paridade numérica exata com o protótipo.
 *
 * Compara TODO o objeto de saída do porte (`src/lib/modelo`) com a cópia verbatim das
 * funções do `agregador-presidencial-2026.jsx` (`tests/reference/original.mjs`), para
 * múltiplas datas fixas, múltiplos conjuntos de parâmetros e vários subconjuntos da série.
 * Tolerância 1e-9 (absoluta ou relativa), strings idênticas, `null` idêntico.
 *
 * Se um destes testes ficar vermelho, o porte mudou o modelo — não é para "ajustar o teste".
 */
import { describe, expect, it } from "vitest";

import { PARAMS_PADRAO } from "@/data/constantes";
import type { ParamsModelo, Pesquisa } from "@/data/tipos";
import * as porte from "@/lib/modelo";
import seedJson from "@/data/pesquisas.seed.json";

import * as orig from "./reference/original.mjs";

/** As 13 rodadas do protótipo — o gabarito só conhece estas; rodadas acrescentadas ao seed
 *  depois (2º turno etc.) ficam fora da paridade de propósito. */
const IDS_PROTOTIPO = new Set([
  "atlas-jul",
  "poder-jul",
  "nexus-jul",
  "dataf-jul",
  "gerp-jul",
  "indexa-jul",
  "quaest-jul",
  "atlas-jun",
  "poder-jun",
  "dataf-jun",
  "quaest-jun",
  "dataf-mar",
  "quaest-jan",
]);
const PESQ = (seedJson as unknown as Pesquisa[]).filter((p) => IDS_PROTOTIPO.has(p.id));

/* ---------------------- comparador profundo ---------------------- */

const TOL = 1e-9;

interface Comparacao {
  divs: string[];
  folhas: number;
}

function iguaisNum(a: number, b: number): boolean {
  if (Number.isNaN(a) || Number.isNaN(b)) return Number.isNaN(a) && Number.isNaN(b);
  if (!Number.isFinite(a) || !Number.isFinite(b)) return Object.is(a, b);
  const d = Math.abs(a - b);
  return d <= TOL || d <= TOL * Math.max(Math.abs(a), Math.abs(b));
}

function tipoDe(v: unknown): string {
  if (v === null) return "null";
  if (Array.isArray(v)) return "array";
  return typeof v;
}

/** Compara recursivamente e devolve o CAMINHO de cada divergência. */
export function quaseIgual(a: unknown, b: unknown, caminho = "raiz"): Comparacao {
  const divs: string[] = [];
  let folhas = 0;

  const anda = (x: unknown, y: unknown, c: string): void => {
    const tx = tipoDe(x),
      ty = tipoDe(y);
    if (tx !== ty) {
      folhas++;
      divs.push(`${c}: tipos diferentes (${tx} × ${ty}) — ${String(x)} × ${String(y)}`);
      return;
    }
    if (tx === "number") {
      folhas++;
      if (!iguaisNum(x as number, y as number))
        divs.push(`${c}: ${x} × ${y} (Δ=${Math.abs((x as number) - (y as number))})`);
      return;
    }
    if (tx === "array") {
      const ax = x as unknown[],
        ay = y as unknown[];
      if (ax.length !== ay.length) {
        folhas++;
        divs.push(`${c}: comprimentos diferentes (${ax.length} × ${ay.length})`);
        return;
      }
      for (let i = 0; i < ax.length; i++) anda(ax[i], ay[i], `${c}[${i}]`);
      return;
    }
    if (tx === "object") {
      const ox = x as Record<string, unknown>,
        oy = y as Record<string, unknown>;
      const kx = Object.keys(ox).sort(),
        ky = Object.keys(oy).sort();
      if (kx.join("|") !== ky.join("|")) {
        folhas++;
        divs.push(`${c}: chaves diferentes ([${kx.join(",")}] × [${ky.join(",")}])`);
        return;
      }
      for (const k of kx) anda(ox[k], oy[k], `${c}.${k}`);
      return;
    }
    folhas++;
    if (!Object.is(x, y)) divs.push(`${c}: ${JSON.stringify(x)} × ${JSON.stringify(y)}`);
  };

  anda(a, b, caminho);
  return { divs, folhas };
}

let totalFolhas = 0;
let totalComparacoes = 0;

/** Assere paridade e contabiliza a cobertura. */
function conferir(recebido: unknown, esperado: unknown, rotulo: string): void {
  const r = quaseIgual(recebido, esperado, rotulo);
  totalFolhas += r.folhas;
  totalComparacoes++;
  expect(r.divs, r.divs.slice(0, 8).join("\n")).toEqual([]);
}

/* ---------------------- matriz de casos ---------------------- */

/** Paridade exata com o protótipo vale ANTES do 1º turno. Depois de 04/10 o porte desvia
 *  de propósito (o protótipo não modelava o pós-1ºT — DECISOES.md); ver `DATAS_POS1T`. */
const DATAS: [string, number][] = [
  ["03/08/2026 (base editorial)", Date.parse("2026-08-03T12:00:00-03:00")],
  ["20/08/2026", Date.parse("2026-08-20T12:00:00-03:00")],
  ["01/10/2026 (véspera do 1ºT)", Date.parse("2026-10-01T12:00:00-03:00")],
  ["04/10/2026 11:59 (último minuto antes do marco)", Date.parse("2026-10-04T11:59:00-03:00")],
];

const DATAS_POS1T: [string, number][] = [
  ["04/10/2026 12:00 (marco do 1ºT)", Date.parse("2026-10-04T12:00:00-03:00")],
  ["16/10/2026 (entre turnos)", Date.parse("2026-10-16T12:00:00-03:00")],
  ["01/11/2026 (pós-eleição, dias=0)", Date.parse("2026-11-01T12:00:00-03:00")],
];

const CONJUNTOS_PARAMS: [string, ParamsModelo][] = [
  ["padrão", PARAMS_PADRAO],
  ["vies=3,1 (réplica 2022)", { ...PARAMS_PADRAO, vies: 3.1 }],
  ["vies=6,3 (teste-limite)", { ...PARAMS_PADRAO, vies: 6.3 }],
  ["vies=−2 (pró-esquerda)", { ...PARAMS_PADRAO, vies: -2 }],
  ["meiaVida=7", { ...PARAMS_PADRAO, meiaVida: 7 }],
  ["meiaVida=45", { ...PARAMS_PADRAO, meiaVida: 45 }],
  ["sigmaSys=0", { ...PARAMS_PADRAO, sigmaSys: 0 }],
  ["coefDeriva=0,7", { ...PARAMS_PADRAO, coefDeriva: 0.7 }],
  ["coefDeriva=0", { ...PARAMS_PADRAO, coefDeriva: 0 }],
  [
    "mv=7 · sig=0 · deriva=0,7 · vies=6,3",
    { meiaVida: 7, sigmaSys: 0, coefDeriva: 0.7, vies: 6.3 },
  ],
  [
    "mv=45 · sig=6 · deriva=0,1 · vies=3,1",
    { meiaVida: 45, sigmaSys: 6, coefDeriva: 0.1, vies: 3.1 },
  ],
  ["mv=3 · sig=8 · deriva=1,2 · vies=−3", { meiaVida: 3, sigmaSys: 8, coefDeriva: 1.2, vies: -3 }],
];

const SUBCONJUNTOS: [string, Pesquisa[]][] = [
  ["série completa (13)", PESQ],
  ["só rodadas sem 1º turno", PESQ.filter((p) => p.t1 == null)],
  ["sem as rodadas de julho", PESQ.filter((p) => p.fim < "2026-07-01")],
  ["só com t1 e bnns divulgados", PESQ.filter((p) => p.t1 != null && p.t1.bnns != null)],
  ["uma pesquisa (com t1)", [PESQ[0]]],
  ["uma pesquisa (sem t1)", PESQ.filter((p) => p.id === "atlas-jun")],
  ["duas do mesmo instituto", PESQ.filter((p) => p.instituto === "Datafolha").slice(0, 2)],
  ["série vazia", []],
];

/** Clone profundo para garantir que porte e gabarito não compartilham objetos. */
const cop = (ps: readonly Pesquisa[]): Pesquisa[] => structuredClone(ps) as Pesquisa[];

/** Roda os dois lados e compara tudo: modelo + todos os derivados. */
function compararTudo(
  pesquisas: readonly Pesquisa[],
  params: ParamsModelo,
  hojeMs: number,
  rot: string,
) {
  const M = porte.rodarModelo(cop(pesquisas), params, hojeMs);
  const O = orig.rodarModelo(cop(pesquisas), params, hojeMs);

  conferir(M, O, `${rot}/rodarModelo`);

  // curva de viés: −3 a +10 em passos de 0,5
  for (let v = -3; v <= 10.0001; v += 0.5) {
    const vv = Math.round(v * 100) / 100;
    conferir(porte.calcVies(M, vv), orig.calcVies(O, vv), `${rot}/calcVies(${vv})`);
  }
  conferir(porte.calcSerieSens(M), orig.serieSens(O), `${rot}/serieSens`);
  conferir(porte.calcDadosDist(M), orig.dadosDist(O), `${rot}/dadosDist`);
  conferir(porte.calcReplay(M), orig.replay(O), `${rot}/replay`);
  conferir(porte.calcCenarioBase(M, params.vies), orig.cenBase(O, params), `${rot}/cenBase`);
  conferir(
    porte.calcCampoCompleto(cop(pesquisas), params.meiaVida, hojeMs),
    orig.campoCompleto(cop(pesquisas), params, hojeMs),
    `${rot}/campoCompleto`,
  );
  conferir(porte.calcPontosGrafico(M, 1), orig.pontosGrafico(O, 1), `${rot}/pontosGrafico(1)`);
  conferir(porte.calcPontosGrafico(M, 2), orig.pontosGrafico(O, 2), `${rot}/pontosGrafico(2)`);
  return M;
}

/* ---------------------- testes ---------------------- */

describe("funções de base", () => {
  it("normCdf idêntico em uma varredura de z", () => {
    for (let z = -8; z <= 8.0001; z += 0.01) {
      const zz = Math.round(z * 1000) / 1000;
      conferir(porte.normCdf(zz), orig.normCdf(zz), `normCdf(${zz})`);
    }
    for (const z of [0, -0, 1e-12, -1e-12, 1e6, -1e6, 40, -40]) {
      conferir(porte.normCdf(z), orig.normCdf(z), `normCdf(${z})`);
    }
  });

  it("meioCampo idêntico em toda a série", () => {
    for (const p of PESQ) conferir(porte.meioCampo(p), orig.meioCampo(p), `meioCampo(${p.id})`);
  });

  it("mediaEm idêntico em várias métricas, datas e meias-vidas", () => {
    const metricas: [string, (p: Pesquisa) => number | null][] = [
      ["t2.lula", (p) => p.t2?.lula ?? null],
      ["t2.flavio", (p) => p.t2?.flavio ?? null],
      ["t1.lula", (p) => p.t1?.lula ?? null],
      ["t1.bnns", (p) => (p.t1 ? p.t1.bnns : null)],
      [
        "válidos t1 lula",
        (p) =>
          p.t1 && p.t1.lula != null && p.t1.bnns != null
            ? (100 * p.t1.lula) / (100 - p.t1.bnns)
            : null,
      ],
      ["sempre null", () => null],
    ];
    for (const [, hoje] of DATAS)
      for (const mv of [3, 7, 21, 45, 120])
        for (const [nome, m] of metricas)
          conferir(
            porte.mediaEm(hoje, cop(PESQ), m, mv),
            orig.mediaEm(hoje, cop(PESQ), m, mv),
            `mediaEm(${nome}, mv=${mv}, ${hoje})`,
          );
  });

  it("tendenciaPareada idêntica (inclusive quirks de null aritmético)", () => {
    const metricas: [string, (p: Pesquisa) => number | null][] = [
      ["t2.lula", (p) => p.t2?.lula ?? null],
      ["t2.margem", (p) => (p.t2 ? (p.t2.lula as number) - (p.t2.flavio as number) : null)],
      ["t1.lula", (p) => p.t1?.lula ?? null],
      [
        "t1.margem",
        (p) => (p.t1 && p.t1.lula != null ? p.t1.lula - (p.t1.flavio as number) : null),
      ],
      ["sempre null", () => null],
    ];
    for (const [, ps] of SUBCONJUNTOS)
      for (const [nome, m] of metricas)
        conferir(
          porte.tendenciaPareada(cop(ps), m),
          orig.tendenciaPareada(cop(ps), m),
          `tendenciaPareada(${nome}, n=${ps.length})`,
        );
  });
});

describe("rodarModelo + derivados — série oficial × datas × parâmetros", () => {
  for (const [rotData, hoje] of DATAS) {
    for (const [rotParams, params] of CONJUNTOS_PARAMS) {
      it(`${rotData} · ${rotParams}`, () => {
        const M = compararTudo(PESQ, params, hoje, `${rotData}|${rotParams}`);
        expect(M).not.toBeNull();
      });
    }
  }
});

describe("rodarModelo + derivados — subconjuntos da série", () => {
  for (const [rotSub, ps] of SUBCONJUNTOS) {
    for (const [rotParams, params] of CONJUNTOS_PARAMS.slice(0, 4)) {
      it(`${rotSub} · ${rotParams}`, () => {
        for (const [rotData, hoje] of DATAS.slice(0, 3))
          compararTudo(ps, params, hoje, `${rotSub}|${rotParams}|${rotData}`);
      });
    }
  }

  it("série vazia devolve null nos dois lados", () => {
    const hoje = DATAS[0][1];
    expect(porte.rodarModelo([], PARAMS_PADRAO, hoje)).toBeNull();
    expect(orig.rodarModelo([], PARAMS_PADRAO, hoje)).toBeNull();
    expect(porte.calcCampoCompleto([], PARAMS_PADRAO.meiaVida, hoje)).toBeNull();
    expect(orig.campoCompleto([], PARAMS_PADRAO, hoje)).toBeNull();
  });

  it("guardas de null nos derivados são idênticas", () => {
    conferir(porte.calcVies(null, 4.2), orig.calcVies(null, 4.2), "calcVies(null)");
    conferir(porte.calcSerieSens(null), orig.serieSens(null), "serieSens(null)");
    conferir(porte.calcDadosDist(null), orig.dadosDist(null), "dadosDist(null)");
    conferir(porte.calcReplay(null), orig.replay(null), "replay(null)");
    conferir(porte.calcCenarioBase(null, 0), orig.cenBase(null, PARAMS_PADRAO), "cenBase(null)");
    conferir(porte.calcPontosGrafico(null, 2), orig.pontosGrafico(null, 2), "pontosGrafico(null)");
  });

  it("rodarModelo não muta a série de entrada", () => {
    const entrada = cop(PESQ);
    const intacta = structuredClone(entrada);
    porte.rodarModelo(entrada, PARAMS_PADRAO, DATAS[0][1]);
    porte.calcCampoCompleto(entrada, PARAMS_PADRAO.meiaVida, DATAS[0][1]);
    expect(entrada).toEqual(intacta);
  });
});

/* ---------------------- pós-1º turno: desvio documentado ---------------------- */

/**
 * Depois de 04/10 o 1º turno já aconteceu e não elegeu ninguém. O porte zera o caminho
 * "ganhar direto no 1º turno" (DECISOES.md — "o protótipo não modelava o pós-1ºT").
 * Aqui o gabarito é o protótipo COM essa única troca aplicada: tudo o que não depende do
 * 1º turno continua idêntico a 1e-9; o que dependia passa a ser o 2º turno puro.
 */
function compararPos1T(
  pesquisas: readonly Pesquisa[],
  params: ParamsModelo,
  hojeMs: number,
  rot: string,
) {
  const M = porte.rodarModelo(cop(pesquisas), params, hojeMs);
  const O = orig.rodarModelo(cop(pesquisas), params, hojeMs);
  if (!O) {
    expect(M).toBeNull();
    return;
  }
  expect(M).not.toBeNull();
  const esperado = {
    ...O,
    p1: null,
    p2Tacontece: 1,
    eleito: {
      hoje: { l: O.pL2hoje, f: 1 - O.pL2hoje },
      dia: { l: O.pL2dia, f: 1 - O.pL2dia },
    },
    // título/texto dependem de `eleito` — conferidos à parte, pela faixa
    titulo: M!.titulo,
    texto: M!.texto,
  };
  conferir(M, esperado, `${rot}/rodarModelo`);

  const pLider = Math.max(O.pL2dia, 1 - O.pL2dia);
  const lider = O.pL2dia >= 0.5 ? "LULA" : "FLÁVIO BOLSONARO";
  if (pLider < 0.6) expect(M!.titulo).toContain("INDEFINIDA");
  else if (pLider < 0.75) expect(M!.titulo).toBe(`${lider} LEVEMENTE FAVORITO`);
  else if (pLider < 0.9) expect(M!.titulo).toContain(`${lider} FAVORITO —`);
  else expect(M!.titulo).toBe(`${lider} AMPLAMENTE FAVORITO`);
  expect(M!.texto).not.toContain(" 0 dias");

  for (let v = -3; v <= 10.0001; v += 0.5) {
    const vv = Math.round(v * 100) / 100;
    const mA = O.margem - vv;
    conferir(
      porte.calcVies(M, vv),
      {
        vies: vv,
        mA,
        elD: orig.normCdf(mA / O.sigmaDia2),
        elH: orig.normCdf(mA / O.sigmaHoje),
      },
      `${rot}/calcVies(${vv})`,
    );
  }
  conferir(porte.calcDadosDist(M), orig.dadosDist(O), `${rot}/dadosDist`);

  const r = porte.calcReplay(M);
  expect(r).not.toBeNull();
  expect(r!.r1L).toBeNull();
  expect(r!.p1Ld).toBeNull();
  expect(r!.pLider1).toBeNull();
  expect(r!.p2Trep).toBe(1);
  expect(r!.elRepD).toBe(r!.pV2rep);
  const ro = orig.replay(O);
  if (ro) {
    conferir(
      { r2L: r!.r2L, r2F: r!.r2F, pV2rep: r!.pV2rep },
      { r2L: ro.r2L, r2F: ro.r2F, pV2rep: ro.pV2rep },
      `${rot}/replay(2ºT)`,
    );
  }

  const cb = porte.calcCenarioBase(M, params.vies);
  expect(cb).not.toBeNull();
  expect(cb!.pDireto).toBe(0);
  expect(cb!.pLulaEm1).toBeNull();
  conferir(cb!.pElei, pLider, `${rot}/cenBase.pElei`);
  const co = orig.cenBase(O, params);
  if (co) {
    conferir(
      { bandas: cb!.bandas, modal: cb!.modal, placarL: cb!.placarL, pV2: cb!.pV2 },
      {
        bandas: co.bandas,
        modal: co.modal,
        placarL: co.placarL,
        pV2: O.pL2dia >= 0.5 ? O.pL2dia : 1 - O.pL2dia,
      },
      `${rot}/cenBase(2ºT)`,
    );
  }

  conferir(
    porte.calcCampoCompleto(cop(pesquisas), params.meiaVida, hojeMs),
    orig.campoCompleto(cop(pesquisas), params, hojeMs),
    `${rot}/campoCompleto`,
  );
  conferir(porte.calcPontosGrafico(M, 1), orig.pontosGrafico(O, 1), `${rot}/pontosGrafico(1)`);
  conferir(porte.calcPontosGrafico(M, 2), orig.pontosGrafico(O, 2), `${rot}/pontosGrafico(2)`);
}

describe("pós-1º turno — protótipo com o caminho do 1ºT zerado", () => {
  for (const [rotData, hoje] of DATAS_POS1T) {
    for (const [rotParams, params] of CONJUNTOS_PARAMS) {
      it(`${rotData} · ${rotParams}`, () => {
        compararPos1T(PESQ, params, hoje, `${rotData}|${rotParams}`);
      });
    }
    for (const [rotSub, ps] of SUBCONJUNTOS) {
      it(`${rotData} · ${rotSub}`, () => {
        compararPos1T(ps, PARAMS_PADRAO, hoje, `${rotData}|${rotSub}`);
      });
    }
  }

  it("entre turnos, a manchete É a chance do 2º turno (a ponte 84×82 vira identidade)", () => {
    const M = porte.rodarModelo(cop(PESQ), PARAMS_PADRAO, DATAS_POS1T[1][1])!;
    expect(M.eleito.dia.l).toBe(M.pL2dia);
    expect(M.eleito.hoje.l).toBe(M.pL2hoje);
    expect(M.p2Tacontece).toBe(1);
    expect(M.p1).toBeNull();
    expect(M.dias1T).toBe(0);
  });
});

describe("veredito (títulos e textos em pt-BR)", () => {
  it("cobre as quatro faixas de probabilidade e o sufixo de viés", () => {
    const vistos = new Set<string>();
    for (const [, hoje] of DATAS)
      for (const vies of [-6, -3, 0, 1.5, 3.1, 4.7, 6.3, 9, 12]) {
        const params = { ...PARAMS_PADRAO, vies };
        const M = porte.rodarModelo(cop(PESQ), params, hoje);
        const O = orig.rodarModelo(cop(PESQ), params, hoje);
        expect(M).not.toBeNull();
        expect(M!.titulo).toBe(O!.titulo);
        expect(M!.texto).toBe(O!.texto);
        totalComparacoes += 2;
        totalFolhas += 2;
        if (M!.titulo.includes("INDEFINIDA")) vistos.add("indefinida");
        else if (M!.titulo.includes("LEVEMENTE")) vistos.add("leve");
        else if (M!.titulo.includes("FAVORITO —")) vistos.add("favorito");
        else if (M!.titulo.includes("AMPLAMENTE")) vistos.add("amplo");
        if (vies !== 0) expect(M!.texto).toContain("Cenário com viés assumido");
      }
    // as quatro faixas de veredito precisam ter sido exercitadas
    expect([...vistos].sort()).toEqual(["amplo", "favorito", "indefinida", "leve"]);
  });
});

describe("formatadores", () => {
  const NUMEROS: (number | null | undefined)[] = [
    0,
    -0,
    1,
    -1,
    4.7,
    -4.7,
    0.05,
    0.5,
    -0.5,
    1.5,
    2.5,
    -2.5,
    1.005,
    0.045,
    99.95,
    -99.95,
    123.456,
    -123.456,
    1e-9,
    -1e-9,
    1e12,
    0.9999999,
    NaN,
    Infinity,
    -Infinity,
    null,
    undefined,
  ];

  it("fmt idêntico (null, NaN, negativos, .5, inteiros, casas 0–3)", () => {
    for (const v of NUMEROS)
      for (const d of [0, 1, 2, 3]) {
        expect(porte.fmt(v, d)).toBe(orig.fmt(v, d));
        totalComparacoes++;
        totalFolhas++;
      }
    expect(porte.fmt(null)).toBe("–");
    expect(porte.fmt(NaN)).toBe("–");
    expect(porte.fmt(4.7)).toBe("4,7");
    expect(porte.fmt(-4.75, 1)).toBe("-4,8");
  });

  it("fmtSinal idêntico (inclusive os quirks null → «+0,0» e NaN → «−–»)", () => {
    for (const v of NUMEROS)
      for (const d of [0, 1, 2]) {
        expect(porte.fmtSinal(v, d)).toBe(orig.fmtSinal(v, d));
        totalComparacoes++;
        totalFolhas++;
      }
    expect(porte.fmtSinal(4.7)).toBe("+4,7");
    expect(porte.fmtSinal(-4.7)).toBe("−4,7");
    expect(porte.fmtSinal(null)).toBe("+0,0");
    expect(porte.fmtSinal(NaN)).toBe("−–");
  });

  it("fmtData idêntico", () => {
    for (const iso of ["2026-07-22", "2026-01-01", "2026-12-31", "", null, undefined]) {
      expect(porte.fmtData(iso)).toBe(orig.fmtData(iso));
      totalComparacoes++;
      totalFolhas++;
    }
    expect(porte.fmtData("2026-07-22")).toBe("22/07");
    expect(porte.fmtData(null)).toBe("–");
  });

  it("pct idêntico", () => {
    for (const p of [0, 0.004, 0.005, 0.5, 0.499, 0.505, 1, 1.2, -0.2, NaN, null, undefined]) {
      expect(porte.pct(p)).toBe(orig.pct(p));
      totalComparacoes++;
      totalFolhas++;
    }
    expect(porte.pct(0.474)).toBe("47%");
    expect(porte.pct(null)).toBe("–");
  });
});

describe("cobertura", () => {
  it("comparou um volume relevante de valores", () => {
    console.log(
      `[golden] ${totalComparacoes} comparações · ${totalFolhas} valores escalares conferidos`,
    );
    expect(totalComparacoes).toBeGreaterThan(2000);
    expect(totalFolhas).toBeGreaterThan(100_000);
  });
});
