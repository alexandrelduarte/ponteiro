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

const CARTOES: Record<string, { dado: string; leitura: string }> = {
  "Aprovação do governo (jul/26)": {
    dado:
      "Quaest: 48% aprovam, 47% desaprovam · Real Time Big Data: 46% aprovam, 50% desaprovam · " +
      "AtlasIntel: 47,6% aprovam, 51,2% desaprovam · PoderData: 42% aprovam, 51% desaprovam.",
    leitura:
      "País dividido. Na Quaest foi a primeira vez, desde dezembro de 2024, que mais gente " +
      "aprova do que desaprova. Isso vai na mesma direção da leve melhora de Lula nas pesquisas " +
      "de voto. Governo com aprovação entre 42% e 48% costuma disputar de igual para igual: " +
      "continua na disputa, mas sem vantagem grande.",
  },
  "Rejeição e teto de voto": {
    dado:
      "Não votaria de jeito nenhum: Lula 47% a 53% · Flávio 46% a 57%, conforme o instituto. " +
      "Quem diz que poderia votar (Quaest, julho): Lula 47% × Flávio 38%.",
    leitura:
      "Os dois têm muita gente que não votaria neles de jeito nenhum, e isso limita até onde " +
      "cada um pode chegar. A disputa se decide entre os cerca de 8% a 15% que ainda não " +
      "escolheram ou vão de branco e nulo. Pelo número de quem diz que poderia votar, o limite " +
      "de Flávio hoje é mais baixo que o de Lula — é esse número que a campanha do PL precisa " +
      "mover.",
  },
  "Piso firme (comprometimento)": {
    dado: "“É o único em que votaria”: Lula 36% × Flávio 31% (PoderData, julho).",
    leitura:
      "Dois terços de quem vota em cada um já diz que não votaria em mais ninguém. Com o " +
      "eleitorado dividido assim, sobra pouca gente para conquistar — e a opinião tende a se " +
      "mexer pouco.",
  },
  "Calendário que ainda pesa": {
    dado:
      "16/08: começa a campanha de Lula · a convenção do PL confirmou Flávio · propaganda no " +
      "rádio e na TV a partir do fim de agosto · debates na TV · votação em 04/10 e 25/10.",
    leitura:
      "A maior parte da propaganda e dos debates ainda não aconteceu. É daí que sai a conta do " +
      "quanto a corrida ainda pode andar: quanto mais tempo falta para a votação, maior a " +
      "chance de o quadro se mexer.",
  },
  "Pano de fundo da disputa": {
    dado:
      "Jair Bolsonaro está preso, com pena de 27 anos, e não pode se candidatar até 2030 · " +
      "desde 22/07 os Estados Unidos cobram uma tarifa de 25% sobre produtos brasileiros, e as " +
      "duas campanhas usam o assunto.",
    leitura:
      "São dois fatos grandes, vindos de fora da disputa, e ainda não se sabe o efeito de " +
      "nenhum deles na eleição. Sem o ex-presidente, a direita se reorganizou em torno do " +
      "filho. E a tarifa virou disputa sobre quem defende a economia e o país.",
  },
};

/** Os cinco cartões, na ordem do dado, com `dado` e `leitura` já traduzidos. */
export const CONTEXTO_TRADUZIDO: ItemContexto[] = CONTEXTO.map((c) => {
  const traducao = CARTOES[c.titulo];
  return traducao ? { ...c, dado: traducao.dado, leitura: traducao.leitura } : c;
});
