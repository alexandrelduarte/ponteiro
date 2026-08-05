"use client";

import { Botao } from "@/components/ui/blocos";
import { sair } from "@/lib/admin/login";

/** Encerra a sessão. Formulário simples: funciona mesmo sem JavaScript. */
export function BotaoSair() {
  return (
    <form action={sair}>
      <Botao type="submit" variante="fantasma" data-testid="sair">
        Sair
      </Botao>
    </form>
  );
}
