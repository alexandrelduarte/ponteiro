/**
 * A marca PONTEIRO na interface (docs/MARCA.md §6, docs/DESIGN-V2.md §8).
 *
 * O símbolo é o mestre vetorial de `public/brand/simbolo.svg`, inline como
 * caminho para herdar `currentColor` e não custar um request. O wordmark é
 * TEXTO VIVO em Instrument Serif — permitido por MARCA.md §6.1/decisão 4: a
 * fonte já é carregada pela manchete, o texto é selecionável e pesa ~6 KB a
 * menos que o SVG. Os arquivos SVG continuam existindo para onde a fonte não é
 * garantida (OG, e-mail, imprensa, favicon).
 *
 * A agulha é MARCA, nunca instrumento: não gira, não oscila e não reage a
 * número nenhum (salvaguarda anti-needle, MARCA.md §6.6 item 3).
 */
import Link from "next/link";
import { NOME_SITE, ROTAS, TAGLINE } from "@/app/_lib/site";

/** Símbolo isolado: anel + agulha, em `currentColor`. Piso de 28px de altura. */
export function Simbolo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 220.49"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M161.497 41.631A100 100 0 1 1 129.321 24.88L123.405 44.169A79.825 79.825 0 1 0 149.09 57.54ZM117.929 125.832C162.003 6.95 162.003 6.95 162.721 0C157.44 4.575 157.44 4.575 85.337 108.865A18.516 18.516 0 1 0 117.929 125.832ZM109.322 122.634L134.979 53.292L92.892 114.082A9.335 9.335 0 1 0 109.322 122.634Z"
      />
    </svg>
  );
}

/**
 * Travamento horizontal: símbolo + wordmark + tagline. É o cabeçalho de todas
 * as páginas e o primeiro elemento do primeiro scroll de 390px (§5.1).
 *
 * A navegação entra aqui porque a 390 a home tem dezenas de telas de altura:
 * sem uma saída visível na primeira dobra, "Metodologia" e "O que já mudou"
 * ficavam a uma rolagem inteira de distância. São dois links de texto, no
 * mesmo alvo de 44px do resto do produto — não é menu, não é gaveta.
 */
export function CabecalhoSite() {
  return (
    <header className="mx-auto w-full max-w-pagina px-goteira pt-4 pb-1 md:px-goteira-md lg:px-goteira-lg">
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-1">
        <Link
          href="/"
          className="inline-flex items-center gap-3 rounded-nicho py-1 no-underline"
          aria-label={`${NOME_SITE} — ${TAGLINE}`}
        >
          <Simbolo className="h-9 w-auto shrink-0 text-ameixa" />
          <span>
            <span aria-hidden="true" className="block font-display text-wordmark text-tinta">
              {NOME_SITE}
            </span>
            <span aria-hidden="true" className="mt-0.5 block text-etiqueta text-ameixa">
              {TAGLINE}
            </span>
          </span>
        </Link>

        <nav aria-label="Páginas do site" className="flex flex-wrap items-center gap-x-5">
          {ROTAS.filter((r) => r.href !== "/").map((r) => (
            <Link
              key={r.href}
              href={r.href}
              className="inline-flex min-h-toque items-center rounded-campo text-etiqueta font-semibold text-ameixa underline decoration-from-font underline-offset-2"
            >
              {r.titulo}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
