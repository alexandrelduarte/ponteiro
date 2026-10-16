"use client";

/**
 * "Quem está na frente?" — o cartão do 2º turno e o do 1º turno já realizado
 * (COPY-DECK §E). Desde 04/10 o cartão do 1º turno é FATO: o resultado oficial
 * do TSE ao lado do que as pesquisas da véspera diziam (src/lib/erro-1t.ts).
 *
 * Padrão de bloco em três camadas (VOZ §7): a PERGUNTA que a pessoa faz, a
 * RESPOSTA que já conclui com o número, e o TRADUZINDO. Só então os nichos com
 * os valores. Nenhum bloco começa por número solto.
 *
 * Os dois candidatos aparecem sempre na mesma ordem (Lula à esquerda, Flávio à
 * direita), com o mesmo tamanho, a mesma estrutura de frase e a mesma
 * quantidade de ressalvas — é a ordem da RÉGUA, não a do placar (VOZ §2.4).
 *
 * A PONTE DE VOCABULÁRIO mora aqui: esta é a PRIMEIRA vez que a home imprime
 * "folga da medida", e o leitor que chega com "margem de erro" na cabeça — que
 * é como a televisão fala — precisa de um lugar para encostar o termo. Os dois
 * nomes aparecem juntos, uma vez, na primeira ocorrência da superfície.
 */
import { Bloco, Cabecalho, Nicho, Subtitulo } from "@/components/ui/blocos";
import { MaisSobre, Termo } from "@/components/ui/glossario";
import { abs1, emCem, pessoasEmCem } from "@/components/ui/textos";
import { RESULTADO_1T, pct1T } from "@/data/resultado-1t";
import { calcErro1T, JANELA_VESPERA_1T } from "@/lib/erro-1t";
import { fmt, fmtData, fmtSinal } from "@/lib/modelo";
import { usePainel } from "./estado";
import { Tendencia } from "./tendencia";

export function Frente() {
  const { M, pesquisasOficiais } = usePainel();

  const [validoL, validoF] = [fmt(M.validoL2), fmt(100 - M.validoL2)];
  const bnT2 = fmt(100 - M.mediaL2 - M.mediaF2);
  const t2Lula = emCem(M.pL2dia);
  const t2HojeLula = emCem(M.pL2hoje);
  // Pesquisa recente em que aparece à frente QUEM NÃO LIDERA A MÉDIA — dado,
  // não texto fixo: a frase só existe enquanto existir a linha (H12/R4), e vale
  // igual para os dois lados (simetria R4).
  const liderMediaLula = M.margem >= 0;
  const invertida = M.linhas
    .filter((l) => l.idadeDias < 35 && (liderMediaLula ? l.margem2 < 0 : l.margem2 > 0))
    .sort((a, b) => a.idadeDias - b.idadeDias)[0];
  const nomeInvertida = liderMediaLula ? "Flávio" : "Lula";

  const erro1T = calcErro1T(pesquisasOficiais);

  return (
    <Bloco rotuladoPor="titulo-frente">
      <Cabecalho
        id="titulo-frente"
        pergunta="Quem está na frente?"
        resposta={
          <>
            <b className="font-semibold">Na média das pesquisas</b> do 2º turno, Lula tem{" "}
            <span className="numeros">{fmt(M.mediaL2)}%</span> e Flávio{" "}
            <span className="numeros">{fmt(M.mediaF2)}%</span> — diferença de{" "}
            <span className="numeros">{abs1(M.margem)}</span> pontos, cerca de{" "}
            <span className="numeros">{pessoasEmCem(M.margem)}</span> pessoas a mais em cada 100.
          </>
        }
        traduzindo={
          <>
            Estes são os números das pesquisas, sem projeção: a média que o painel faz do que os
            institutos mediram até agora. No 1º turno, em 4 de outubro, ninguém passou da metade dos{" "}
            <Termo chave="votosValidos">votos válidos</Termo> — a decisão é em 25 de outubro.
          </>
        }
      />

      <div className="mt-5 grid gap-4 md:grid-cols-2 md:items-start">
        {/* ---------------- 2º turno ---------------- */}
        <Nicho>
          <Subtitulo>2º turno · 25 de outubro · é aqui que se decide</Subtitulo>

          {/* O «×» viaja preso ao segundo nome: se a linha quebrar, quebra
              inteira («× Flávio 42,2%»), nunca deixando o separador órfão. */}
          <p className="mt-2 flex flex-wrap items-baseline gap-x-3 font-display text-manchete-2">
            <span data-testid="media-2t-lula" className="text-lula numeros">
              Lula {fmt(M.mediaL2)}%
            </span>
            <span className="flex items-baseline gap-x-3 whitespace-nowrap">
              <span aria-hidden="true" className="text-intro text-tinta-media">
                ×
              </span>
              <span className="text-flavio numeros">Flávio {fmt(M.mediaF2)}%</span>
            </span>
          </p>
          <p className="mt-1 text-corpo text-tinta numeros">diferença de {abs1(M.margem)} pontos</p>

          {/* DIETA: a frase inteira de votos válidos ocupava três linhas para
              entregar dois números. Fica o RÓTULO com os números — que é o
              dado — e a frase auditada abre no "?", palavra por palavra, com o
              aposto ("o bolo depois de tirar os N% de branco, nulo e quem não
              sabe") que é o que ela tem de explicativo. */}
          <p className="mt-3 text-micro text-tinta-media">
            Em <Termo chave="votosValidos">votos válidos</Termo>:{" "}
            <span className="numeros">
              {validoL}% × {validoF}%
            </span>{" "}
            <MaisSobre
              titulo="Votos válidos no 2º turno"
              rotuloAcessivel="ver a conta dos votos válidos do 2º turno"
            >
              Em votos válidos — o bolo depois de tirar os {bnT2}% de branco, nulo e quem não sabe,
              que é o que falta para 100 nos números acima — fica {validoL}% × {validoF}%.
            </MaisSobre>
          </p>

          <p className="mt-3 text-micro text-tinta-media">
            {M.qtdRecentes > 0 ? (
              <>
                <span className="numeros">{M.qtdEmpate}</span> das{" "}
                <span className="numeros">{M.qtdRecentes}</span> pesquisas dos últimos 35 dias estão
                em
              </>
            ) : (
              <>Nenhuma pesquisa da lista é dos últimos 35 dias. Uma pesquisa está em</>
            )}{" "}
            <Termo chave="empateTecnico">empate técnico</Termo> quando a diferença é menor que{" "}
            <b className="font-semibold text-tinta">o dobro</b> da{" "}
            <b className="font-semibold text-tinta">folga da medida — a margem de erro</b>. É essa a
            folga que vale quando se comparam os dois números.
            {invertida ? (
              <>
                {" "}
                Em {invertida.instituto}, quem aparece à frente é {nomeInvertida}, por{" "}
                <span className="numeros">{abs1(invertida.margem2)}</span>{" "}
                {Math.abs(invertida.margem2) === 1 ? "ponto" : "pontos"}
                {invertida.empate2 ? ", ainda dentro dessa folga" : ""}.
              </>
            ) : null}
          </p>

          <p className="mt-2 text-micro text-tinta-media">
            Os institutos discordam entre si em cerca de{" "}
            <span className="numeros">{fmt(M.sdEntre)}</span> pontos{" "}
            <b className="font-semibold text-tinta">na diferença entre os dois</b>.
          </p>

          <div className="mt-3 space-y-1 text-corpo text-tinta">
            <p className="numeros">
              Se a decisão fosse hoje, Lula ganharia em <b>{t2HojeLula}</b> de cada 100 cenários.
            </p>
            <p className="numeros">
              No dia 25 de outubro, em <b>{t2Lula}</b> de cada 100.
            </p>
          </div>

          <p className="mt-3 text-micro text-tinta-media numeros">
            Em 8 de cada 10 cenários, a diferença{" "}
            <b className="font-semibold text-tinta">medida nas pesquisas</b> fica entre{" "}
            {fmtSinal(M.int80[0])} e {fmtSinal(M.int80[1])} pontos.
            {M.int80[0] < 0 && M.int80[1] > 0 ? " A faixa inclui vitórias dos dois lados." : ""}
          </p>
        </Nicho>

        {/* ---------------- 1º turno: resultado oficial ----------------
            Fato, não estimativa. Ao lado, o que as pesquisas da última semana
            diziam — a mesma conta que mediu o erro de 2022 (src/lib/erro-1t.ts). */}
        <Nicho>
          <Subtitulo>1º turno · 4 de outubro · resultado oficial</Subtitulo>

          <p
            data-testid="resultado-1t-frente"
            className="mt-2 flex flex-wrap items-baseline gap-x-3 font-display text-manchete-2"
          >
            <span className="text-lula numeros">Lula {fmt(pct1T("Lula"), 2)}%</span>
            <span className="flex items-baseline gap-x-3 whitespace-nowrap">
              <span aria-hidden="true" className="text-intro text-tinta-media">
                ×
              </span>
              <span className="text-flavio numeros">
                Flávio {fmt(pct1T("Flávio Bolsonaro"), 2)}%
              </span>
            </span>
          </p>
          <p className="mt-1 text-corpo text-tinta">
            Em <Termo chave="votosValidos">votos válidos</Termo>, contados pelo TSE. Ninguém passou
            da metade, por isso há 2º turno.
          </p>

          {erro1T ? (
            <p data-testid="erro-1t" className="mt-3 text-micro text-tinta-media numeros">
              Na última semana antes da votação ({fmtData(JANELA_VESPERA_1T.de)} a{" "}
              {fmtData(JANELA_VESPERA_1T.ate)}), a média de {erro1T.k} pesquisas dava Lula{" "}
              {fmt(erro1T.pesqL)}% × Flávio {fmt(erro1T.pesqF)}%.{" "}
              {Math.abs(erro1T.erroMargem) < 0.5 ? (
                <>A urna confirmou a diferença que as pesquisas mostravam.</>
              ) : (
                <>
                  Na diferença entre os dois, as pesquisas erraram{" "}
                  <b className="font-semibold text-tinta">
                    {abs1(erro1T.erroMargem)} pontos a favor de{" "}
                    {erro1T.erroMargem > 0 ? "Lula" : "Flávio"}
                  </b>
                  .
                </>
              )}
            </p>
          ) : null}

          <p className="mt-3 text-micro text-tinta-media">
            Fonte:{" "}
            <a
              href={RESULTADO_1T.fonte}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2"
            >
              resultado oficial do TSE
            </a>
            .
          </p>
        </Nicho>
      </div>

      {/* ---------------- Tendência ----------------
          A nota do método era uma faixa de texto sozinha embaixo de duas
          colunas curtas — a assinatura visual da faixa morta. Em `lg` ela vira
          a TERCEIRA coluna, ao lado das duas listas que ela explica. */}
      <div className="mt-5">
        <Subtitulo>Subiu ou desceu desde a pesquisa anterior?</Subtitulo>
        <div className="mt-2 grid gap-4 md:grid-cols-2 md:items-start">
          <div className="flex flex-col gap-1">
            <p className="text-etiqueta text-tinta-media">2º turno</p>
            <Tendencia t={M.tend2.l} rotulo="Lula" />
            <Tendencia t={M.tend2.f} rotulo="Flávio" />
            <Tendencia t={M.tend2.m} rotulo="Diferença" />
          </div>
          <p className="max-w-texto text-micro text-tinta-media">
            Para não confundir método com movimento, o painel compara cada instituto com ele mesmo:
            a pesquisa nova contra a anterior da mesma casa. Subir agora não quer dizer que vai
            continuar subindo.
          </p>
        </div>
      </div>
    </Bloco>
  );
}
