/**
 * Anti-deriva das camadas de tradução (condição do carimbo, AUDITORIA §11):
 * se uma chave de tradução deixar de casar com o título/pleito do dado (ex.:
 * alguém edita `contexto.ts`), o fallback devolve o texto ORIGINAL — com o
 * jargão que a superfície pública bane — sem nenhum aviso. Estes testes fazem
 * esse silêncio virar vermelho: o jargão banido não pode aparecer no que a
 * tela consome.
 */
import { describe, expect, it } from "vitest";
import { CONTEXTO_TRADUZIDO } from "@/components/painel/copia-contexto";
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
