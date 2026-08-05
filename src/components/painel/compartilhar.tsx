"use client";

/**
 * Compartilhar o que o leitor está vendo: Web Share API quando existe, cópia do
 * link quando não. O feedback é sempre visível E anunciado (`role="status"`).
 *
 * Quando as réguas estão fora do padrão, o texto compartilhado diz que o número
 * é de SIMULAÇÃO (H7) — o link não pode sair por aí passando por oficial.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { Botao } from "@/components/ui/blocos";
import { ACOES, parEmCem } from "@/components/ui/textos";
import { NOME_SITE } from "@/app/_lib/site";
import { paramsParaQuery } from "./parametros-url";
import { usePainel } from "./estado";

type Estado = "pronto" | "copiado" | "erro";

export function Compartilhar() {
  const { params, paramsAlterados, M } = usePainel();
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
    const [lula, flavio] = parEmCem(M.eleito.dia.l);
    const texto = paramsAlterados
      ? `Minha simulação no ${NOME_SITE}: com as réguas que eu mexi, Lula é eleito em ${lula} de cada 100 cenários. Não é o número oficial do painel.`
      : `Em 100 eleições parecidas com esta, Lula é eleito em ${lula} e Flávio em ${flavio}. Não é previsão — veja de onde vem esse número.`;
    try {
      if (typeof navigator.share === "function") {
        await navigator.share({ title: `${NOME_SITE} — Presidente 2026`, text: texto, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      avisar("copiado");
    } catch (erro) {
      // Cancelar o menu nativo não é falha.
      if (erro instanceof DOMException && erro.name === "AbortError") return;
      avisar("erro");
    }
  }, [params, paramsAlterados, M, avisar]);

  return (
    <span className="inline-flex flex-wrap items-center gap-3">
      <Botao variante="fantasma" onClick={compartilhar} data-testid="compartilhar">
        {ACOES.compartilhar}
      </Botao>
      <span role="status" aria-live="polite" className="text-micro text-tinta-media">
        {estado === "copiado"
          ? ACOES.compartilharCopiado
          : estado === "erro"
            ? ACOES.compartilharErro
            : ""}
      </span>
    </span>
  );
}
