import type { Metadata } from "next";
import {
  Atkinson_Hyperlegible_Next,
  Bricolage_Grotesque,
  Instrument_Serif,
  Lexend,
  Public_Sans,
  Schibsted_Grotesk,
} from "next/font/google";

/**
 * LABORATÓRIO DE DESIGN (Fase 3) — layout próprio.
 *
 * Regras deste diretório:
 *  - NÃO indexa e NÃO entra no sitemap (`ROTAS` em `_lib/site.ts` é uma lista
 *    literal: o sitemap não varre o sistema de arquivos, então /design-lab
 *    fica de fora por construção; o `robots` abaixo fecha a porta que sobra);
 *  - as fontes dos três conceitos são carregadas AQUI, nunca no layout raiz —
 *    o site v1 continua no ar durante a transição e não pode ganhar peso;
 *  - estilo inline/arbitrário é permitido: a tokenização só acontece depois
 *    de o conceito vencedor ser escolhido.
 */

/* -- Conceito A · LATÃO: display com eixo óptico + grotesca cívica de leitura -- */
const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  display: "swap",
  variable: "--fonte-a-display",
});
const publicSans = Public_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--fonte-a-texto",
});

/* -- Conceito B · ENXAME: serifa de display + sans desenhada para leitura -- */
const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  variable: "--fonte-b-display",
});
const lexend = Lexend({
  subsets: ["latin"],
  display: "swap",
  variable: "--fonte-b-texto",
});

/* -- Conceito C · CHUMBO: grotesca de notícia + face de acessibilidade -- */
const schibsted = Schibsted_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--fonte-c-display",
});
const atkinson = Atkinson_Hyperlegible_Next({
  subsets: ["latin"],
  display: "swap",
  variable: "--fonte-c-texto",
});

export const metadata: Metadata = {
  title: "Laboratório de design · PONTEIRO",
  description: "Três conceitos divergentes para o redesign v2. Página interna, não indexada.",
  robots: { index: false, follow: false },
};

export default function LayoutDesignLab({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div
      className={[
        bricolage.variable,
        publicSans.variable,
        instrumentSerif.variable,
        lexend.variable,
        schibsted.variable,
        atkinson.variable,
        "flex-1",
      ].join(" ")}
    >
      {children}
    </div>
  );
}
