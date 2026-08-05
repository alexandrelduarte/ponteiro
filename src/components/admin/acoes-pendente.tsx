"use client";

/**
 * Aprovar / rejeitar uma pesquisa da fila (R3).
 *
 * Confirmação em dois passos, inline: nada de `window.confirm` (não é
 * estilizável, não é testável e some no mobile). A ação primária é ameixa
 * cheia; a destrutiva é botão-fantasma com tinta e contorno em âmbar-queimado.
 * Não existe verde de sucesso nem vermelho de perigo aqui (DESIGN-V2 §5.8).
 */
import { useState, useTransition } from "react";
import { Botao } from "@/components/ui/blocos";
import { aprovarPesquisa, rejeitarPesquisa, type ResultadoAcao } from "@/lib/admin/acoes";

type Passo = null | "aprovar" | "rejeitar";

const FANTASMA_ATENCAO =
  "inline-flex min-h-toque items-center justify-center rounded-plena bg-placa px-5 " +
  "text-corpo font-semibold text-atencao shadow-[inset_0_0_0_2px_var(--color-atencao)] " +
  "transition-colors duration-(--dur-rapida) ease-(--ease-padrao) hover:bg-atencao-fundo";

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
        <div className="flex flex-wrap gap-3">
          <Botao onClick={() => setPasso("aprovar")} disabled={processando}>
            Aprovar e publicar
          </Botao>
          <button
            type="button"
            onClick={() => setPasso("rejeitar")}
            disabled={processando}
            className={FANTASMA_ATENCAO}
          >
            Rejeitar
          </button>
        </div>
      ) : (
        <div className="rounded-campo bg-placa p-4">
          <p className="text-corpo text-tinta">
            {passo === "aprovar"
              ? `Publicar na lista oficial: ${descricao}?`
              : `Rejeitar e tirar da fila: ${descricao}?`}
          </p>
          {passo === "rejeitar" ? (
            <label className="mt-2 block text-micro text-tinta-media">
              Motivo (opcional, fica na auditoria)
              <input
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                maxLength={500}
                className="mt-1 min-h-toque w-full rounded-campo bg-placa px-3 text-corpo text-tinta shadow-[inset_0_0_0_1px_var(--color-contorno)]"
              />
            </label>
          ) : null}
          <div className="mt-3 flex flex-wrap gap-3">
            <Botao onClick={() => executar(passo)} disabled={processando}>
              {processando ? "Executando…" : "Confirmar"}
            </Botao>
            <Botao variante="fantasma" onClick={() => setPasso(null)} disabled={processando}>
              Cancelar
            </Botao>
          </div>
        </div>
      )}

      <p role="status" aria-live="polite" className="mt-2">
        {resultado ? (
          <span
            className={[
              "inline-block rounded-nicho px-4 py-2 text-micro",
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
