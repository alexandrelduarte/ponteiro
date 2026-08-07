/**
 * Índice /pesquisas — DIRETÓRIO seco das fichas, uma linha por pesquisa.
 *
 * Anti-canibalização por desenho (plano SEO, DECISOES.md): aqui não há barra,
 * chips, modelo nem tradução — isso é da home e das fichas. O índice existe
 * para dar caminho de rastreio estável às filhas e responder "lista de
 * pesquisas registradas no TSE". Redação carimbada (AUDITORIA-COPY §14).
 */
import type { Metadata } from "next";
import { ROTA_PESQUISAS, URL_SITE } from "@/app/_lib/site";
import { JsonLd } from "@/components/site/json-ld";
import { Bloco, LinkExterno, LinkInterno, Secao } from "@/components/ui/blocos";
import { registroTse } from "@/components/ui/textos";
import { getFichasPesquisas } from "@/lib/dados";
import { fmt, fmtData } from "@/lib/modelo";

export const revalidate = 300;

const DESCRICAO =
  "Cada pesquisa desta lista tem uma página com o registro no TSE, o contratante, o período " +
  "de campo e o link para a publicação original. A leitura de todas juntas está no painel.";

export const metadata: Metadata = {
  title: ROTA_PESQUISAS.titulo,
  description: DESCRICAO,
  alternates: { canonical: "/pesquisas" },
  openGraph: { title: ROTA_PESQUISAS.titulo, description: DESCRICAO, url: "/pesquisas" },
  twitter: { title: ROTA_PESQUISAS.titulo },
};

export default async function IndicePesquisas() {
  const fichas = await getFichasPesquisas();

  return (
    <main>
      <Secao>
        <Bloco rotuladoPor="titulo-indice-pesquisas">
          <div className="lg:grid lg:grid-cols-[minmax(0,34rem)_minmax(0,1fr)] lg:items-start lg:gap-10">
            <div>
              <h1 id="titulo-indice-pesquisas" className="text-pergunta text-tinta">
                {ROTA_PESQUISAS.titulo}
              </h1>
              <p className="mt-3 max-w-texto">
                <LinkInterno href="/" className="text-corpo font-semibold">
                  ← voltar ao painel
                </LinkInterno>
              </p>
            </div>
            {/* Carimbada §14 (pesquisas.indice.intro) */}
            <p className="mt-2 max-w-texto text-intro text-tinta lg:mt-0">{DESCRICAO}</p>
          </div>

          <ul className="mt-6 divide-y divide-filete">
            {fichas.map((f) => {
              const p = f.pesquisa;
              return (
                <li
                  key={f.slug}
                  className="flex min-h-toque flex-wrap items-center gap-x-4 gap-y-0.5 py-2 text-corpo"
                >
                  <LinkInterno href={`/pesquisas/${f.slug}`} className="font-semibold">
                    {p.instituto}
                  </LinkInterno>
                  <span className="text-tinta-media numeros">
                    campo de {fmtData(p.inicio)} a {fmtData(p.fim)}/{p.fim.slice(0, 4)}
                  </span>
                  <span className="text-micro text-tinta-media numeros">{registroTse(p.tse)}</span>
                  <span className="numeros text-tinta-media">
                    2º turno: <span className="text-lula">Lula {fmt(p.t2.lula)}%</span> ×{" "}
                    <span className="text-flavio">Flávio {fmt(p.t2.flavio)}%</span>
                  </span>
                  {p.fonte ? (
                    <LinkExterno href={p.fonte} className="text-micro">
                      fonte
                    </LinkExterno>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </Bloco>
      </Secao>

      <JsonLd
        dados={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Painel", item: URL_SITE },
            {
              "@type": "ListItem",
              position: 2,
              name: ROTA_PESQUISAS.titulo,
              item: `${URL_SITE}${ROTA_PESQUISAS.href}`,
            },
          ],
        }}
      />
    </main>
  );
}
