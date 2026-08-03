"use client";

/**
 * Abas "Disputa principal × Todos os candidatos" (docs/DESIGN.md §7.3).
 * O par principal é DEFINIDO PELOS DADOS (os dois primeiros do 1º turno) — se
 * o ranking mudar, o painel avisa em vez de fingir que nada aconteceu.
 */
import { useRef } from "react";
import { Secao } from "@/components/ui/basicos";
import { usePainel, type Aba } from "./estado";
import { CartoesTurnos } from "./cartoes-turnos";
import { Graficos } from "./graficos";
import { TodosCandidatos } from "./todos-candidatos";

const ORDEM: Aba[] = ["principal", "todos"];

export function Abas() {
  const { aba, definirAba, campoCompleto } = usePainel();
  const refs = useRef<Record<Aba, HTMLButtonElement | null>>({ principal: null, todos: null });

  const nomesPar = campoCompleto
    ? campoCompleto.top2.map((n) => n.split(" ")[0]).join(" × ")
    : "Lula × Flávio";

  const aoTeclar = (evento: React.KeyboardEvent) => {
    const i = ORDEM.indexOf(aba);
    let proxima: Aba | null = null;
    if (evento.key === "ArrowRight") proxima = ORDEM[(i + 1) % ORDEM.length];
    if (evento.key === "ArrowLeft") proxima = ORDEM[(i - 1 + ORDEM.length) % ORDEM.length];
    if (evento.key === "Home") proxima = ORDEM[0];
    if (evento.key === "End") proxima = ORDEM[ORDEM.length - 1];
    if (!proxima) return;
    evento.preventDefault();
    definirAba(proxima);
    refs.current[proxima]?.focus();
  };

  const classeAba = (alvo: Aba, comBorda: boolean) =>
    [
      "min-h-toque flex-1 px-4 text-sm font-bold md:whitespace-nowrap",
      comBorda ? "border-l border-tinta" : "",
      aba === alvo ? "bg-tinta text-texto-inverso" : "text-tinta",
    ]
      .filter(Boolean)
      .join(" ");

  return (
    <>
      <Secao>
        <div className="flex flex-wrap items-center gap-3">
          <div
            role="tablist"
            aria-label="Escopo do painel"
            onKeyDown={aoTeclar}
            className="flex w-full overflow-hidden rounded-controle border border-tinta md:w-auto md:flex-none"
          >
            <button
              type="button"
              role="tab"
              id="aba-principal"
              aria-selected={aba === "principal"}
              aria-controls="painel-principal"
              tabIndex={aba === "principal" ? 0 : -1}
              ref={(el) => {
                refs.current.principal = el;
              }}
              onClick={() => definirAba("principal")}
              className={classeAba("principal", false)}
            >
              <span className="md:hidden">Principal · {nomesPar}</span>
              <span className="hidden md:inline">Disputa principal · {nomesPar}</span>
            </button>
            <button
              type="button"
              role="tab"
              id="aba-todos"
              data-testid="aba-todos"
              aria-selected={aba === "todos"}
              aria-controls="painel-todos"
              tabIndex={aba === "todos" ? 0 : -1}
              ref={(el) => {
                refs.current.todos = el;
              }}
              onClick={() => definirAba("todos")}
              className={classeAba("todos", true)}
            >
              Todos os candidatos{campoCompleto ? ` (${campoCompleto.linhas.length})` : ""}
            </button>
          </div>
          <p className="text-xs text-cinza">
            o par da disputa principal é <b>definido pelos dados</b> (os dois primeiros do 1º
            turno), não fixado — se o ranking mudar, o painel avisa.
          </p>
        </div>

        {campoCompleto && !campoCompleto.parPadrao ? (
          <p
            role="status"
            className="mt-2 rounded-controle border border-alerta bg-alerta-fundo px-3 py-2 text-xs text-alerta-texto"
          >
            ⚠ O par líder mudou para <b>{campoCompleto.top2.join(" × ")}</b>. Os módulos de 2º turno
            seguem Lula × Flávio até haver simulações registradas do novo confronto — inclua-as pela
            fila de aprovação do /admin.
          </p>
        ) : null}
      </Secao>

      <Secao>
        {aba === "principal" ? (
          <div id="painel-principal" role="tabpanel" aria-labelledby="aba-principal">
            <CartoesTurnos />
            <div className="mt-secao md:mt-secao-md">
              <Graficos />
            </div>
          </div>
        ) : (
          <div id="painel-todos" role="tabpanel" aria-labelledby="aba-todos">
            <TodosCandidatos />
          </div>
        )}
      </Secao>
    </>
  );
}
