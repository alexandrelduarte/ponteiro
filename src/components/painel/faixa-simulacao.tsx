"use client";

/**
 * Faixa de "simulação ativa" (R5 / docs/DESIGN.md §8.4).
 *
 * O leitor precisa saber, a qualquer momento, se está olhando a base oficial
 * ou o brinquedo dele. Em md+ acompanha a rolagem; em 390px não é sticky
 * (roubaria altura no viewport primário).
 */
import { fmt } from "@/lib/modelo";
import { usePainel } from "./estado";

export function FaixaSimulacao() {
  const { simulando, serieAlterada, paramsAlterados, pesquisas, params, restaurarTudo } =
    usePainel();

  return (
    <div
      role="status"
      aria-live="polite"
      className="mx-auto w-full max-w-leitura px-goteira lg:px-goteira-lg md:sticky md:top-0 md:z-10"
    >
      {simulando ? (
        <div
          data-testid="faixa-simulacao"
          className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-controle border border-alerta bg-alerta-fundo px-3 py-2 font-mono text-xs text-alerta-texto"
        >
          <span>
            ⚠ simulação ativa — não altera a base oficial
            {serieAlterada ? ` · série em simulação (${pesquisas.length} pesquisas)` : ""}
            {paramsAlterados ? ` · viés ${fmt(params.vies)} · σ ${fmt(params.sigmaSys)}` : ""}
          </span>
          <button
            type="button"
            onClick={restaurarTudo}
            data-testid="voltar-ao-oficial"
            className="min-h-toque rounded-controle border border-alerta px-3 text-xs font-semibold text-alerta-texto"
          >
            ↺ voltar ao oficial
          </button>
        </div>
      ) : null}
    </div>
  );
}
