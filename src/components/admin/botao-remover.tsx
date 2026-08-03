"use client";

/**
 * Remoção de uma pesquisa já publicada. Também em dois passos: sair da série é
 * a ação mais delicada do produto (é o que um agregador mal-intencionado faria
 * em silêncio), e ela fica registrada na auditoria pública.
 */
import { useState, useTransition } from "react";
import { removerPesquisa, type ResultadoAcao } from "@/lib/admin/acoes";

export function BotaoRemover({ id, descricao }: { id: string; descricao: string }) {
  const [confirmando, setConfirmando] = useState(false);
  const [motivo, setMotivo] = useState("");
  const [resultado, setResultado] = useState<ResultadoAcao | null>(null);
  const [processando, iniciar] = useTransition();

  if (resultado?.ok) {
    return (
      <span role="status" className="font-mono text-xs text-confirma-texto">
        ✓ {resultado.mensagem}
      </span>
    );
  }

  if (!confirmando) {
    return (
      <div className="flex flex-col items-end gap-1">
        <button
          type="button"
          onClick={() => setConfirmando(true)}
          aria-label={`Remover da série: ${descricao}`}
          className="min-h-toque min-w-toque rounded-controle border border-linha px-2 text-sm text-cinza"
        >
          ×
        </button>
        {resultado && !resultado.ok ? (
          <span role="status" className="font-mono text-xs text-alerta-texto">
            ⚠ {resultado.erro}
          </span>
        ) : null}
      </div>
    );
  }

  return (
    <div className="rounded-controle border border-alerta bg-alerta-fundo p-2">
      <p className="text-xs text-alerta-texto">Remover {descricao} da série publicada?</p>
      <input
        value={motivo}
        onChange={(e) => setMotivo(e.target.value)}
        placeholder="motivo (vai para a auditoria)"
        maxLength={500}
        className="mt-1 min-h-toque w-full rounded-controle border border-linha bg-campo px-2 text-xs text-tinta"
      />
      <div className="mt-2 flex gap-2">
        <button
          type="button"
          disabled={processando}
          onClick={() =>
            iniciar(async () => {
              setResultado(await removerPesquisa(id, motivo));
              setConfirmando(false);
              setMotivo("");
            })
          }
          className="min-h-toque rounded-controle bg-tinta px-3 text-xs font-semibold text-texto-inverso disabled:cursor-wait"
        >
          {processando ? "⏳" : "Confirmar"}
        </button>
        <button
          type="button"
          onClick={() => setConfirmando(false)}
          className="min-h-toque rounded-controle border border-cinza px-3 text-xs font-semibold text-tinta"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
