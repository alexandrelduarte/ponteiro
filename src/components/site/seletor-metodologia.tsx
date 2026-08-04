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
 *
 * SEM PLACA: §5.7 manda a /metodologia ser prosa em coluna de leitura, "zero
 * cartão decorativo". A placa de 936px que envolvia este seletor deixava 50%
 * de faixa morta à direita a 1440 — o controle ocupa 300px. O que ele perde em
 * campo branco, ganha em contorno: o trilho do segmentado passa a ter 1,5px de
 * `--color-contorno` (3,01:1 contra a bruma), porque sobre a página tingida o
 * campo `--color-nicho` fica a 1,05:1 e o controle deixaria de parecer
 * controle.
 */
import { useState, useSyncExternalStore, type ReactNode } from "react";

export type ModoMetodologia = "simples" | "tecnica";

const OPCOES: { valor: ModoMetodologia; rotulo: string }[] = [
  { valor: "simples", rotulo: "Explicação simples" },
  { valor: "tecnica", rotulo: "Explicação técnica" },
];

/** A âncora que pede a explicação técnica logo de cara. */
const ANCORA_TECNICA = "#explicacao-tecnica";

const assinarHash = (aoMudar: () => void) => {
  window.addEventListener("hashchange", aoMudar);
  return () => window.removeEventListener("hashchange", aoMudar);
};
const lerHash = () => window.location.hash;
/** No servidor não existe hash: o HTML nasce sempre na explicação simples. */
const hashNoServidor = () => "";

export function SeletorMetodologia({ children }: { children: ReactNode }) {
  /**
   * Quem chega por "ver a fórmula exata na explicação técnica" já cai nela.
   * O padrão continua sendo a explicação simples — a âncora é a única coisa
   * que muda o modo inicial, e ela só existe em links que prometem a conta.
   *
   * `useSyncExternalStore` em vez de efeito com `setState`: o hash é estado de
   * fora do React, e ler daqui evita render em cascata e mantém a página
   * estática (nada de `useSearchParams`, nada de renderização dinâmica).
   */
  const hash = useSyncExternalStore(assinarHash, lerHash, hashNoServidor);
  const [escolhido, setEscolhido] = useState<ModoMetodologia | null>(null);
  const modo: ModoMetodologia = escolhido ?? (hash === ANCORA_TECNICA ? "tecnica" : "simples");
  const setModo = setEscolhido;

  return (
    <>
      <section aria-labelledby="rotulo-modo" className="mt-8">
        <p id="rotulo-modo" className="text-secao text-tinta">
          Como você quer ler esta página?
        </p>
        <div
          id="explicacao-tecnica"
          role="radiogroup"
          aria-labelledby="rotulo-modo"
          /* Raio condicional: abaixo de `sm` os dois botões empilham e o trilho
             vira um "estádio" de raio ~50px — arco que NÃO contém a pílula de
             raio 22 (ela transbordava o anel em até 4,3px). Retângulo de raio
             16 quando empilha; o estádio (`rounded-plena`) volta quando o
             controle cabe em uma linha. */
          className="mt-2 inline-flex scroll-mt-4 flex-wrap gap-1 rounded-nicho bg-placa p-1 shadow-[inset_0_0_0_1.5px_var(--color-contorno)] sm:rounded-plena"
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
        <p className="mt-2 text-micro text-tinta-media">
          A explicação técnica é a mesma que sempre esteve aqui, palavra por palavra. A simples não
          tira nada: só troca as palavras difíceis.
        </p>
      </section>

      <div className="group" data-modo={modo}>
        {children}
      </div>
    </>
  );
}
