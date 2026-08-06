"use client";

/**
 * "O que é mais provável acontecer em outubro?" — o cenário-base
 * (COPY-DECK §M, INVENTÁRIO 3.9).
 *
 * É o caminho MODAL da árvore de probabilidades do próprio modelo, nos números
 * que o leitor deixou nas réguas. "Mais provável" não é "certo", e o texto diz
 * isso antes de qualquer número.
 *
 * A barra de bandas veste a cor do DADO (redesenho aprovado pelo dono — a
 * versão monocromática foi reprovada; DECISOES.md): direção = família do
 * candidato (naval à esquerda da régua, carmim à direita), magnitude = degrau
 * da rampa de fundo (§4 de tokens.css — lula-fundo → fundo-2 → fundo-3, ΔL
 * medido). Não é ênfase editorial num desfecho (R4/H9): é rampa sequencial do
 * próprio dado, e ela só tem degraus do lado que o modelo bina. A banda modal
 * é marcada por canal de FORMA — contorno de 2px na cor do candidato + chip
 * "o mais provável" ancorado nela — nunca só por cor. A régua do empate é a
 * mesma do enxame, deitada, na fronteira entre "Flávio na frente" e "Lula por
 * até 5". Cada banda tem rótulo e número ancorados NELA (grid proporcional em
 * sm+; lista com amostra de cor a 390) — a cor nunca informa sozinha.
 *
 * Condição do despacho (AUDITORIA §9.3): o título "do jeito que as pesquisas
 * medem" fica na MESMA dobra dos chips, nunca colapsado.
 */
import { useMemo, type CSSProperties } from "react";
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

/**
 * Cor de cada banda, alinhada 1:1 com ROTULO_BANDA: direção = família do
 * candidato, magnitude = degrau da rampa de fundo (tokens.css §4, contrastes
 * calculados lá). `anel` é o contorno da banda modal — na cor do candidato,
 * nunca em tinta: ≥3:1 sobre o próprio fundo em todos os degraus (7,39:1 no
 * naval; 4,80 · 3,81 · 3,07:1 nos três carmins). Strings completas para o
 * scanner do Tailwind.
 */
const ESTILO_BANDA = [
  {
    fundo: "bg-flavio-fundo",
    borda: "border-flavio",
    anel: "shadow-[inset_0_0_0_2px_var(--color-flavio)]",
  },
  {
    fundo: "bg-lula-fundo",
    borda: "border-lula",
    anel: "shadow-[inset_0_0_0_2px_var(--color-lula)]",
  },
  {
    fundo: "bg-lula-fundo-2",
    borda: "border-lula",
    anel: "shadow-[inset_0_0_0_2px_var(--color-lula)]",
  },
  {
    fundo: "bg-lula-fundo-3",
    borda: "border-lula",
    anel: "shadow-[inset_0_0_0_2px_var(--color-lula)]",
  },
] as const;

/** Amostra da legenda: o fundo da banda com a borda forte do lado (≥3:1 na placa). */
function AmostraBanda({ indice, className }: { indice: number; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={[
        "inline-block h-2.5 w-2.5 shrink-0 rounded-[3px] border",
        ESTILO_BANDA[indice].fundo,
        ESTILO_BANDA[indice].borda,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    />
  );
}

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

  /* Geometria das bandas: índice da modal, fronteira da régua do empate e o
     centro da banda modal (âncora do chip), tudo em % da largura da barra. */
  const idxModal = cen.bandas.indexOf(cen.modal);
  const fronteira = Math.max(cen.bandas[0].p * 100, 0);
  const antesDaModal = cen.bandas.slice(0, idxModal).reduce((soma, banda) => soma + banda.p, 0);
  const centroModal = (antesDaModal + cen.modal.p / 2) * 100;
  const empateNaDireita = fronteira > 70;
  const colunasBandas = cen.bandas
    .map((b) => `minmax(0, ${Math.max(b.p, 0.001).toFixed(4)}fr)`)
    .join(" ");

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

        {/* O chip da banda modal, ancorado no CENTRO dela. O clamp em rem
            impede o chip de vazar da placa a 390 (vazamento aqui viraria
            rolagem horizontal da página). aria-hidden: a mesma informação
            está na legenda (" — o mais provável"), que o leitor de tela já
            recebe — o chip é reforço visual, não conteúdo novo. */}
        <div aria-hidden="true" className="relative mt-3 h-7">
          <span
            className={[
              "absolute bottom-0 -translate-x-1/2 rounded-plena border-2 bg-placa px-2.5 py-0.5",
              "text-micro font-semibold whitespace-nowrap text-tinta",
              ESTILO_BANDA[idxModal].borda,
            ].join(" ")}
            style={{ left: `clamp(3.75rem, ${centroModal}%, calc(100% - 3.75rem))` }}
          >
            o mais provável
          </span>
        </div>

        {/* O rótulo "empate" ENCOSTADO na régua: o traço de 3px do rótulo tem
            o mesmo x e a mesma largura da régua de tinta dentro da barra — um
            traço contínuo, não um texto flutuando. Se a fronteira migrar para
            a ponta direita (réguas do leitor), o rótulo troca de lado. */}
        <p className="relative mt-1 h-5 text-micro">
          <span
            className={[
              "absolute inset-y-0 flex items-center font-semibold whitespace-nowrap text-tinta",
              empateNaDireita
                ? "-translate-x-full border-r-[3px] border-tinta pr-1.5"
                : "border-l-[3px] border-tinta pl-1.5",
            ].join(" ")}
            style={{
              left: empateNaDireita ? `calc(${fronteira}% + 1.5px)` : `calc(${fronteira}% - 1.5px)`,
            }}
          >
            empate
          </span>
        </p>

        {/* Quatro bandas CONTÍGUAS (somam 100): a DIREÇÃO é a família de cor
            do candidato e a posição contra a régua; a MAGNITUDE é o degrau da
            rampa de fundo (tokens.css §4). O que separa uma banda da outra é
            um vão de placa de 2px — vão, não traço. O fio de contorno desenha
            o limite da barra: fundo claro não segura a forma sozinho contra a
            placa (mesma doutrina da faixa da dúvida, §6 dos tokens). A banda
            modal ganha o anel de 2px na cor do candidato — canal de forma por
            cima da cor, nunca tinta preta. */}
        <div
          className="relative flex h-8 w-full overflow-hidden rounded-plena border border-contorno"
          role="img"
          aria-label={cen.bandas
            .map((b, i) => `${ROTULO_BANDA[i]}: ${emCem(b.p)} em 100`)
            .join("; ")}
        >
          {cen.bandas.map((b, i) => (
            <div
              key={ROTULO_BANDA[i]}
              className={[
                "h-full border-r-2 border-placa last:border-r-0",
                ESTILO_BANDA[i].fundo,
                i === idxModal ? ESTILO_BANDA[i].anel : "",
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
            style={{ left: `${fronteira}%` }}
          />
        </div>

        {/* Legenda ANCORADA: em sm+ o grid repete as proporções das bandas e
            cada rótulo cai debaixo do seu pedaço; a 390 vira lista vertical.
            Nas duas formas a amostra de cor liga o rótulo à banda — e o texto
            continua dizendo direção e magnitude com todas as letras. */}
        <ul
          className={[
            "mt-2 grid grid-cols-1 gap-y-1.5 text-micro text-tinta-media",
            "sm:gap-y-1 sm:[grid-template-columns:var(--colunas-bandas)]",
          ].join(" ")}
          style={{ "--colunas-bandas": colunasBandas } as CSSProperties}
        >
          {cen.bandas.map((b, i) => (
            <li
              key={ROTULO_BANDA[i]}
              className="numeros flex items-start gap-1.5 sm:min-w-0 sm:pr-3"
            >
              <AmostraBanda indice={i} className="mt-1" />
              <span className="min-w-0">
                {ROTULO_BANDA[i]}: <b className="font-semibold text-tinta">{emCem(b.p)} em 100</b>
                {i === idxModal ? (
                  <span className="font-semibold text-tinta"> — o mais provável</span>
                ) : null}
              </span>
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
