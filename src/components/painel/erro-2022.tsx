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
import { abs1, emCem, parEmCem } from "@/components/ui/textos";
import { pct1T } from "@/data/resultado-1t";
import { calcErro1T } from "@/lib/erro-1t";
import { calcReplay, fmt, fmtSinal, rodarModelo } from "@/lib/modelo";
import { ERROS_TRADUZIDOS, FONTES_TRADUZIDAS } from "./copia-erros";
import { CurvaSensibilidade } from "./curva-sensibilidade";
import { Replay2022 } from "./replay-2022";
import { usePainel } from "./estado";

export function Erro2022() {
  const { M, pesquisas, pesquisasOficiais, params, hojeMs } = usePainel();
  const replay = useMemo(() => calcReplay(M), [M]);
  const [elDia, elDiaF] = parEmCem(replay?.elRepD ?? null);
  const margemRep = M.margem - 3.1;

  /* O erro do 1º turno de 2026 (pesquisas da última semana × urna) entra na
     tabela como sexta linha, calculado pela regra pública de src/lib/erro-1t.ts. */
  const erro1T = useMemo(() => calcErro1T(pesquisasOficiais), [pesquisasOficiais]);
  const linhas = useMemo(() => {
    if (!erro1T) return ERROS_TRADUZIDOS;
    return [
      ...ERROS_TRADUZIDOS,
      {
        pleito: "2026 · 1º turno",
        urna: `Lula ${fmt(pct1T("Lula"), 2)}% × Flávio ${fmt(pct1T("Flávio Bolsonaro"), 2)}%`,
        pesq: `média de ${erro1T.k} pesquisas da última semana: Lula ${fmt(erro1T.pesqL)}% × Flávio ${fmt(erro1T.pesqF)}%`,
        erro:
          Math.abs(erro1T.erroMargem) < 0.5
            ? "acerto na diferença (menos de meio ponto)"
            : `diferença errada em ${abs1(erro1T.erroMargem)} pontos a favor de ${erro1T.erroMargem > 0 ? "Lula" : "Flávio"}`,
      },
    ];
  }, [erro1T]);

  /* "Traduzindo em número": a chance de Lula no dia sob três tamanhos da dúvida
     sobre o erro do setor (régua de erro 3,0 · padrão 4,0 · 6,0). Calculado,
     nunca fixo — os números de agosto (86/83/79) envelheceram com a série. */
  const porRegua = useMemo(
    () =>
      [3, 4, 6].map((sigmaSys) => {
        const R = rodarModelo(pesquisas, { ...params, sigmaSys }, hojeMs);
        return R ? emCem(R.eleito.dia.l) : "–";
      }),
    [pesquisas, params, hojeMs],
  );

  return (
    <Bloco rotuladoPor="titulo-erro-2022">
      <Cabecalho
        id="titulo-erro-2022"
        pergunta="E se as pesquisas errarem como em 2022?"
        resposta={
          <>
            Se o erro do 2º turno de 2022 (3,1 pontos a favor de Lula) se repetisse igual, a
            diferença passaria a <span className="numeros">{fmtSinal(margemRep)}</span>, com{" "}
            {margemRep >= 0 ? "Lula" : "Flávio"} na frente: Lula eleito em{" "}
            <span className="numeros">{elDia}</span> de cada 100 cenários e Flávio em{" "}
            <span className="numeros">{elDiaF}</span>.
          </>
        }
        traduzindo={
          <>
            Esta seção compara o que as pesquisas de véspera diziam com o resultado real, em{" "}
            {linhas.length === 5 ? "cinco" : "seis"} eleições. Serve para dar tamanho ao erro
            possível. Não é uma previsão de que ele vai acontecer de novo.
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
        {linhas.map((h) => (
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
            O que as pesquisas de véspera diziam e qual foi o resultado real, eleição a eleição.
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
            {linhas.map((h) => (
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
            direita — parte desse eleitor não responde, parte decide na última hora.
            {erro1T && erro1T.erroMargem >= 0.5
              ? " No 1º turno de 2026 aconteceu de novo."
              : ""}{" "}
            Nada garante que a correção já veio.
          </p>
        </Nicho>
        <Nicho>
          <Subtitulo>Por que pode ser menor</Subtitulo>
          <p className="mt-1 text-corpo text-tinta-media numeros">
            A eleição se decide no 2º turno, e é ali que o erro histórico é bem menor: de 0,4 a 6,2
            pontos em 2022, quase zero em 2018. Entre um turno e outro os institutos ganham um
            gabarito — o resultado real do 1º turno — e podem corrigir o método. A direção do erro
            não é regra.
          </p>
        </Nicho>
      </div>

      {/* Quatro parágrafos de aprofundamento — a resposta da seção já foi dada
          acima, e a 390 eles custavam mais de mil pixels de rolagem antes do
          gráfico. Viram detalhe, com afordância de controle: nada saiu da
          página, e quem quer a íntegra alcança num toque. */}
      <Detalhe
        titulo="Por que o erro do 1º turno ainda importa, se o do 2º costuma ser menor"
        className="mt-5"
      >
        <Colunas
          arranjo="iguais"
          className="mt-2 space-y-3 text-corpo text-tinta-media numeros lg:gap-y-3 lg:space-y-0"
        >
          <p className="max-w-texto">
            O erro pequeno da decisão de 2022 (3,1 pontos) só foi possível porque, entre um turno e
            outro, os institutos ganharam um gabarito perfeito: o resultado real do 1º turno. Com
            ele na mão, eles corrigiram o método. Em 2026 o gabarito existe desde 4 de outubro, e as
            pesquisas de 2º turno desta lista foram feitas depois dele.{" "}
            <b className="font-semibold text-tinta">
              Se a correção funcionou, só a urna de 25 de outubro vai dizer
            </b>
            .
          </p>
          <p className="max-w-texto">
            Por isso o erro do 1º turno continua na conta. Ele dá o tamanho da dúvida de hoje (o
            padrão de 4,0 fica entre o 3,1 da decisão de 2022 e os erros maiores dos 1ºs turnos). E
            ele define o teto do erro já visto no setor, usado no cartão de teste-limite.
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
            se manteve (régua em 3,0), cerca de {porRegua[0]} em 100. Se veio só em parte — o padrão
            do painel, 4,0 — cerca de {porRegua[1]} em 100. Se o erro voltar para perto do tamanho
            do 1º turno (6,0, o topo da régua), cerca de {porRegua[2]} em 100. Escolha a sua
            suposição na régua de erro, logo acima.
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
