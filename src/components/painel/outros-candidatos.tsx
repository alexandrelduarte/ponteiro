"use client";

/**
 * "E os outros candidatos?" (COPY-DECK §I, INVENTÁRIO 3.3).
 *
 * O par principal é DEFINIDO PELOS DADOS (os dois primeiros do 1º turno) — se
 * o ranking mudar, o painel avisa em vez de fingir que nada aconteceu.
 *
 * Cor das barras: Lula e Flávio usam os tokens da paleta v2 (é a cor própria
 * deles no sistema); os demais mantêm a cor de `src/data/constantes.ts`, que é
 * DADO do protótipo e não muda. Assim a "cor própria por candidato" do
 * inventário sobrevive sem reintroduzir a paleta antiga nos dois protagonistas.
 * A cor nunca informa sozinha: o nome e o número estão sempre ao lado.
 */
import { useRef } from "react";
import { Bloco, Chip, Pergunta, Resposta, Traduzindo, Vazio } from "@/components/ui/blocos";
import { fmt, fmtData, valCand } from "@/lib/modelo";
import { usePainel, type Aba } from "./estado";

const ORDEM: Aba[] = ["principal", "todos"];

/**
 * Abreviação INTENCIONAL do nome do instituto no cabeçalho da matriz abaixo de
 * `md`, onde 7 colunas + candidato + média disputam a largura. Corte cego de
 * string entregava "PODERDA", "DATAFOL" — palavra mutilada onde o produto pede
 * procedência. Em `md+` o nome sai inteiro; o nome completo continua no rótulo
 * acessível em qualquer largura.
 */
const ABREV_INSTITUTO: Record<string, string> = {
  PoderData: "PoderD.",
  AtlasIntel: "Atlas",
  Datafolha: "Datafol.",
  "Genial/Quaest": "Quaest",
  Nexus: "Nexus",
  Gerp: "Gerp",
  Indexa: "Indexa",
};

function corDoCandidato(nome: string, corDoDado: string): string {
  if (nome === "Lula") return "var(--color-lula)";
  if (nome === "Flávio Bolsonaro") return "var(--color-flavio)";
  return corDoDado;
}

export function OutrosCandidatos() {
  const { campoCompleto, aba, definirAba } = usePainel();
  const refs = useRef<Record<Aba, HTMLButtonElement | null>>({ principal: null, todos: null });

  const aoTeclar = (evento: React.KeyboardEvent) => {
    const i = ORDEM.indexOf(aba);
    let proxima: Aba | null = null;
    if (evento.key === "ArrowRight") proxima = ORDEM[(i + 1) % ORDEM.length];
    if (evento.key === "ArrowLeft") proxima = ORDEM[(i - 1 + ORDEM.length) % ORDEM.length];
    if (evento.key === "Home") proxima = ORDEM[0];
    if (evento.key === "End") proxima = ORDEM[ORDEM.length - 1];
    if (!proxima) return;
    evento.preventDefault();
    definirAba(proxima);
    refs.current[proxima]?.focus();
  };

  const classeAba = (alvo: Aba) =>
    [
      "min-h-toque rounded-plena px-5 text-corpo font-semibold",
      "transition-colors duration-(--dur-rapida) ease-(--ease-padrao)",
      aba === alvo ? "bg-ameixa text-tinta-inversa" : "text-tinta hover:bg-ameixa-tenue",
    ].join(" ");

  return (
    <Bloco rotuladoPor="titulo-outros">
      <Pergunta id="titulo-outros">E os outros candidatos?</Pergunta>
      <Resposta>
        {campoCompleto?.gap3 != null ? (
          <>
            O terceiro colocado está <span className="numeros">{fmt(campoCompleto.gap3)}</span>{" "}
            pontos atrás do segundo — por isso o painel faz a conta do 2º turno só entre os dois
            primeiros.
          </>
        ) : (
          <>
            Nenhuma pesquisa da lista divulgou o 1º turno com a lista de nomes, então não há ranking
            a mostrar hoje.
          </>
        )}
      </Resposta>
      <Traduzindo>
        Aqui estão todos os nomes testados no 1º turno, com a média de cada um. O par principal não
        é escolha nossa: são os dois primeiros da própria lista. Se o ranking mudar, o painel avisa.
      </Traduzindo>

      {campoCompleto && !campoCompleto.parPadrao ? (
        <p
          role="status"
          className="mt-4 rounded-nicho bg-atencao-fundo px-4 py-3 text-corpo text-tinta"
        >
          <span aria-hidden="true" className="mr-1 font-semibold text-atencao">
            ⚠
          </span>
          Os dois primeiros mudaram: agora são <b>{campoCompleto.top2.join(" × ")}</b>. As contas de
          2º turno continuam em Lula × Flávio até existirem pesquisas do novo confronto.
        </p>
      ) : null}

      <div
        role="tablist"
        aria-label="Escopo da lista de candidatos"
        onKeyDown={aoTeclar}
        className="mt-4 inline-flex flex-wrap gap-1 rounded-plena bg-nicho p-1"
      >
        <button
          type="button"
          role="tab"
          id="aba-principal"
          aria-selected={aba === "principal"}
          aria-controls="painel-outros"
          tabIndex={aba === "principal" ? 0 : -1}
          ref={(el) => {
            refs.current.principal = el;
          }}
          onClick={() => definirAba("principal")}
          className={classeAba("principal")}
        >
          Lula × Flávio
        </button>
        <button
          type="button"
          role="tab"
          id="aba-todos"
          data-testid="aba-todos"
          aria-selected={aba === "todos"}
          aria-controls="painel-outros"
          tabIndex={aba === "todos" ? 0 : -1}
          ref={(el) => {
            refs.current.todos = el;
          }}
          onClick={() => definirAba("todos")}
          className={classeAba("todos")}
        >
          Candidatos testados nas pesquisas
          {campoCompleto ? ` (${campoCompleto.linhas.length})` : ""}
        </button>
      </div>

      <div
        id="painel-outros"
        role="tabpanel"
        aria-labelledby={aba === "todos" ? "aba-todos" : "aba-principal"}
        className="mt-4"
      >
        {aba === "principal" ? (
          <p className="max-w-texto text-corpo text-tinta-media">
            Enquanto essa distância valer, a eleição se decide entre os dois primeiros — e é para
            esse par que os institutos perguntam sobre o 2º turno.
          </p>
        ) : !campoCompleto ? (
          <Vazio
            titulo="Nenhuma pesquisa da lista divulgou o 1º turno com a lista de nomes."
            ilustracao={{ src: "/ilustracoes/vazio-sem-dados.svg", alt: "" }}
          >
            Sem esse dado não há ranking a mostrar — só o confronto de 2º turno, que segue no resto
            da página. Quando um instituto voltar a divulgar o 1º turno, esta lista se preenche
            sozinha.
          </Vazio>
        ) : (
          <>
            <ul className="space-y-3">
              {campoCompleto.linhas.map((c, i) => {
                const largura = (100 * c.media) / campoCompleto.linhas[0].media;
                return (
                  <li key={c.nome}>
                    <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                      <span className="text-corpo text-tinta">
                        <b className="font-semibold">
                          {i + 1}º · {c.nome}
                        </b>{" "}
                        <span className="text-micro text-tinta-media">({c.partido})</span>
                        {i < 2 ? (
                          <Chip tom="ameixa" className="ml-2">
                            ● disputa principal
                          </Chip>
                        ) : null}
                      </span>
                      <span className="text-corpo font-semibold whitespace-nowrap text-tinta numeros">
                        {fmt(c.media)}%{" "}
                        <span className="text-micro font-normal text-tinta-media">
                          · {c.k} {c.k === 1 ? "pesquisa" : "pesquisas"}
                        </span>
                      </span>
                    </div>
                    <div className="mt-1 h-3 overflow-hidden rounded-plena bg-nicho">
                      <div
                        className="h-full rounded-plena"
                        style={{
                          width: `${largura}%`,
                          background: corDoCandidato(c.nome, c.cor),
                        }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>

            <p className="mt-4 text-micro text-tinta-media numeros">
              Branco, nulo e quem ainda não sabe somam {fmt(campoCompleto.bn)}% na média. Outros
              nomes testados em alguma pesquisa ficam em 1% ou menos e não entram no ranking.
            </p>

            <div
              className="rolagem-x relative mt-4 overflow-x-auto"
              role="group"
              tabIndex={0}
              aria-labelledby="titulo-outros"
            >
              <table className="w-full text-micro numeros">
                <caption className="sr-only">
                  Intenção de voto de cada candidato no 1º turno, pesquisa a pesquisa (as 7 mais
                  recentes que divulgaram o 1º turno) e a média do painel.
                </caption>
                <thead>
                  <tr className="text-left text-tinta-media">
                    <th scope="col" className="py-2 pr-3 font-medium">
                      Candidato
                    </th>
                    {campoCompleto.pollsCampo.map((p) => (
                      <th
                        key={p.id}
                        scope="col"
                        className="coluna-numerica min-w-[5ch] py-2 pr-3 font-medium whitespace-nowrap"
                      >
                        <span aria-hidden="true" className="md:hidden">
                          {ABREV_INSTITUTO[p.instituto] ?? p.instituto}
                        </span>
                        <span className="sr-only md:not-sr-only">{p.instituto}</span>
                        <br />
                        {fmtData(p.fim)}
                      </th>
                    ))}
                    <th scope="col" className="coluna-numerica min-w-[5ch] py-2 font-medium">
                      Média
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {campoCompleto.linhas.map((c) => (
                    <tr key={c.nome} className="border-t border-filete">
                      <th
                        scope="row"
                        className="py-2 pr-3 text-left font-semibold whitespace-nowrap text-tinta"
                      >
                        {c.nome}
                      </th>
                      {campoCompleto.pollsCampo.map((p) => {
                        const v = valCand(p, c.nome);
                        return (
                          <td
                            key={p.id}
                            className="coluna-numerica min-w-[5ch] py-2 pr-3 text-tinta-media"
                          >
                            {v != null ? fmt(v, v % 1 ? 1 : 0) : "–"}
                          </td>
                        );
                      })}
                      <td className="coluna-numerica min-w-[5ch] py-2 font-semibold text-tinta">
                        {fmt(c.media)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="mt-3 max-w-texto text-micro text-tinta-media">
              “–” quer dizer que o instituto não testou esse nome naquela pesquisa, ou não divulgou
              o número.
            </p>
          </>
        )}
      </div>
    </Bloco>
  );
}
