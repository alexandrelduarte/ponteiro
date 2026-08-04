"use client";

/**
 * "Quem está na frente?" — os cartões de 1º e 2º turno (COPY-DECK §E).
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
import { Termo } from "@/components/ui/glossario";
import { abs1, emCem, parEmCem, pessoasEmCem } from "@/components/ui/textos";
import { fmt, fmtSinal } from "@/lib/modelo";
import { usePainel } from "./estado";
import { Tendencia } from "./tendencia";

export function Frente() {
  const { M } = usePainel();

  const [validoL, validoF] = [fmt(M.validoL2), fmt(100 - M.validoL2)];
  const bnT2 = fmt(100 - M.mediaL2 - M.mediaF2);
  const t2Lula = emCem(M.pL2dia);
  const t2HojeLula = emCem(M.pL2hoje);
  const [p1LulaDia] = parEmCem(M.p1?.lulaDia ?? null);
  const p1FlavioDia = emCem(M.p1?.flavioDia ?? null);
  const p1LulaHoje = emCem(M.p1?.lulaHoje ?? null);

  // Pesquisa recente em que quem aparece à frente é Flávio — dado, não texto
  // fixo: a frase só existe enquanto existir a linha (H12/R4).
  const invertida = M.linhas
    .filter((l) => l.idadeDias < 35 && l.margem2 < 0)
    .sort((a, b) => a.idadeDias - b.idadeDias)[0];

  const falta50 = M.t1valL ? fmt(50 - M.t1valL.valor) : null;

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
            institutos mediram até agora. A eleição tem dois dias: 4 de outubro e, se ninguém passar
            de metade dos <Termo chave="votosValidos">votos válidos</Termo>, 25 de outubro.
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

          <p className="mt-3 text-micro text-tinta-media">
            Em <Termo chave="votosValidos">votos válidos</Termo> — o bolo depois de tirar os{" "}
            <span className="numeros">{bnT2}%</span> de branco, nulo e quem não sabe, que é o que
            falta para 100 nos números acima — fica{" "}
            <span className="numeros">
              {validoL}% × {validoF}%
            </span>
            .
          </p>

          <p className="mt-3 text-micro text-tinta-media">
            <span className="numeros">{M.qtdEmpate}</span> das{" "}
            <span className="numeros">{M.qtdRecentes}</span> pesquisas dos últimos 35 dias estão em{" "}
            <Termo chave="empateTecnico">empate técnico</Termo>: nelas, a diferença é menor que{" "}
            <b className="font-semibold text-tinta">o dobro</b> da{" "}
            <b className="font-semibold text-tinta">folga da medida — a margem de erro</b>. É essa a
            folga que vale quando se comparam os dois números.
            {invertida ? (
              <>
                {" "}
                Em {invertida.instituto}, quem aparece à frente é Flávio, por{" "}
                <span className="numeros">{abs1(invertida.margem2)}</span>{" "}
                {Math.abs(invertida.margem2) === 1 ? "ponto" : "pontos"}, ainda dentro dessa folga.
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
            {M.int80[0] < 0
              ? " A ponta de baixo dessa faixa é uma vitória apertada de Flávio."
              : ""}
          </p>
        </Nicho>

        {/* ---------------- 1º turno ---------------- */}
        <Nicho>
          <Subtitulo>1º turno · 4 de outubro</Subtitulo>

          <p className="mt-2 flex flex-wrap items-baseline gap-x-3 font-display text-manchete-2">
            <span className="text-lula numeros">Lula {fmt(M.t1raw?.valor)}%</span>
            <span className="flex items-baseline gap-x-3 whitespace-nowrap">
              <span aria-hidden="true" className="text-intro text-tinta-media">
                ×
              </span>
              <span className="text-flavio numeros">Flávio {fmt(M.t1rawF?.valor)}%</span>
            </span>
          </p>
          <p className="mt-1 text-corpo text-tinta">
            É a média das pesquisas em que o entrevistador mostra a lista de nomes.
          </p>

          {falta50 ? (
            <p className="mt-3 text-micro text-tinta-media">
              Em <Termo chave="votosValidos">votos válidos</Termo>, Lula tem cerca de{" "}
              <span className="numeros">{fmt(M.t1valL?.valor)}%</span> —{" "}
              <b className="font-semibold text-tinta numeros">faltam {falta50} pontos</b> para a
              metade que evitaria o 2º turno.
            </p>
          ) : null}

          <div className="mt-3 space-y-1 text-corpo text-tinta numeros">
            <p>
              Lula ganhar já no 1º turno, se fosse hoje: <b>{p1LulaHoje}</b> em 100
            </p>
            <p>
              Lula ganhar já no 1º turno, em 4 de outubro: <b>{p1LulaDia}</b> em 100
            </p>
          </div>

          <p className="mt-3 text-micro text-tinta-media">
            Flávio ganhar já no 1º turno acontece em{" "}
            <b className="font-semibold text-tinta numeros">{p1FlavioDia}</b> de cada 100 cenários —
            precisaria de mais da metade dos <Termo chave="votosValidos">votos válidos</Termo>.
          </p>
        </Nicho>
      </div>

      {/* ---------------- Tendência ---------------- */}
      <div className="mt-5">
        <Subtitulo>Subiu ou desceu desde a pesquisa anterior?</Subtitulo>
        <div className="mt-2 grid gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-1">
            <p className="text-etiqueta text-tinta-media">2º turno</p>
            <Tendencia t={M.tend2.l} rotulo="Lula" />
            <Tendencia t={M.tend2.f} rotulo="Flávio" />
            <Tendencia t={M.tend2.m} rotulo="Diferença" />
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-etiqueta text-tinta-media">1º turno</p>
            <Tendencia t={M.tend1.l} rotulo="Lula" />
            <Tendencia t={M.tend1.f} rotulo="Flávio" />
            <Tendencia t={M.tend1.m} rotulo="Diferença" />
          </div>
        </div>
        <p className="mt-3 max-w-texto text-micro text-tinta-media">
          Para não confundir método com movimento, o painel compara cada instituto com ele mesmo: a
          pesquisa nova contra a anterior da mesma casa. Subir agora não quer dizer que vai
          continuar subindo.
        </p>
      </div>
    </Bloco>
  );
}
