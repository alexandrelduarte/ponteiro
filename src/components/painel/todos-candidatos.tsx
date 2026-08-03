"use client";

/**
 * Aba "Todos os candidatos" — ranking do 1º turno estimulado.
 *
 * Correção de acessibilidade em relação ao protótipo (docs/DESIGN.md §5.5): o
 * NOME do candidato é sempre `--color-tinta`; a cor do candidato aparece só como
 * preenchimento de barra, com contorno de 1px em `--color-linha-forte` para
 * garantir o limite discernível (1.4.11) mesmo nos tons claros.
 */
import { Cartao } from "@/components/ui/cartao";
import { Vazio } from "@/components/ui/basicos";
import { fmt, fmtData, valCand } from "@/lib/modelo";
import { usePainel } from "./estado";

/**
 * Abreviação INTENCIONAL do nome do instituto para o cabeçalho da matriz
 * cruzada abaixo de `md`, onde as 7 colunas + candidato + média disputam 326px.
 *
 * O `slice(0,7)` anterior era corte cego de string: entregava `PODERDA`,
 * `ATLASIN`, `DATAFOL` e `GENIAL` — palavra mutilada onde o §P9 pede a
 * procedência do número. Abreviação com ponto é convenção de imprensa e diz ao
 * leitor que faltam letras. Em `md+` o nome sai inteiro (o espaço sobra: a
 * 1440 mediram-se ~60px livres por coluna), e o nome completo continua no
 * rótulo acessível em qualquer largura.
 *
 * «Genial/Quaest» abrevia para «Quaest» — o instituto de campo; «Genial» é o
 * contratante, e é o nome que o `split("/")[0]` entregaria.
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

export function TodosCandidatos() {
  const { campoCompleto } = usePainel();

  if (!campoCompleto) {
    return (
      <Cartao titulo="Todos os candidatos · 1º turno estimulado" destaque="confirma">
        <Vazio titulo="Nenhuma rodada da série divulgou o 1º turno estimulado.">
          Sem esse dado não há ranking a mostrar — só o confronto de 2º turno, que segue no painel
          principal. Quando um instituto voltar a divulgar o cenário de 1º turno, esta aba se
          preenche sozinha.
        </Vazio>
      </Cartao>
    );
  }

  const { linhas, pollsCampo, bn, gap3 } = campoCompleto;
  const lider = linhas[0];

  return (
    <Cartao
      idTitulo="titulo-todos-candidatos"
      titulo="Todos os candidatos · 1º turno estimulado (média ponderada por recência e amostra)"
      destaque="confirma"
    >
      <ul className="space-y-2">
        {linhas.map((c, i) => {
          const largura = (100 * c.media) / lider.media;
          return (
            <li key={c.nome}>
              <div className="flex items-baseline justify-between gap-2 text-sm">
                <span className="text-tinta">
                  <b>
                    {i + 1}º · {c.nome}
                  </b>{" "}
                  <span className="text-xs text-cinza">({c.partido})</span>
                  {/* A 390px o selo cabia na linha do nome para «Lula» e
                      quebrava para «Flávio Bolsonaro», deixando o `●` órfão no
                      fim da primeira linha: as duas fileiras do topo ficavam
                      com estruturas diferentes no único bloco em que os nove
                      candidatos aparecem lado a lado (§5.1). Abaixo de `sm` o
                      selo tem linha própria NOS DOIS, e nunca se parte. */}
                  {i < 2 ? (
                    <span className="mt-0.5 block text-xs font-semibold whitespace-nowrap text-confirma-texto sm:mt-0 sm:ml-1 sm:inline">
                      ● disputa principal
                    </span>
                  ) : null}
                </span>
                <span className="font-mono font-semibold whitespace-nowrap">
                  {fmt(c.media)}%{" "}
                  <span className="text-xs font-normal text-cinza">· {c.k} pesq.</span>
                </span>
              </div>
              {/* §5.5 pede o preenchimento com CONTORNO de 1px em
                  `--color-linha-forte` — o contorno inteiro, não só a tampa
                  direita: é ele que garante o limite discernível (1.4.11) para
                  as cores que não alcançam 3:1 sobre o trilho (Zema, 2,53:1). */}
              <div className="mt-0.5 h-4 overflow-hidden rounded-controle border border-linha bg-mini">
                <div
                  className="h-full border border-linha-forte"
                  style={{ width: `${largura}%`, background: c.cor }}
                />
              </div>
            </li>
          );
        })}
      </ul>

      <p className="pt-1 text-xs text-cinza">
        Branco/nulo + não sabe (média): <b className="font-mono text-tinta">{fmt(bn)}%</b> · demais
        nomes testados (Hertz Dias, Rui C. Pimenta, Edmilson Costa, Heró Bezerra) somam ≤1% cada.
      </p>

      {/* `relative` + `.rolagem-x`: recorta os `sr-only` (position:absolute) do
          conteúdo rolável dentro do wrapper e mostra a borda de rolagem. */}
      <div
        className="relative mt-4 overflow-x-auto rolagem-x"
        role="group"
        tabIndex={0}
        aria-labelledby="titulo-todos-candidatos"
      >
        <table className="w-full font-mono text-xs">
          <caption className="sr-only">
            Intenção de voto de cada candidato no 1º turno, pesquisa a pesquisa (as 7 rodadas mais
            recentes com 1º turno divulgado) e a média ponderada.
          </caption>
          <thead>
            <tr className="text-left text-cinza uppercase">
              <th scope="col" className="py-2 pr-3 font-medium">
                Candidato
              </th>
              {pollsCampo.map((p) => (
                <th key={p.id} scope="col" className="py-2 pr-3 font-medium whitespace-nowrap">
                  {/* O nome inteiro é o rótulo acessível em toda largura; a
                      abreviação é só a forma visível abaixo de `md`. */}
                  <span aria-hidden="true" className="md:hidden">
                    {ABREV_INSTITUTO[p.instituto] ?? p.instituto}
                  </span>
                  <span className="sr-only md:not-sr-only">{p.instituto}</span>
                  <br />
                  {fmtData(p.fim)}
                </th>
              ))}
              <th scope="col" className="py-2 font-medium">
                Média
              </th>
            </tr>
          </thead>
          <tbody>
            {linhas.map((c) => (
              <tr key={c.nome} className="border-t border-linha">
                <th
                  scope="row"
                  className="py-1.5 pr-3 text-left font-sans font-semibold whitespace-nowrap text-tinta"
                >
                  {c.nome}
                </th>
                {pollsCampo.map((p) => {
                  const v = valCand(p, c.nome);
                  return (
                    <td key={p.id} className="py-1.5 pr-3">
                      {v != null ? fmt(v, v % 1 ? 1 : 0) : "–"}
                    </td>
                  );
                })}
                <td className="py-1.5 font-semibold">{fmt(c.media)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-sm leading-compacto text-cinza">
        <b className="text-tinta">Por que o painel modela só o confronto líder:</b> o 3º colocado (
        {linhas[2]?.nome}, <span className="font-mono">{fmt(linhas[2]?.media)}%</span>) está{" "}
        <b className="font-mono text-tinta">{fmt(gap3)} pontos</b> atrás do 2º — uma distância sem
        precedente de reversão na série de 2026. Enquanto isso valer, a eleição se decide entre os
        dois primeiros, e é para esse par que os institutos simulam o 2º turno. «–» na tabela = nome
        não testado ou não divulgado naquela rodada (a Datafolha, por exemplo, só divulgou os dois
        líderes em julho).
      </p>
    </Cartao>
  );
}
