"use client";

/**
 * Aprovar / rejeitar uma pesquisa da fila (R3).
 *
 * Confirmação em dois passos, inline: nada de `window.confirm` (não é
 * estilizável, não é testável e some no mobile). O resultado é anunciado por
 * `role="status"`.
 */
import { useState, useTransition } from "react";
import { aprovarPesquisa, rejeitarPesquisa, type ResultadoAcao } from "@/lib/admin/acoes";

type Passo = null | "aprovar" | "rejeitar";

export function AcoesPendente({ id, descricao }: { id: string; descricao: string }) {
  const [passo, setPasso] = useState<Passo>(null);
  const [motivo, setMotivo] = useState("");
  const [resultado, setResultado] = useState<ResultadoAcao | null>(null);
  const [processando, iniciar] = useTransition();

  const executar = (acao: Exclude<Passo, null>) => {
    iniciar(async () => {
      const r = acao === "aprovar" ? await aprovarPesquisa(id) : await rejeitarPesquisa(id, motivo);
      setResultado(r);
      setPasso(null);
      setMotivo("");
    });
  };

  return (
    <div className="mt-3">
      {passo === null ? (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setPasso("aprovar")}
            disabled={processando}
            className="min-h-toque rounded-controle bg-confirma px-3 text-sm font-semibold text-campo shadow-botao"
          >
            ✓ Aprovar
          </button>
          <button
            type="button"
            onClick={() => setPasso("rejeitar")}
            disabled={processando}
            className="min-h-toque rounded-controle border border-alerta px-3 text-sm font-semibold text-alerta-texto"
          >
            × Rejeitar
          </button>
        </div>
      ) : (
        <div className="rounded-controle border border-dashed border-cinza bg-mini p-3">
          <p className="text-sm text-tinta">
            {passo === "aprovar"
              ? `Publicar na série oficial: ${descricao}?`
              : `Rejeitar e tirar da fila: ${descricao}?`}
          </p>
          {passo === "rejeitar" ? (
            <label className="mt-2 block text-xs text-cinza">
              Motivo (opcional, fica na auditoria)
              <input
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                maxLength={500}
                className="mt-1 min-h-toque w-full rounded-controle border border-linha bg-campo px-2 text-sm text-tinta"
              />
            </label>
          ) : null}
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => executar(passo)}
              disabled={processando}
              className="min-h-toque rounded-controle bg-tinta px-3 text-sm font-semibold text-texto-inverso disabled:cursor-wait"
            >
              {processando ? "⏳ Executando…" : "Confirmar"}
            </button>
            <button
              type="button"
              onClick={() => setPasso(null)}
              disabled={processando}
              className="min-h-toque rounded-controle border border-cinza px-3 text-sm font-semibold text-tinta"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      <p role="status" aria-live="polite" className="mt-2">
        {resultado ? (
          <span
            className={[
              "inline-block rounded-controle border px-3 py-2 font-mono text-xs",
              resultado.ok
                ? "border-confirma bg-confirma-fundo text-confirma-texto"
                : "border-alerta bg-alerta-fundo text-alerta-texto",
            ].join(" ")}
          >
            {resultado.ok ? `✓ ${resultado.mensagem}` : `⚠ ${resultado.erro}`}
          </span>
        ) : null}
      </p>
    </div>
  );
}
