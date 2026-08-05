"use client";

/**
 * "E os outros candidatos?" (COPY-DECK §I, INVENTÁRIO 3.3).
 *
 * O par principal é DEFINIDO PELOS DADOS (os dois primeiros do 1º turno) — se
 * o ranking mudar, o painel avisa em vez de fingir que nada aconteceu.
 *
 * Três decisões desta seção, todas da Fase 7:
 *
 *  1. **A cor vem do mapa de exibição** (`ui/cores-candidatos`), não do campo
 *     `cor` do dado. O dado continua intocado — é a tela que deixa de vestir a
 *     paleta da v1. Lula e Flávio ficam com os tokens próprios; os outros sete,
 *     com a rampa neutra de 7 degraus. A cor nunca informa sozinha: nome e
 *     número estão sempre ao lado.
 *  2. **A régua das barras é FIXA, de 0 a 50% dos votos, e vem rotulada.**
 *     Normalizar pelo líder desenhava 41,4% como trilho cheio — é a barra
 *     83/17 da v1 voltando pela porta dos fundos, e faz a régua mudar conforme
 *     quem lidera (H9/R4). Agora as nove barras estão na mesma régua, com a
 *     marca da metade no mesmo lugar para todo mundo.
 *  3. **Abaixo de `lg` a matriz candidato × instituto é uma lista de cartões.**
 *     Dez colunas numa tela de 390 (ou de 768) só cabem com rolagem horizontal,
 *     que §6.3 bane com todas as letras. O número por instituto continua
 *     alcançável, a um toque, em qualquer largura.
 */
import { useRef } from "react";
import { Bloco, Cabecalho, Chip, LINHA_TABELA, Vazio } from "@/components/ui/blocos";
import { corDeExibicao } from "@/components/ui/cores-candidatos";
import { fmt, fmtData, valCand } from "@/lib/modelo";
import { usePainel, type Aba } from "./estado";

const ORDEM: Aba[] = ["principal", "todos"];

/** Topo da régua das barras, em % de intenção de voto no 1º turno. */
const REGUA_MAX = 50;

/**
 * Abreviação INTENCIONAL do nome do instituto no cabeçalho da matriz, onde
 * 7 colunas + candidato + média disputam a largura. Corte cego de string
 * entregava "PODERDA", "DATAFOL" — palavra mutilada onde o produto pede
 * procedência. O nome completo continua no rótulo acessível.
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
      "min-h-toque flex-1 basis-0 rounded-plena px-4 text-center text-corpo font-semibold",
      "transition-[background-color,color,scale] duration-(--dur-rapida) ease-(--ease-padrao)",
      "motion-safe:active:scale-[0.985]",
      aba === alvo ? "bg-ameixa text-tinta-inversa" : "text-tinta hover:bg-ameixa-tenue",
    ].join(" ");

  return (
    <Bloco rotuladoPor="titulo-outros">
      <Cabecalho
        id="titulo-outros"
        pergunta="E os outros candidatos?"
        resposta={
          campoCompleto?.gap3 != null ? (
            <>
              O terceiro colocado está <span className="numeros">{fmt(campoCompleto.gap3)}</span>{" "}
              pontos atrás do segundo — por isso o painel faz a conta do 2º turno só entre os dois
              primeiros.
            </>
          ) : (
            <>
              Nenhuma pesquisa da lista divulgou o 1º turno com a lista de nomes, então não há
              ranking a mostrar hoje.
            </>
          )
        }
        traduzindo={
          <>
            Aqui estão todos os nomes testados no 1º turno, com a média de cada um. O par principal
            não é escolha nossa: são os dois primeiros da própria lista. Se o ranking mudar, o
            painel avisa.
          </>
        }
      />

      {campoCompleto && !campoCompleto.parPadrao ? (
        <p
          role="status"
          className="mt-4 rounded-nicho bg-atencao-fundo px-4 py-3 text-corpo text-tinta"
        >
          Os dois primeiros mudaram: agora são <b>{campoCompleto.top2.join(" × ")}</b>. As contas de
          2º turno continuam em Lula × Flávio até existirem pesquisas do novo confronto.
        </p>
      ) : null}

      <div
        role="tablist"
        aria-label="Escopo da lista de candidatos"
        onKeyDown={aoTeclar}
        /* O teto do controle acompanha a coluna: 32rem era 55% da placa de 936
           e virava 48% na de 1056 — a barra encolhia sozinha quando a página
           crescia. 40rem devolve a proporção. */
        className="mt-4 flex w-full gap-1 rounded-plena bg-nicho p-1 md:w-auto md:max-w-[32rem] lg:max-w-[40rem]"
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
          Candidatos testados
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
            {/* A régua, rotulada e igual para os nove. Ela vem ANTES das barras
                porque é ela que dá sentido ao comprimento de cada uma.
                O rótulo do meio é POSICIONADO, não distribuído: num
                `justify-between` de três itens o do meio se centra no VÃO entre
                os outros dois, e não no tique — media 675 num trilho cujo meio
                é 720, ou seja, o rótulo "25%" caía sobre 22,4% da escala. É a
                mesma âncora da marca no trilho (`left-1/2 -translate-x-1/2`),
                então os dois não têm como divergir. */}
            <div
              aria-hidden="true"
              className="relative mt-1 h-5 text-micro text-tinta-media lg:hidden"
            >
              <span className="absolute left-0">0</span>
              <span className="absolute left-1/2 -translate-x-1/2">25%</span>
              <span className="absolute right-0">50% dos votos</span>
            </div>

            <ul className="mt-1 space-y-3 lg:hidden" data-testid="lista-candidatos">
              {campoCompleto.linhas.map((c, i) => {
                const largura = Math.min(100, (100 * c.media) / REGUA_MAX);
                return (
                  <li key={c.nome}>
                    {/* Nome e partido em LINHAS DIFERENTES, para os nove.
                        Inline, o par quebrava conforme o comprimento do nome —
                        sete dos nove empurravam "(PSD)", "(Avante)", "(UP)"
                        para a segunda linha e dois ficavam inteiros, então a
                        lista não tinha ritmo nenhum. Aqui a primeira linha é
                        sempre "Nº · nome" contra o número, e a segunda sempre
                        o partido; nada depende de caber. */}
                    <div className="flex items-baseline justify-between gap-x-3">
                      <span className="min-w-0 text-corpo font-semibold text-tinta">
                        {i + 1}º · {c.nome}
                      </span>
                      <span className="shrink-0 text-corpo font-semibold whitespace-nowrap text-tinta numeros">
                        {fmt(c.media)}%
                      </span>
                    </div>
                    <p className="flex flex-wrap items-center gap-x-2 text-micro text-tinta-media numeros">
                      <span>
                        {c.partido} · média de {c.k} {c.k === 1 ? "pesquisa" : "pesquisas"}
                      </span>
                      {i < 2 ? <Chip tom="ameixa">disputa principal</Chip> : null}
                    </p>
                    {/* Trilho = a régua inteira (0 a 50%). A marca da metade
                        cai sempre no mesmo lugar, para os nove. */}
                    <div className="relative mt-1 h-3 overflow-hidden rounded-plena bg-nicho">
                      <div
                        data-testid={`barra-candidato-${i}`}
                        className="h-full rounded-plena"
                        style={{
                          width: `${largura}%`,
                          background: corDeExibicao(c.nome, i),
                        }}
                      />
                      <span
                        aria-hidden="true"
                        className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-contorno"
                      />
                    </div>
                  </li>
                );
              })}
            </ul>

            <p className="mt-2 max-w-texto text-micro text-tinta-media lg:hidden">
              Todas as barras estão na mesma régua: de 0 a 50% dos votos no 1º turno. O risco na
              marca do meio é a metade dessa régua, 25%.
            </p>

            <p className="mt-3 text-micro text-tinta-media numeros">
              Branco, nulo e quem ainda não sabe somam {fmt(campoCompleto.bn)}% na média. Outros
              nomes testados em alguma pesquisa ficam em 1% ou menos e não entram no ranking.
            </p>

            {/* ---------- abaixo de lg: um cartão por candidato ----------
                Dez colunas não cabem em 390 nem em 768 sem rolagem lateral, e
                tabela que rola de lado é o padrão que §6.3 bane. */}
            <ul
              className="mt-4 flex flex-col gap-2 lg:hidden"
              aria-label="Cada candidato, pesquisa a pesquisa"
            >
              {campoCompleto.linhas.map((c) => (
                <li key={c.nome} className="rounded-nicho bg-nicho p-4">
                  <details>
                    <summary className="flex min-h-toque flex-wrap items-center justify-between gap-x-3 text-corpo text-tinta">
                      <span className="font-semibold">{c.nome}</span>
                      <span className="numeros">
                        média {fmt(c.media)}%{" "}
                        <span className="font-semibold text-ameixa underline decoration-from-font underline-offset-2">
                          ver por instituto
                        </span>
                      </span>
                    </summary>
                    <dl className="mt-2 space-y-1 text-micro numeros">
                      {campoCompleto.pollsCampo.map((p) => {
                        const v = valCand(p, c.nome);
                        return (
                          <div key={p.id} className="flex justify-between gap-3">
                            <dt className="text-tinta-media">
                              {p.instituto} · {fmtData(p.fim)}
                            </dt>
                            <dd className="text-tinta">
                              {v != null ? `${fmt(v, v % 1 ? 1 : 0)}%` : "não testou esse nome"}
                            </dd>
                          </div>
                        );
                      })}
                    </dl>
                  </details>
                </li>
              ))}
            </ul>

            {/* ---------- lg+: UMA tabela só ----------
                A seção tinha duas leituras do mesmo dado empilhadas: o ranking
                com as barras (numa coluna de 512px, com 49,7% da placa vazia à
                direita) e, logo abaixo, a matriz candidato × instituto. Ler
                "Lula 41,4%" duas vezes na mesma tela é o que VOZ §4 proíbe.
                A partir de `lg` a MATRIZ absorve a régua como segunda coluna e
                o ranking se recolhe: uma tabela, uma leitura, zero vazio. O
                ranking continua sendo a forma de 390 e 768, onde a matriz não
                caberia.

                `table-fixed` + `<colgroup>`: os sete institutos dividem o que
                sobra em partes iguais e a tabela não pode exceder a placa. O
                `overflow-x-auto` é rede defensiva — com larguras fixas ele
                nunca chega a rolar. */}
            <div className="mt-4 hidden overflow-x-auto lg:block">
              <table className="w-full table-fixed text-micro numeros">
                <caption className="sr-only">
                  Cada candidato no 1º turno: onde a média dele cai na régua de 0 a 50% dos votos, a
                  média do painel e o número pesquisa a pesquisa (as 7 mais recentes que divulgaram
                  o 1º turno).
                </caption>
                <colgroup>
                  <col className="w-[16%]" />
                  <col className="w-[27%]" />
                  <col className="w-[8%]" />
                  {campoCompleto.pollsCampo.map((p) => (
                    <col key={p.id} />
                  ))}
                </colgroup>
                <thead>
                  <tr className="text-left align-bottom text-tinta-media">
                    <th scope="col" className="py-2 pr-3 font-medium">
                      Candidato
                    </th>
                    {/* A régua dos 0 a 50% vive no CABEÇALHO da coluna que ela
                        nomeia — mesma largura e mesmo recuo das barras de
                        baixo, que é o que faz o "25%" cair exatamente sobre o
                        risco da metade de cada trilho. */}
                    <th scope="col" className="py-2 pr-3 font-medium">
                      Onde a média cai
                      <span
                        aria-hidden="true"
                        className="relative mt-1 block h-4 font-normal text-tinta-media"
                      >
                        <span className="absolute left-0">0</span>
                        <span className="absolute left-1/2 -translate-x-1/2">25%</span>
                        <span className="absolute right-0">50% dos votos</span>
                      </span>
                    </th>
                    <th scope="col" className="coluna-numerica py-2 pr-3 font-medium">
                      Média
                    </th>
                    {campoCompleto.pollsCampo.map((p) => (
                      <th
                        key={p.id}
                        scope="col"
                        className="coluna-numerica py-2 pr-3 font-medium whitespace-nowrap"
                      >
                        {ABREV_INSTITUTO[p.instituto] ? (
                          <>
                            <span aria-hidden="true">{ABREV_INSTITUTO[p.instituto]}</span>
                            <span className="sr-only">{p.instituto}</span>
                          </>
                        ) : (
                          p.instituto
                        )}
                        <br />
                        {fmtData(p.fim)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {campoCompleto.linhas.map((c, i) => {
                    const largura = Math.min(100, (100 * c.media) / REGUA_MAX);
                    return (
                      <tr
                        key={c.nome}
                        className={`border-t border-filete align-top ${LINHA_TABELA}`}
                      >
                        <th scope="row" className="py-2 pr-3 text-left font-semibold text-tinta">
                          {i + 1}º · {c.nome}
                          <span className="block font-normal text-tinta-media">
                            {c.partido} · média de {c.k} {c.k === 1 ? "pesquisa" : "pesquisas"}
                          </span>
                          {i < 2 ? (
                            <Chip tom="ameixa" className="mt-1">
                              disputa principal
                            </Chip>
                          ) : null}
                        </th>
                        <td className="py-2 pr-3">
                          <div className="relative mt-1 h-3 overflow-hidden rounded-plena bg-nicho">
                            <div
                              data-testid={`barra-candidato-${i}`}
                              className="h-full rounded-plena"
                              style={{
                                width: `${largura}%`,
                                background: corDeExibicao(c.nome, i),
                              }}
                            />
                            <span
                              aria-hidden="true"
                              className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-contorno"
                            />
                          </div>
                        </td>
                        <td className="coluna-numerica py-2 pr-3 font-semibold text-tinta">
                          {fmt(c.media)}
                        </td>
                        {campoCompleto.pollsCampo.map((p) => {
                          const v = valCand(p, c.nome);
                          return (
                            <td key={p.id} className="coluna-numerica py-2 pr-3 text-tinta-media">
                              {v != null ? fmt(v, v % 1 ? 1 : 0) : "–"}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div className="mt-3 lg:grid lg:grid-cols-2 lg:items-start lg:gap-10">
                <p className="max-w-texto text-micro text-tinta-media">
                  Todas as barras estão na mesma régua: de 0 a 50% dos votos no 1º turno. O risco na
                  marca do meio é a metade dessa régua, 25%.
                </p>
                <p className="mt-2 max-w-texto text-micro text-tinta-media lg:mt-0">
                  “–” quer dizer que o instituto não testou esse nome naquela pesquisa, ou não
                  divulgou o número.
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </Bloco>
  );
}
