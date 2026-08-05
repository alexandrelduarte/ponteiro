/**
 * O ENXAME DE 100 — a matemática do elemento-assinatura (docs/DESIGN-V2.md §2.2 e §4.1).
 *
 * NÃO é modelo: `src/lib/modelo` continua intocável e é ele que publica a
 * média (`margemAj`) e a dúvida (`sigmaDia2`). O que existe aqui é a leitura
 * geométrica dessa mesma distribuição — os 100 quantis, empilhados em colunas
 * de um ponto — e nada mais. Módulo puro, sem React, testável sozinho.
 *
 * As três regras que este arquivo faz valer:
 *
 *  1. O DOMÍNIO NÃO É FIXO. Ele é o intervalo que os 100 quantis de fato
 *     ocupam, arredondado para fora até fechar colunas inteiras. Domínio fixo
 *     (`[-11,+21]` do style tile) dava bolinha de 7,8px a 390px.
 *  2. O ZERO É SEMPRE BORDA DE COLUNA, nunca centro (`floor(q / largura)`).
 *     É isso que permite a régua do empate passar no vão entre as colunas que
 *     ladeiam o zero e nunca por cima de bolinha.
 *  3. A COLUNA DOBRA PARA 2 PONTOS se o desenho não couber com o piso duro de
 *     8px de bolinha e 2px de folga. Dobrar (e não usar 1,5) preserva a
 *     leitura "cada coluna é um número redondo de pontos".
 */

/** Quantas bolinhas. É o denominador canônico do produto inteiro (VOZ §2.2). */
export const N_BOLINHAS = 100;

/**
 * Largura útil, em px, do enxame a 390: 390 − 2×16 de goteira − 2×20 de
 * padding do bloco. É o piso de todo cálculo (P12) e a unidade do viewBox: o
 * SVG escala por `width:100%`, então a bolinha só CRESCE a partir daqui.
 */
export const LARGURA_BASE = 318;

/** Piso duro do diâmetro e da folga a 390 (`--spacing-bolinha`/`-folga`). */
const BOLINHA_MIN = 8;
const FOLGA_MIN = 2;

/** Proporção da bolinha dentro do passo, em md+ (§2.2 item 5). */
const PROPORCAO = 0.84;

/**
 * Máximo de colunas que cabem com bolinha ≥8px E folga ≥2px em 318px:
 * `318/32 − 2 = 7,94px` já reprova, então o teto é 31.
 */
const COLUNAS_MAX = 31;

/** Teto de altura da pilha, em px a 390 (§2.2 item 4). */
const PILHA_MAX = 180;

/* ------------------------------------------------------------------ *
 * Inversa da normal padrão                                           *
 * ------------------------------------------------------------------ */

const A = [
  -3.969683028665376e1, 2.209460984245205e2, -2.759285104469687e2, 1.38357751867269e2,
  -3.066479806614716e1, 2.506628277459239,
];
const B = [
  -5.447609879822406e1, 1.615858368580409e2, -1.556989798598866e2, 6.680131188771972e1,
  -1.328068155288572e1,
];
const C = [
  -7.784894002430293e-3, -3.223964580411365e-1, -2.400758277161838, -2.549732539343734,
  4.374664141464968, 2.938163982698783,
];
const D = [7.784695709041462e-3, 3.224671290700398e-1, 2.445134137142996, 3.754408661907416];

/**
 * Quantil da normal padrão (algoritmo de Acklam, erro relativo < 1,2e-9).
 *
 * Por que não reaproveitar `normCdf` do modelo: ela é a acumulada, não a
 * inversa, e é intocável. Esta função vive na apresentação e não altera
 * nenhum número publicado — ela só decide ONDE cada bolinha cai.
 */
export function probit(p: number): number {
  if (!(p > 0) || !(p < 1)) return p <= 0 ? -Infinity : Infinity;
  const baixo = 0.02425;
  if (p < baixo) {
    const q = Math.sqrt(-2 * Math.log(p));
    return (
      (((((C[0] * q + C[1]) * q + C[2]) * q + C[3]) * q + C[4]) * q + C[5]) /
      ((((D[0] * q + D[1]) * q + D[2]) * q + D[3]) * q + 1)
    );
  }
  if (p > 1 - baixo) {
    const q = Math.sqrt(-2 * Math.log(1 - p));
    return (
      -(((((C[0] * q + C[1]) * q + C[2]) * q + C[3]) * q + C[4]) * q + C[5]) /
      ((((D[0] * q + D[1]) * q + D[2]) * q + D[3]) * q + 1)
    );
  }
  const q = p - 0.5;
  const r = q * q;
  return (
    ((((((A[0] * r + A[1]) * r + A[2]) * r + A[3]) * r + A[4]) * r + A[5]) * q) /
    (((((B[0] * r + B[1]) * r + B[2]) * r + B[3]) * r + B[4]) * r + 1)
  );
}

/* ------------------------------------------------------------------ *
 * Os 100 cenários                                                    *
 * ------------------------------------------------------------------ */

/**
 * Os 100 quantis da diferença projetada, em ordem crescente. Cada um é UM
 * cenário, e todos valem o mesmo — é literalmente o que a legenda promete.
 */
export function quantisDaDiferenca(media: number, dp: number): number[] {
  const fora: number[] = [];
  for (let i = 1; i <= N_BOLINHAS; i++) {
    fora.push(media + dp * probit((i - 0.5) / N_BOLINHAS));
  }
  return fora;
}

export interface ColunaEnxame {
  /** índice da coluna; 0 é a primeira coluna à DIREITA do empate */
  indice: number;
  /** quantos cenários caem nela */
  qtd: number;
  /** de que lado do empate ela está */
  lado: "lula" | "flavio";
  /**
   * Quantos cenários caem DESTA COLUNA PARA A ESQUERDA, ela inclusive.
   *
   * É a acumulada do próprio desenho — a SOMA CORRIDA de `qtd`, nunca uma
   * normal avaliada de novo: se o número lido no hover viesse de fórmula, ele
   * poderia discordar das bolinhas que o leitor está contando na tela, e o
   * produto inteiro se apoia em "o escrito é o desenhado" (H3).
   *
   * Duas âncoras que caem fora por construção: na última coluna do lado de
   * Flávio o acumulado é exatamente `nFlavio` (o inteiro impresso sob o
   * desenho), e na última coluna é exatamente 100. Nunca é 0: a primeira
   * coluna é, por definição, a do menor quantil, então tem ao menos um.
   */
  acumulado: number;
}

export interface LayoutEnxame {
  /** quantos pontos percentuais vale cada coluna (1 ou 2) */
  larguraColuna: number;
  colunas: ColunaEnxame[];
  /** quantidade de cenários de cada lado — SOMAM 100 por construção (H3) */
  nLula: number;
  nFlavio: number;
  /* --- geometria em unidades do viewBox (1 unidade = 1px a 390) --- */
  larguraSvg: number;
  alturaSvg: number;
  passo: number;
  diametro: number;
  /** distância vertical de centro a centro dentro de uma coluna */
  passoVertical: number;
  /** x da régua do empate */
  xEmpate: number;
  /** y da linha de base (o eixo) */
  yEixo: number;
  /** posição do empate em porcentagem da largura — para rótulo FORA do SVG */
  posEmpatePct: number;
}

function montarComLargura(
  quantis: number[],
  larguraColuna: number,
  forcar = false,
): LayoutEnxame | null {
  const indices = quantis.map((q) => Math.floor(q / larguraColuna));
  const min = Math.min(...indices);
  const max = Math.max(...indices);
  const nCols = max - min + 1;
  if (!forcar && nCols > COLUNAS_MAX) return null;

  const contagem = new Map<number, number>();
  for (const i of indices) contagem.set(i, (contagem.get(i) ?? 0) + 1);

  const colunas: ColunaEnxame[] = [];
  let maiorPilha = 0;
  let corrente = 0;
  for (let i = min; i <= max; i++) {
    const qtd = contagem.get(i) ?? 0;
    if (qtd > maiorPilha) maiorPilha = qtd;
    corrente += qtd;
    colunas.push({ indice: i, qtd, lado: i >= 0 ? "lula" : "flavio", acumulado: corrente });
  }

  const passo = LARGURA_BASE / nCols;
  // A bolinha respeita as DUAS restrições ao mesmo tempo: proporção do passo e
  // folga mínima de 2px. É a folga que mantém cada bolinha com o próprio
  // limite a ≥3:1 contra a placa (1.4.11).
  const diametro = Math.min(PROPORCAO * passo, passo - FOLGA_MIN);
  if (!forcar && diametro < BOLINHA_MIN) return null;

  const passoVertical = diametro + Math.max(FOLGA_MIN, (1 - PROPORCAO) * passo);
  const alturaPilha = maiorPilha * passoVertical;
  if (!forcar && alturaPilha > PILHA_MAX) return null;

  const nLula = indices.filter((i) => i >= 0).length;

  return {
    larguraColuna,
    colunas,
    nLula,
    nFlavio: N_BOLINHAS - nLula,
    larguraSvg: LARGURA_BASE,
    alturaSvg: alturaPilha + 6,
    passo,
    diametro,
    passoVertical,
    xEmpate: -min * passo,
    yEixo: alturaPilha + 2,
    posEmpatePct: (-min / nCols) * 100,
  };
}

/**
 * Monta o enxame. Tenta a coluna de 1 ponto; se o domínio, a bolinha ou a
 * altura da pilha não couberem, dobra para 2 pontos (e, no limite de uma
 * dúvida absurda, para 4) — nunca encolhe a bolinha abaixo do piso.
 */
export function montarEnxame(media: number, dp: number): LayoutEnxame {
  const quantis = quantisDaDiferenca(media, dp);
  for (const largura of [1, 2, 4]) {
    const layout = montarComLargura(quantis, largura);
    if (layout) return layout;
  }
  // Só se chega aqui com uma dúvida absurda (σ acima de ~30 pontos): desenhar
  // é melhor que não desenhar, e a contagem continua correta de qualquer jeito.
  return montarComLargura(quantis, 8, true) as LayoutEnxame;
}
