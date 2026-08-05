"use client";

/**
 * Série vazia (docs/DESIGN-V2.md §5.9 · COPY-DECK §S) — o leitor tirou todas as
 * pesquisas da simulação. NENHUM número do modelo é renderizado: o painel
 * prefere não mostrar nada a mostrar zeros.
 */
import { Bloco, Botao, Pergunta } from "@/components/ui/blocos";
import { ACOES } from "@/components/ui/textos";

export function EstadoVazio({ onRestaurar }: { onRestaurar: () => void }) {
  return (
    <div className="mx-auto w-full max-w-pagina px-goteira py-8 md:px-goteira-md lg:px-goteira-lg">
      <Bloco className="max-w-texto">
        {/* eslint-disable-next-line @next/next/no-img-element -- SVG estático, sem otimização a fazer */}
        <img
          src="/ilustracoes/vazio-sem-dados.svg"
          alt=""
          width={320}
          height={118}
          className="mb-4 h-auto w-full max-w-[20rem]"
        />
        <Pergunta>Sem pesquisa nenhuma, não há o que calcular.</Pergunta>
        <p className="mt-3 text-corpo text-tinta-media">
          Você tirou todas as pesquisas da sua simulação. Sem pesquisa não existe média, nem
          diferença, nem chance — então o painel prefere não mostrar nada a mostrar zeros. A lista
          oficial continua intacta.
        </p>
        <p className="mt-4">
          <Botao onClick={onRestaurar} data-testid="restaurar-oficial-vazio">
            {ACOES.restaurarOficial}
          </Botao>
        </p>
      </Bloco>
    </div>
  );
}
