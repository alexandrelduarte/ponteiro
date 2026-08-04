"use client";

/**
 * O ENXAME DE 100 — o elemento-assinatura (docs/DESIGN-V2.md §4.1).
 *
 * Cem bolinhas, uma por cenário, empilhadas em colunas de um ponto sobre a
 * régua da diferença. A PILHA INTEIRA é a incerteza: a forma vem antes da
 * linha, e quem está de que lado é POSIÇÃO em relação ao empate — não cor.
 *
 * Três coisas que este componente garante:
 *
 *  1. NASCE PRONTO. É HTML do servidor, sem `next/dynamic`, sem Recharts e sem
 *     medir o DOM: com JavaScript desligado o desenho está lá, inteiro.
 *  2. O ESCRITO É O DESENHADO. `nLula`/`nFlavio` saem da contagem das próprias
 *     bolinhas e somam 100 por construção (H3) — a legenda usa os mesmos.
 *  3. A ANIMAÇÃO É DECORATIVA E DISPENSÁVEL. As bolinhas caem por CSS, por
 *     COLUNA, uma vez por visita à seção; sem o atributo `data-assenta` elas
 *     nascem assentadas. `prefers-reduced-motion` mata a queda inteira pela
 *     regra de `[data-motion="decorativo"]` em tokens.css.
 *
 * A régua do empate, o eixo e os rótulos NUNCA animam: referência que se mexe
 * mente (§7.2). Os rótulos ficam FORA do SVG, posicionados em porcentagem,
 * para não encolherem junto com o desenho a 390px (§6.2).
 */
import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { LayoutEnxame } from "./enxame-nucleo";

export { montarEnxame } from "./enxame-nucleo";
export type { LayoutEnxame } from "./enxame-nucleo";

/** Dispara a queda uma única vez, quando a seção entra na tela. */
function useAssentaUmaVez<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [assentou, setAssentou] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || assentou) return;
    // Sem IntersectionObserver não há animação nenhuma — e não faz falta: as
    // bolinhas já nascem assentadas no HTML. Movimento é o que se perde primeiro.
    if (!("IntersectionObserver" in window)) return;
    const observador = new IntersectionObserver(
      (entradas) => {
        if (entradas.some((e) => e.isIntersecting)) {
          setAssentou(true);
          observador.disconnect();
        }
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    observador.observe(el);
    return () => observador.disconnect();
  }, [assentou]);

  return { ref, assentou };
}

/**
 * As três escalas do elemento-assinatura, em ordem estrita de tamanho.
 *
 * O elemento-assinatura tem de ser o MAIOR onde ele assina (§5.1): a versão
 * anterior deixava o hero a 1440 com bolinha de 16px contra 20px do enxame de
 * "Isso ainda pode virar?" — o hero 25% menor que uma seção do meio da página,
 * porque ali ele dividia a placa com a micro-legenda e perdia largura. Agora a
 * ordem é garantida por construção, e o hero não tem teto: ele ocupa a placa
 * inteira, em qualquer largura, como §2.2 item 5 manda ("o passo cresce sem
 * teto"). Medido na placa de 936px de 1440: hero ~23px · média ~16px ·
 * mini ~13px. A 390 as três valem 318px de contêiner e caem no piso de 8px.
 */
const LARGURA_ESCALA = {
  hero: "",
  media: "max-w-[40rem]",
  mini: "max-w-[32rem]",
} as const;

export type EscalaEnxame = keyof typeof LARGURA_ESCALA;

export function Enxame({
  layout,
  rotuloAcessivel,
  escala = "media",
  idTeste,
}: {
  layout: LayoutEnxame;
  /** o gráfico dito em português, com os DOIS números (§6.2) */
  rotuloAcessivel: string;
  escala?: EscalaEnxame;
  idTeste?: string;
}) {
  const { ref, assentou } = useAssentaUmaVez<HTMLDivElement>();
  const { passo, diametro, passoVertical, larguraSvg, alturaSvg, yEixo, xEmpate } = layout;
  const raio = diametro / 2;
  /**
   * Rótulos de ponta curtos no mini: no cartão de 286px de 390, "← Flávio na
   * frente · 18" quebrava e deixava o "18" órfão numa linha sozinha, sem o
   * lado que ele descreve — o número ancorado no desenho perdia a âncora. A
   * frase inteira continua no rótulo acessível do SVG.
   */
  const curto = escala === "mini";

  return (
    <div ref={ref} className={LARGURA_ESCALA[escala]}>
      {/* Rótulo do empate, ancorado em porcentagem e fora do SVG. */}
      <div className="relative h-5 text-micro text-tinta">
        <span
          className="absolute -translate-x-1/2 whitespace-nowrap"
          style={{ left: `${layout.posEmpatePct}%` }}
        >
          empate
        </span>
      </div>

      <div
        data-motion="decorativo"
        data-assenta={assentou ? "sim" : undefined}
        data-testid={idTeste}
      >
        <svg
          viewBox={`0 0 ${larguraSvg} ${alturaSvg}`}
          role="img"
          aria-label={rotuloAcessivel}
          className="block h-auto w-full"
        >
          {layout.colunas.map((coluna, i) => {
            const cx = (coluna.indice - layout.colunas[0].indice + 0.5) * passo;
            return (
              <g
                key={coluna.indice}
                className="bolinha"
                style={
                  {
                    // Atraso por COLUNA, nunca por bolinha: a coluna é o bin, e
                    // é o bin que representa acúmulo (§7.1). Os dois tokens
                    // zeram em prefers-reduced-motion.
                    "--atraso": `min(calc(var(--stagger-passo) * ${i}), var(--stagger-teto))`,
                  } as CSSProperties
                }
              >
                {Array.from({ length: coluna.qtd }, (_, j) => (
                  <circle
                    key={j}
                    cx={cx}
                    cy={yEixo - 2 - (j + 0.5) * passoVertical}
                    r={raio}
                    fill={coluna.lado === "lula" ? "var(--color-lula)" : "var(--color-flavio)"}
                  />
                ))}
              </g>
            );
          })}

          {/* Eixo: linha de base do enxame. Espessura constante em qualquer
              escala — o desenho cresce, a referência não engorda. */}
          <line
            x1={0}
            y1={yEixo}
            x2={larguraSvg}
            y2={yEixo}
            stroke="var(--color-contorno)"
            strokeWidth={1.5}
            vectorEffect="non-scaling-stroke"
          />
          {/* Régua do empate: passa no VÃO entre as colunas que ladeiam o zero. */}
          <line
            className="regua-empate"
            x1={xEmpate}
            y1={0}
            x2={xEmpate}
            y2={alturaSvg}
            stroke="var(--color-tinta)"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </div>

      {/* Os DOIS números, ancorados no desenho e não na prosa.
          Contar 100 bolinhas de 8px num Android é ficção: sem número junto, a
          "frequência contável" que P1 promete não chega ao leitor — e a 390 a
          prosa que trazia o 82 e o 18 caía fora da primeira dobra.
          Eles saem de `layout`, ou seja, da CONTAGEM DAS PRÓPRIAS BOLINHAS
          (`{{T2_LULA}}`/`{{T2_FLAVIO}}`), nunca da manchete: escrito e
          desenhado são o mesmo inteiro por construção (H3). Cada um fica do
          lado da régua que descreve, no mesmo peso da legenda de ponta. */}
      {/* `flex-wrap` é rede de segurança, não layout: com os dois rótulos em
          `whitespace-nowrap`, uma fonte maior que a prevista faria o par
          estourar a coluna. Assim ele quebra por rótulo INTEIRO — nunca
          separando o número do lado que ele descreve. */}
      <p className="mt-1 flex flex-wrap justify-between gap-x-3 text-micro text-tinta-media">
        <span className="whitespace-nowrap">
          ← {curto ? "Flávio" : "Flávio na frente"} ·{" "}
          <b data-testid={idTeste ? `${idTeste}-n-flavio` : undefined} className="text-flavio">
            {layout.nFlavio}
          </b>
        </span>
        <span className="whitespace-nowrap">
          <b data-testid={idTeste ? `${idTeste}-n-lula` : undefined} className="text-lula">
            {layout.nLula}
          </b>{" "}
          · {curto ? "Lula" : "Lula na frente"} →
        </span>
      </p>
    </div>
  );
}
