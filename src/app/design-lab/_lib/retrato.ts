import "server-only";

/**
 * LABORATÓRIO DE DESIGN — camada de dados dos style tiles.
 *
 * Não é código de produção: existe só para que os três conceitos da Fase 3
 * sejam desenhados contra os NÚMEROS REAIS do modelo, e não contra lorem
 * ipsum. Roda `rodarModelo` com o seed local e `PARAMS_PADRAO`.
 *
 * `hojeMs = Date.now()` é aceitável AQUI (laboratório, como no briefing da
 * Fase 3): as páginas do /design-lab não são indexadas, não entram no sitemap
 * e não têm ISR acoplado ao relógio do produto.
 */
import { PARAMS_PADRAO } from "@/data/constantes";
import { pesquisasDoSeed } from "@/lib/dados";
import { meioCampo, rodarModelo, type ResultadoModelo } from "@/lib/modelo";

/** Uma pesquisa da série, reduzida ao que os style tiles desenham. */
export interface PesquisaPlotada {
  id: string;
  instituto: string;
  /** "DD/MM" do fim do campo */
  fim: string;
  /** margem do 2º turno (Lula − Flávio) na pesquisa */
  margem: number;
  /** margem de erro declarada, em p.p. */
  moe: number;
  /** |margem| ≤ 2×moe — a definição do próprio modelo */
  empate: boolean;
}

/** Ponto da faixa projetada: dias a partir de hoje → intervalo de 80%. */
export interface PontoFaixa {
  /** dias a partir de hoje */
  d: number;
  /** margem central (o modelo não move a média: só alarga a faixa) */
  mid: number;
  lo: number;
  hi: number;
}

/** Ponto da série histórica da margem agregada. */
export interface PontoMargem {
  x: number;
  margem: number;
}

/** Coluna do enxame (quantile dotplot): centro do bin e quantos pontos empilha. */
export interface ColunaEnxame {
  centro: number;
  /** quantos dos 100 cenários caem neste bin */
  n: number;
  /** o bin está do lado de Flávio (margem < 0)? */
  flavio: boolean;
}

export interface Retrato {
  /* ---- manchete ---- */
  /** chance de SER ELEITO, projetada para o 2º turno, em unidades de 100 */
  lulaEm100: number;
  flavioEm100: number;
  /** chance de estar à frente NO 2º TURNO, em unidades de 100. Difere da
      manchete por 1 unidade: o caminho "vitória já no 1º turno" não tem
      margem de 2º turno para cair de um lado ou do outro. */
  lulaMargemEm100: number;
  flavioMargemEm100: number;

  /* ---- cartão de dado ---- */
  mediaLula: number;
  mediaFlavio: number;
  margem: number;
  incerteza: number;
  int80: [number, number];
  /** meia-largura do intervalo de 80% da média de HOJE (1,2816 × σ_hoje) */
  bandaHoje: number;

  /* ---- tempo ---- */
  dias1T: number;
  dias2T: number;

  /* ---- procedência ---- */
  totalPesquisas: number;
  qtdEmpate: number;
  qtdRecentes: number;

  /* ---- gráficos ---- */
  faixa: PontoFaixa[];
  serie: PontoMargem[];
  pesquisas: PesquisaPlotada[];
  enxame: ColunaEnxame[];
  /** maior pilha do enxame (para dimensionar o SVG) */
  enxameAlturaMax: number;
}

/* Inversa da normal padrão (Acklam). Usada SÓ para posicionar os 100 pontos do
   enxame nos quantis — é geometria de desenho, não toca no modelo. */
function probitAprox(p: number): number {
  const a = [
    -39.6968302866538, 220.946098424521, -275.928510446969, 138.357751867269, -30.6647980661472,
    2.50662827745924,
  ];
  const b = [
    -54.4760987982241, 161.585836858041, -155.698979859887, 66.8013118877197, -13.2806815528857,
  ];
  const c = [
    -0.00778489400243029, -0.322396458041136, -2.40075827716184, -2.54973253934373,
    4.37466414146497, 2.93816398269878,
  ];
  const d = [0.00778469570904146, 0.32246712907004, 2.445134137143, 3.75440866190742];
  const cauda = 0.02425;
  if (p < cauda) {
    const q = Math.sqrt(-2 * Math.log(p));
    return (
      (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1)
    );
  }
  if (p > 1 - cauda) return -probitAprox(1 - p);
  const q = p - 0.5;
  const r = q * q;
  return (
    ((((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q) /
    (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1)
  );
}

/** Faixa de 80% dia a dia até o 2º turno, com a MESMA fórmula do modelo. */
function faixaProjetada(m: ResultadoModelo): PontoFaixa[] {
  const z80 = 1.2816;
  const pontos: PontoFaixa[] = [];
  for (let d = 0; d <= m.dias2T; d += 1) {
    const deriva = PARAMS_PADRAO.coefDeriva * Math.sqrt(d);
    const sigma = Math.sqrt(m.sigmaHoje ** 2 + deriva ** 2);
    pontos.push({
      d,
      mid: m.margemAj,
      lo: m.margemAj - z80 * sigma,
      hi: m.margemAj + z80 * sigma,
    });
  }
  return pontos;
}

/** 100 cenários nos quantis da margem projetada, empilhados em bins de 1 p.p. */
function enxameDeCem(m: ResultadoModelo): { enxame: ColunaEnxame[]; enxameAlturaMax: number } {
  const largura = 1; // p.p. por coluna
  const bins = new Map<number, number>();
  for (let i = 1; i <= 100; i += 1) {
    const q = m.margemAj + m.sigmaDia2 * probitAprox((i - 0.5) / 100);
    const chave = Math.floor(q / largura);
    bins.set(chave, (bins.get(chave) ?? 0) + 1);
  }
  const enxame = [...bins.entries()]
    .map(([chave, n]) => {
      const centro = (chave + 0.5) * largura;
      return { centro, n, flavio: centro < 0 };
    })
    .sort((x, y) => x.centro - y.centro);
  return { enxame, enxameAlturaMax: Math.max(...enxame.map((c) => c.n)) };
}

/** Roda o modelo oficial e devolve o retrato que os três conceitos desenham. */
export async function montarRetrato(): Promise<Retrato> {
  const pesquisas = pesquisasDoSeed();
  const hojeMs = Date.now();
  const m = rodarModelo(pesquisas, PARAMS_PADRAO, hojeMs);
  if (!m) throw new Error("[design-lab] o modelo não devolveu retrato para o seed");

  const lulaEm100 = Math.round(m.eleito.dia.l * 100);
  const lulaMargemEm100 = Math.round(m.pL2dia * 100);
  const { enxame, enxameAlturaMax } = enxameDeCem(m);

  return {
    lulaEm100,
    flavioEm100: 100 - lulaEm100,
    lulaMargemEm100,
    flavioMargemEm100: 100 - lulaMargemEm100,

    mediaLula: m.mediaL2,
    mediaFlavio: m.mediaF2,
    margem: m.margemAj,
    incerteza: m.sigmaDia2,
    int80: m.int80,
    bandaHoje: 1.2816 * m.sigmaHoje,

    dias1T: m.dias1T,
    dias2T: m.dias2T,

    totalPesquisas: m.linhas.length,
    qtdEmpate: m.qtdEmpate,
    qtdRecentes: m.qtdRecentes,

    faixa: faixaProjetada(m),
    serie: m.serie2.map((p) => ({ x: p.x, margem: p.l - p.f })),
    pesquisas: m.linhas
      .slice()
      .sort((x, y) => meioCampo(y) - meioCampo(x))
      .map((l) => ({
        id: l.id,
        instituto: l.instituto,
        fim: `${l.fim.slice(8, 10)}/${l.fim.slice(5, 7)}`,
        margem: l.margem2,
        moe: l.moe || 2,
        empate: l.empate2,
      })),
    enxame,
    enxameAlturaMax,
  };
}
