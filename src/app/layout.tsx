import { Analytics } from "@vercel/analytics/next";
import type { Metadata, Viewport } from "next";
import { Lexend, Newsreader } from "next/font/google";
import "./globals.css";
import { JsonLd } from "@/components/site/json-ld";
import { CabecalhoSite } from "@/components/site/marca";
import { Rodape } from "@/components/site/rodape";
import {
  DESCRICAO_PADRAO,
  NOME_DESCRITIVO,
  NOME_SITE,
  TAGLINE,
  TITULO_PADRAO,
  URL_SITE,
} from "./_lib/site";

/**
 * Self-host automático: nenhum request a terceiros em runtime.
 *
 * `Newsreader` é variável com EIXO ÓPTICO (`axes: ["opsz"]`): o navegador
 * escolhe sozinho o corte display nos corpos grandes da manchete
 * (`font-optical-sizing: auto` é o padrão) — é o corte medido no relatório de
 * branding (dígito 0,600 em, +55% vs Instrument Serif, `tnum` presente).
 * A Lexend é variável, então entra SEM `weight` — um único arquivo cobre
 * 400/500/600/700, exatamente o intervalo que o sistema usa (DESIGN-V2 §3.2).
 * Archivo e IBM Plex Mono saíram: mono não volta como identidade (P7).
 */
const newsreader = Newsreader({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-newsreader",
  axes: ["opsz"],
});

const lexend = Lexend({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-lexend",
});

export const metadata: Metadata = {
  metadataBase: new URL(URL_SITE),
  title: { default: TITULO_PADRAO, template: `%s · ${NOME_SITE}` },
  description: DESCRICAO_PADRAO,
  applicationName: NOME_SITE,
  generator: "Next.js",
  keywords: [
    "PONTEIRO",
    "pesquisas eleitorais",
    "eleições 2026",
    "presidente 2026",
    "agregador de pesquisas",
    "Lula",
    "Flávio Bolsonaro",
    "TSE",
    "intenção de voto",
  ],
  authors: [{ name: NOME_SITE }],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "/",
    siteName: NOME_SITE,
    title: TITULO_PADRAO,
    description: DESCRICAO_PADRAO,
  },
  twitter: {
    card: "summary_large_image",
    title: TITULO_PADRAO,
    description: DESCRICAO_PADRAO,
  },
  robots: { index: true, follow: true },
  formatDetection: { telephone: false, address: false, email: false },
};

export const viewport: Viewport = {
  // Não existe dark mode: a página tem um modo só (docs/DESIGN-V2.md §3.1).
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={`${newsreader.variable} ${lexend.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        {/* Primeiro focável da página (WCAG 2.4.1): invisível até receber foco,
            quando aparece como botão primário sobre a barra sticky (z acima). */}
        <a
          href="#conteudo"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[60] focus:rounded-plena focus:bg-ameixa focus:px-4 focus:py-2 focus:text-etiqueta focus:font-semibold focus:text-tinta-inversa focus:no-underline"
        >
          Pular para o conteúdo
        </a>
        <CabecalhoSite />
        <div id="conteudo" tabIndex={-1} className="flex flex-1 flex-col outline-none">
          {children}
        </div>
        <Rodape />
        {/* Medição de audiência AGREGADA e SEM COOKIE (Vercel Web Analytics):
            first-party (/_vercel/insights, dentro da CSP), nenhum visitante é
            identificado individualmente. Declarado em /privacidade.
            Só na infraestrutura da Vercel: em `next start` local o script não
            existe (404 de console que derrubava a suíte e2e inteira). */}
        {process.env.VERCEL ? <Analytics /> : null}
        <JsonLd
          dados={{
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: NOME_SITE,
            alternateName: NOME_DESCRITIVO,
            slogan: TAGLINE,
            url: `${URL_SITE}/`,
            inLanguage: "pt-BR",
            description: DESCRICAO_PADRAO,
          }}
        />
      </body>
    </html>
  );
}
