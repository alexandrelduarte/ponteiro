import type { MetadataRoute } from "next";
import { URL_SITE } from "./_lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/auth/", "/api/"] }],
    sitemap: `${URL_SITE}/sitemap.xml`,
    host: URL_SITE,
  };
}
