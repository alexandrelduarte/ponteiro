/**
 * Os cinco cartões de contexto, ditos em português — camada de tela.
 *
 * `src/data/contexto.ts` é o dado extraído do protótipo e não muda (o arquivo
 * diz, na linha 2, "textos preservados"). O problema é que esse texto é v1
 * verbatim e chegava CRU a uma superfície pública: os TÍTULOS já tinham sido
 * traduzidos em `contexto-social.tsx`, as notas não. Ficavam na tela
 * "incumbente competitivo", "comprime os tetos", "choques exógenos",
 * "fundamento matemático da deriva", "o nº", "série de intenção de voto",
 * "oscilar" e meses abreviados ("jul", "dez/2024") — VOZ §5.1 bane "série" e
 * "amostra", §5.3 bane moldura errada, §1.1 pede uma ideia por frase.
 *
 * É o MESMO padrão de `copia-erros.ts`: a tradução mora aqui, keyed pelo
 * identificador do dado (o `titulo` original), com FALLBACK para o texto
 * original — se um cartão novo entrar no dado sem tradução, ele aparece
 * inteiro, nunca some da tela.
 *
 * O que mudou, item a item do checklist de VOZ §9:
 *  - `dado` do 1º cartão: "48%×47% (Quaest)" → "Quaest: 48% aprovam, 47%
 *    desaprovam". Em TODA a página "×" quer dizer *Lula × Flávio*; ali ele
 *    queria dizer *aprova × desaprova*, e o leitor não tinha como saber. Onde
 *    o "×" continua, ele é mesmo Lula × Flávio;
 *  - "RTBD" → "Real Time Big Data" (sigla que a página não explicava em lugar
 *    nenhum);
 *  - "jul", "dez/2024" → "julho", "dezembro de 2024";
 *  - "incumbente competitivo, não dominante" → "costuma disputar de igual para
 *    igual — não larga na frente, nem está fora da disputa";
 *  - "comprime os tetos" → "limita até onde cada um pode chegar";
 *  - "o nº que a campanha do PL precisa mover" → "esse número que a campanha
 *    do PL precisa mover";
 *  - "série de intenção de voto" / "a série de 2026" → "as pesquisas";
 *  - "tende a oscilar pouco" → "a opinião se mexe pouco";
 *  - "fundamento matemático da «deriva» do modelo" → "é daí que sai a conta do
 *    quanto a corrida ainda pode andar" (o mesmo nome que o glossário usa);
 *  - "choques exógenos" → "fatos grandes, vindos de fora da disputa";
 *  - "disputa de narrativa econômica e nacional" → "disputa sobre quem defende
 *    a economia e o país";
 *  - "Potencial de voto" → "quem diz que poderia votar".
 *
 * Nenhuma ressalva foi amputada: os intervalos ("47% a 53%"), o "conforme o
 * instituto", o "ainda incerto" e o "pelo número de quem diz que poderia
 * votar" continuam todos na tela.
 */
import { CONTEXTO } from "@/data/contexto";
import type { ItemContexto } from "@/data/tipos";

/**
 * 2º turno (out/2026): os cartões de outubro já nascem escritos em linguagem
 * simples em `src/data/contexto.ts` — não há tradução a fazer, e o mapa fica
 * vazio (o fallback devolve o dado como está). As traduções dos cartões de
 * julho saíram junto com eles. `tests/copia-apresentacao.test.ts` continua
 * vigiando o jargão banido no que chega à tela.
 */
const CARTOES: Record<string, { dado: string; leitura: string }> = {};

/**
 * A 1ª camada da leitura, DERIVADA — nunca redigida à parte.
 *
 * A dieta da missão "ENCAIXE" deixa visível só a abertura de cada leitura e
 * põe o resto atrás do "?". A tentação é escrever o resumo à mão; o preço
 * seria a mesma frase existindo em dois lugares, livre para divergir — o
 * defeito que este arquivo inteiro existe para evitar. Aqui o resumo é um
 * PREFIXO calculado do texto auditado: corta no primeiro ponto final e nunca
 * reescreve uma palavra. `tests/copia-apresentacao.test.ts` trava a invariante.
 *
 * O piso de 40 caracteres existe porque uma das cinco leituras abre com uma
 * frase de duas palavras ("País dividido."): sozinha na tela ela não é
 * resumo de nada, então o corte anda até o próximo ponto final.
 */
const PISO_RESUMO = 40;

export function primeiraFrase(texto: string): string {
  let corte = 0;
  while (corte < texto.length) {
    const ponto = texto.indexOf(". ", corte);
    if (ponto < 0) return texto;
    corte = ponto + 1;
    if (corte >= PISO_RESUMO) break;
  }
  return texto.slice(0, corte);
}

export interface ItemContextoTraduzido extends ItemContexto {
  /** abertura da `leitura`, palavra por palavra — o resto abre no "?" */
  leituraCurta: string;
}

/** Os cinco cartões, na ordem do dado, com `dado` e `leitura` já traduzidos. */
export const CONTEXTO_TRADUZIDO: ItemContextoTraduzido[] = CONTEXTO.map((c) => {
  const traducao = CARTOES[c.titulo];
  const item = traducao ? { ...c, dado: traducao.dado, leitura: traducao.leitura } : c;
  return { ...item, leituraCurta: primeiraFrase(item.leitura) };
});
