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

/** Símbolo isolado: letra em `currentColor`, agulha no token da marca. */
export function Simbolo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="548 228 1240 1416"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <path fill="currentColor" d="M 559.748 457.308 C 595.83 459.173 641.247 457.946 677.848 457.936 L 889.803 457.9 C 1051.85 457.855 1211.99 453.121 1337.48 575.206 C 1313.49 595.942 1287.69 615.104 1263.19 635.26 C 1255.37 641.696 1247.34 648.462 1238.86 653.945 C 1223.62 607.554 1215.69 584.76 1178.88 548.289 C 1161.24 531.159 1140.77 517.21 1118.38 507.061 C 1052.51 476.752 992.86 481.197 923.288 483.349 C 896.192 484.031 869.087 484.306 841.983 484.173 L 842.167 947.146 C 836.543 948.868 830.276 950.569 824.863 952.773 C 781.817 970.3 759.228 1010.68 762.534 1056 C 764.589 1083.13 777.296 1108.34 797.879 1126.14 C 818.301 1143.64 829.613 1143.25 852.839 1150.67 C 966.571 1186.99 1109.06 1186.79 1190.8 1085.69 C 1267.6 990.701 1277.14 858.739 1267.87 742.071 C 1277.71 731.262 1294.47 715.744 1305.26 705.1 C 1329.02 681.505 1352.91 658.035 1376.92 634.692 C 1385.36 648.448 1392.71 665.679 1398.44 680.756 C 1426.06 762.166 1426.69 850.316 1400.22 932.109 C 1327.83 1161.34 1054.19 1238.44 842.614 1171.2 L 841.772 1375.6 C 841.746 1388.59 841.842 1401.5 841.762 1414.61 C 841.357 1481.16 837.207 1600.4 928.994 1605.32 C 946.952 1606.29 965.154 1606.43 983.319 1606.62 C 983.648 1615.07 983.721 1623.82 983.908 1632.29 C 931.987 1631.02 877.32 1631.9 825.246 1631.98 L 560.71 1631.86 L 560.973 1606.22 C 575.819 1606.64 590.668 1606.94 605.519 1607.1 C 629.2 1607.36 645.839 1604.91 663.054 1586.97 C 699.305 1549.2 704.225 1502.69 704.477 1453.81 L 704.536 834.367 C 704.259 781.58 704.272 728.791 704.575 676.004 C 704.624 644.161 705.32 608.324 702.302 576.899 C 700.139 554.366 690.003 524.417 673.429 508.191 C 643.868 479.25 597.705 482.613 559.453 482.823 L 559.748 457.308 z" />
      <path className="fill-agulha" d="M 1758.39 252.18 L 1760.16 254.265 C 1742.56 269.907 1723.58 289.013 1706.41 305.467 L 1598.67 408.47 C 1472.38 527.052 1347.79 647.45 1224.97 769.626 L 1095.54 899.64 C 1072.21 923.502 1048.72 947.209 1025.07 970.762 C 1015.49 980.437 998.862 998.826 989.129 1006.98 C 976.211 1017.79 955.456 1032.41 941.426 1042.49 C 939.306 1067.19 936.669 1084.64 918.085 1103.5 C 903.872 1118.05 884.37 1126.23 864.028 1126.16 C 842.016 1126.15 821.331 1118.33 805.817 1102.54 C 790.972 1087.29 782.858 1066.73 783.288 1045.45 C 783.585 1023.51 791.927 1003.15 807.9 988.129 C 826.586 970.555 844.359 966.63 869.005 967.074 C 886.276 951.046 902.886 932.108 920.443 916.649 C 931.978 906.493 947.401 895.195 959.798 885.592 L 1027.55 832.985 L 1250.18 658.553 L 1758.39 252.18 z M 1758.39 252.18 C 1763.45 248.024 1769.08 243.977 1773.95 239.708 L 1774.55 239.764 L 1774.99 239.12 L 1774.92 239.071 L 1775.25 238.995 C 1775.3 239.09 1775.34 239.185 1775.39 239.281 C 1775.05 239.535 1774.71 239.79 1774.37 240.045 L 1774.63 240.514 C 1771.82 244.055 1763.93 250.879 1760.16 254.265 L 1758.39 252.18 z" />
    </svg>
  );
}

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
