/**
 * Cor de EXIBIÇÃO de cada candidato — camada de apresentação, e só ela.
 *
 * `src/data/constantes.ts` é dado do protótipo e tem paridade numérica exata
 * com ele (os golden tests carregam `cor` junto do resto do campo). O campo
 * `cor` de lá é herança visual da v1 — sete hex crus do Tailwind, fora do
 * sistema — e a Fase 7 o APOSENTA da tela sem tocar no dado: a UI passa a
 * perguntar a cor a este mapa, keyed por nome.
 *
 * O que o mapa resolve, item a item da crítica (`.qa/iter-v2-1/critica.md`):
 *
 *  1. `#e8791d` (Zema) fazia 2,92:1 contra a placa — reprovava o piso de 3:1
 *     de objeto gráfico (SC 1.4.11), e o axe não testa esse par. Aqui o pior
 *     par das nove cores é 3,13:1 (`cand-7` contra o nicho).
 *  2. `#0e7c86` (Caiado) × `#0f766e` (Daciolo) davam 1,11:1 entre si — dois
 *     candidatos vestindo a mesma cor, um em cima do outro na lista. Aqui o
 *     ΔE(OKLab) mínimo entre duas cores de exibição é 0,0596, cerca de 3× o
 *     limiar de percepção.
 *  3. `#7c3aed` (Renan) era 1,00:1 contra `--color-ameixa-clara`: um candidato
 *     vestindo a cor da marca, o que MARCA.md §6.6.1 e DESIGN-V2 §8.3 proíbem.
 *     `#a16207` (Cury) fazia o mesmo com o âmbar de atenção. Aqui as sete têm
 *     croma OKLCH ≤ 0,034 contra 0,081 da ameixa e 0,111 do âmbar — e o ΔE
 *     mínimo contra a família da marca e contra a atenção é 0,0556.
 *  4. `#0f766e` reintroduzia VERDE num produto que baniu semântica verde
 *     (DECISOES #5). Nenhuma matiz desta rampa entra na faixa 120–200°.
 *
 * Os números calculados vivem ao lado dos tokens, em `src/app/tokens.css` §4b
 * — este arquivo não escreve hex, só nomeia. E a cor continua sem informar
 * sozinha: nome e número acompanham a barra em qualquer largura.
 */

/** Os sete degraus neutros, em ordem de clareza crescente. */
const NEUTROS = [
  "var(--color-cand-1)",
  "var(--color-cand-2)",
  "var(--color-cand-3)",
  "var(--color-cand-4)",
  "var(--color-cand-5)",
  "var(--color-cand-6)",
  "var(--color-cand-7)",
] as const;

/**
 * Nome → cor de exibição. Lula e Flávio recebem os tokens próprios (carmim e
 * naval são deles em toda superfície do produto, R4); os outros sete recebem
 * um degrau fixo da rampa neutra, para que a cor de cada nome não dance
 * quando o ranking mudar.
 */
const POR_NOME: Record<string, string> = {
  Lula: "var(--color-lula)",
  "Flávio Bolsonaro": "var(--color-flavio)",
  "Renan Santos": NEUTROS[0],
  "Ronaldo Caiado": NEUTROS[1],
  "Romeu Zema": NEUTROS[2],
  "Augusto Cury": NEUTROS[3],
  "Cabo Daciolo": NEUTROS[4],
  "Samara Martins": NEUTROS[5],
  "Joaquim Barbosa": NEUTROS[6],
};

/**
 * Cor de exibição de um candidato. Nome desconhecido (a lista de nomes vem do
 * banco e pode crescer) cai num degrau da rampa pela posição — nunca no hex
 * do dado, que é justamente o que esta camada existe para não usar.
 */
export function corDeExibicao(nome: string, indice = 0): string {
  return POR_NOME[nome] ?? NEUTROS[indice % NEUTROS.length];
}
