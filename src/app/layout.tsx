import type { Metadata, Viewport } from "next";
import { Instrument_Serif, Lexend } from "next/font/google";
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
 * `Instrument_Serif` é estática (só 400) e exige `weight`; a Lexend é variável,
 * então entra SEM `weight` — um único arquivo cobre 400/500/600/700, que é
 * exatamente o intervalo que o sistema usa (docs/DESIGN-V2.md §3.2).
 * Archivo e IBM Plex Mono saíram: mono não volta como identidade (P7).
 */
const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  variable: "--font-instrument-serif",
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
    <html
      lang="pt-BR"
      className={`${instrumentSerif.variable} ${lexend.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <CabecalhoSite />
        {children}
        <Rodape />
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
