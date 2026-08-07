/** Arquivo de verificação do IndexNow — texto puro com a chave (404 sem env). */
export function GET() {
  const chave = process.env.INDEXNOW_KEY;
  if (!chave) return new Response(null, { status: 404 });
  return new Response(chave, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
