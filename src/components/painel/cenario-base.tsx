"use client";

/**
 * "O que é mais provável acontecer em outubro?" — o cenário-base
 * (COPY-DECK §M, INVENTÁRIO 3.9).
 *
 * É o caminho MODAL da árvore de probabilidades do próprio modelo, nos números
 * que o leitor deixou nas réguas. "Mais provável" não é "certo", e o texto diz
 * isso antes de qualquer número.
 *
 * A barra de bandas é monocromática no lilás da dúvida, com a banda modal em
 * ameixa (ameixa é o produto falando, não um lado) e a régua do empate exatamente
 * na fronteira entre "Flávio na frente" e "Lula por até 5": é a mesma gramática
 * do enxame, deitada. Cada pedaço carrega o rótulo e o número ao lado — a cor
 * nunca informa sozinha.
 *
 * Condição do despacho (AUDITORIA §9.3): o título "do jeito que as pesquisas
 * medem" fica na MESMA dobra dos chips, nunca colapsado.
 */
import { useMemo } from "react";
import { Bloco, Cabecalho, Colunas, Detalhe, Nicho, Subtitulo } from "@/components/ui/blocos";
import { Termo } from "@/components/ui/glossario";
import { emCem, inteiroEmCem } from "@/components/ui/textos";
import { calcCenarioBase, fmt } from "@/lib/modelo";
import { usePainel } from "./estado";

/** Rótulos das quatro bandas, na ordem em que o modelo as devolve. */
const ROTULO_BANDA = [
  "Flávio na frente",
  "Lula por até 5 pontos",
  "Lula por 5 a 10",
  "Lula por mais de 10",
];

export function CenarioBase() {
  const { M, params } = usePainel();
  const cen = useMemo(() => calcCenarioBase(M, params.vies), [M, params.vies]);

  if (!cen) return null;

  const lider = cen.liderLula ? "Lula" : "Flávio";
  const lider1T = cen.pLulaEm1 >= 0.5 ? "Lula" : "Flávio";
  const apertada = Math.abs(M.margemAj) < 5 ? "apertada" : "média";
  const pElei = emCem(cen.pElei);
  const pContra = emCem(1 - cen.pElei);
  const umaEm = Math.max(2, Math.round(1 / Math.max(0.01, 1 - cen.pElei)));
  const p2t = emCem(M.p2Tacontece);
  const pV2 = emCem(cen.pV2);
  const pV2Abs = inteiroEmCem(M.p2Tacontece * cen.pV2);
  const p1Direto = inteiroEmCem(cen.pDireto);
  const larguraModal = cen.bandas.indexOf(cen.modal);

  return (
    <Bloco rotuladoPor="titulo-cenario-base">
      <Cabecalho
        id="titulo-cenario-base"
        pergunta="O que é mais provável acontecer em outubro?"
        resposta={
          <span data-testid="cenario-base-titulo">
            {lider} eleito, com a definição saindo em 25 de outubro e por diferença {apertada}: é o
            caminho que aparece em <span className="numeros">{pV2Abs}</span> de cada 100 cenários.
            Somando com o caminho de vitória já em 4 de outubro, {lider} termina eleito em{" "}
            <span data-testid="cenario-base-probabilidade" className="numeros">
              {pElei}
            </span>{" "}
            de cada 100.
          </span>
        }
        traduzindo={
          <>
            De todos os caminhos que o painel calcula, este é o que aparece em mais cenários. “Mais
            provável” não é “certo”: os outros caminhos continuam existindo, com as chances
            mostradas ao lado.
          </>
        }
      />

      <div className="mt-5 grid gap-3 md:grid-cols-3 md:items-start">
        <Nicho>
          <Subtitulo>4 de outubro · 1º turno</Subtitulo>
          <p className="mt-1 text-corpo text-tinta-media numeros">
            Na maioria dos cenários ninguém passa da metade: vai para o 2º turno em {p2t} de cada
            100. Lula chega em 1º lugar em {emCem(cen.pLulaEm1)} de cada 100.
          </p>
        </Nicho>
        <Nicho>
          <Subtitulo>25 de outubro · 2º turno</Subtitulo>
          <p className="mt-1 text-corpo text-tinta-media numeros">
            Havendo 2º turno, {lider} ganha a decisão em {pV2} de cada 100 desses cenários — como o
            2º turno acontece em {p2t} de cada 100, esse caminho vale {pV2Abs} em 100. Some os{" "}
            {p1Direto} em 100 em que {lider} já ganha em 4 de outubro: {pElei} em 100.
          </p>
        </Nicho>
        <Nicho>
          <Subtitulo>Divisão de votos mais provável</Subtitulo>
          <p className="mt-1 text-corpo text-tinta numeros">
            <span className="text-lula">Lula {fmt(cen.placarL)}%</span>
            <span className="text-tinta-media"> × </span>
            <span className="text-flavio">Flávio {fmt(100 - cen.placarL)}%</span> dos{" "}
            <Termo chave="votosValidos">votos válidos</Termo>.
          </p>
        </Nicho>
      </div>

      {/* ---------- bandas: título e chips na MESMA dobra ---------- */}
      <div className="mt-6">
        <Subtitulo>
          De quanto pode ser a diferença no fim, do jeito que as pesquisas medem
        </Subtitulo>

        {/* A régua, rotulada — ela aparecia aqui sem nome nenhum, e é a mesma
            do enxame. */}
        <p className="relative mt-3 h-5 text-micro text-tinta-media">
          <span
            className="absolute -translate-x-1/2 font-semibold whitespace-nowrap text-tinta"
            style={{ left: `${Math.max(cen.bandas[0].p * 100, 0)}%` }}
          >
            empate
          </span>
        </p>

        {/* Quatro pedaços CONTÍGUOS: eles somam 100, e a folga de 3px entre
            eles quebrava justamente a leitura de proporção. O que separa um do
            outro é um filete da cor da placa, de 1px, que não rouba largura
            perceptível.
            Todos no MESMO lilás da dúvida: dar campo ameixa cheio só ao pedaço
            modal punha ênfase visual num desfecho e não no outro (R4/H9). O
            modal é marcado por contorno de tinta — canal de forma, não de cor
            — e nomeado na lista logo abaixo. */}
        <div
          className="relative flex h-7 w-full overflow-hidden rounded-plena"
          role="img"
          aria-label={cen.bandas
            .map((b, i) => `${ROTULO_BANDA[i]}: ${emCem(b.p)} em 100`)
            .join("; ")}
        >
          {cen.bandas.map((b, i) => (
            <div
              key={ROTULO_BANDA[i]}
              className={[
                "h-full border-r border-placa bg-faixa last:border-r-0",
                i === larguraModal ? "shadow-[inset_0_0_0_2px_var(--color-tinta)]" : "",
              ].join(" ")}
              style={{ width: `${Math.max(b.p * 100, 0)}%` }}
            />
          ))}
          {/* A régua do empate mora na fronteira entre a primeira banda
              (Flávio na frente) e a segunda: é o mesmo zero do enxame, e por
              isso é desenhada POR CIMA, em tinta. */}
          <span
            aria-hidden="true"
            className="absolute inset-y-0 w-[3px] -translate-x-1/2 bg-tinta"
            style={{ left: `${Math.max(cen.bandas[0].p * 100, 0)}%` }}
          />
        </div>

        <ul className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-micro text-tinta-media">
          {cen.bandas.map((b, i) => (
            <li key={ROTULO_BANDA[i]} className="numeros">
              {ROTULO_BANDA[i]}: <b className="font-semibold text-tinta">{emCem(b.p)} em 100</b>
              {i === larguraModal ? (
                <span className="font-semibold text-tinta"> — o mais provável</span>
              ) : null}
            </li>
          ))}
        </ul>

        <p className="mt-2 max-w-texto text-micro text-tinta-media">
          Cada pedaço é uma faixa de diferença, e o tamanho dele é a chance daquela faixa acontecer.
        </p>
      </div>

      {/* Um parágrafo de nove orações numerado por dentro ("Um:… Dois:… Três:…
          Quatro:") é uma LISTA disfarçada de prosa — e, preso na medida de
          leitura, era 678px de altura contra 49% da placa em branco ao lado.
          Aqui ele vira o que já era: quatro itens, palavra por palavra, em duas
          colunas a partir de lg. Os marcadores são os do próprio texto
          auditado; nenhuma frase foi reescrita nem reordenada. */}
      <div className="mt-6">
        <Subtitulo>Por que este é o caminho mais provável</Subtitulo>
        <p className="mt-1 max-w-texto text-corpo text-tinta-media">Quatro motivos.</p>
        <ul className="mt-2 text-corpo text-tinta-media numeros lg:grid lg:grid-cols-2 lg:items-start lg:gap-x-10 lg:gap-y-3">
          <li className="mt-2 max-w-texto lg:mt-0">
            <b className="font-semibold text-tinta">Um:</b> a vantagem é constante — 6 dos 7
            institutos de julho mostram Lula à frente, e no sétimo os dois estão em empate técnico;
            a comparação de cada instituto com ele mesmo está estável.
          </li>
          <li className="mt-2 max-w-texto lg:mt-0">
            <b className="font-semibold text-tinta">Dois:</b> o contexto medido não desfavorece quem
            está no governo: aprovação e desaprovação próximas, rejeição alta dos dois lados e mais
            gente aberta a votar em Lula (47% contra 38%).
          </li>
          <li className="mt-2 max-w-texto">
            <b className="font-semibold text-tinta">Três:</b> com dois terços de cada lado já
            decididos, a diferença anda devagar. Virar exige movimento fora do padrão de 2026.
          </li>
          <li className="mt-2 max-w-texto">
            <b className="font-semibold text-tinta">Quatro:</b> mesmo assim a diferença fica
            apertada. Quando as pesquisas erraram em 2018 e em 2022, o erro foi na mesma direção —
            subestimando a direita — e a repetição fiel de 2022 dá algo perto de 51 × 49.
          </li>
        </ul>
        {/* A lista das "três coisas que mudariam o quadro" mora no bloco
            "Isso ainda pode virar?" — aqui ela voltava quase palavra por
            palavra, na mesma página. */}
      </div>

      <Detalhe titulo="Como este caminho foi escolhido" className="mt-4">
        <Colunas arranjo="iguais" className="mt-1 text-corpo text-tinta-media numeros">
          <p className="max-w-texto">
            O painel vai perguntando, uma coisa de cada vez, e fica sempre com a resposta mais
            provável. Cada resposta é a mais provável da sua pergunta — juntas elas descrevem o
            caminho mais comum, não o único.
          </p>
          <p className="mt-3 max-w-texto lg:mt-0">
            Acaba no 1º turno? Não, em {p2t} de cada 100 cenários vai para o 2º. Quem chega na
            frente? {lider1T}. Quem ganha a decisão? {lider}. Por quanto? A faixa em destaque acima.
            Nada disso é opinião fixa: mude a régua da puxada para 6,3 e esta seção passa a
            descrever, sozinha, a vitória de Flávio.
          </p>
        </Colunas>
      </Detalhe>

      <p className="mt-4 max-w-texto text-micro text-tinta-media numeros">
        Um resultado que aparece em {pContra} de cada 100 cenários acontece, no longo prazo, 1 vez a
        cada {umaEm} eleições parecidas.
      </p>
    </Bloco>
  );
}
