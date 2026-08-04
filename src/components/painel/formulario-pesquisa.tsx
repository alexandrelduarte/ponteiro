"use client";

/**
 * Formulário de inclusão em MODO SIMULAÇÃO (R5 · COPY-DECK §R).
 *
 * O que entra aqui vale só nesta aba do navegador: nada é gravado, nada é
 * enviado. A inclusão real na lista oficial acontece no /admin, com conferência
 * humana e registro em auditoria pública.
 *
 * A entrada é tratada como hostil mesmo sendo local: Zod valida faixas e
 * coerência (1º turno só entra com os dois lados), e a vírgula decimal é aceita.
 */
import { useId, useState } from "react";
import { z } from "zod";
import { Botao } from "@/components/ui/blocos";
import { ACOES } from "@/components/ui/textos";
import type { Pesquisa } from "@/data/tipos";

// O probe JIT do Zod chama `Function("")` e dispara uma violação da CSP
// (script-src sem unsafe-eval). `jitless` desliga o probe; a validação é
// idêntica, apenas sem o atalho compilado. É o único módulo cliente com Zod.
z.config({ jitless: true });

const CAMPOS = [
  { chave: "instituto", rotulo: "Instituto *", largo: true, tipo: "text" },
  { chave: "fim", rotulo: "Último dia da pesquisa *", largo: false, tipo: "date" },
  { chave: "n", rotulo: "Quantas pessoas foram ouvidas", largo: false, tipo: "text" },
  { chave: "moe", rotulo: "Folga da medida, em pontos", largo: false, tipo: "text" },
  { chave: "tse", rotulo: "Número do registro no TSE", largo: false, tipo: "text" },
  { chave: "l2", rotulo: "2º turno · Lula % *", largo: false, tipo: "text" },
  { chave: "f2", rotulo: "2º turno · Flávio % *", largo: false, tipo: "text" },
  { chave: "l1", rotulo: "1º turno · Lula %", largo: false, tipo: "text" },
  { chave: "f1", rotulo: "1º turno · Flávio %", largo: false, tipo: "text" },
  { chave: "bnns1", rotulo: "1º turno · branco, nulo e não sabe %", largo: false, tipo: "text" },
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
    instituto: z.string().min(2, "Faltou preencher o instituto. Sem isso não dá para calcular."),
    fim: z
      .string()
      .regex(
        /^\d{4}-\d{2}-\d{2}$/,
        "Faltou preencher o último dia da pesquisa. Sem isso não dá para calcular.",
      ),
    n: z
      .number({ error: "Quantas pessoas foram ouvidas: use um número inteiro." })
      .int("Quantas pessoas foram ouvidas: use um número inteiro.")
      .min(100, "Quantas pessoas foram ouvidas: o mínimo é 100.")
      .max(200000, "Quantas pessoas foram ouvidas: esse número não é plausível.")
      .nullable(),
    moe: z
      .number({ error: "Folga da medida: use um número." })
      .min(0, "Folga da medida: não pode ser negativa.")
      .max(10, "Folga da medida: acima de 10 pontos não é plausível.")
      .nullable(),
    tse: z.string().max(40, "Número do registro no TSE: texto longo demais."),
    l2: percentual("2º turno · Lula"),
    f2: percentual("2º turno · Flávio"),
    l1: percentual("1º turno · Lula").nullable(),
    f1: percentual("1º turno · Flávio").nullable(),
    bnns1: percentual("1º turno · branco, nulo e não sabe").nullable(),
  })
  .refine((d) => d.l2 + d.f2 <= 100, {
    error: "2º turno: Lula + Flávio não pode passar de 100%.",
    path: ["f2"],
  })
  .refine((d) => (d.l1 === null) === (d.f1 === null), {
    error: "1º turno: preencha os dois lados (Lula e Flávio) ou nenhum.",
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
      contratante: "Adicionada por você nesta simulação",
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
    <form onSubmit={enviar} noValidate className="mt-4 rounded-nicho bg-nicho p-5">
      <p className="text-secao text-tinta">Adicionar uma pesquisa à minha simulação</p>
      <p className="mt-1 max-w-texto text-micro text-tinta-media">
        Só entra pesquisa com registro no TSE. O que você adicionar aqui vale só nesta tela e some
        quando você voltar ao oficial. Para a pesquisa entrar de verdade na lista, ela passa pela
        conferência de uma pessoa.
      </p>

      <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        {CAMPOS.map((c) => {
          const id = `${idBase}-${c.chave}`;
          const erro = erros[c.chave];
          return (
            <div key={c.chave} className={c.largo ? "col-span-2" : ""}>
              <label htmlFor={id} className="mb-1 block text-micro text-tinta-media">
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
                  "min-h-toque w-full rounded-campo bg-placa px-3 text-corpo text-tinta",
                  erro
                    ? "shadow-[inset_0_0_0_2px_var(--color-atencao)]"
                    : "shadow-[inset_0_0_0_1px_var(--color-contorno)]",
                ].join(" ")}
              />
              {erro ? (
                <p id={`${id}-erro`} className="mt-1 text-micro text-atencao">
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
          className="mt-4 rounded-nicho bg-atencao-fundo p-4 text-micro text-tinta"
        >
          <p className="font-semibold">Corrija antes de incluir:</p>
          <ul className="mt-1 list-disc pl-4">
            {resumoErro.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Botao type="submit" data-testid="incluir-simulacao">
          {ACOES.incluirPesquisa}
        </Botao>
        <span className="text-micro text-tinta-media">
          * precisa preencher. Pode usar vírgula nos decimais.
        </span>
      </div>
    </form>
  );
}
