"use client";

/**
 * "O que é mais provável acontecer em 25 de outubro?" — o cenário-base
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
 *
 * BANDAS SIMÉTRICAS (2º turno, out/2026 — DECISOES.md): as bandas do protótipo
 * (`calcCenarioBase().bandas`) binavam magnitude só do lado de Lula — uma banda
 * única "Flávio vence" contra três de Lula. Com Flávio na frente isso jogava
 * todas as vitórias dele num balde só (R4). A barra agora é calculada aqui, na
 * apresentação, com duas bandas por lado e o mesmo corte de 5 pontos — o modelo
 * (e a paridade dele) não muda.
 */
import { useMemo, type CSSProperties } from "react";
import { Bloco, Cabecalho, Colunas, Detalhe, Nicho, Subtitulo } from "@/components/ui/blocos";
import { Termo } from "@/components/ui/glossario";
import { abs1, emCem } from "@/components/ui/textos";
import { pct1T } from "@/data/resultado-1t";
import { calcErro1T } from "@/lib/erro-1t";
import { calcCenarioBase, fmt, normCdf } from "@/lib/modelo";
import { usePainel } from "./estado";

/** Corte de magnitude das bandas, em pontos — o mesmo dos dois lados. */
const CORTE_BANDA = 5;

/** Rótulos das quatro bandas, da esquerda (Flávio) para a direita (Lula). */
const ROTULO_BANDA = [
  `Flávio por mais de ${CORTE_BANDA} pontos`,
  `Flávio por até ${CORTE_BANDA}`,
  `Lula por até ${CORTE_BANDA}`,
  `Lula por mais de ${CORTE_BANDA}`,
];

/**
 * Cor de cada banda, alinhada 1:1 com ROTULO_BANDA: direção = família do
 * candidato, magnitude = degrau da rampa de fundo (tokens.css §4, contrastes
 * calculados lá — a rampa naval espelha a carmim em clareza). `anel` é o
 * contorno da banda modal, na cor do candidato (≥3:1 sobre o próprio fundo).
 * Strings completas para o scanner do Tailwind.
 */
const ESTILO_BANDA = [
  {
    fundo: "bg-flavio-fundo-2",
    borda: "border-flavio",
    anel: "shadow-[inset_0_0_0_2px_var(--color-flavio)]",
  },
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
  const { M, params, pesquisasOficiais } = usePainel();
  const cen = useMemo(() => calcCenarioBase(M, params.vies), [M, params.vies]);
  const erro1T = useMemo(() => calcErro1T(pesquisasOficiais), [pesquisasOficiais]);

  if (!cen) return null;

  const lider = cen.liderLula ? "Lula" : "Flávio";
  const apertada = Math.abs(M.margemAj) < CORTE_BANDA ? "apertada" : "média";
  const pElei = emCem(cen.pElei);
  const pContra = emCem(1 - cen.pElei);
  const umaEm = Math.max(2, Math.round(1 / Math.max(0.01, 1 - cen.pElei)));

  /* Bandas simétricas sobre N(margemAj, sigmaDia2) — a mesma distribuição do
     enxame e das bandas do modelo, só que binada igual dos dois lados. */
  const F = (x: number) => normCdf((x - M.margemAj) / M.sigmaDia2);
  const bandas = [
    F(-CORTE_BANDA),
    F(0) - F(-CORTE_BANDA),
    F(CORTE_BANDA) - F(0),
    Math.max(0, 1 - F(CORTE_BANDA)),
  ].map((p, i) => ({ rot: ROTULO_BANDA[i], p }));
  const idxModal = bandas.reduce((m, b, i) => (b.p > bandas[m].p ? i : m), 0);
  const modal = bandas[idxModal];

  /* Recentes de 2º turno (últimos 35 dias): quem aparece à frente em cada uma. */
  const recentes = M.linhas.filter((l) => l.idadeDias < 35 && l.w > 0); // só as que entram na média
  const recentesLider = recentes.filter((l) =>
    cen.liderLula ? l.margem2 > 0 : l.margem2 < 0,
  ).length;
  const recentesEmpate = recentes.filter((l) => l.empate2).length;
  const lider1T = pct1T("Flávio Bolsonaro") > pct1T("Lula") ? "Flávio" : "Lula";

  /* Geometria das bandas: fronteira da régua do empate (entre a 2ª e a 3ª
     banda) e o centro da banda modal (âncora do chip), em % da largura. */
  const fronteira = Math.max((bandas[0].p + bandas[1].p) * 100, 0);
  const antesDaModal = bandas.slice(0, idxModal).reduce((soma, banda) => soma + banda.p, 0);
  const centroModal = (antesDaModal + modal.p / 2) * 100;
  const empateNaDireita = fronteira > 70;
  // Piso de 14% por coluna na legenda: uma banda de 3 em 100 espremia o rótulo
  // numa coluna de uma palavra por linha. A barra continua proporcional.
  const colunasBandas = bandas
    .map((b) => `minmax(0, ${Math.max(b.p, 0.14).toFixed(4)}fr)`)
    .join(" ");

  return (
    <Bloco rotuladoPor="titulo-cenario-base">
      <Cabecalho
        id="titulo-cenario-base"
        pergunta="O que é mais provável acontecer em 25 de outubro?"
        resposta={
          <span data-testid="cenario-base-titulo">
            {lider} eleito, por diferença {apertada}: é o desfecho que aparece em{" "}
            <span data-testid="cenario-base-probabilidade" className="numeros">
              {pElei}
            </span>{" "}
            de cada 100 cenários da decisão de 25 de outubro.
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
          <Subtitulo>4 de outubro · 1º turno · já aconteceu</Subtitulo>
          <p className="mt-1 text-corpo text-tinta-media numeros">
            Ninguém passou da metade dos votos válidos: Lula {fmt(pct1T("Lula"), 2)}% × Flávio{" "}
            {fmt(pct1T("Flávio Bolsonaro"), 2)}%. Por isso a eleição vai ao 2º turno.
          </p>
        </Nicho>
        <Nicho>
          <Subtitulo>25 de outubro · 2º turno</Subtitulo>
          <p className="mt-1 text-corpo text-tinta-media numeros">
            {lider} ganha a decisão em {emCem(cen.pV2)} de cada 100 cenários. Como o 1º turno já
            passou, é a mesma chance de ser eleito.
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

        {/* Quatro bandas CONTÍGUAS (somam 100), duas de cada lado da régua do
            empate: a DIREÇÃO é a família de cor do candidato e a posição contra
            a régua; a MAGNITUDE é o degrau da rampa de fundo (tokens.css §4).
            O que separa uma banda da outra é um vão de placa de 2px. A banda
            modal ganha o anel de 2px na cor do candidato. */}
        <div
          className="relative flex h-8 w-full overflow-hidden rounded-plena border border-contorno"
          role="img"
          aria-label={bandas.map((b) => `${b.rot}: ${emCem(b.p)} em 100`).join("; ")}
        >
          {bandas.map((b, i) => (
            <div
              key={b.rot}
              className={[
                "h-full border-r-2 border-placa last:border-r-0",
                ESTILO_BANDA[i].fundo,
                i === idxModal ? ESTILO_BANDA[i].anel : "",
              ].join(" ")}
              style={{ width: `${Math.max(b.p * 100, 0)}%` }}
            />
          ))}
          {/* A régua do empate mora na fronteira entre as bandas de Flávio e
              as de Lula: é o mesmo zero do enxame, desenhado POR CIMA. */}
          <span
            aria-hidden="true"
            className="absolute inset-y-0 w-[3px] -translate-x-1/2 bg-tinta"
            style={{ left: `${fronteira}%` }}
          />
        </div>

        {/* Legenda ANCORADA: em sm+ o grid repete as proporções das bandas e
            cada rótulo cai debaixo do seu pedaço; a 390 vira lista vertical. */}
        <ul
          className={[
            "mt-2 grid grid-cols-1 gap-y-1.5 text-micro text-tinta-media",
            "sm:gap-y-1 sm:[grid-template-columns:var(--colunas-bandas)]",
          ].join(" ")}
          style={{ "--colunas-bandas": colunasBandas } as CSSProperties}
        >
          {bandas.map((b, i) => (
            <li key={b.rot} className="numeros flex items-start gap-1.5 sm:min-w-0 sm:pr-3">
              <AmostraBanda indice={i} className="mt-1" />
              <span className="min-w-0">
                {b.rot}: <b className="font-semibold text-tinta">{emCem(b.p)} em 100</b>
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

      {/* Os motivos saem dos DADOS da lista (e do resultado oficial do 1º
          turno), não de texto fixo: com outra lista, outra frase. */}
      <div className="mt-6">
        <Subtitulo>Por que este é o caminho mais provável</Subtitulo>
        <ul className="mt-2 text-corpo text-tinta-media numeros lg:grid lg:grid-cols-2 lg:items-start lg:gap-x-10 lg:gap-y-3">
          <li className="mt-2 max-w-texto lg:mt-0">
            <b className="font-semibold text-tinta">As pesquisas recentes:</b>{" "}
            {recentes.length > 0 ? (
              <>
                {recentesLider} das {recentes.length} pesquisas de 2º turno dos últimos 35 dias
                mostram {lider} à frente; {recentesEmpate} delas estão em empate técnico.
              </>
            ) : (
              <>nenhuma pesquisa da lista é dos últimos 35 dias — o retrato pode estar atrasado.</>
            )}
          </li>
          <li className="mt-2 max-w-texto lg:mt-0">
            <b className="font-semibold text-tinta">A urna do 1º turno:</b> {lider1T} terminou na
            frente em 4 de outubro, por{" "}
            {fmt(Math.abs(pct1T("Flávio Bolsonaro") - pct1T("Lula")), 2)} pontos dos votos válidos.
            O 2º turno é outra votação, mas o ponto de partida é esse.
          </li>
          <li className="mt-2 max-w-texto">
            <b className="font-semibold text-tinta">O erro das pesquisas:</b>{" "}
            {erro1T && Math.abs(erro1T.erroMargem) >= 0.5 ? (
              <>
                no 1º turno deste ano elas erraram {abs1(erro1T.erroMargem)} pontos na diferença, a
                favor de {erro1T.erroMargem > 0 ? "Lula" : "Flávio"}. Em 2018 e em 2022 o erro
                também subestimou a direita.
              </>
            ) : (
              <>em 2018 e em 2022 as pesquisas erraram na mesma direção, subestimando a direita.</>
            )}{" "}
            Por isso a diferença medida não basta: a régua da puxada, mais abaixo, mostra o que
            acontece se o erro se repetir.
          </li>
        </ul>
      </div>

      <Detalhe titulo="Como este caminho foi escolhido" className="mt-4">
        <Colunas arranjo="iguais" className="mt-1 text-corpo text-tinta-media numeros">
          <p className="max-w-texto">
            O painel vai perguntando, uma coisa de cada vez, e fica sempre com a resposta mais
            provável. Cada resposta é a mais provável da sua pergunta — juntas elas descrevem o
            caminho mais comum, não o único.
          </p>
          <p className="mt-3 max-w-texto lg:mt-0">
            Quem ganha a decisão? {lider}. Por quanto? A faixa em destaque acima. Nada disso é
            opinião fixa: mude a régua da puxada e esta seção passa a descrever, sozinha, o outro
            desfecho quando ele virar o mais provável.
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
