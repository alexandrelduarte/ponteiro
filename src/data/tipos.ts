/**
 * Tipos compartilhados dos dados da série — espelham a estrutura do protótipo
 * `agregador-presidencial-2026.jsx` (fonte da verdade). O modelo (src/lib/modelo)
 * e a camada de dados (src/lib/dados) consomem estes tipos.
 */

/** Intenção de voto de um turno. `null` = não divulgado na fonte. */
export interface Placar {
  lula: number | null;
  flavio: number | null;
  /** branco/nulo + não sabe */
  bnns: number | null;
}

export interface Pesquisa {
  id: string;
  instituto: string;
  contratante: string;
  /** AAAA-MM-DD (início do campo) */
  inicio: string;
  /** AAAA-MM-DD (fim do campo) */
  fim: string;
  /** amostra */
  n: number;
  /** margem de erro em p.p. */
  moe: number;
  /** registro TSE (ex.: BR-08602/2026) */
  tse: string;
  /** 1º turno estimulado; null quando a rodada não divulgou */
  t1: Placar | null;
  /** demais candidatos testados no 1º turno, por nome */
  outros1?: Record<string, number>;
  /** 2º turno Lula × Flávio (sempre presente na série oficial) */
  t2: Placar;
  /** URL da fonte; null quando indisponível */
  fonte: string | null;
  /** marcações de origem usadas pela UI de simulação */
  usuario?: boolean;
  auto?: boolean;
}

export interface Instituto {
  /** slug estável, ex.: 'atlasintel' */
  id: string;
  /** nome canônico, ex.: 'AtlasIntel' */
  nome: string;
  /** grafias alternativas aceitas na normalização (case-insensitive) */
  aliases: string[];
}

export interface Candidato {
  nome: string;
  partido: string;
  cor: string;
}

export interface ParamsModelo {
  /** dias para o peso de uma pesquisa cair pela metade */
  meiaVida: number;
  /** erro sistemático possível de todo o setor (p.p.) */
  sigmaSys: number;
  /** deriva da opinião pública (p.p. × √dias) */
  coefDeriva: number;
  /** viés direcional assumido das pesquisas (p.p.; positivo = superestimando Lula) */
  vies: number;
}

export interface ItemContexto {
  titulo: string;
  dado: string;
  leitura: string;
  fonte: string;
}

export interface ErroPleito {
  pleito: string;
  urna: string;
  pesq: string;
  erro: string;
}

export interface CenarioVies {
  vies: number;
  rotulo: string;
  titulo: string;
  desc: string;
}

export interface FonteErro {
  nome: string;
  url: string;
}
