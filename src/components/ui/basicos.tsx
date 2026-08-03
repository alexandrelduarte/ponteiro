import type { ReactNode } from "react";

/* ------------------------------------------------------------------ *
 * Seção da coluna de leitura                                         *
 * ------------------------------------------------------------------ */

/** Faixa de conteúdo: coluna de 1024px, goteiras e ritmo vertical do §6.2. */
export function Secao({
  children,
  className,
  id,
  rotuladaPor,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
  rotuladaPor?: string;
}) {
  return (
    <section
      id={id}
      aria-labelledby={rotuladaPor}
      className={[
        "mx-auto w-full max-w-leitura px-goteira lg:px-goteira-lg",
        "mt-secao md:mt-secao-md lg:mt-secao-lg",
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </section>
  );
}

/* ------------------------------------------------------------------ *
 * Links                                                              *
 * ------------------------------------------------------------------ */

/** Link para fora do site — sempre `noopener noreferrer` e sublinhado pontilhado. */
export function LinkExterno({
  href,
  children,
  className,
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={["underline decoration-dotted underline-offset-2", className ?? ""]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </a>
  );
}

/* ------------------------------------------------------------------ *
 * Chips                                                              *
 * ------------------------------------------------------------------ */

export type TomChip = "alerta" | "confirma" | "neutro";

const TOM: Record<TomChip, string> = {
  alerta: "bg-alerta-fundo text-alerta-texto border-alerta",
  confirma: "bg-confirma-fundo text-confirma-texto border-confirma",
  neutro: "bg-mini text-cinza border-linha",
};

/** Etiqueta curta com fundo — leitura de pesquisa, selo de frescor, avisos. */
export function Chip({
  tom = "neutro",
  children,
  className,
  ...resto
}: {
  tom?: TomChip;
  children: ReactNode;
  className?: string;
} & React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      {...resto}
      className={["inline-block rounded-full border px-2 py-0.5 text-xs", TOM[tom], className ?? ""]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </span>
  );
}

/* ------------------------------------------------------------------ *
 * Estados                                                            *
 * ------------------------------------------------------------------ */

/**
 * Aviso local degradado (docs/DESIGN.md §8.3): diz o que ficou indisponível e
 * o que ainda vale. `role="status"` — a página não é uma emergência.
 */
export function AvisoErro({ children }: { children: ReactNode }) {
  return (
    <p
      role="status"
      className="rounded-controle border border-alerta bg-alerta-fundo px-3 py-2 font-mono text-xs text-alerta-texto"
    >
      ⚠ {children}
    </p>
  );
}

/** Bloco de estado vazio com voz do produto. */
export function Vazio({ titulo, children }: { titulo: string; children?: ReactNode }) {
  return (
    <div className="rounded-controle border border-dashed border-linha-forte bg-mini p-cartao">
      <p className="text-sm font-semibold text-tinta">{titulo}</p>
      {children ? <div className="mt-1 text-sm leading-compacto text-cinza">{children}</div> : null}
    </div>
  );
}

/**
 * Esqueleto de carregamento: retângulo sem shimmer, com a ALTURA EXATA do
 * conteúdo final (docs/DESIGN.md §8.1) — é o que mantém o CLS em zero.
 */
export function Esqueleto({ className, rotulo }: { className: string; rotulo: string }) {
  return (
    <div aria-busy="true" className={["rounded-controle bg-linha opacity-40", className].join(" ")}>
      <span className="sr-only">{rotulo}</span>
    </div>
  );
}
