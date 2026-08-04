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
import { Bloco, Nicho, Pergunta, Resposta, Subtitulo, Traduzindo } from "@/components/ui/blocos";
import { Termo } from "@/components/ui/glossario";
import { emCem, inteiroEmCem } from "@/components/ui/textos";
import { calcCenarioBase, fmt, fmtSinal } from "@/lib/modelo";
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
      <Pergunta id="titulo-cenario-base">O que é mais provável acontecer em outubro?</Pergunta>
      <Resposta>
        <span data-testid="cenario-base-titulo">
          {lider} eleito, com a definição saindo em 25 de outubro e por diferença {apertada}: é o
          caminho que aparece em <span className="numeros">{pV2Abs}</span> de cada 100 cenários.
          Somando com o caminho de vitória já em 4 de outubro, {lider} termina eleito em{" "}
          <span data-testid="cenario-base-probabilidade" className="numeros">
            {pElei}
          </span>{" "}
          de cada 100.
        </span>
      </Resposta>
      <Traduzindo>
        De todos os caminhos que o painel calcula, este é o que aparece em mais cenários. “Mais
        provável” não é “certo”: os outros caminhos continuam existindo, com as chances mostradas ao
        lado.
      </Traduzindo>

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
          <p className="mt-1 text-micro text-tinta-media numeros">
            Em 8 de cada 10 cenários, a diferença{" "}
            <b className="font-semibold text-tinta">medida nas pesquisas</b> fica entre{" "}
            {fmtSinal(M.int80[0])} e {fmtSinal(M.int80[1])} pontos.
          </p>
        </Nicho>
      </div>

      {/* ---------- bandas: título e chips na MESMA dobra ---------- */}
      <div className="mt-6">
        <Subtitulo>
          De quanto pode ser a diferença no fim, do jeito que as pesquisas medem
        </Subtitulo>

        <div
          className="relative mt-2 flex h-7 w-full gap-[3px]"
          role="img"
          aria-label={cen.bandas
            .map((b, i) => `${ROTULO_BANDA[i]}: ${emCem(b.p)} em 100`)
            .join("; ")}
        >
          {cen.bandas.map((b, i) => (
            <div
              key={ROTULO_BANDA[i]}
              className={[
                "h-full rounded-plena",
                i === larguraModal ? "bg-ameixa-clara" : "bg-faixa",
              ].join(" ")}
              style={{ width: `${Math.max(b.p * 100, 0)}%` }}
            />
          ))}
          {/* A régua do empate mora na fronteira entre a primeira banda
              (Flávio na frente) e a segunda: é o mesmo zero do enxame, e por
              isso é desenhada POR CIMA, em tinta, e não como borda de um
              pedaço (borda em raio pleno some). */}
          <span
            aria-hidden="true"
            className="absolute inset-y-[-4px] w-[3px] -translate-x-1/2 rounded-plena bg-tinta"
            style={{ left: `${Math.max(cen.bandas[0].p * 100, 0)}%` }}
          />
        </div>

        <ul className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-micro text-tinta-media">
          {cen.bandas.map((b, i) => (
            <li key={ROTULO_BANDA[i]} className="numeros">
              {ROTULO_BANDA[i]}: <b className="font-semibold text-tinta">{emCem(b.p)} em 100</b>
              {i === larguraModal ? (
                <span className="font-semibold text-ameixa"> ● o mais provável</span>
              ) : null}
            </li>
          ))}
        </ul>

        <p className="mt-2 max-w-texto text-micro text-tinta-media">
          Cada pedaço é uma faixa de diferença, e o tamanho dele é a chance daquela faixa acontecer.
        </p>
      </div>

      <div className="mt-6 max-w-texto">
        <Subtitulo>Por que este é o caminho mais provável</Subtitulo>
        <p className="mt-1 text-corpo text-tinta-media numeros">
          Quatro motivos. <b className="font-semibold text-tinta">Um:</b> a vantagem é constante — 6
          dos 7 institutos de julho mostram Lula à frente, e no sétimo os dois estão em empate
          técnico; a comparação de cada instituto com ele mesmo está estável.{" "}
          <b className="font-semibold text-tinta">Dois:</b> o contexto medido não desfavorece quem
          está no governo: aprovação e desaprovação próximas, rejeição alta dos dois lados e mais
          gente aberta a votar em Lula (47% contra 38%).{" "}
          <b className="font-semibold text-tinta">Três:</b> com dois terços de cada lado já
          decididos, a diferença anda devagar. Virar exige movimento fora do padrão de 2026.{" "}
          <b className="font-semibold text-tinta">Quatro:</b> mesmo assim a diferença fica apertada.
          Quando as pesquisas erraram em 2018 e em 2022, o erro foi na mesma direção — subestimando
          a direita — e a repetição fiel de 2022 dá algo perto de 51 × 49.
        </p>
        <p className="mt-3 text-corpo text-tinta-media">
          Três coisas derrubariam este caminho. Pesquisas novas levando a diferença para baixo de 2
          pontos. Três institutos seguidos com Flávio na frente, fora da folga. Ou um erro de
          pesquisa maior que o já visto quando os institutos tinham o gabarito na mão.
        </p>
      </div>

      <details className="mt-4 max-w-texto">
        <summary className="inline-flex min-h-toque items-center text-corpo font-semibold text-ameixa">
          Como este caminho foi escolhido
        </summary>
        <p className="mt-1 text-corpo text-tinta-media numeros">
          O painel vai perguntando, uma coisa de cada vez, e fica sempre com a resposta mais
          provável. Cada resposta é a mais provável da sua pergunta — juntas elas descrevem o
          caminho mais comum, não o único. Acaba no 1º turno? Não, em {p2t} de cada 100 cenários vai
          para o 2º. Quem chega na frente? {lider1T}. Quem ganha a decisão? {lider}. Por quanto? A
          faixa em destaque acima. Nada disso é opinião fixa: mude a régua da puxada para 6,3 e esta
          seção passa a descrever, sozinha, a vitória de Flávio.
        </p>
      </details>

      <p className="mt-4 max-w-texto text-micro text-tinta-media numeros">
        Leitura das pesquisas, não previsão nem torcida. Um resultado que aparece em {pContra} de
        cada 100 cenários acontece, no longo prazo, 1 vez a cada {umaEm} eleições parecidas.
      </p>
    </Bloco>
  );
}
