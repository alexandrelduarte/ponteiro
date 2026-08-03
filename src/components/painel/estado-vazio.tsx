"use client";

/**
 * Série vazia (docs/DESIGN.md §8.2) — o leitor removeu todas as pesquisas em
 * modo simulação. Nenhum número do modelo é renderizado.
 */
export function EstadoVazio({ onRestaurar }: { onRestaurar: () => void }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-goteira text-center">
      <p className="max-w-texto text-sm leading-leitura text-tinta">
        <strong>A série está vazia — nenhuma pesquisa no agregado.</strong> Sem pesquisa não há
        média, margem nem probabilidade: em vez de mostrar zeros, o painel espera. Isto é uma
        simulação local — a base oficial continua intacta.
      </p>
      <button
        type="button"
        onClick={onRestaurar}
        data-testid="restaurar-oficial-vazio"
        className="min-h-toque rounded-controle bg-confirma px-4 py-2 text-sm font-semibold text-campo shadow-botao"
      >
        ↺ Restaurar dados oficiais
      </button>
    </div>
  );
}
