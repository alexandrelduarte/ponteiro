"use client";

/**
 * Inclusão manual (origem `admin`): entra direto como publicada, mas passa
 * pelo MESMO funil de sanidade do coletor automático — quem digita também erra.
 * A validação forte é do servidor; aqui só marcamos os obrigatórios e damos
 * dicas de formato.
 */
import { useActionState } from "react";
import { incluirManual, type ResultadoAcao } from "@/lib/admin/acoes";

const CAMPOS = [
  { nome: "instituto", rotulo: "Instituto*", tipo: "text", dica: "nome como publicado" },
  { nome: "contratante", rotulo: "Contratante", tipo: "text", dica: "" },
  { nome: "inicio", rotulo: "Início do campo", tipo: "date", dica: "vazio = igual ao fim" },
  { nome: "fim", rotulo: "Fim do campo*", tipo: "date", dica: "" },
  { nome: "n", rotulo: "Amostra (n)", tipo: "text", dica: "" },
  { nome: "moe", rotulo: "Margem de erro (p.p.)", tipo: "text", dica: "" },
  { nome: "tse", rotulo: "Registro TSE", tipo: "text", dica: "BR-XXXXX/2026" },
  { nome: "l2", rotulo: "2ºT · Lula %*", tipo: "text", dica: "" },
  { nome: "f2", rotulo: "2ºT · Flávio %*", tipo: "text", dica: "" },
  { nome: "l1", rotulo: "1ºT · Lula %", tipo: "text", dica: "" },
  { nome: "f1", rotulo: "1ºT · Flávio %", tipo: "text", dica: "" },
  { nome: "bnns1", rotulo: "1ºT · Branco/nulo + NS %", tipo: "text", dica: "" },
  { nome: "fonte", rotulo: "URL da fonte*", tipo: "url", dica: "https:// — obrigatória (R4)" },
] as const;

const OBRIGATORIOS = new Set(["instituto", "fim", "l2", "f2", "fonte"]);

async function acao(_anterior: ResultadoAcao | null, dados: FormData): Promise<ResultadoAcao> {
  return incluirManual(dados);
}

export function FormInclusao() {
  const [estado, enviar, pendente] = useActionState<ResultadoAcao | null, FormData>(acao, null);

  return (
    <form action={enviar}>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {CAMPOS.map((c) => (
          <div key={c.nome} className={c.nome === "fonte" ? "sm:col-span-2 lg:col-span-4" : ""}>
            <label htmlFor={`inc-${c.nome}`} className="mb-1 block font-mono text-xs text-cinza">
              {c.rotulo}
            </label>
            <input
              id={`inc-${c.nome}`}
              name={c.nome}
              type={c.tipo}
              required={OBRIGATORIOS.has(c.nome)}
              className="min-h-toque w-full rounded-controle border border-linha bg-campo px-2 text-sm text-tinta"
            />
            {c.dica ? <p className="mt-1 text-xs text-cinza">{c.dica}</p> : null}
          </div>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={pendente}
          className="min-h-toque rounded-controle bg-tinta px-4 text-sm font-semibold text-texto-inverso disabled:cursor-wait"
        >
          {pendente ? "⏳ Gravando…" : "Incluir na série oficial"}
        </button>
        <span className="text-xs text-cinza">
          * obrigatórios. A inclusão é registrada na auditoria e aparece no feed público.
        </span>
      </div>

      <p role="status" aria-live="polite" className="mt-2">
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
