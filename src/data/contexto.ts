/**
 * Contexto social medido (não é opinião) — 2º turno, outubro de 2026.
 *
 * Substitui os cartões de julho do protótipo (DECISOES.md, "2º turno"). Cada número
 * foi conferido em pelo menos uma página aberta (fonte + extras abaixo, em
 * comentário); o que não deu para conferir ficou FORA do `dado`. Leituras simétricas:
 * descrevem só o que os números dizem, dos dois lados.
 */
import type { ItemContexto } from "./tipos";

export const CONTEXTO: ItemContexto[] = [
  {
    titulo: "Avaliação do governo (outubro de 2026)",
    dado:
      "Quaest (10 a 13 de outubro): 45% aprovam, 48% desaprovam · PoderData (13 a 15 de " +
      "outubro): 46% aprovam, 49% desaprovam · Datafolha (6 a 8 de outubro): 35% acham o governo " +
      "ótimo ou bom, 40% acham ruim ou péssimo.",
    leitura:
      "Nos três institutos, quem desaprova passa um pouco de quem aprova, por 3 a 5 pontos. Na " +
      "Quaest, a variação em relação ao começo de outubro ficou dentro da folga da medida. As " +
      "perguntas não são iguais em todos os institutos, então os números não se comparam " +
      "diretamente entre si.",
    // extras: infomoney.com.br (Quaest), jornale.com.br (reprodução do Poder360, PoderData),
    // brasildefato.com.br 08/10 (Datafolha)
    fonte:
      "https://www.opovo.com.br/noticias/politica/2026/10/14/quaest-48-desaprovam-o-governo-lula-contra-45-que-aprovam.html",
  },
  {
    titulo: "Rejeição no 2º turno",
    dado:
      "Não votariam de jeito nenhum — Quaest (10 a 13 de outubro): Lula 53%, Flávio 54% · " +
      "PoderData (13 a 15 de outubro): Lula 46%, Flávio 45% · Datafolha (6 a 8 de outubro): " +
      "Lula 46%, Flávio 43%.",
    leitura:
      "Em cada instituto, a rejeição dos dois fica próxima: a diferença vai de 1 a 3 pontos. Quem " +
      "é mais rejeitado muda conforme o instituto — Flávio na Quaest, Lula no PoderData e no " +
      "Datafolha. O nível geral também muda de um instituto para outro, por diferença de método " +
      "e de pergunta.",
    // extras: cnnbrasil.com.br (PoderData), brasildefato.com.br 08/10 (Datafolha)
    fonte:
      "https://sbtnews.sbt.com.br/noticia/eleicoes/quaest-flavio-bolsonaro-tem-46-e-lula-44-no-2-turno",
  },
  {
    titulo: "Voto decidido no 2º turno",
    dado:
      "Quaest (10 a 13 de outubro): 91% dizem que o voto é definitivo e 9% que ainda podem mudar " +
      "· PoderData (13 a 15 de outubro): é o único em quem votariam — Lula 44%, Flávio 43%; " +
      "poderiam votar — Lula 7%, Flávio 7%.",
    leitura:
      "A maior parte do eleitorado diz que já decidiu: quem ainda pode mudar fica perto de 1 em " +
      "cada 10. No PoderData, o voto firme é praticamente o mesmo para os dois. Quando a " +
      "diferença entre os candidatos é de poucos pontos, esse grupo que ainda pode mudar é maior " +
      "que ela.",
    // extra: cnnbrasil.com.br (PoderData)
    fonte: "https://www.infomoney.com.br/politica/quaest-2-turno-flavio-lula/",
  },
  {
    titulo: "Calendário da reta final",
    dado:
      "Propaganda no rádio e na TV: de 9 a 23 de outubro · debates: Record (11/10) e o das " +
      "emissoras reunidas (15/10) foram cancelados; Band em 18/10, às 20h, com os dois " +
      "confirmados; Globo em 23/10 marcado pela emissora, sem confirmação pública dos dois até " +
      "15/10 · votação: domingo, 25/10, das 8h às 17h (horário de Brasília).",
    leitura:
      "Lula e Flávio não fizeram nenhum debate no 1º turno: se forem mantidos, os da Band e da " +
      "Globo serão os únicos encontros ao vivo entre os dois. As emissoras atribuíram os " +
      "cancelamentos à agenda dos candidatos, sem dizer de qual deles.",
    // extras: congressoemfoco.com.br, bnewssaopaulo.com.br, poder360.com.br, jornaldocomercio.com
    fonte:
      "https://www.opovo.com.br/noticias/politica/eleicoes/2026/10/15/lula-e-flavio-tem-debate-presidencial-hoje-15-10.html",
  },
  {
    titulo: "Apoios de quem saiu no 1º turno",
    dado:
      "Augusto Cury (2,89% no 1º turno): apoio a Flávio em 8/10, com um termo de compromissos · " +
      "Renan Santos (2,24%): não apoia nenhum dos dois · Ronaldo Caiado (2,18%): apoio a Flávio " +
      "em 6/10 · Romeu Zema (0,27%): apoio a Flávio em 5/10 · Datafolha (6 a 8 de outubro): entre " +
      "os eleitores desses quatro, 46% dizem votar em Flávio e 32% em Lula.",
    leitura:
      "Dos quatro, três declararam apoio a Flávio e um ficou neutro; nenhum declarou apoio a " +
      "Lula. Mas o eleitor não segue o apoio em bloco: pelo Datafolha, cerca de um terço de quem " +
      "votou neles diz votar em Lula.",
    // extras: dgabc.com.br (Cury, Datafolha), poder360.com.br (Renan Santos),
    // cnnbrasil.com.br (Caiado), diariodonordeste.verdesmares.com.br (Zema)
    fonte:
      "https://www.dgabc.com.br/Noticia/4351747/46-dos-eleitores-de-cury-renan-santos-caiado-e-zema-migram-para-flavio-aonta-datafolha",
  },
];

/** Síntese do contexto — 2º turno. */
export const SINTESE_CONTEXTO =
  "Rejeição alta dos dois lados e quase todo mundo já decidido explicam por que a diferença se " +
  "move pouco. O que ainda pode mover: o grupo de cerca de 1 em cada 10 que ainda pode mudar, os " +
  "debates da reta final e fatos novos.";
