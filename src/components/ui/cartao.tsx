import type { ReactNode } from "react";

/** Filete de topo do cartão (docs/DESIGN.md §3.2: destaque nunca é fundo escuro). */
export type Destaque = "confirma" | "lula" | "flavio" | "alerta" | "tinta";

const FILETE: Record<Destaque, string> = {
  confirma: "border-t-[3px] border-t-confirma",
  lula: "border-t-[3px] border-t-lula",
  flavio: "border-t-[3px] border-t-flavio",
  alerta: "border-t-[3px] border-t-alerta",
  tinta: "border-t-[3px] border-t-tinta",
};

export interface CartaoProps {
  titulo: ReactNode;
  /** id do título — use para `aria-labelledby` de tabelas e regiões roláveis */
  idTitulo?: string;
  destaque?: Destaque;
  className?: string;
  children: ReactNode;
}

/** Cartão-canhoto: papel mais claro, filete fino e rótulo mono em caixa alta. */
export function Cartao({ titulo, idTitulo, destaque, className, children }: CartaoProps) {
  return (
    <div
      className={[
        "rounded-cartao border border-linha bg-cartao p-cartao md:p-cartao-md",
        destaque ? FILETE[destaque] : "",
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div id={idTitulo} className="mb-3 font-mono text-xs tracking-etiqueta text-cinza uppercase">
        {titulo}
      </div>
      {children}
    </div>
  );
}
