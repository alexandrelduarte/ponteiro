"use client";

/**
 * Remoção de uma pesquisa já publicada. Também em dois passos: sair da lista é
 * a ação mais delicada do produto (é o que um agregador mal-intencionado faria
 * em silêncio), e ela fica registrada na auditoria pública.
 */
import { useState, useTransition } from "react";
import { Botao } from "@/components/ui/blocos";
import { removerPesquisa, type ResultadoAcao } from "@/lib/admin/acoes";

export function BotaoRemover({ id, descricao }: { id: string; descricao: string }) {
  const [confirmando, setConfirmando] = useState(false);
  const [motivo, setMotivo] = useState("");
  const [resultado, setResultado] = useState<ResultadoAcao | null>(null);
  const [processando, iniciar] = useTransition();

  if (resultado?.ok) {
    return (
      <span role="status" className="text-micro text-ameixa">
        {resultado.mensagem}
      </span>
    );
  }

  if (!confirmando) {
    return (
      <span className="flex flex-col items-end gap-1">
        <button
          type="button"
          onClick={() => setConfirmando(true)}
          aria-label={`Tirar da lista: ${descricao}`}
          className="inline-flex min-h-toque min-w-toque items-center justify-center rounded-plena text-atencao shadow-[inset_0_0_0_2px_var(--color-atencao)] transition-colors duration-(--dur-rapida) hover:bg-atencao-fundo"
        >
          <span aria-hidden="true">×</span>
        </button>
        {resultado && !resultado.ok ? (
          <span role="status" className="text-micro text-atencao">
            ⚠ {resultado.erro}
          </span>
        ) : null}
      </span>
    );
  }

  return (
    <span className="block rounded-nicho bg-atencao-fundo p-3">
      <span className="block text-micro text-tinta">Tirar {descricao} da lista publicada?</span>
      <input
        value={motivo}
        onChange={(e) => setMotivo(e.target.value)}
        placeholder="motivo (vai para a auditoria)"
        maxLength={500}
        aria-label="Motivo da remoção"
        className="mt-2 min-h-toque w-full rounded-campo bg-placa px-3 text-micro text-tinta shadow-[inset_0_0_0_1px_var(--color-contorno)]"
      />
      <span className="mt-2 flex gap-3">
        <Botao
          disabled={processando}
          onClick={() =>
            iniciar(async () => {
              setResultado(await removerPesquisa(id, motivo));
              setConfirmando(false);
              setMotivo("");
            })
          }
        >
          {processando ? "…" : "Confirmar"}
        </Botao>
        <Botao variante="fantasma" onClick={() => setConfirmando(false)}>
          Cancelar
        </Botao>
      </span>
    </span>
  );
}
