"use client";

/**
 * "E se as pesquisas errarem como em 2022?" (COPY-DECK §L, INVENTÁRIO 3.8).
 *
 * O passado é AFIRMAÇÃO; o futuro é CONDIÇÃO (H8). Por isso a tabela dos cinco
 * pleitos fala no pretérito e sem ressalva, e toda frase sobre 2026 começa com
 * "se". A seção existe para dar TAMANHO ao erro possível, não para prever que
 * ele vai acontecer.
 *
 * Abaixo de `md` a tabela vira cartões: a coluna do ERRO é a razão de existir
 * do bloco e some por completo numa tabela espremida.
 */
import { useMemo } from "react";
import {
  Bloco,
  Cabecalho,
  Colunas,
  Detalhe,
  LINHA_TABELA,
  LinkExterno,
  Nicho,
  Subtitulo,
} from "@/components/ui/blocos";
import { parEmCem } from "@/components/ui/textos";
import { calcReplay } from "@/lib/modelo";
import { ERROS_TRADUZIDOS, FONTES_TRADUZIDAS } from "./copia-erros";
import { CurvaSensibilidade } from "./curva-sensibilidade";
import { Replay2022 } from "./replay-2022";
import { usePainel } from "./estado";

export function Erro2022() {
  const { M } = usePainel();
  const replay = useMemo(() => calcReplay(M), [M]);
  const [elDia] = parEmCem(replay?.elRepD ?? null);

  return (
    <Bloco rotuladoPor="titulo-erro-2022">
      <Cabecalho
        id="titulo-erro-2022"
        pergunta="E se as pesquisas errarem como em 2022?"
        resposta={
          <>
            Se o erro do 2º turno de 2022 se repetisse igual, Lula continuaria à frente — eleito em{" "}
            <span className="numeros">{elDia}</span> de cada 100 cenários, e por pouco, como em
            2022.
          </>
        }
        traduzindo={
          <>
            Esta seção compara o que as pesquisas de véspera diziam com o resultado real, em cinco
            eleições. Serve para dar tamanho ao erro possível. Não é uma previsão de que ele vai
            acontecer de novo.
          </>
        }
      />

      {/* ---------- abaixo de lg: cartões ----------
          A 768 a coluna "De quanto foi o erro" — a razão de existir do bloco —
          saía cortada em x≈712 dentro de uma tabela que rolava de lado. */}
      <ul
        className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2 lg:hidden"
        aria-label="Erro das pesquisas, eleição a eleição"
      >
        {ERROS_TRADUZIDOS.map((h) => (
          <li key={h.pleito}>
            {/* Rótulo e valor na MESMA linha: empilhados, os cinco cartões
                custavam ~1 500px de altura a 390 sem dizer nada a mais. */}
            <Nicho>
              <p className="text-secao text-tinta">{h.pleito}</p>
              <dl className="mt-2 text-micro">
                <div className="flex flex-wrap gap-x-2">
                  <dt className="text-tinta-media">O resultado real:</dt>
                  <dd className="text-tinta numeros">{h.urna}</dd>
                </div>
                <div className="mt-1 flex flex-wrap gap-x-2">
                  <dt className="text-tinta-media">As pesquisas de véspera:</dt>
                  <dd className="text-tinta numeros">{h.pesq}</dd>
                </div>
                <div className="mt-2">
                  <dt className="sr-only">De quanto foi o erro</dt>
                  <dd className="text-corpo text-tinta">{h.erro}</dd>
                </div>
              </dl>
            </Nicho>
          </li>
        ))}
      </ul>

      {/* ---------- lg+: tabela ----------
          Mesma cirurgia da tabela da série: `table-fixed` com `<colgroup>` em
          porcentagem, e a região de rolagem (com os gradientes e o `tabIndex`)
          desaparece porque não há mais o que rolar. A coluna do ERRO — a razão
          de existir do bloco — é a mais larga depois da fala das pesquisas. */}
      <div className="relative mt-5 hidden lg:block">
        <table className="w-full table-fixed text-micro">
          <caption className="sr-only">
            O que as pesquisas de véspera diziam e qual foi o resultado real, em cinco eleições.
          </caption>
          <colgroup>
            <col className="w-[14%]" />
            <col className="w-[22%]" />
            <col className="w-[34%]" />
            <col className="w-[30%]" />
          </colgroup>
          <thead>
            <tr className="text-left align-bottom text-tinta-media">
              <th scope="col" className="py-2 pr-3 font-medium">
                Eleição
              </th>
              <th scope="col" className="py-2 pr-3 font-medium">
                O resultado real
              </th>
              <th scope="col" className="py-2 pr-3 font-medium">
                O que as pesquisas de véspera diziam
              </th>
              <th scope="col" className="py-2 font-medium">
                De quanto foi o erro
              </th>
            </tr>
          </thead>
          <tbody>
            {ERROS_TRADUZIDOS.map((h) => (
              <tr key={h.pleito} className={`border-t border-filete align-top ${LINHA_TABELA}`}>
                <th scope="row" className="py-3 pr-3 text-left font-semibold text-tinta">
                  {h.pleito}
                </th>
                <td className="py-3 pr-3 text-tinta-media numeros">{h.urna}</td>
                <td className="py-3 pr-3 text-tinta-media numeros">{h.pesq}</td>
                <td className="py-3 text-tinta">{h.erro}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2 md:items-start">
        <Nicho tom="atencao">
          <Subtitulo>Por que pode acontecer de novo</Subtitulo>
          <p className="mt-1 text-corpo text-tinta">
            O erro não foi acidente de uma eleição. Em 2018 e em 2022 as pesquisas subestimaram a
            direita — parte desse eleitor não responde, parte decide na última hora. O país continua
            dividido do mesmo jeito e os métodos das casas continuam parecidos. Nada garante que a
            correção já veio.
          </p>
        </Nicho>
        <Nicho>
          <Subtitulo>Por que pode ser menor</Subtitulo>
          <p className="mt-1 text-corpo text-tinta-media numeros">
            A eleição se decide no 2º turno, e é ali que o erro histórico é bem menor: de 0,4 a 6,2
            pontos em 2022, quase zero em 2018. Além disso, o candidato da direita agora é outro:
            Flávio, não Jair. Não se sabe quanto do voto se transfere, e a direção do erro não é
            regra.
          </p>
        </Nicho>
      </div>

      {/* Quatro parágrafos de aprofundamento — a resposta da seção já foi dada
          acima, e a 390 eles custavam mais de mil pixels de rolagem antes do
          gráfico. Viram detalhe, com afordância de controle: nada saiu da
          página, e quem quer a íntegra alcança num toque. */}
      <Detalhe
        titulo="Por que o erro do 1º turno importa agora, se o do 2º é menor"
        className="mt-5"
      >
        <Colunas
          arranjo="iguais"
          className="mt-2 space-y-3 text-corpo text-tinta-media numeros lg:gap-y-3 lg:space-y-0"
        >
          <p className="max-w-texto">
            O erro pequeno da decisão de 2022 (3,1 pontos) só foi possível porque, entre um turno e
            outro, os institutos ganharam um gabarito perfeito: o resultado real do 1º turno. Com
            ele na mão, eles corrigiram o método.{" "}
            <b className="font-semibold text-tinta">
              As pesquisas que alimentam este painel ainda não passaram por essa correção
            </b>{" "}
            — são o mesmo tipo de instrumento que produziu o erro de 6,3.
          </p>
          <p className="max-w-texto">
            Por isso o erro do 1º turno entra três vezes na conta. Ele dá o tamanho da dúvida de
            hoje (o padrão de 4,0 fica entre os dois números). Ele muda a cara do 1º turno
            projetado: uma folga de cerca de 9 pontos vira uma chegada de cerca de 2,5. E ele define
            o teto do erro já visto no setor, usado no cartão de teste-limite. O 3,1 só vira a
            referência certa depois de 4 de outubro, quando o gabarito voltar a existir.
          </p>
          <p className="max-w-texto">
            <b className="font-semibold text-tinta">
              E as correções duram de uma eleição para a outra?
            </b>{" "}
            Só em parte. Ajustes de método (peso de escolaridade, religião, forma de sortear quem
            responde) ficam. Mas a arma que salvou o 2º turno de 2022 — refazer a conta com o voto
            real recém-apurado — não é portátil: o gabarito envelhece e quem não responde muda.
            Existem dois testes. De 2018 para 2022, o erro do 1º turno voltou, no mesmo sentido e de
            tamanho parecido. Em São Paulo, em 2024, dois anos depois da correção, Datafolha e
            Quaest ficaram 4,7 e 8,7 pontos abaixo da diferença real de Nunes — a Futura acertou.
            Correção parcial e desigual: nem cura, nem volta à estaca zero.
          </p>
          <p className="max-w-texto">
            Traduzindo em número, sempre falando da chance de Lula no dia da votação: se a correção
            se manteve (régua em 3,0), cerca de 86 em 100. Se veio só em parte — o padrão do painel,
            4,0 — cerca de 83 em 100. Se o erro voltar para perto do tamanho do 1º turno (6,0, o
            topo da régua), cerca de 79 em 100. Escolha a sua suposição na régua de erro, logo
            acima.
          </p>
        </Colunas>
      </Detalhe>

      <CurvaSensibilidade />
      <Replay2022 />

      <Detalhe titulo="De onde vieram os números de erro" className="mt-6">
        <ul className="mt-1">
          {FONTES_TRADUZIDAS.map((f) => (
            <li key={f.url} className="flex min-h-toque items-center">
              <LinkExterno href={f.url} className="text-micro">
                {f.nome}
              </LinkExterno>
            </li>
          ))}
        </ul>
      </Detalhe>
    </Bloco>
  );
}
