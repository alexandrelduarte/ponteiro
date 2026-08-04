"use client";

/**
 * Formulário de inclusão em MODO SIMULAÇÃO (R5).
 *
 * O que entra aqui vale só nesta aba do navegador: nada é gravado, nada é
 * enviado. A inclusão real da série oficial acontece no /admin, com aprovação
 * humana e registro em auditoria.
 *
 * A entrada é tratada como hostil mesmo sendo local: Zod valida faixas e
 * coerência (1º turno só entra com os dois lados), e a vírgula decimal é aceita.
 */
import { useId, useState } from "react";
import { z } from "zod";
import type { Pesquisa } from "@/data/tipos";

// O probe JIT do Zod chama `Function("")` e dispara uma violação da CSP
// (script-src sem unsafe-eval). `jitless` desliga o probe; a validação é
// idêntica, apenas sem o atalho compilado. É o único módulo cliente com Zod.
z.config({ jitless: true });

const CAMPOS = [
  { chave: "instituto", rotulo: "Instituto*", largo: true, tipo: "text" },
  { chave: "fim", rotulo: "Data final do campo*", largo: false, tipo: "date" },
  { chave: "n", rotulo: "Amostra (n)", largo: false, tipo: "text" },
  { chave: "moe", rotulo: "Margem de erro (p.p.)", largo: false, tipo: "text" },
  { chave: "tse", rotulo: "Registro TSE", largo: false, tipo: "text" },
  { chave: "l2", rotulo: "2ºT · Lula %*", largo: false, tipo: "text" },
  { chave: "f2", rotulo: "2ºT · Flávio %*", largo: false, tipo: "text" },
  { chave: "l1", rotulo: "1ºT · Lula %", largo: false, tipo: "text" },
  { chave: "f1", rotulo: "1ºT · Flávio %", largo: false, tipo: "text" },
  { chave: "bnns1", rotulo: "1ºT · Branco/nulo + NS %", largo: false, tipo: "text" },
] as const;

type Chave = (typeof CAMPOS)[number]["chave"];

const VAZIO: Record<Chave, string> = {
  instituto: "",
  fim: "",
  n: "",
  moe: "",
  tse: "",
  l1: "",
  f1: "",
  bnns1: "",
  l2: "",
  f2: "",
};

/** "44,5" → 44.5 · "" → null · lixo → NaN (o Zod recusa) */
function paraNumero(v: string): number | null {
  const t = v.trim();
  if (t === "") return null;
  return Number(t.replace(",", "."));
}

const percentual = (rotulo: string) =>
  z
    .number({ error: `${rotulo}: use um número entre 0 e 100 (vírgula aceita).` })
    .min(0, `${rotulo}: não pode ser negativo.`)
    .max(100, `${rotulo}: não pode passar de 100.`);

const esquema = z
  .object({
    instituto: z.string().min(2, "Instituto: informe o nome (mínimo 2 caracteres)."),
    fim: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data final do campo: informe uma data válida."),
    n: z
      .number({ error: "Amostra: use um número inteiro." })
      .int("Amostra: use um número inteiro.")
      .min(100, "Amostra: mínimo de 100 entrevistas.")
      .max(200000, "Amostra: valor implausível.")
      .nullable(),
    moe: z
      .number({ error: "Margem de erro: use um número." })
      .min(0, "Margem de erro: não pode ser negativa.")
      .max(10, "Margem de erro: acima de 10 p.p. não é plausível.")
      .nullable(),
    tse: z.string().max(40, "Registro TSE: texto longo demais."),
    l2: percentual("2ºT Lula"),
    f2: percentual("2ºT Flávio"),
    l1: percentual("1ºT Lula").nullable(),
    f1: percentual("1ºT Flávio").nullable(),
    bnns1: percentual("1ºT branco/nulo + NS").nullable(),
  })
  .refine((d) => d.l2 + d.f2 <= 100, {
    error: "2º turno: Lula + Flávio não pode passar de 100%.",
    path: ["f2"],
  })
  .refine((d) => (d.l1 === null) === (d.f1 === null), {
    error: "1º turno: informe os dois lados (Lula e Flávio) ou nenhum.",
    path: ["f1"],
  });

export function FormularioPesquisa({
  onIncluir,
  onFechar,
}: {
  onIncluir: (p: Pesquisa) => void;
  onFechar: () => void;
}) {
  const idBase = useId();
  const [form, setForm] = useState<Record<Chave, string>>(VAZIO);
  const [erros, setErros] = useState<Partial<Record<Chave, string>>>({});
  const [resumoErro, setResumoErro] = useState<string[]>([]);

  const enviar = (evento: React.FormEvent) => {
    evento.preventDefault();
    const analisado = esquema.safeParse({
      instituto: form.instituto.trim(),
      fim: form.fim.trim(),
      n: paraNumero(form.n),
      moe: paraNumero(form.moe),
      tse: form.tse.trim(),
      l2: paraNumero(form.l2),
      f2: paraNumero(form.f2),
      l1: paraNumero(form.l1),
      f1: paraNumero(form.f1),
      bnns1: paraNumero(form.bnns1),
    });

    if (!analisado.success) {
      const porCampo: Partial<Record<Chave, string>> = {};
      const lista: string[] = [];
      for (const problema of analisado.error.issues) {
        const chave = problema.path[0] as Chave | undefined;
        if (chave && !porCampo[chave]) porCampo[chave] = problema.message;
        lista.push(problema.message);
      }
      setErros(porCampo);
      setResumoErro(lista);
      return;
    }

    const d = analisado.data;
    onIncluir({
      id: `user-${Date.now()}`,
      instituto: d.instituto,
      contratante: "Adicionada pelo usuário",
      inicio: d.fim,
      fim: d.fim,
      n: d.n ?? 2000,
      moe: d.moe ?? 2,
      tse: d.tse || "—",
      t1: d.l1 !== null ? { lula: d.l1, flavio: d.f1, bnns: d.bnns1 } : null,
      t2: { lula: d.l2, flavio: d.f2, bnns: null },
      fonte: null,
      usuario: true,
    });

    setForm(VAZIO);
    setErros({});
    setResumoErro([]);
    onFechar();
  };

  return (
    <form
      onSubmit={enviar}
      noValidate
      className="mt-4 rounded-cartao border border-dashed border-cinza bg-mini p-4"
    >
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {CAMPOS.map((c) => {
          const id = `${idBase}-${c.chave}`;
          const erro = erros[c.chave];
          return (
            <div key={c.chave} className={c.largo ? "col-span-2" : ""}>
              <label htmlFor={id} className="mb-1 block font-mono text-xs text-cinza">
                {c.rotulo}
              </label>
              <input
                id={id}
                data-testid={`campo-${c.chave}`}
                type={c.tipo}
                value={form[c.chave]}
                aria-invalid={erro ? true : undefined}
                aria-describedby={erro ? `${id}-erro` : undefined}
                onChange={(e) => setForm((f) => ({ ...f, [c.chave]: e.target.value }))}
                className={[
                  "min-h-toque w-full rounded-controle bg-campo px-2 text-sm text-tinta",
                  erro ? "border-2 border-alerta" : "border border-linha",
                ].join(" ")}
              />
              {erro ? (
                <p id={`${id}-erro`} className="mt-1 text-xs text-alerta-texto">
                  {erro}
                </p>
              ) : null}
            </div>
          );
        })}
      </div>

      {resumoErro.length ? (
        <div
          role="alert"
          data-testid="erros-form"
          className="mt-3 rounded-controle border border-alerta bg-alerta-fundo p-2 text-xs text-alerta-texto"
        >
          <p className="font-semibold">Corrija antes de incluir:</p>
          <ul className="mt-1 list-disc pl-4">
            {resumoErro.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          type="submit"
          data-testid="incluir-simulacao"
          className="min-h-toque rounded-controle bg-tinta px-3 text-sm font-semibold text-texto-inverso"
        >
          Incluir na simulação
        </button>
        <span className="text-xs text-cinza">
          * obrigatórios. Use apenas pesquisas com registro no TSE. Edições valem só nesta sessão e{" "}
          <b className="text-tinta">não alteram a base oficial</b>.
        </span>
      </div>
    </form>
  );
}
