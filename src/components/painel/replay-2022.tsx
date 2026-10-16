"use client";

/**
 * Replay 2022 — "e se o erro de 2022 se repetisse do mesmo tamanho?"
 * (COPY-DECK §L, INVENTÁRIO 3.8).
 *
 * É uma conta de "E SE" (H6): o aviso de que isto não prevê nada fica no mesmo
 * bloco, nunca atrás de um clique. O erro de cada turno é aplicado NO SEU
 * PRÓPRIO TURNO — os erros de 2022 não se somam, porque o do 2º turno foi
 * medido sobre pesquisas refeitas depois do 1º.
 *
 * As probabilidades aqui são CONDICIONAIS a essa hipótese: dentro dela o erro
 * vira suposição fixa e a única dúvida que sobra é o quanto a opinião ainda
 * pode andar até 25 de outubro. Por isso os números diferem dos do painel
 * principal, e o texto diz exatamente por quê.
 *
 * Desde 04/10 o 1º turno já aconteceu: o cartão do 1º turno some (os campos
 * dele vêm `null` do modelo) e a síntese passa a ser só a decisão.
 */
import { useMemo } from "react";
import { Botao, Chip, Detalhe, Nicho, Subtitulo } from "@/components/ui/blocos";
import { MaisSobre } from "@/components/ui/glossario";
import { emCem, parEmCem } from "@/components/ui/textos";
import { ERRO_2022 } from "@/data/constantes";
import { calcReplay, fmt, fmtSinal } from "@/lib/modelo";
import { usePainel } from "./estado";

export function Replay2022() {
  const { M, definirParam } = usePainel();
  const replay = useMemo(() => calcReplay(M), [M]);

  if (!replay) return null;

  const t1Dif = M.t1valL && M.t1valF ? M.t1valL.valor - M.t1valF.valor : null;
  const [elDia, elDiaF] = parEmCem(replay.elRepD);
  const p2t = emCem(replay.p2Trep);
  const pv2 = emCem(replay.pV2rep);
  const p1Direto = emCem(replay.p1Ld);
  const v2Abs = Math.round(replay.p2Trep * replay.pV2rep * 100);
  const r2lInt = Math.round(replay.r2L);
  const tem1T = replay.r1L != null && replay.r1F != null;
  const dif2 = replay.r2L - replay.r2F;

  return (
    <div className="mt-6">
      <Subtitulo>E se o erro de 2022 se repetisse do mesmo tamanho?</Subtitulo>

      <p className="mt-1 max-w-texto rounded-nicho bg-atencao-fundo px-4 py-3 text-corpo text-tinta">
        Isto não diz que o erro vai se repetir. É uma conta de “e se”: pegamos o erro exato das
        pesquisas de véspera de 2022 e aplicamos nos números de hoje. Em 2026 o candidato da direita
        é outro e o contexto é outro.
      </p>

      {/* Três colunas só a partir de lg. A 768 a grade ficava severamente
          desequilibrada — as colunas 1 e 2 terminavam ~450px acima da 3, que
          carrega o dobro de texto — e a coluna de ~180px espremia o botão
          primário em quatro linhas, virando uma pílula de 110px de altura.
          Em lg os três cartões passam a ter a MESMA altura (`items-stretch` +
          `h-full`): o desequilíbrio que sobrava era o do conteúdo, e o terceiro
          cartão devolveu ao balão o parágrafo que o fazia ter o dobro dos
          outros. Quatro peças contra duas e três viraram três contra duas e
          três. */}
      <div
        className={`mt-4 grid gap-3 lg:items-stretch ${tem1T ? "lg:grid-cols-3" : "md:grid-cols-2"}`}
      >
        {replay.r1L != null && replay.r1F != null && (
          <Nicho className="h-full">
            <p className="text-secao text-tinta">1º turno, com o erro de 2022 aplicado</p>
            <p className="mt-2">
              <Chip tom="ameixa" className="numeros">
                vai a 2º turno em {p2t} de cada 100
              </Chip>
            </p>
            <p className="mt-2 text-micro text-tinta-media numeros">
              Lula {fmt(replay.r1L)}% × Flávio {fmt(replay.r1F)}% dos votos válidos. Pelos números
              centrais, ninguém chega à metade: em {p2t} de cada 100 cenários dessa hipótese haveria
              2º turno, com uma chegada apertada de {fmtSinal(replay.r1L - replay.r1F)} pontos, em
              vez dos {t1Dif === null ? "–" : fmtSinal(t1Dif)} das pesquisas. Lula chegar em 1º
              lugar acontece em {emCem(replay.pLider1)} de cada 100.
            </p>
          </Nicho>
        )}

        <Nicho className="h-full">
          <p className="text-secao text-tinta">2º turno, com o erro de 2022 aplicado</p>
          <p className="mt-2">
            <Chip tom="ameixa" className="numeros">
              Lula ganha em {pv2} de cada 100
            </Chip>
          </p>
          <p className="mt-2 text-micro text-tinta-media numeros">
            Lula {fmt(replay.r2L)}% × Flávio {fmt(replay.r2F)}% dos votos válidos: vitória de{" "}
            {dif2 >= 0 ? "Lula" : "Flávio"} por {fmt(Math.abs(dif2))}{" "}
            {Math.abs(dif2) === 1 ? "ponto" : "pontos"}. Em 2022, o resultado real foi 50,9 × 49,1.
          </p>
        </Nicho>

        {/* Tom neutro de propósito: sobre o lilás da faixa, o carmim dos números
            fica em 4,47:1 — 0,03 abaixo do piso AA (axe reprova). O lilás segue
            reservado às formas de incerteza; a síntese destaca pelo título. */}
        <Nicho className="h-full">
          <p className="text-secao text-tinta">
            {tem1T ? "Somando os dois turnos nesta hipótese" : "A decisão, nesta hipótese"}
          </p>
          <p className="mt-2 text-dado numeros">
            <span className="text-lula">Lula {elDia} em 100</span>
            <span className="text-tinta-media"> × </span>
            <span className="text-flavio">Flávio {elDiaF} em 100</span>
          </p>
          {/* DIETA: o quarto parágrafo deste cartão — o que explica por que a
              distância até outubro derruba o número — desceu para o balão. Ele
              é a única peça de aprofundamento dos três cartões e era ele que
              fazia esta coluna ter o dobro de altura das outras duas. Nenhuma
              palavra mudou: ela está inteira a um toque. */}
          <p className="mt-2 text-micro text-tinta numeros">
            {tem1T ? (
              <>
                De cada 100 cenários desta hipótese: <b className="font-semibold">{p1Direto}</b>{" "}
                terminam com Lula eleito já no 1º turno. Os outros{" "}
                <b className="font-semibold">{p2t}</b> vão à decisão, e Lula ganha em {pv2} de cada
                100 deles — o que dá <b className="font-semibold">{v2Abs}</b> em 100. Somando os
                dois caminhos: <b className="font-semibold">{elDia}</b> em 100.
              </>
            ) : (
              <>
                O 1º turno já aconteceu: o que sobra é a decisão de 25 de outubro, em que Lula ganha
                em <b className="font-semibold">{elDia}</b> de cada 100 cenários desta hipótese.
              </>
            )}{" "}
            <MaisSobre
              titulo={tem1T ? "Somando os dois turnos nesta hipótese" : "A decisão, nesta hipótese"}
              rotuloAcessivel="ver por que a distância até a votação mexe nesse número"
            >
              Nesta hipótese o erro vira suposição fixa, como aconteceu em 2022. A única dúvida que
              sobra é o quanto a opinião ainda pode andar até 25 de outubro. Se a votação fosse hoje
              sob essa hipótese, a diferença ficaria perto de {r2lInt} × {100 - r2lInt} e Lula seria
              eleito em {emCem(replay.elRepH)} de cada 100 cenários. É a distância até a votação que
              leva esse número para {elDia}.
            </MaisSobre>
          </p>
        </Nicho>
      </div>

      {/* O botão saiu de dentro do terceiro cartão: ele é a ação da SEÇÃO
          inteira, não daquele cartão, e numa coluna de grade ele nunca tem
          largura para caber em uma linha. */}
      <p className="mt-3">
        <Botao
          data-testid="aplicar-replica"
          onClick={() => definirParam("vies", ERRO_2022.t2.margem)}
        >
          Aplicar esta hipótese ao painel (puxada de 3,1)
        </Botao>
      </p>

      {/* Vira um detalhe com afordância de controle, e sem a frase "eleito em
          NN de cada 100 cenários, por pouco" — ela já aparecia duas vezes
          neste mesmo bloco, na resposta do topo e no cartão da soma. */}
      <Detalhe titulo="De onde saem esses números" className="mt-4 max-w-texto">
        <p className="mt-1 text-micro text-tinta-media numeros">
          Em 2022, as pesquisas de véspera do 1º turno davam a Lula uma vantagem de 7,1 a 14 pontos
          (média de 11,6), e o resultado real foi 5,2. No 2º turno davam de 0,8 a 8 pontos (média de
          4,9), e o resultado real foi 1,8. Os dois erros não se somam: as do 2º turno foram
          refeitas depois do susto do 1º, e o que sobrou de erro na decisão foi 3,1. No painel
          principal esta mesma hipótese aparece como cerca de {emCem(replay.pPainel)} em 100, porque
          lá a dúvida sobre o tamanho da puxada continua na conta. O que acontece se o erro do 1º
          turno de 2022 chegar inteiro à decisão — algo que{" "}
          <b className="font-semibold text-tinta">não</b> aconteceu em 2022 — está no cartão de
          teste-limite, acima.
        </p>
      </Detalhe>
    </div>
  );
}
