"use client";

/**
 * Compartilhar o cenário atual: Web Share API quando existe, cópia do link
 * quando não. O feedback é sempre visível E anunciado (`role="status"`).
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { paramsParaQuery } from "./parametros-url";
import { usePainel } from "./estado";

type Estado = "pronto" | "copiado" | "erro";

export function Compartilhar() {
  const { params } = usePainel();
  const [estado, setEstado] = useState<Estado>("pronto");
  const timer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    },
    [],
  );

  const avisar = useCallback((novo: Estado) => {
    setEstado(novo);
    if (timer.current !== null) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setEstado("pronto"), 4000);
  }, []);

  const compartilhar = useCallback(async () => {
    const url = `${window.location.origin}${window.location.pathname}${paramsParaQuery(params)}`;
    const titulo = "Agregador Presidencial 2026 — cenário com os meus parâmetros";
    try {
      if (typeof navigator.share === "function") {
        await navigator.share({ title: titulo, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      avisar("copiado");
    } catch (erro) {
      // Cancelar o menu nativo não é falha.
      if (erro instanceof DOMException && erro.name === "AbortError") return;
      avisar("erro");
    }
  }, [params, avisar]);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={compartilhar}
        data-testid="compartilhar"
        className="min-h-toque rounded-controle border border-cinza px-3 text-sm font-semibold text-tinta"
      >
        ▶ Compartilhar este cenário
      </button>
      <p role="status" aria-live="polite" className="font-mono text-xs text-cinza">
        {estado === "copiado"
          ? "✓ link copiado — ele reabre o painel com estes parâmetros"
          : estado === "erro"
            ? "⚠ não foi possível copiar; selecione a barra de endereço e copie o link"
            : ""}
      </p>
    </div>
  );
}
