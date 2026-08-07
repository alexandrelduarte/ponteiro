/**
 * /embed — o widget incorporável (iframe) para imprensa e sites.
 *
 * Route handler PURO servindo HTML autocontido: fora do layout React (sem
 * header/nav/rodapé), ~2 KB, zero JS. A MESMA fonte de dados e o MESMO modelo
 * do painel, na MESMA cadência (revalidate 300) — condição carimbada §14.5.5
 * ("o mesmo número, atualizado junto" precisa ser verdade mecânica).
 *
 * Honestidade fora de casa (§14.5.4): a chance sai em FREQUÊNCIA ("NN em 100",
 * parEmCem com piso/teto H13) e o rodapé "PONTEIRO · oponteiro.com.br — não é
 * previsão" é inseparável do número (mesmo HTML, sem opção de remover).
 *
 * HEX literais: espelho dos tokens (mesma exceção documentada do OG — aqui não
 * há pipeline de CSS). frame-ancestors * NESTA rota apenas; o resto do site
 * continua proibido de ser emoldurado (next.config.ts).
 */
import { instanteDoRender } from "@/app/_lib/relogio";
import { URL_SITE } from "@/app/_lib/site";
import { parEmCem } from "@/components/ui/textos";
import { PARAMS_PADRAO } from "@/data/constantes";
import { getPesquisasPublicadas } from "@/lib/dados";
import { rodarModelo } from "@/lib/modelo";

export const revalidate = 300;

/* Espelho literal de tokens.css — mudou lá, muda aqui. */
const COR = {
  bruma: "#efecf1",
  placa: "#ffffff",
  tinta: "#211c26",
  tintaMedia: "#5c5566",
  ameixa: "#4a2e55",
  lula: "#be1745",
  flavio: "#26418b",
  filete: "#d8d1dd",
};

export async function GET() {
  const [pesquisas, hojeMs] = await Promise.all([getPesquisasPublicadas(), instanteDoRender()]);
  const M = rodarModelo(pesquisas, PARAMS_PADRAO, hojeMs);
  const [l, f] = M ? parEmCem(M.eleito.dia.l) : ["–", "–"];
  const atualizado = new Date(hojeMs).toISOString();

  const html = `<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>PONTEIRO — para onde apontam as pesquisas</title>
<style>
  * { margin: 0; box-sizing: border-box; }
  body { font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
         background: ${COR.placa}; color: ${COR.tinta}; padding: 14px 16px 10px;
         border: 1px solid ${COR.filete}; border-radius: 12px; }
  .numeros { font-variant-numeric: tabular-nums; }
  .frase { font-size: 15px; line-height: 1.45; }
  .frase b { font-weight: 700; }
  .lula { color: ${COR.lula}; } .flavio { color: ${COR.flavio}; }
  .rodape { margin-top: 10px; padding-top: 8px; border-top: 1px solid ${COR.filete};
            font-size: 11.5px; color: ${COR.tintaMedia}; display: flex;
            justify-content: space-between; gap: 8px; flex-wrap: wrap; }
  .rodape a { color: ${COR.ameixa}; font-weight: 600; text-decoration: none; }
  .rodape a:hover { text-decoration: underline; }
</style></head>
<body>
  <p class="frase numeros">Em 100 eleições parecidas com esta, <b class="lula">Lula é eleito em ${l}</b> e <b class="flavio">Flávio em ${f}</b>.</p>
  <p class="rodape">
    <a href="${URL_SITE}" target="_top" rel="noopener">PONTEIRO · oponteiro.com.br — não é previsão</a>
    <time datetime="${atualizado}">${new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Sao_Paulo", day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }).format(new Date(hojeMs))}</time>
  </p>
</body></html>`;

  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; frame-ancestors *",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
