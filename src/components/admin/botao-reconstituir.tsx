"use client";

/**
 * Reconstituição retroativa da série do /historico. Idempotente e barata
 * (zero IA): apaga e regrava só os pontos marcados como recalculados.
 */
import { useState, useTransition } from "react";
import { Botao } from "@/components/ui/blocos";
import { reconstituirHistorico } from "@/lib/admin/acoes";

interface Resultado {
  ok: boolean;
  mensagem?: string;
  erro?: string;
}

export function BotaoReconstituir() {
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [rodando, iniciar] = useTransition();

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Botao
        disabled={rodando}
        onClick={() =>
          iniciar(async () => {
            setResultado(await reconstituirHistorico());
          })
        }
        className="w-56"
      >
        {rodando ? "Recalculando…" : "Reconstituir histórico"}
      </Botao>

      <p role="status" aria-live="polite" className="text-micro numeros">
        {rodando ? (
          <span className="text-tinta-media">
            rodando o modelo em cada data passada… (alguns segundos)
          </span>
        ) : resultado ? (
          <span
            className={[
              "inline-block rounded-nicho px-4 py-2",
              resultado.ok ? "bg-ameixa-bruma text-tinta" : "bg-atencao-fundo text-tinta",
            ].join(" ")}
          >
            {resultado.ok ? resultado.mensagem : `⚠ ${resultado.erro}`}
          </span>
        ) : null}
      </p>
    </div>
  );
}
