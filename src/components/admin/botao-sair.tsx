"use client";

import { sair } from "@/lib/admin/login";

/** Encerra a sessão. Formulário simples: funciona mesmo sem JavaScript. */
export function BotaoSair() {
  return (
    <form action={sair}>
      <button
        type="submit"
        data-testid="sair"
        className="min-h-toque rounded-controle border border-cinza px-3 text-sm font-semibold text-tinta"
      >
        Sair
      </button>
    </form>
  );
}
