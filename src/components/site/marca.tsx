/**
 * A marca PONTEIRO na interface (docs/MARCA.md §6, docs/DESIGN-V2.md §8).
 *
 * Símbolo do branding 2026 (estudo 3.1, DECISOES.md): P didone em ameixa-forte
 * — o hex da letra É o token — com a AGULHA âmbar estourando do bojo. Inline
 * para herdar cor por token e não custar request; o mestre vetorial é
 * `public/brand/simbolo.svg` (OG, e-mail, imprensa, favicon).
 *
 * O wordmark segue TEXTO VIVO, agora em Newsreader (a display do site): fonte
 * já paga pela manchete, texto selecionável, e MARCA.md §6.1 continua valendo.
 *
 * A agulha é MARCA, nunca instrumento: não gira, não oscila e não reage a
 * número nenhum (salvaguarda anti-needle, MARCA.md §6.6 item 3).
 */
import Link from "next/link";
import { NOME_SITE, TAGLINE } from "@/app/_lib/site";
import { BarraNav } from "./barra-nav";
import { Simbolo } from "./simbolo";

export { Simbolo };


/**
 * Cabeçalho em DUAS CAMADAS (pesquisa de branding §2.2, DECISOES.md):
 * a camada de MARCA é generosa e rola embora com a página; a NAVEGAÇÃO é a
 * barra compacta logo abaixo, que gruda no topo (`BarraNav`). Não há animação
 * de encolher — a barra sticky JÁ É a versão encolhida.
 *
 * As duas são irmãs (não pai-filho): `position: sticky` prende o elemento ao
 * bloco contentor, e dentro do <header> a barra deixaria de existir no fim
 * dele — no fluxo do <body> ela vale a página inteira.
 */
export function CabecalhoSite() {
  return (
    <>
      <header className="mx-auto w-full max-w-pagina px-goteira pt-3 pb-2 md:px-goteira-md md:pt-5 md:pb-3 lg:px-goteira-lg">
        <Link
          href="/"
          className="inline-flex items-center gap-3 rounded-nicho py-1 no-underline"
          aria-label={`${NOME_SITE} — ${TAGLINE}`}
        >
          <Simbolo className="h-9 w-auto shrink-0 text-ameixa-forte md:h-11" />
          <span>
            <span aria-hidden="true" className="block font-display text-wordmark text-tinta">
              {NOME_SITE}
            </span>
            <span aria-hidden="true" className="mt-0.5 block text-etiqueta text-ameixa">
              {TAGLINE}
            </span>
          </span>
        </Link>
      </header>
      <BarraNav />
    </>
  );
}
