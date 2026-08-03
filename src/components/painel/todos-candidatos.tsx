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
                  {i < 2 ? (
                    <span className="ml-1 text-xs font-semibold text-confirma-texto">
                      ● disputa principal
                    </span>
                  ) : null}
                </span>
                <span className="font-mono font-semibold whitespace-nowrap">
                  {fmt(c.media)}%{" "}
                  <span className="text-xs font-normal text-cinza">· {c.k} pesq.</span>
                </span>
              </div>
              <div className="mt-0.5 h-4 overflow-hidden rounded-controle border border-linha bg-mini">
                <div
                  className="h-full border-r border-linha-forte"
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
                  {p.instituto.split("/")[0].slice(0, 7)}
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
