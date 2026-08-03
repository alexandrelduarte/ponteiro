"use client";

/**
 * Cabeçalho do painel (docs/DESIGN.md §7.1 e §6.3).
 *
 * Ordem obrigatória no primeiro scroll de 390px: sobretítulo → h1 → subtítulo →
 * selo de frescor → contadores em UMA linha. A tela da urna começa logo abaixo.
 */
import type { SeloFrescor } from "./frescor";
import { usePainel } from "./estado";

export function Cabecalho({ selo }: { selo: SeloFrescor }) {
  const { pesquisas, M } = usePainel();

  return (
    <header className="mx-auto w-full max-w-leitura px-goteira pt-8 pb-5 lg:px-goteira-lg">
      <div className="md:flex md:flex-wrap md:items-end md:justify-between md:gap-4">
        <div className="md:max-w-[36rem]">
          <p className="font-mono text-xs tracking-sobretitulo text-confirma-texto uppercase">
            Apuração de pesquisas · registro obrigatório no TSE
          </p>
          <h1 className="mt-1 text-titulo">
            PRESIDENTE <span className="text-cinza">2026</span>
          </h1>
          {/* A data-base NÃO se repete aqui: o selo de frescor abaixo é a única
              origem dessa informação (docs/DESIGN.md §8.5). */}
          <p className="mt-1 text-sm text-cinza">
            Lula (PT) × Flávio Bolsonaro (PL) ·{" "}
            <b className="font-mono text-tinta">{pesquisas.length}</b> pesquisas na série
          </p>

          <p
            data-testid="selo-frescor"
            className={[
              "mt-3 rounded-controle border px-3 py-2 font-mono text-xs",
              selo.alerta
                ? "border-alerta bg-alerta-fundo text-alerta-texto"
                : "border-confirma bg-confirma-fundo text-confirma-texto",
            ].join(" ")}
          >
            <span aria-hidden="true">{selo.alerta ? "⚠ " : "✓ "}</span>
            {selo.texto}
          </p>
        </div>

        <div className="mt-3 flex gap-2 font-mono md:mt-0">
          <Contador numero={M.dias1T} rotulo="dias p/ 1º turno" data="04/10" />
          <Contador numero={M.dias2T} rotulo="dias p/ 2º turno" data="25/10" />
        </div>
      </div>
    </header>
  );
}

function Contador({ numero, rotulo, data }: { numero: number; rotulo: string; data: string }) {
  return (
    <div className="flex flex-1 items-baseline gap-2 rounded-controle border border-linha bg-cartao px-3 py-2 md:block md:flex-none md:text-center">
      <span className="text-dado">{numero}</span>
      {/* O ponto médio é colado ao rótulo por espaço inquebrável: nenhuma linha
          pode começar com «·» quando o contador quebra em 390px. */}
      <span className="text-xs text-cinza md:mt-1 md:block">
        {rotulo}
        <span aria-hidden="true" className="md:hidden">
          {"\u00a0·"}
        </span>{" "}
        <span className="md:block">{data}</span>
      </span>
    </div>
  );
}
