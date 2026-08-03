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
  /** ETIQUETA curta, caixa alta. Nunca prosa: o §4.3 dimensiona este estilo
   *  para rótulo — frase inteira vai em `descricao`. */
  titulo: ReactNode;
  /** Frase de apoio/instrução, caixa normal em `text-sm` logo abaixo da etiqueta. */
  descricao?: ReactNode;
  /** id do título — use para `aria-labelledby` de tabelas e regiões roláveis */
  idTitulo?: string;
  destaque?: Destaque;
  className?: string;
  children: ReactNode;
}

/** Cartão-canhoto: papel mais claro, filete fino e rótulo mono em caixa alta. */
export function Cartao({
  titulo,
  descricao,
  idTitulo,
  destaque,
  className,
  children,
}: CartaoProps) {
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
      <div className="mb-3">
        <div id={idTitulo} className="font-mono text-xs tracking-etiqueta text-cinza uppercase">
          {titulo}
        </div>
        {descricao ? (
          <p className="mt-1 max-w-texto text-sm leading-compacto text-cinza">{descricao}</p>
        ) : null}
      </div>
      {children}
    </div>
  );
}
