import type { MetadataRoute } from "next";
import { ROTAS, ROTAS_INSTITUCIONAIS, URL_SITE } from "./_lib/site";

/** Sitemap: só as páginas públicas — /admin e /api ficam de fora por desenho. */
export default function sitemap(): MetadataRoute.Sitemap {
  const agora = new Date();
  const principais: MetadataRoute.Sitemap = ROTAS.map((r) => ({
    url: `${URL_SITE}${r.href === "/" ? "/" : r.href}`,
    lastModified: agora,
    changeFrequency: r.href === "/" ? ("daily" as const) : ("weekly" as const),
    priority: r.prioridade,
  }));
  const institucionais: MetadataRoute.Sitemap = ROTAS_INSTITUCIONAIS.map((r) => ({
    url: `${URL_SITE}${r.href}`,
    lastModified: agora,
    changeFrequency: "monthly" as const,
    priority: r.prioridade,
  }));
  return [...principais, ...institucionais];
}
