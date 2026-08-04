"use client";

/**
 * Seletor "explicação simples / explicação técnica" da /metodologia
 * (COPY-DECK §U).
 *
 * As DUAS camadas estão sempre no HTML; o seletor só troca qual delas fica
 * visível, por CSS. Isso tem três consequências boas: sem JavaScript a página
 * mostra as duas (nada some), o leitor de tela alcança tudo, e a troca não
 * remonta nada — logo, zero CLS e zero espera.
 *
 * A camada técnica é a mesma que sempre esteve aqui, palavra por palavra.
 */
import { useState, type ReactNode } from "react";
import { Secao } from "@/components/ui/blocos";

export type ModoMetodologia = "simples" | "tecnica";

const OPCOES: { valor: ModoMetodologia; rotulo: string }[] = [
  { valor: "simples", rotulo: "Explicação simples" },
  { valor: "tecnica", rotulo: "Explicação técnica" },
];

export function SeletorMetodologia({ children }: { children: ReactNode }) {
  const [modo, setModo] = useState<ModoMetodologia>("simples");

  return (
    <>
      <Secao>
        <div className="rounded-bloco bg-placa p-bloco md:p-bloco-md">
          <p id="rotulo-modo" className="text-secao text-tinta">
            Como você quer ler esta página?
          </p>
          <div
            role="radiogroup"
            aria-labelledby="rotulo-modo"
            className="mt-2 inline-flex flex-wrap gap-1 rounded-plena bg-nicho p-1"
          >
            {OPCOES.map((o) => (
              <button
                key={o.valor}
                type="button"
                role="radio"
                aria-checked={modo === o.valor}
                data-testid={`modo-${o.valor}`}
                onClick={() => setModo(o.valor)}
                className={[
                  "min-h-toque rounded-plena px-5 text-corpo font-semibold",
                  "transition-colors duration-(--dur-rapida) ease-(--ease-padrao)",
                  modo === o.valor
                    ? "bg-ameixa text-tinta-inversa"
                    : "text-tinta hover:bg-ameixa-tenue",
                ].join(" ")}
              >
                {o.rotulo}
              </button>
            ))}
          </div>
          <p className="mt-2 max-w-texto text-micro text-tinta-media">
            A explicação técnica é a mesma que sempre esteve aqui, palavra por palavra. A simples
            não tira nada: só troca as palavras difíceis.
          </p>
        </div>
      </Secao>

      <div className="group" data-modo={modo}>
        {children}
      </div>
    </>
  );
}
