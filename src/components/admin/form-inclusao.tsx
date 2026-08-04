"use client";

/**
 * Inclusão manual (origem `admin`): entra direto como publicada, mas passa pelo
 * MESMO funil de sanidade do coletor automático — quem digita também erra. A
 * validação forte é do servidor; aqui só marcamos os obrigatórios e damos dicas
 * de formato.
 */
import { useActionState } from "react";
import { Botao } from "@/components/ui/blocos";
import { incluirManual, type ResultadoAcao } from "@/lib/admin/acoes";

const CAMPOS = [
  { nome: "instituto", rotulo: "Instituto *", tipo: "text", dica: "nome como publicado" },
  { nome: "contratante", rotulo: "Contratante", tipo: "text", dica: "" },
  { nome: "inicio", rotulo: "Início do campo", tipo: "date", dica: "vazio = igual ao fim" },
  { nome: "fim", rotulo: "Fim do campo *", tipo: "date", dica: "" },
  { nome: "n", rotulo: "Quantas pessoas foram ouvidas", tipo: "text", dica: "" },
  { nome: "moe", rotulo: "Folga da medida, em pontos", tipo: "text", dica: "" },
  { nome: "tse", rotulo: "Registro no TSE", tipo: "text", dica: "BR-XXXXX/2026" },
  { nome: "l2", rotulo: "2º turno · Lula % *", tipo: "text", dica: "" },
  { nome: "f2", rotulo: "2º turno · Flávio % *", tipo: "text", dica: "" },
  { nome: "l1", rotulo: "1º turno · Lula %", tipo: "text", dica: "" },
  { nome: "f1", rotulo: "1º turno · Flávio %", tipo: "text", dica: "" },
  { nome: "bnns1", rotulo: "1º turno · branco, nulo e não sabe %", tipo: "text", dica: "" },
  { nome: "fonte", rotulo: "URL da fonte *", tipo: "url", dica: "https:// — obrigatória (R4)" },
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
            <label htmlFor={`inc-${c.nome}`} className="mb-1 block text-micro text-tinta-media">
              {c.rotulo}
            </label>
            <input
              id={`inc-${c.nome}`}
              name={c.nome}
              type={c.tipo}
              required={OBRIGATORIOS.has(c.nome)}
              className="min-h-toque w-full rounded-campo bg-placa px-3 text-corpo text-tinta shadow-[inset_0_0_0_1px_var(--color-contorno)]"
            />
            {c.dica ? <p className="mt-1 text-micro text-tinta-media">{c.dica}</p> : null}
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Botao type="submit" disabled={pendente}>
          {pendente ? "Gravando…" : "Incluir na lista oficial"}
        </Botao>
        <span className="text-micro text-tinta-media">
          * precisa preencher. A inclusão é registrada na auditoria e aparece na página pública.
        </span>
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
