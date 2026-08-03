"use client";

/**
 * Disparo manual do coletor. Custa dinheiro (IA + busca), então o backend
 * impõe um cooldown de 60s — aqui só tratamos o erro que ele devolve, com a
 * largura do botão travada para o rótulo "⏳ Buscando…" não pular o layout.
 */
import { useState, useTransition } from "react";
import { dispararAtualizacao, type ResultadoAtualizacao } from "@/lib/admin/acoes";

export function BotaoAtualizar() {
  const [resultado, setResultado] = useState<ResultadoAtualizacao | null>(null);
  const [buscando, iniciar] = useTransition();

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        disabled={buscando}
        onClick={() =>
          iniciar(async () => {
            setResultado(await dispararAtualizacao());
          })
        }
        className="min-h-toque w-52 rounded-controle bg-confirma px-4 text-sm font-black tracking-botao text-campo uppercase shadow-botao disabled:cursor-wait"
      >
        {buscando ? "⏳ Buscando…" : "▶ Verificar agora"}
      </button>

      <p role="status" aria-live="polite" className="font-mono text-xs">
        {buscando ? (
          <span className="text-cinza">
            buscando rodadas novas nos institutos… (até ~1 min). O que for encontrado entra como
            pendente.
          </span>
        ) : resultado ? (
          <span
            className={[
              "inline-block rounded-controle border px-3 py-2",
              resultado.ok
                ? "border-confirma bg-confirma-fundo text-confirma-texto"
                : "border-alerta bg-alerta-fundo text-alerta-texto",
            ].join(" ")}
          >
            {resultado.ok
              ? `✓ ${resultado.mensagem} (encontradas ${resultado.resumo.encontradas} · rejeitadas ${resultado.resumo.rejeitadas.length})`
              : `⚠ ${resultado.erro}`}
          </span>
        ) : null}
      </p>
    </div>
  );
}
