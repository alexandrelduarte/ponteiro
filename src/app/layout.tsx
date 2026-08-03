import type { Metadata, Viewport } from "next";
import { Archivo, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { JsonLd } from "@/components/site/json-ld";
import { DESCRICAO_PADRAO, NOME_SITE, TITULO_PADRAO, URL_SITE } from "./_lib/site";

/* Self-host automático: nenhum request a terceiros em runtime (docs/DESIGN.md §4.1). */
const archivo = Archivo({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-archivo",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
  variable: "--font-plex-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL(URL_SITE),
  title: { default: TITULO_PADRAO, template: `%s · ${NOME_SITE}` },
  description: DESCRICAO_PADRAO,
  applicationName: NOME_SITE,
  generator: "Next.js",
  keywords: [
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
  // Não existe dark mode: a página tem um modo só (docs/DESIGN.md §3.2).
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={`${archivo.variable} ${plexMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        {children}
        <JsonLd
          dados={{
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: NOME_SITE,
            alternateName: "Agregador de pesquisas — Presidente 2026",
            url: `${URL_SITE}/`,
            inLanguage: "pt-BR",
            description: DESCRICAO_PADRAO,
          }}
        />
      </body>
    </html>
  );
}
