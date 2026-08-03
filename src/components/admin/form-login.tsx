"use client";

/**
 * Login por magic link. A resposta é sempre a mesma para e-mail autorizado e
 * não autorizado — a tela de login não é um oráculo de quem é administrador.
 */
import { useActionState } from "react";
import { enviarMagicLink, type ResultadoLogin } from "@/lib/admin/login";

async function acao(_anterior: ResultadoLogin | null, dados: FormData): Promise<ResultadoLogin> {
  return enviarMagicLink(String(dados.get("email") ?? ""));
}

export function FormLogin() {
  const [estado, enviar, pendente] = useActionState<ResultadoLogin | null, FormData>(acao, null);

  return (
    <form action={enviar} className="mt-4 max-w-texto">
      <label htmlFor="email-admin" className="block text-sm font-semibold text-tinta">
        E-mail de administrador
      </label>
      <div className="mt-1 flex flex-wrap gap-2">
        <input
          id="email-admin"
          name="email"
          type="email"
          autoComplete="email"
          required
          data-testid="campo-email-admin"
          className="min-h-toque flex-1 rounded-controle border border-linha bg-campo px-3 text-sm text-tinta"
        />
        <button
          type="submit"
          disabled={pendente}
          data-testid="enviar-magic-link"
          className="min-h-toque w-40 rounded-controle bg-confirma px-4 text-sm font-semibold text-campo shadow-botao disabled:cursor-wait"
        >
          {pendente ? "⏳ Enviando…" : "Enviar link"}
        </button>
      </div>

      <p role="status" aria-live="polite" className="mt-2 text-sm">
        {estado ? (
          <span
            className={[
              "inline-block rounded-controle border px-3 py-2 font-mono text-xs",
              estado.ok
                ? "border-confirma bg-confirma-fundo text-confirma-texto"
                : "border-alerta bg-alerta-fundo text-alerta-texto",
            ].join(" ")}
          >
            {estado.ok ? `✓ ${estado.mensagem}` : `⚠ ${estado.erro}`}
          </span>
        ) : null}
      </p>
    </form>
  );
}
