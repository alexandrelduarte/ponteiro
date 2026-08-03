import type { MetadataRoute } from "next";
import { ROTAS, URL_SITE } from "./_lib/site";

/** Sitemap: só as páginas públicas — /admin e /api ficam de fora por desenho. */
export default function sitemap(): MetadataRoute.Sitemap {
  const agora = new Date();
  return ROTAS.map((r) => ({
    url: `${URL_SITE}${r.href === "/" ? "/" : r.href}`,
    lastModified: agora,
    changeFrequency: r.href === "/" ? ("daily" as const) : ("weekly" as const),
    priority: r.prioridade,
  }));
}
