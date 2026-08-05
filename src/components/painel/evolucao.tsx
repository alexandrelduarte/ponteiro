"use client";

/**
 * "Como a diferença mudou com o tempo?" (COPY-DECK §G, DESIGN-V2 §5.3).
 *
 * A faixa da dúvida é a forma dominante; a média do painel é uma linha ameixa
 * dentro dela. Os rótulos das pontas são DIRETOS, em HTML sobre o gráfico —
 * tooltip em celular barato é aposta, não interface (§5.3).
 *
 * A troca 1º ⇄ 2º turno anima só `opacity`, em `--dur-rapida`: a referência
 * (régua do empate, eixo, rótulos) não se mexe, porque referência que se mexe
 * mente (§7.2).
 */
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useRef } from "react";
import { Bloco, Cabecalho } from "@/components/ui/blocos";
import { Termo } from "@/components/ui/glossario";
import { duracaoDoToken, easeDoToken } from "@/components/ui/movimento";
import { abs1 } from "@/components/ui/textos";
import { ALTURA, CaixaGrafico } from "@/components/graficos/comum";
import { EvolucaoLazy } from "@/components/graficos/carregados";
import { ELEICAO_1T, ELEICAO_2T } from "@/data/constantes";
import { calcPontosGrafico, fmt } from "@/lib/modelo";
import { usePainel } from "./estado";

const TURNOS = [1, 2] as const;

export function Evolucao() {
  const { M, params, hojeMs, turnoGrafico, definirTurnoGrafico } = usePainel();
  const refs = useRef<Record<number, HTMLButtonElement | null>>({ 1: null, 2: null });

  const pontos = useMemo(() => calcPontosGrafico(M, turnoGrafico), [M, turnoGrafico]);
  const serie = turnoGrafico === 2 ? M.serie2 : M.serie1;
  const inicio = M.serie2[0] ? M.serie2[0].l - M.serie2[0].f : null;

  const aoTeclar = (evento: React.KeyboardEvent) => {
    const proximo =
      evento.key === "ArrowRight" || evento.key === "End"
        ? 2
        : evento.key === "ArrowLeft" || evento.key === "Home"
          ? 1
          : null;
    if (!proximo) return;
    evento.preventDefault();
    definirTurnoGrafico(proximo as 1 | 2);
    refs.current[proximo]?.focus();
  };

  return (
    <Bloco rotuladoPor="titulo-evolucao">
      <Cabecalho
        id="titulo-evolucao"
        pergunta="Como a diferença mudou com o tempo?"
        resposta={
          <>
            Desde janeiro a diferença encolheu: era de cerca de{" "}
            <span className="numeros">{inicio === null ? "–" : abs1(inicio)}</span> pontos e hoje
            está em <span className="numeros">{abs1(M.margem)}</span>. No caminho ela subiu e desceu
            — não foi uma queda em linha reta.
          </>
        }
        traduzindo={
          <>
            Cada bolinha é uma pesquisa. A linha é a média do painel, que dá mais peso às pesquisas
            mais novas e maiores. A faixa em volta da linha é a dúvida: quanto mais larga, menos se
            sabe.
          </>
        }
      />

      <div
        role="tablist"
        aria-label="Turno exibido no gráfico"
        onKeyDown={aoTeclar}
        className="mt-4 inline-flex gap-1 rounded-plena bg-nicho p-1"
      >
        {TURNOS.map((t) => (
          <button
            key={t}
            type="button"
            role="tab"
            id={`aba-turno-${t}`}
            data-testid={`turno-grafico-${t}`}
            aria-selected={turnoGrafico === t}
            aria-controls="painel-evolucao"
            tabIndex={turnoGrafico === t ? 0 : -1}
            ref={(el) => {
              refs.current[t] = el;
            }}
            onClick={() => definirTurnoGrafico(t)}
            className={[
              "min-h-toque rounded-plena px-5 text-corpo font-semibold",
              "transition-[background-color,color,scale] duration-(--dur-rapida) ease-(--ease-padrao)",
              "motion-safe:active:scale-[0.985]",
              turnoGrafico === t
                ? "bg-ameixa text-tinta-inversa"
                : "text-tinta hover:bg-ameixa-tenue",
            ].join(" ")}
          >
            {t}º turno
          </button>
        ))}
      </div>

      <div
        id="painel-evolucao"
        role="tabpanel"
        aria-labelledby={`aba-turno-${turnoGrafico}`}
        className="relative mt-3"
      >
        <p className="flex flex-wrap justify-between gap-x-4 text-micro text-tinta-media">
          <span>Lula na frente ↑</span>
          <span>a altura é a diferença, em pontos</span>
        </p>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={turnoGrafico}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: duracaoDoToken("--dur-rapida", 120),
              ease: easeDoToken("--ease-padrao"),
            }}
          >
            <CaixaGrafico altura={ALTURA.evolucao}>
              <EvolucaoLazy
                serie={serie}
                pontos={pontos}
                hojeMs={hojeMs}
                eleicaoMs={turnoGrafico === 2 ? ELEICAO_2T : ELEICAO_1T}
                centroProjetado={
                  turnoGrafico === 2 ? M.margemAj : (serie.at(-1)?.l ?? 0) - (serie.at(-1)?.f ?? 0)
                }
                sigmaHoje={M.sigmaHoje}
                coefDeriva={params.coefDeriva}
              />
            </CaixaGrafico>
          </motion.div>
        </AnimatePresence>
        <p className="text-micro text-tinta-media">Flávio na frente ↓</p>
      </div>

      {/* As sete frases de legenda do gráfico em 2×2 a partir de lg: em coluna
          única elas eram 746px de altura contra uma faixa branca do mesmo
          tamanho à direita. Cada uma continua na medida de leitura. */}
      <div className="mt-3 space-y-2 text-micro text-tinta-media lg:grid lg:grid-cols-2 lg:items-start lg:gap-x-10 lg:gap-y-2 lg:space-y-0">
        <p className="max-w-texto">
          <b className="font-semibold text-tinta">empate</b> — nesta altura os dois teriam o mesmo
          tanto de voto.
        </p>
        <p className="max-w-texto">
          A linha vertical marcada <b className="font-semibold text-tinta">hoje</b> é onde as
          pesquisas acabam. Dali para a frente a faixa fica tracejada: é{" "}
          <Termo chave="projecao">projeção</Termo>, não pesquisa.
        </p>
        {turnoGrafico === 1 ? (
          <p className="max-w-texto">
            No 1º turno a linha é mais curta: nem todo instituto divulgou esse cenário nas pesquisas
            mais antigas.
          </p>
        ) : null}
        {/* Este gráfico é de DIFERENÇA e tem uma linha só, ameixa. Dizer
            "vermelho: Lula, azul: Flávio" mandava o leitor procurar duas
            linhas que não existem. O que a cor faz aqui é dizer, em cada
            pesquisa, de que lado da régua ela caiu. */}
        <p className="max-w-texto numeros">
          Cada bolinha é uma pesquisa, na cor de quem aparece à frente nela: acima da régua,{" "}
          <b className="font-semibold text-lula">Lula</b>; abaixo,{" "}
          <b className="font-semibold text-flavio">Flávio</b>. A linha ameixa é a média do painel, e
          é uma só. Hoje a média do {turnoGrafico}º turno está em {fmt(serie.at(-1)?.l)}% para Lula
          e {fmt(serie.at(-1)?.f)}% para Flávio.
        </p>
      </div>
    </Bloco>
  );
}
