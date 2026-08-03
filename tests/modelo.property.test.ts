/**
 * PROPERTY TESTS DO MODELO — invariantes que precisam valer para QUALQUER série.
 *
 * Sem dependência nova: os casos são gerados por loops determinísticos (LCG com semente
 * fixa), então a suíte é reprodutível. Aqui não se compara com o gabarito — verifica-se
 * que a matemática do protótipo respeita as garantias que o painel afirma ao leitor
 * (probabilidades são probabilidades, a incerteza só cresce com o tempo, etc.).
 */
import { describe, expect, it } from "vitest";

import { PARAMS_PADRAO } from "@/data/constantes";
import seedJson from "@/data/pesquisas.seed.json";
import type { ParamsModelo, Pesquisa } from "@/data/tipos";
import {
  calcCampoCompleto,
  calcCenarioBase,
  calcDadosDist,
  calcPontosGrafico,
  calcReplay,
  calcSerieSens,
  calcVies,
  meioCampo,
  normCdf,
  rodarModelo,
  type ResultadoModelo,
} from "@/lib/modelo";

/* ---------------------- gerador determinístico ---------------------- */

/** LCG (Numerical Recipes) — determinístico, sem dependência externa. */
function lcg(semente: number): () => number {
  let s = semente >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

const INICIO_2026 = Date.parse("2026-01-01T12:00:00-03:00");
const INSTITUTOS = [
  "AtlasIntel",
  "Datafolha",
  "Genial/Quaest",
  "PoderData",
  "Nexus",
  "Gerp",
  "Indexa",
];
/** amostras realistas e repetidas de propósito (para comparar pesos com o mesmo n) */
const AMOSTRAS = [1000, 2000, 2004, 2400, 5021];

const dataIso = (ms: number) => new Date(ms).toISOString().slice(0, 10);
const arred = (v: number, d = 1) => Math.round(v * 10 ** d) / 10 ** d;

/** Série sintética plausível: datas em 2026, 2ºT sempre presente, 1ºT às vezes. */
function gerarSerie(rnd: () => number, qtd: number): Pesquisa[] {
  const ps: Pesquisa[] = [];
  for (let i = 0; i < qtd; i++) {
    const fimMs = INICIO_2026 + Math.floor(rnd() * 250) * 864e5;
    const inicioMs = fimMs - Math.floor(rnd() * 5) * 864e5;
    const temT1 = rnd() < 0.75;
    const temBnns = rnd() < 0.75;
    ps.push({
      id: `sin-${i}`,
      instituto: INSTITUTOS[Math.floor(rnd() * INSTITUTOS.length)],
      contratante: "sintético",
      inicio: dataIso(inicioMs),
      fim: dataIso(fimMs),
      n: AMOSTRAS[Math.floor(rnd() * AMOSTRAS.length)],
      moe: arred(1 + rnd() * 2, 2),
      tse: "BR-00000/2026",
      t1: temT1
        ? {
            lula: arred(28 + rnd() * 22),
            flavio: arred(20 + rnd() * 25),
            bnns: temBnns ? arred(rnd() * 25) : null,
          }
        : null,
      outros1: temT1
        ? { "Renan Santos": arred(rnd() * 9), "Romeu Zema": arred(rnd() * 6) }
        : undefined,
      t2: { lula: arred(33 + rnd() * 24), flavio: arred(33 + rnd() * 24), bnns: arred(rnd() * 18) },
      fonte: null,
    });
  }
  return ps;
}

const DATAS = [
  Date.parse("2026-08-03T12:00:00-03:00"),
  Date.parse("2026-09-15T12:00:00-03:00"),
  Date.parse("2026-10-04T12:00:00-03:00"),
  Date.parse("2026-11-30T12:00:00-03:00"),
];

const PARAMS: ParamsModelo[] = [
  PARAMS_PADRAO,
  { meiaVida: 7, sigmaSys: 0, coefDeriva: 0.7, vies: 3.1 },
  { meiaVida: 45, sigmaSys: 6, coefDeriva: 0.1, vies: -2 },
  { meiaVida: 21, sigmaSys: 4, coefDeriva: 0.35, vies: 6.3 },
];

/** Todos os cenários (série × params × data) que produzem um modelo. */
interface Cenario {
  rot: string;
  pesquisas: Pesquisa[];
  params: ParamsModelo;
  hojeMs: number;
  M: ResultadoModelo;
}

const CENARIOS: Cenario[] = (() => {
  const rnd = lcg(20261004);
  const out: Cenario[] = [];
  const series: Pesquisa[][] = [seedJson as unknown as Pesquisa[]];
  for (let s = 0; s < 25; s++) series.push(gerarSerie(rnd, 1 + (s % 12)));
  for (const [s, pesquisas] of series.entries()) {
    for (const params of PARAMS)
      for (const hojeMs of DATAS) {
        const M = rodarModelo(pesquisas, params, hojeMs);
        if (M)
          out.push({
            rot: `serie#${s}(n=${pesquisas.length}) mv=${params.meiaVida} vies=${params.vies} @${dataIso(hojeMs)}`,
            pesquisas,
            params,
            hojeMs,
            M,
          });
      }
  }
  return out;
})();

const dentro01 = (v: number, rot: string) => {
  expect(Number.isFinite(v), `${rot} não é finito: ${v}`).toBe(true);
  expect(v, `${rot} fora de [0,1]: ${v}`).toBeGreaterThanOrEqual(0);
  expect(v, `${rot} fora de [0,1]: ${v}`).toBeLessThanOrEqual(1);
};

/* ---------------------- invariantes ---------------------- */

describe("gerador de cenários", () => {
  it("produz uma massa relevante de casos válidos", () => {
    console.log(`[property] ${CENARIOS.length} cenários (série × parâmetros × data)`);
    expect(CENARIOS.length).toBeGreaterThan(300);
    expect(CENARIOS.some((c) => c.M.p1 !== null)).toBe(true);
    expect(CENARIOS.some((c) => c.M.p1 === null)).toBe(true);
  });
});

describe("normCdf", () => {
  it("devolve sempre uma probabilidade em [0,1]", () => {
    for (let z = -50; z <= 50.0001; z += 0.01)
      dentro01(normCdf(Math.round(z * 100) / 100), `normCdf(${z})`);
    for (const z of [0, -0, 1e-15, -1e-15, 1e9, -1e9, Number.MAX_SAFE_INTEGER])
      dentro01(normCdf(z), `normCdf(${z})`);
  });

  it("é monotônica não-decrescente", () => {
    let ant = normCdf(-40);
    for (let z = -40; z <= 40.0001; z += 0.005) {
      const v = normCdf(Math.round(z * 1000) / 1000);
      expect(v, `normCdf caiu em z=${z}`).toBeGreaterThanOrEqual(ant - 1e-15);
      ant = v;
    }
  });
});

describe("rodarModelo — invariantes de probabilidade e incerteza", () => {
  it("todas as probabilidades estão em [0,1]", () => {
    for (const { rot, M } of CENARIOS) {
      dentro01(M.pL2hoje, `${rot}/pL2hoje`);
      dentro01(M.pL2dia, `${rot}/pL2dia`);
      dentro01(M.p2Tacontece, `${rot}/p2Tacontece`);
      dentro01(M.eleito.hoje.l, `${rot}/eleito.hoje.l`);
      dentro01(M.eleito.hoje.f, `${rot}/eleito.hoje.f`);
      dentro01(M.eleito.dia.l, `${rot}/eleito.dia.l`);
      dentro01(M.eleito.dia.f, `${rot}/eleito.dia.f`);
      if (M.p1) {
        dentro01(M.p1.lulaHoje, `${rot}/p1.lulaHoje`);
        dentro01(M.p1.flavioHoje, `${rot}/p1.flavioHoje`);
        dentro01(M.p1.lulaDia, `${rot}/p1.lulaDia`);
        dentro01(M.p1.flavioDia, `${rot}/p1.flavioDia`);
      }
    }
  });

  it("as chances dos dois candidatos somam exatamente 1", () => {
    for (const { rot, M } of CENARIOS) {
      expect(Math.abs(M.eleito.hoje.l + M.eleito.hoje.f - 1), `${rot}/hoje`).toBeLessThanOrEqual(
        1e-12,
      );
      expect(Math.abs(M.eleito.dia.l + M.eleito.dia.f - 1), `${rot}/dia`).toBeLessThanOrEqual(
        1e-12,
      );
    }
  });

  it("sigmaDia2 ≥ sigmaHoje ≥ 0,8 (o piso 0,8 é do seAgora) e sigmaDia1 ≥ sigmaHoje", () => {
    for (const { rot, M } of CENARIOS) {
      expect(M.seAgora, `${rot}/seAgora`).toBeGreaterThanOrEqual(0.8);
      expect(M.sigmaHoje, `${rot}/sigmaHoje ≥ seAgora`).toBeGreaterThanOrEqual(M.seAgora - 1e-12);
      expect(M.sigmaHoje, `${rot}/sigmaHoje ≥ 0,8`).toBeGreaterThanOrEqual(0.8);
      expect(M.sigmaDia2, `${rot}/sigmaDia2 ≥ sigmaHoje`).toBeGreaterThanOrEqual(
        M.sigmaHoje - 1e-12,
      );
      expect(M.sigmaDia1, `${rot}/sigmaDia1 ≥ sigmaHoje`).toBeGreaterThanOrEqual(
        M.sigmaHoje - 1e-12,
      );
      expect(M.deriva1, `${rot}/deriva1`).toBeGreaterThanOrEqual(0);
      expect(M.deriva2, `${rot}/deriva2`).toBeGreaterThanOrEqual(0);
    }
  });

  it("o intervalo de 80% contém a margem ajustada", () => {
    for (const { rot, M } of CENARIOS) {
      expect(M.int80[0], `${rot}/int80 inferior`).toBeLessThanOrEqual(M.margemAj);
      expect(M.margemAj, `${rot}/int80 superior`).toBeLessThanOrEqual(M.int80[1]);
      expect(M.int80[1] - M.int80[0], `${rot}/largura do int80`).toBeCloseTo(
        2 * 1.2816 * M.sigmaDia2,
        9,
      );
    }
  });

  it("linhas: ordenadas por meio de campo, pesos positivos e teto 1,5", () => {
    for (const { rot, M } of CENARIOS) {
      for (let i = 1; i < M.linhas.length; i++)
        expect(meioCampo(M.linhas[i - 1]), `${rot}/ordem`).toBeLessThanOrEqual(
          meioCampo(M.linhas[i]),
        );
      for (const l of M.linhas) {
        expect(l.w, `${rot}/w > 0`).toBeGreaterThan(0);
        expect(l.w, `${rot}/w ≤ 1,5`).toBeLessThanOrEqual(1.5);
        expect(l.idadeDias, `${rot}/idade ≥ 0`).toBeGreaterThanOrEqual(0);
        expect(l.margem2).toBeCloseTo(l.t2.lula - l.t2.flavio, 12);
      }
      expect(M.dias1T, `${rot}/dias1T`).toBeGreaterThanOrEqual(0);
      expect(M.dias2T, `${rot}/dias2T`).toBeGreaterThanOrEqual(M.dias1T);
      expect(Number.isInteger(M.dias1T) && Number.isInteger(M.dias2T)).toBe(true);
      expect(M.validoL2, `${rot}/validoL2`).toBeGreaterThan(0);
      expect(M.validoL2, `${rot}/validoL2`).toBeLessThan(100);
    }
  });

  it("pesos decrescem com a idade quando a amostra é a mesma", () => {
    let pares = 0;
    for (const { rot, M } of CENARIOS) {
      for (let i = 0; i < M.linhas.length; i++)
        for (let j = i + 1; j < M.linhas.length; j++) {
          const a = M.linhas[i],
            b = M.linhas[j];
          if (a.n !== b.n || a.idadeDias === b.idadeDias) continue;
          pares++;
          const maisVelha = a.idadeDias > b.idadeDias ? a : b;
          const maisNova = a.idadeDias > b.idadeDias ? b : a;
          expect(maisVelha.w, `${rot}/peso da mais velha`).toBeLessThan(maisNova.w);
        }
    }
    expect(pares, "nenhum par comparável — o teste seria vazio").toBeGreaterThan(50);
  });

  it("série sintética com n idêntico: peso é estritamente decrescente na idade", () => {
    const base: Pesquisa[] = [0, 6, 13, 27, 55, 90].map((d, i) => ({
      id: `w-${i}`,
      instituto: `Inst ${i}`,
      contratante: "sintético",
      inicio: dataIso(Date.parse("2026-07-30T12:00:00-03:00") - d * 864e5),
      fim: dataIso(Date.parse("2026-07-30T12:00:00-03:00") - d * 864e5),
      n: 2000,
      moe: 2,
      tse: "BR-00000/2026",
      t1: { lula: 40, flavio: 32, bnns: 12 },
      t2: { lula: 47, flavio: 43, bnns: 10 },
      fonte: null,
    }));
    for (const mv of [3, 7, 21, 45, 120]) {
      const M = rodarModelo(base, { ...PARAMS_PADRAO, meiaVida: mv }, DATAS[0]);
      expect(M).not.toBeNull();
      const ordenadas = [...M!.linhas].sort((a, b) => a.idadeDias - b.idadeDias);
      for (let i = 1; i < ordenadas.length; i++) {
        expect(ordenadas[i].idadeDias).toBeGreaterThan(ordenadas[i - 1].idadeDias);
        expect(ordenadas[i].w, `mv=${mv}`).toBeLessThan(ordenadas[i - 1].w);
      }
    }
  });
});

describe("curva de viés", () => {
  it("elD e elH são monotônicas não-crescentes no viés (favorecem Lula cada vez menos)", () => {
    for (const { rot, M } of CENARIOS) {
      let antD = Infinity,
        antH = Infinity;
      for (let v = -5; v <= 12.0001; v += 0.1) {
        const vv = Math.round(v * 100) / 100;
        const c = calcVies(M, vv);
        dentro01(c.elD, `${rot}/elD(${vv})`);
        dentro01(c.elH, `${rot}/elH(${vv})`);
        expect(c.elD, `${rot}/elD subiu em viés=${vv}`).toBeLessThanOrEqual(antD + 1e-12);
        expect(c.elH, `${rot}/elH subiu em viés=${vv}`).toBeLessThanOrEqual(antH + 1e-12);
        expect(c.mA).toBeCloseTo(M.margem - vv, 9);
        antD = c.elD;
        antH = c.elH;
      }
    }
  });

  it("calcVies(null) devolve o cenário neutro do protótipo", () => {
    expect(calcVies(null, 3.1)).toEqual({ vies: 3.1, mA: 0, elD: 0.5, elH: 0.5 });
  });

  it("serieSens: 53 pontos de −3 a +10, l+f = 100 e l não-crescente", () => {
    for (const { rot, M } of CENARIOS) {
      const s = calcSerieSens(M);
      expect(s.length, rot).toBe(53);
      expect(s[0].v).toBe(-3);
      expect(s[52].v).toBe(10);
      for (let i = 0; i < s.length; i++) {
        expect(Math.abs(s[i].l + s[i].f - 100), `${rot}/soma em ${s[i].v}`).toBeLessThanOrEqual(
          1e-9,
        );
        expect(s[i].l).toBeGreaterThanOrEqual(0);
        expect(s[i].l).toBeLessThanOrEqual(100);
        if (i > 0)
          expect(s[i].l, `${rot}/monotonia em ${s[i].v}`).toBeLessThanOrEqual(s[i - 1].l + 1e-10);
        if (i > 0) expect(s[i].v).toBeCloseTo(s[i - 1].v + 0.25, 10);
      }
    }
  });
});

describe("derivados", () => {
  it("distribuição: 121 pontos, x crescente, pico 1 na margem ajustada e faixas exclusivas", () => {
    for (const { rot, M } of CENARIOS) {
      const d = calcDadosDist(M);
      expect(d.length, rot).toBe(121);
      for (let i = 1; i < d.length; i++)
        expect(d[i].x, `${rot}/x crescente`).toBeGreaterThan(d[i - 1].x);
      expect(d[60].x).toBeCloseTo(M.margemAj, 9);
      for (const p of d) {
        expect(p.lula === 0 || p.flavio === 0, `${rot}/faixas exclusivas`).toBe(true);
        expect(Math.max(p.lula, p.flavio)).toBeLessThanOrEqual(1 + 1e-12);
      }
      expect(d[0].x).toBeCloseTo(M.margemAj - 4 * M.sigmaDia2, 9);
      expect(d[120].x).toBeCloseTo(M.margemAj + 4 * M.sigmaDia2, 9);
    }
  });

  it("cenário-base: as bandas somam 1 e a modal é a de maior probabilidade", () => {
    let vistos = 0;
    for (const { rot, M, params } of CENARIOS) {
      const cb = calcCenarioBase(M, params.vies);
      if (!cb) continue;
      vistos++;
      const soma = cb.bandas.reduce((s, b) => s + b.p, 0);
      expect(Math.abs(soma - 1), `${rot}/soma das bandas`).toBeLessThanOrEqual(1e-9);
      for (const b of cb.bandas) dentro01(b.p, `${rot}/banda ${b.rot}`);
      expect(cb.modal.p, `${rot}/modal`).toBe(Math.max(...cb.bandas.map((b) => b.p)));
      dentro01(cb.pElei, `${rot}/pElei`);
      dentro01(cb.pDireto, `${rot}/pDireto`);
      dentro01(cb.pV2, `${rot}/pV2`);
      dentro01(cb.pLulaEm1, `${rot}/pLulaEm1`);
      expect(cb.pElei, `${rot}/pElei ≥ 0,5`).toBeGreaterThanOrEqual(0.5);
      expect(cb.lider).toBe(cb.liderLula ? "LULA" : "FLÁVIO BOLSONARO");
    }
    expect(vistos, "nenhum cenário-base calculado — o teste seria vazio").toBeGreaterThan(100);
  });

  it("réplica 2022: todas as probabilidades em [0,1]", () => {
    let vistos = 0;
    for (const { rot, M } of CENARIOS) {
      const r = calcReplay(M);
      if (!r) continue;
      vistos++;
      dentro01(r.elRepD, `${rot}/elRepD`);
      dentro01(r.elRepH, `${rot}/elRepH`);
      dentro01(r.p1Ld, `${rot}/p1Ld`);
      dentro01(r.p2Trep, `${rot}/p2Trep`);
      dentro01(r.pLider1, `${rot}/pLider1`);
      dentro01(r.pV2rep, `${rot}/pV2rep`);
      dentro01(r.pPainel, `${rot}/pPainel`);
      // os erros NÃO se somam: cada turno recebe o erro medido no seu próprio turno
      expect(r.r2L + r.r2F).toBeCloseTo(100 + (-1.6 + 1.6), 9);
    }
    expect(vistos, "nenhuma réplica calculada — o teste seria vazio").toBeGreaterThan(100);
  });

  it("campo completo: ranking decrescente e top2 coerente", () => {
    let vistos = 0;
    for (const { rot, pesquisas, params, hojeMs } of CENARIOS) {
      const cc = calcCampoCompleto(pesquisas, params.meiaVida, hojeMs);
      if (!cc) continue;
      vistos++;
      for (let i = 1; i < cc.linhas.length; i++)
        expect(cc.linhas[i].media, `${rot}/ordem`).toBeLessThanOrEqual(cc.linhas[i - 1].media);
      expect(cc.top2).toEqual(cc.linhas.slice(0, 2).map((c) => c.nome));
      expect(cc.pollsCampo.length).toBeLessThanOrEqual(7);
      for (let i = 1; i < cc.pollsCampo.length; i++)
        expect(meioCampo(cc.pollsCampo[i]), `${rot}/pollsCampo ordem`).toBeLessThanOrEqual(
          meioCampo(cc.pollsCampo[i - 1]),
        );
      if (cc.gap3 != null) expect(cc.gap3).toBeGreaterThanOrEqual(0);
    }
    expect(vistos, "nenhum campo completo calculado — o teste seria vazio").toBeGreaterThan(100);
  });

  it("pontos do gráfico: um por pesquisa elegível, com x no meio do campo", () => {
    for (const { rot, M } of CENARIOS) {
      const p2 = calcPontosGrafico(M, 2);
      expect(p2.length, `${rot}/turno 2`).toBe(M.linhas.length);
      const p1 = calcPontosGrafico(M, 1);
      expect(p1.length, `${rot}/turno 1`).toBe(
        M.linhas.filter((l) => l.t1 && l.t1.lula != null).length,
      );
      for (const p of p2) {
        expect(p.x).toBe(meioCampo(p));
        expect(p.lVal).toBe(p.t2.lula);
        expect(p.fVal).toBe(p.t2.flavio);
      }
    }
  });
});
