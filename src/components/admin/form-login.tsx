"use client";

/**
 * Login por link de uso único. A resposta é sempre a mesma para e-mail
 * autorizado e não autorizado — a tela de login não é um oráculo de quem é
 * administrador.
 */
import { useActionState } from "react";
import { Botao } from "@/components/ui/blocos";
import { enviarMagicLink, type ResultadoLogin } from "@/lib/admin/login";

async function acao(_anterior: ResultadoLogin | null, dados: FormData): Promise<ResultadoLogin> {
  return enviarMagicLink(String(dados.get("email") ?? ""));
}

export function FormLogin() {
  const [estado, enviar, pendente] = useActionState<ResultadoLogin | null, FormData>(acao, null);

  return (
    <form action={enviar} className="mt-4">
      <label htmlFor="email-admin" className="block text-secao text-tinta">
        E-mail de administrador
      </label>
      <div className="mt-2 flex flex-wrap gap-3">
        <input
          id="email-admin"
          name="email"
          type="email"
          autoComplete="email"
          required
          data-testid="campo-email-admin"
          className="min-h-toque flex-1 rounded-campo bg-placa px-3 text-corpo text-tinta shadow-[inset_0_0_0_1px_var(--color-contorno)]"
        />
        <Botao type="submit" disabled={pendente} data-testid="enviar-magic-link" className="w-44">
          {pendente ? "Enviando…" : "Enviar link"}
        </Botao>
      </div>

      <p role="status" aria-live="polite" className="mt-3">
        {estado ? (
          <span
            className={[
              "inline-block rounded-nicho px-4 py-2 text-micro",
              estado.ok ? "bg-ameixa-bruma text-tinta" : "bg-atencao-fundo text-tinta",
            ].join(" ")}
          >
            {estado.ok ? estado.mensagem : `⚠ ${estado.erro}`}
          </span>
        ) : null}
      </p>
    </form>
  );
}
