/**
 * /api/resumo — o número do painel em JSON, para citação por IAs, jornalistas
 * e integrações. É a MESMA fonte e o MESMO modelo da home (verdade mecânica:
 * mesma leitura, mesma cadência de 5 minutos). Aberto no robots de propósito.
 */
import { instanteDoRender } from "@/app/_lib/relogio";
import { NOME_SITE, URL_SITE } from "@/app/_lib/site";
import { parEmCem } from "@/components/ui/textos";
import { PARAMS_PADRAO } from "@/data/constantes";
import { getPesquisasPublicadas } from "@/lib/dados";
import { rodarModelo } from "@/lib/modelo";

export const revalidate = 300;

export async function GET() {
  const [pesquisas, hojeMs] = await Promise.all([getPesquisasPublicadas(), instanteDoRender()]);
  const M = rodarModelo(pesquisas, PARAMS_PADRAO, hojeMs);
  if (!M) {
    return Response.json(
      { erro: "sem dados suficientes" },
      { status: 503, headers: { "Cache-Control": "public, s-maxage=60" } },
    );
  }
  const [eleitoLula, eleitoFlavio] = parEmCem(M.eleito.dia.l);
  const maisRecente = pesquisas[0];

  return Response.json(
    {
      fonte: NOME_SITE,
      url: URL_SITE,
      licenca: "CC-BY-4.0 — atribuição obrigatória com link",
      naoEPrevisao: true,
      atualizadoEm: new Date(hojeMs).toISOString(),
      leitura: `Em 100 eleições parecidas com esta, Lula é eleito em ${eleitoLula} e Flávio em ${eleitoFlavio}.`,
      eleito: { lula: eleitoLula, flavio: eleitoFlavio, escala: "em cada 100 cenários" },
      diferencaMedida: { valor: Number(M.margem.toFixed(2)), unidade: "pontos (Lula − Flávio)" },
      duvidaDoDia: { valor: Number(M.sigmaDia2.toFixed(2)), unidade: "pontos para cada lado" },
      nPesquisas: pesquisas.length,
      ultimaPesquisa: maisRecente
        ? { instituto: maisRecente.instituto, campoFim: maisRecente.fim, tse: maisRecente.tse }
        : null,
      metodologia: `${URL_SITE}/metodologia`,
    },
    { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" } },
  );
}
