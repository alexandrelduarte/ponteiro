import type { CSSProperties, ReactNode } from "react";

/**
 * Rótulo de gráfico em HTML, posicionado por fração sobre um SVG.
 *
 * Por que não `<text>` dentro do SVG: com `viewBox` o texto escala junto com o
 * desenho, e a 390px o mesmo rótulo que fica confortável no desktop cai para
 * 7px — abaixo do piso tipográfico. Rótulo é TEXTO: sai em HTML, com corpo
 * real e responsivo, e o SVG fica só com geometria.
 *
 * `x`/`y` são frações (0–1) da caixa do SVG; o wrapper precisa ser `relative`.
 */
export function Rotulo({
  x,
  y,
  ancora = "inicio",
  cor,
  peso,
  classe,
  children,
}: {
  x: number;
  y: number;
  ancora?: "inicio" | "meio" | "fim";
  cor?: string;
  peso?: number;
  classe?: string;
  children: ReactNode;
}) {
  const deslocamento =
    ancora === "fim"
      ? "translate(-100%, -50%)"
      : ancora === "meio"
        ? "translate(-50%, -50%)"
        : "translate(0, -50%)";
  const estilo: CSSProperties = {
    left: `${x * 100}%`,
    top: `${y * 100}%`,
    transform: deslocamento,
    color: cor,
    fontWeight: peso,
    fontVariantNumeric: "tabular-nums",
  };
  return (
    <span
      className={`pointer-events-none absolute whitespace-nowrap ${classe ?? "text-[12px] md:text-[13px]"}`}
      style={estilo}
    >
      {children}
    </span>
  );
}

/** Caixa `relative` que embrulha um SVG responsivo e seus rótulos em HTML. */
export function Figura({ children }: { children: ReactNode }) {
  return <div className="relative w-full">{children}</div>;
}
