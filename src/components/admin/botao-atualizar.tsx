"use client";

/**
 * Disparo manual do coletor. Custa dinheiro (IA + busca), então o backend impõe
 * um cooldown de 60s — aqui só tratamos o erro que ele devolve, com a largura do
 * botão travada para o rótulo de espera não pular o layout.
 */
import { useState, useTransition } from "react";
import { Botao } from "@/components/ui/blocos";
import { dispararAtualizacao, type ResultadoAtualizacao } from "@/lib/admin/acoes";

export function BotaoAtualizar() {
  const [resultado, setResultado] = useState<ResultadoAtualizacao | null>(null);
  const [buscando, iniciar] = useTransition();

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Botao
        disabled={buscando}
        onClick={() =>
          iniciar(async () => {
            setResultado(await dispararAtualizacao());
          })
        }
        className="w-56"
      >
        {buscando ? "Buscando…" : "Verificar agora"}
      </Botao>

      <p role="status" aria-live="polite" className="text-micro numeros">
        {buscando ? (
          <span className="text-tinta-media">
            buscando pesquisas novas nos institutos… (até ~1 min). O que for encontrado entra como
            pendente.
          </span>
        ) : resultado ? (
          <span
            className={[
              "inline-block rounded-nicho px-4 py-2",
              resultado.ok ? "bg-ameixa-bruma text-tinta" : "bg-atencao-fundo text-tinta",
            ].join(" ")}
          >
            {resultado.ok
              ? `${resultado.mensagem} (encontradas ${resultado.resumo.encontradas} · rejeitadas ${resultado.resumo.rejeitadas.length})`
              : `⚠ ${resultado.erro}`}
          </span>
        ) : null}
      </p>
    </div>
  );
}
