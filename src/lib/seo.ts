/**
 * Plumbing de descoberta (server-only): IndexNow.
 *
 * A cada mudança REAL da série (aprovação/inclusão/remoção — `serieMudou`),
 * avisamos Bing/Yandex/Seznam/Naver na hora pelo protocolo IndexNow. Google
 * não usa IndexNow: para ele valem o sitemap com lastmod real + ISR.
 *
 * Fire-and-forget por contrato: NUNCA lança, NUNCA atrasa a ação do admin em
 * mais que o timeout curto; sem env é no-op silencioso (R8: preview/local não
 * pingam nada).
 */
import "server-only";

export async function pingIndexNow(rotas: readonly string[]): Promise<void> {
  const chave = process.env.INDEXNOW_KEY;
  const site = process.env.NEXT_PUBLIC_SITE_URL;
  if (!chave || !site || !site.startsWith("https://") || rotas.length === 0) return;

  try {
    const host = new URL(site).host;
    const resposta = await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        host,
        key: chave,
        keyLocation: `${site}/chave-indexnow.txt`,
        urlList: rotas.map((r) => `${site}${r === "/" ? "" : r}` || site),
      }),
      signal: AbortSignal.timeout(3_000),
    });
    if (!resposta.ok && resposta.status !== 202) {
      console.error("[seo] IndexNow respondeu", resposta.status);
    }
  } catch (erro) {
    console.error("[seo] IndexNow falhou (ignorado):", erro);
  }
}
