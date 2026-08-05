/**
 * Anti-deriva das camadas de tradução (condição do carimbo, AUDITORIA §11):
 * se uma chave de tradução deixar de casar com o título/pleito do dado (ex.:
 * alguém edita `contexto.ts`), o fallback devolve o texto ORIGINAL — com o
 * jargão que a superfície pública bane — sem nenhum aviso. Estes testes fazem
 * esse silêncio virar vermelho: o jargão banido não pode aparecer no que a
 * tela consome.
 */
import { describe, expect, it } from "vitest";
import { CONTEXTO_TRADUZIDO, primeiraFrase } from "@/components/painel/copia-contexto";
import { ERROS_TRADUZIDOS, FONTES_TRADUZIDAS } from "@/components/painel/copia-erros";
import { CONTEXTO } from "@/data/contexto";
import { FONTES_ERROS } from "@/data/fontes-erros";
import { HISTORICO_ERROS } from "@/data/historico-erros";

const JARGAO_BANIDO = [
  "incumbente",
  "choques exógenos",
  "comprime os tetos",
  "fundamento matemático",
  "pró-esquerda",
  "cravou",
  "p.p.",
  "«",
  "»",
];

function exigirSemJargao(texto: string, onde: string) {
  for (const termo of JARGAO_BANIDO) {
    expect(texto, `"${termo}" vazou em ${onde} (chave de tradução sem par no dado?)`).not.toContain(
      termo,
    );
  }
}

describe("camadas de tradução de apresentação", () => {
  it("todo cartão de contexto tem tradução casada (nenhum fallback com jargão)", () => {
    expect(CONTEXTO_TRADUZIDO).toHaveLength(CONTEXTO.length);
    for (const c of CONTEXTO_TRADUZIDO) {
      exigirSemJargao(c.dado, `contexto "${c.titulo}" (dado)`);
      exigirSemJargao(c.leitura, `contexto "${c.titulo}" (leitura)`);
    }
  });

  it("todo pleito do histórico de erros tem tradução casada", () => {
    expect(ERROS_TRADUZIDOS).toHaveLength(HISTORICO_ERROS.length);
    for (const h of ERROS_TRADUZIDOS) {
      exigirSemJargao(h.urna, `erro "${h.pleito}" (urna)`);
      exigirSemJargao(h.pesq, `erro "${h.pleito}" (pesq)`);
      exigirSemJargao(h.erro, `erro "${h.pleito}" (erro)`);
    }
  });

  it("toda fonte do histórico tem rótulo traduzido casado", () => {
    expect(FONTES_TRADUZIDAS).toHaveLength(FONTES_ERROS.length);
    for (const f of FONTES_TRADUZIDAS) {
      exigirSemJargao(f.nome, `fonte "${f.url}"`);
    }
  });
});

/**
 * A DIETA NÃO REESCREVE (missão v2.1 "ENCAIXE").
 *
 * A 1ª camada de cada cartão de contexto mostra só a abertura da leitura e põe
 * o resto atrás do "?". A regra do dono é dura: o que fica visível tem de ser
 * o texto auditado PALAVRA POR PALAVRA, cortado num ponto final — nunca um
 * resumo redigido à parte, que envelheceria em silêncio quando a leitura
 * mudasse. Aqui isso vira invariante: prefixo literal, corte em ponto final, e
 * nada de resumo maior que o texto que ele resume.
 */
describe("dieta de texto: a 1ª camada é prefixo literal da 2ª", () => {
  it("leituraCurta é prefixo VERBATIM de leitura em todos os cartões", () => {
    for (const c of CONTEXTO_TRADUZIDO) {
      expect(
        c.leitura.startsWith(c.leituraCurta),
        `"${c.titulo}": a abertura visível deixou de ser prefixo literal da leitura`,
      ).toBe(true);
    }
  });

  it("o corte cai sempre num ponto final, e nunca no meio de uma frase", () => {
    for (const c of CONTEXTO_TRADUZIDO) {
      expect(c.leituraCurta.length, `"${c.titulo}": abertura vazia`).toBeGreaterThan(0);
      expect(c.leituraCurta.endsWith("."), `"${c.titulo}": "${c.leituraCurta}"`).toBe(true);
      expect(c.leituraCurta.length).toBeLessThanOrEqual(c.leitura.length);
    }
  });

  it("primeiraFrase anda até o próximo ponto quando a abertura é curta demais", () => {
    // "País dividido." tem 14 caracteres: sozinha não resume nada.
    expect(primeiraFrase("País dividido. Na Quaest foi a primeira vez. E mais.")).toBe(
      "País dividido. Na Quaest foi a primeira vez.",
    );
    // Uma abertura que já se sustenta sozinha não anda.
    const longa = "Os dois têm muita gente que não votaria neles de jeito nenhum. E mais coisa.";
    expect(primeiraFrase(longa)).toBe(
      "Os dois têm muita gente que não votaria neles de jeito nenhum.",
    );
    // Texto de uma frase só volta inteiro, sem corte nenhum.
    expect(primeiraFrase("Uma frase só, sem ponto no meio.")).toBe(
      "Uma frase só, sem ponto no meio.",
    );
  });
});
