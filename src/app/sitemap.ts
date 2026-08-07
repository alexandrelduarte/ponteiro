import type { MetadataRoute } from "next";
import { getFichasPesquisas } from "@/lib/dados";
import { ROTA_PESQUISAS, ROTAS, ROTAS_INSTITUCIONAIS, URL_SITE } from "./_lib/site";

/**
 * Sitemap: só as páginas públicas — /admin e /api ficam de fora por desenho.
 *
 * `lastModified` é REAL, não a hora do render: a ficha usa `publicado_em`
 * (quando a pesquisa entrou na série oficial; no seed, o fim do campo), e as
 * páginas que agregam a série usam a mudança mais recente. Timestamp idêntico
 * em tudo é o padrão que buscador aprende a ignorar (auditoria SEO).
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const fichas = await getFichasPesquisas();

  const lastmodFicha = (f: (typeof fichas)[number]): Date =>
    new Date(f.publicadoEm ?? f.criadoEm ?? `${f.pesquisa.fim}T12:00:00-03:00`);
  const ultimaMudanca = fichas.length
    ? new Date(Math.max(...fichas.map((f) => lastmodFicha(f).getTime())))
    : new Date();

  const principais: MetadataRoute.Sitemap = ROTAS.map((r) => ({
    url: r.href === "/" ? URL_SITE : `${URL_SITE}${r.href}`,
    lastModified: ultimaMudanca,
    changeFrequency: r.href === "/" ? ("daily" as const) : ("weekly" as const),
    priority: r.prioridade,
  }));
  const institucionais: MetadataRoute.Sitemap = ROTAS_INSTITUCIONAIS.map((r) => ({
    url: `${URL_SITE}${r.href}`,
    lastModified: ultimaMudanca,
    changeFrequency: "monthly" as const,
    priority: r.prioridade,
  }));
  const indice: MetadataRoute.Sitemap = [
    {
      url: `${URL_SITE}${ROTA_PESQUISAS.href}`,
      lastModified: ultimaMudanca,
      changeFrequency: "daily" as const,
      priority: ROTA_PESQUISAS.prioridade,
    },
  ];
  const fichasSitemap: MetadataRoute.Sitemap = fichas.map((f) => ({
    url: `${URL_SITE}/pesquisas/${f.slug}`,
    lastModified: lastmodFicha(f),
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));

  return [...principais, ...indice, ...institucionais, ...fichasSitemap];
}
