"use client";

/**
 * Faixa de "modo de teste" (R5/H7 · COPY-DECK §R).
 *
 * O leitor precisa saber, a qualquer momento, se está olhando a lista oficial
 * ou o brinquedo dele — e o caminho de volta é um toque, sem rolagem. Em md+
 * ela acompanha a rolagem; a 390px não é fixa (roubaria altura do viewport
 * primário). É a ÚNICA superfície do painel autorizada a usar sombra, e só
 * quando está flutuando (§3.5).
 *
 * Movimento: `opacity` + `translateY` curto, entrada em `--dur-base` e saída
 * acelerada. Nunca existe na primeira pintura — só aparece depois de um gesto.
 */
import { AnimatePresence, motion } from "motion/react";
import { duracaoDoToken, easeDoToken } from "@/components/ui/movimento";
import { ACOES, SIMULACAO } from "@/components/ui/textos";
import { usePainel } from "./estado";

export function FaixaSimulacao() {
  const { simulando, serieAlterada, paramsAlterados, pesquisas, restaurarTudo } = usePainel();

  return (
    <div
      role="status"
      aria-live="polite"
      className="mx-auto w-full max-w-pagina px-goteira md:sticky md:top-2 md:z-30 md:px-goteira-md lg:px-goteira-lg"
    >
      <AnimatePresence>
        {simulando ? (
          <motion.div
            data-testid="faixa-simulacao"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{
              opacity: 0,
              y: -8,
              transition: {
                duration: duracaoDoToken("--dur-rapida", 120),
                ease: easeDoToken("--ease-saida"),
              },
            }}
            transition={{
              duration: duracaoDoToken("--dur-base", 200),
              ease: easeDoToken("--ease-padrao"),
            }}
            className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-nicho bg-atencao-fundo px-4 py-3 md:shadow-flutua"
          >
            <span className="text-corpo text-tinta">
              {SIMULACAO.faixa}
              {serieAlterada ? ` ${SIMULACAO.detalheSerie(pesquisas.length)}` : ""}
              {paramsAlterados ? ` ${SIMULACAO.detalheReguas}` : ""}
            </span>
            <button
              type="button"
              onClick={restaurarTudo}
              data-testid="voltar-ao-oficial"
              className="inline-flex min-h-toque items-center rounded-plena bg-ameixa px-5 text-corpo font-semibold text-tinta-inversa transition-colors duration-(--dur-rapida) ease-(--ease-padrao) hover:bg-ameixa-forte"
            >
              {ACOES.voltarOficial}
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
