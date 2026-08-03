/**
 * Metodologia resumida no painel — o texto completo (limitações, classificação
 * dos cenários, fontes da série) mora em /metodologia.
 */
import Link from "next/link";
import { Cartao } from "@/components/ui/cartao";
import { DEF_EMPATE_TECNICO } from "@/components/ui/textos";

export function MetodologiaResumo() {
  return (
    <Cartao titulo="Metodologia e limitações — resumo">
      <div className="space-y-2 text-sm leading-compacto text-cinza">
        <p>
          <b className="text-tinta">Peso de cada pesquisa</b> = recência (decaimento exponencial,
          com meia-vida ajustável) × √(amostra/2000), com teto 1,5. A probabilidade «no cenário
          atual» usa a incerteza de hoje (dispersão entre institutos + erro sistemático possível de
          todo o setor); a «no dia da votação» soma a deriva da opinião, que cresce com a raiz do
          tempo restante — por isso ela é sempre menos cravada.
        </p>
        <p>
          <b className="text-tinta">Tendência</b> compara cada instituto com ele mesmo (última
          rodada menos a anterior, até 75 dias), para que diferença de metodologia não vire
          tendência falsa.
        </p>
        <p>
          <b className="text-tinta">Classificação</b> da chance projetada: 50–60% empate técnico
          projetado · 60–75% leve favoritismo · 75–90% favorito · 90%+ amplamente favorito. Em cada
          pesquisa isolada, {DEF_EMPATE_TECNICO}.
        </p>
      </div>
      <p className="mt-3">
        <Link
          href="/metodologia"
          className="inline-flex min-h-toque items-center text-sm font-semibold text-confirma-texto underline decoration-dotted underline-offset-2"
        >
          Ler a metodologia completa, as limitações e as fontes da série →
        </Link>
      </p>
    </Cartao>
  );
}
