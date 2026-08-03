/**
 * Modelo estatístico do agregador — porte puro do protótipo
 * `agregador-presidencial-2026.jsx` (fonte da verdade).
 *
 * Uso: `rodarModelo(pesquisas, params, hojeMs)` devolve o retrato completo
 * (`ResultadoModelo | null`); as funções `calc*` derivam dele os blocos do painel.
 * Tudo é puro, determinístico (`hojeMs` explícito) e serializável — nenhum `Date`,
 * nenhuma função na saída —, o que permite calcular no Server Component e passar
 * o resultado pronto para o cliente.
 *
 * Paridade numérica exata (1e-9) verificada em `tests/modelo.golden.test.ts` contra
 * `tests/reference/original.mjs`. Nunca "melhorar" a matemática: bug real → DECISOES.md.
 */
export {
  normCdf,
  meioCampo,
  mediaEm,
  tendenciaPareada,
  rodarModelo,
  type Metrica,
  type Placar2T,
  type PesquisaCom2T,
  type LinhaModelo,
  type Media,
  type Tendencia,
  type PontoSerie,
  type Probabilidades1T,
  type TendenciasTurno,
  type Eleito,
  type ResultadoModelo,
} from "./nucleo";

export {
  calcVies,
  calcSerieSens,
  calcDadosDist,
  calcReplay,
  calcCenarioBase,
  calcCampoCompleto,
  calcPontosGrafico,
  valCand,
  type ResultadoVies,
  type PontoSens,
  type PontoDist,
  type Replay,
  type BandaCenario,
  type CenarioBase,
  type LinhaCampo,
  type CampoCompleto,
  type PontoGrafico,
} from "./derivados";

export { fmt, fmtSinal, fmtData, pct } from "./formatadores";
