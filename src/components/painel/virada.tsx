"use client";

/**
 * "Isso ainda pode virar?" — o espaço de virada (COPY-DECK §F).
 *
 * Aqui o enxame aparece na segunda escala da gramática (docs/DESIGN-V2.md §4):
 * mesma régua, mesmo zero chamado "empate", mesma convenção esquerda/direita.
 * É o que substitui a curva de densidade da v1 — a mesma distribuição, contada
 * em bolinhas em vez de desenhada como área: cem cenários que dá para CONTAR
 * na tela, que é o que a evidência recomenda para leitor de baixa numeracia.
 *
 * Nada aqui espera JavaScript nem carrega biblioteca de gráfico.
 */
import { Bloco, Pergunta, Resposta, Traduzindo } from "@/components/ui/blocos";
import { abs1, parEmCem } from "@/components/ui/textos";
import { fmtSinal } from "@/lib/modelo";
import { Enxame, montarEnxame } from "./enxame";
import { usePainel } from "./estado";

export function Virada() {
  const { M } = usePainel();
  const layout = montarEnxame(M.margemAj, M.sigmaDia2);
  const [, eleitoF] = parEmCem(M.eleito.dia.l);

  return (
    <Bloco rotuladoPor="titulo-virada">
      <Pergunta id="titulo-virada">Isso ainda pode virar?</Pergunta>
      <Resposta>
        Pode. Em <span className="numeros">{layout.nFlavio}</span> de cada 100 cenários para 25 de
        outubro, é Flávio quem ganha a decisão — e em <span className="numeros">{eleitoF}</span> de
        cada 100 ele termina eleito, contando os dois caminhos.
      </Resposta>
      <Traduzindo>
        Cada bolinha é um resultado possível para a diferença no dia da votação, e todas valem o
        mesmo. As que caem à direita da régua são cenários em que Lula ganha; à esquerda, cenários
        em que Flávio ganha. Quanto mais espalhadas, menos fechada está a disputa.
      </Traduzindo>

      <div className="mt-5">
        <Enxame
          layout={layout}
          idTeste="enxame-virada"
          rotuloAcessivel={`Gráfico dos cenários da diferença no dia da votação: ${layout.nLula} em 100 do lado de Lula, ${layout.nFlavio} em 100 do lado de Flávio.`}
        />
      </div>

      <p className="mt-4 max-w-texto text-corpo text-tinta-media">
        A régua do meio é o empate: ali os dois teriam o mesmo tanto de voto.
      </p>
      <p className="mt-2 max-w-texto text-corpo text-tinta-media">
        Tudo o que está do lado esquerdo da régua é o espaço de virada que os dados de hoje ainda
        comportam.
      </p>
      <p className="mt-2 max-w-texto text-corpo text-tinta-media numeros">
        Em 8 de cada 10 cenários, a diferença{" "}
        <b className="font-semibold text-tinta">medida nas pesquisas</b> fica entre{" "}
        {fmtSinal(M.int80[0])} e {fmtSinal(M.int80[1])} pontos.
      </p>

      <p className="mt-4 max-w-texto text-corpo text-tinta-media">
        Três coisas mudariam este quadro. Pesquisas novas trazendo a diferença para baixo de 2
        pontos. Três institutos seguidos com Flávio na frente, fora da folga. Ou uma puxada das
        pesquisas a favor de Lula maior que <span className="numeros">{abs1(M.margem)}</span> pontos
        — menos que os 6,3 do 1º turno de 2022.
      </p>
    </Bloco>
  );
}
