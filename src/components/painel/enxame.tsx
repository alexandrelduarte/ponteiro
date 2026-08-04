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

export function Enxame({
  layout,
  rotuloAcessivel,
  compacto = false,
  idTeste,
}: {
  layout: LayoutEnxame;
  /** o gráfico dito em português, com os DOIS números (§6.2) */
  rotuloAcessivel: string;
  compacto?: boolean;
  idTeste?: string;
}) {
  const { ref, assentou } = useAssentaUmaVez<HTMLDivElement>();
  const { passo, diametro, passoVertical, larguraSvg, alturaSvg, yEixo, xEmpate } = layout;
  const raio = diametro / 2;

  return (
    <div ref={ref} className={compacto ? "max-w-[20rem]" : "max-w-[45rem]"}>
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
            x1={xEmpate}
            y1={0}
            x2={xEmpate}
            y2={alturaSvg}
            stroke="var(--color-tinta)"
            strokeWidth={3}
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </div>

      <p className="mt-1 flex justify-between gap-4 text-micro text-tinta-media">
        <span>← Flávio na frente</span>
        <span>Lula na frente →</span>
      </p>
    </div>
  );
}
