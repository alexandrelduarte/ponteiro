"use client";

/**
 * Aplica ao painel os parâmetros que vieram na URL (`?vies=3.1&sys=4…`).
 *
 * Roda UMA vez, depois da montagem: a página é estática e nasce com a base
 * oficial e os parâmetros padrão — é isso que faz a manchete existir no HTML
 * do servidor. Precisa de `<Suspense>` porque `useSearchParams` marcaria a
 * árvore inteira como dinâmica.
 */
import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { ehPadrao, paramsDaQuery } from "./parametros-url";
import { usePainel } from "./estado";

export function SincronizadorURL() {
  const busca = useSearchParams();
  const { definirParams } = usePainel();
  const aplicado = useRef(false);

  useEffect(() => {
    if (aplicado.current) return;
    aplicado.current = true;
    const daUrl = paramsDaQuery(new URLSearchParams(busca.toString()));
    if (!ehPadrao(daUrl)) definirParams(daUrl);
  }, [busca, definirParams]);

  return null;
}
