/**
 * Ficha pública de UMA pesquisa (/pesquisas/[slug]) — o motor de long-tail do
 * SEO (missão de branding/SEO, DECISOES.md) e, antes disso, uma página honesta:
 * os números DELA, a procedência completa (registro TSE, contratante, campo,
 * amostra, folga, fonte) e a posição dela na média do painel.
 *
 * Toda redação editorial aqui é CARIMBADA (AUDITORIA-COPY §14). Condições de
 * veto implementadas: o gatilho do texto de empate é `empate2` do modelo
 * (dobro da folga); {{DIF_MEDIA}} mapeia `M.margem` (NUNCA margemAj); "não é
 * previsão" mora na mesma tela dos números; números do instituto saem
 * verbatim (nunca parEmCem — não somam 100 por construção).
 */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { instanteDoRender } from "@/app/_lib/relogio";
import { NOME_SITE, ROTA_PESQUISAS, URL_SITE } from "@/app/_lib/site";
import { BarraPesquisa, escalaDaSerie } from "@/components/painel/barra-pesquisa";
import { JsonLd } from "@/components/site/json-ld";
import { Bloco, LinkExterno, LinkInterno, Pergunta, Secao } from "@/components/ui/blocos";
import { inteiroBr, pessoasEmCem } from "@/components/ui/textos";
import { getFichasPesquisas, getFichaPorSlug } from "@/lib/dados";
import { fmt, fmtData, rodarModelo } from "@/lib/modelo";
import { PARAMS_PADRAO } from "@/data/constantes";
import { PADRAO_SLUG } from "@/lib/slug";

export const revalidate = 300;

/** R8: sem envs o build gera as 13 do seed; novas renderizam on-demand. */
export async function generateStaticParams() {
  const fichas = await getFichasPesquisas();
  return fichas.map((f) => ({ slug: f.slug }));
}

const URL_CONSULTA_TSE =
  "https://www.tse.jus.br/eleicoes/pesquisa-eleitorais/consulta-as-pesquisas-registradas";

function mesAnoPorExtenso(iso: string): string {
  const meses = [
    "janeiro",
    "fevereiro",
    "março",
    "abril",
    "maio",
    "junho",
    "julho",
    "agosto",
    "setembro",
    "outubro",
    "novembro",
    "dezembro",
  ];
  const [ano, mes] = iso.split("-").map(Number);
  return `${meses[(mes ?? 1) - 1]} de ${ano}`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const ficha = await getFichaPorSlug(slug);
  if (!ficha) return {};
  const p = ficha.pesquisa;
  const titulo = `Pesquisa ${p.instituto} — ${mesAnoPorExtenso(p.fim)}`;
  // Carimbada (§14): a ressalva "não é previsão" vem ANTES do ponto de
  // truncamento (~160 caracteres) — ressalva truncada não existe.
  const descricao =
    `Pesquisa ${p.instituto} no 2º turno: Lula ${fmt(p.t2.lula)}% × Flávio ${fmt(p.t2.flavio)}%, ` +
    `${inteiroBr(p.n)} pessoas ouvidas, folga de ${fmt(p.moe)} pontos — não é previsão. ` +
    `Registro no TSE (${p.tse}), campo de ${fmtData(p.inicio)} a ${fmtData(p.fim)}, ` +
    `contratante, fonte e o peso dela na média.`;
  return {
    title: titulo,
    description: descricao,
    alternates: { canonical: `/pesquisas/${slug}` },
    openGraph: { title: titulo, description: descricao, url: `/pesquisas/${slug}` },
    twitter: { title: titulo, description: descricao },
  };
}

export default async function PaginaPesquisa({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!PADRAO_SLUG.test(slug)) notFound();
  const [ficha, fichas, hojeMs] = await Promise.all([
    getFichaPorSlug(slug),
    getFichasPesquisas(),
    instanteDoRender(),
  ]);
  if (!ficha) notFound();
  const p = ficha.pesquisa;
  // A camada de dados nunca entrega ficha sem 2ºT (linhaParaPesquisa descarta),
  // mas o TIPO permite null — o narrow aqui é a prova para o compilador.
  const l2 = p.t2.lula;
  const f2 = p.t2.flavio;
  if (l2 == null || f2 == null) notFound();

  const pesquisas = fichas.map((f) => f.pesquisa);
  const M = rodarModelo(pesquisas, PARAMS_PADRAO, hojeMs);
  const linha = M?.linhas.find((l) => l.slug === slug) ?? null;

  // A pesquisa anterior do MESMO instituto (fichas já vêm por fim desc).
  const doInstituto = fichas.filter((f) => f.institutoId === ficha.institutoId);
  const idx = doInstituto.findIndex((f) => f.slug === slug);
  const anterior = idx >= 0 ? (doInstituto[idx + 1] ?? null) : null;

  const difPesquisa = Math.abs(l2 - f2);
  const direcaoPesquisa = l2 >= f2 ? "a favor de Lula" : "a favor de Flávio";
  const difMedia = M ? Math.abs(M.margem) : null; // §14.5.2: SEMPRE margem, nunca margemAj
  const direcaoMedia = M ? (M.margem >= 0 ? "a favor de Lula" : "a favor de Flávio") : "";

  const antL = anterior?.pesquisa.t2.lula;
  const antF = anterior?.pesquisa.t2.flavio;
  const delta = anterior && antL != null && antF != null ? l2 - f2 - (antL - antF) : null;
  const deltaAbs = delta === null ? null : Math.abs(delta);
  const candidatoDelta = delta !== null && delta >= 0 ? "Lula" : "Flávio";

  const periodo = `${fmtData(p.inicio)} a ${fmtData(p.fim)}/${p.fim.slice(0, 4)}`;

  return (
    <main>
      <Secao>
        <Bloco rotuladoPor="titulo-pesquisa">
          <nav aria-label="Você está em" className="text-micro text-tinta-media">
            <LinkInterno href="/" className="text-micro">
              Painel
            </LinkInterno>{" "}
            ·{" "}
            <LinkInterno href={ROTA_PESQUISAS.href} className="text-micro">
              {ROTA_PESQUISAS.titulo}
            </LinkInterno>
          </nav>
          <h1 id="titulo-pesquisa" className="mt-2 text-pergunta text-tinta">
            {p.instituto} — pesquisa de {periodo}
          </h1>

          {/* Números do 2º turno, VERBATIM do instituto (nunca somam 100 por
              construção: falta branco/nulo/não sabe — §14.4). */}
          <p className="mt-4 font-display text-manchete-2 text-tinta numeros">
            2º turno: <span className="text-lula">Lula {fmt(p.t2.lula)}%</span>{" "}
            <span className="text-tinta-media">×</span>{" "}
            <span className="text-flavio">Flávio {fmt(p.t2.flavio)}%</span>
          </p>

          <div className="mt-4 max-w-texto">
            {linha && M ? (
              <BarraPesquisa linha={linha} escala={escalaDaSerie(M.linhas)} balaoNaLinha />
            ) : null}
          </div>

          {/* Carimbada §14: não é previsão — na mesma tela dos números (H4). */}
          <p className="mt-4 max-w-texto text-intro text-tinta">
            Uma pesquisa é um retrato do período em que ela foi a campo — não é previsão do
            resultado. O número para o dia da votação, com a dúvida à vista, está no{" "}
            <LinkInterno href="/" className="text-intro">
              painel
            </LinkInterno>
            .
          </p>
        </Bloco>
      </Secao>

      <Secao>
        <Bloco rotuladoPor="titulo-procedencia">
          <Pergunta id="titulo-procedencia">De onde vem este número</Pergunta>
          <dl className="mt-3 grid gap-x-10 gap-y-2 text-corpo text-tinta-media sm:grid-cols-2">
            <div>
              <dt className="font-semibold text-tinta">Registro no TSE</dt>
              <dd className="numeros">
                {p.tse} ·{" "}
                <LinkExterno href={URL_CONSULTA_TSE} className="text-corpo">
                  conferir no site do TSE
                </LinkExterno>
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-tinta">Contratante</dt>
              <dd>{p.contratante}</dd>
            </div>
            <div>
              <dt className="font-semibold text-tinta">Período de campo</dt>
              <dd className="numeros">{periodo}</dd>
            </div>
            <div>
              <dt className="font-semibold text-tinta">Pessoas ouvidas</dt>
              <dd className="numeros">{inteiroBr(p.n)}</dd>
            </div>
            <div>
              <dt className="font-semibold text-tinta">Folga da medida — a margem de erro</dt>
              <dd className="numeros">{fmt(p.moe)} pontos para cada lado</dd>
            </div>
            {p.fonte ? (
              <div>
                <dt className="font-semibold text-tinta">Fonte</dt>
                <dd>
                  <LinkExterno href={p.fonte} className="text-corpo">
                    Ver a publicação original
                  </LinkExterno>
                </dd>
              </div>
            ) : null}
          </dl>

          {p.t1 && p.t1.lula != null ? (
            <div className="mt-6">
              <h3 className="text-secao text-tinta">1º turno, como o instituto divulgou</h3>
              <p className="mt-2 max-w-texto text-corpo text-tinta-media numeros">
                <span className="text-lula">Lula {fmt(p.t1.lula)}%</span> ·{" "}
                <span className="text-flavio">Flávio Bolsonaro {fmt(p.t1.flavio)}%</span>
                {p.outros1
                  ? Object.entries(p.outros1).map(([nome, valor]) => (
                      <span key={nome}>
                        {" "}
                        · {nome} {fmt(valor)}%
                      </span>
                    ))
                  : null}
                {p.t1.bnns != null ? (
                  <span> · branco, nulo ou não sabe {fmt(p.t1.bnns)}%</span>
                ) : null}
              </p>
            </div>
          ) : null}
        </Bloco>
      </Secao>

      <Secao>
        <Bloco rotuladoPor="titulo-na-media">
          <Pergunta id="titulo-na-media">O que ela muda no painel</Pergunta>
          <div className="mt-2 max-w-texto space-y-3 text-corpo text-tinta-media">
            {/* Carimbada §14 (papelNaSerie) */}
            <p>
              Esta é uma das {pesquisas.length} pesquisas que alimentam a média do painel. A média
              dá mais peso às pesquisas mais novas e com mais gente ouvida. Nenhuma decide sozinha:
              o{" "}
              <LinkInterno href="/" className="text-corpo">
                painel
              </LinkInterno>{" "}
              é a leitura de todas juntas.
            </p>

            {/* Carimbadas §14: vsMedia × vsMediaEmpate — o gatilho é empate2 do
                modelo (dobro da folga), nunca a folga simples (§14.5.1). */}
            {linha && M && difMedia !== null ? (
              linha.empate2 ? (
                <p className="numeros">
                  Nesta pesquisa, a diferença ficou menor que o dobro da folga da medida — a folga
                  que vale quando se comparam os dois números. Ela não consegue dizer quem está na
                  frente; isso não quer dizer que os dois estão iguais. Na média do painel hoje, a
                  diferença é de {fmt(difMedia)} pontos {direcaoMedia}.
                </p>
              ) : (
                <p className="numeros">
                  Nesta pesquisa, a diferença foi de {fmt(difPesquisa)} pontos {direcaoPesquisa} —
                  cerca de {pessoasEmCem(difPesquisa)} pessoas a mais em cada 100. Na média do
                  painel hoje, a diferença é de {fmt(difMedia)} pontos {direcaoMedia}.
                </p>
              )
            ) : null}

            {linha ? (
              <p className="numeros">
                {inteiroBr(p.n)} pessoas ouvidas · folga da medida de {fmt(p.moe)} pontos · peso na
                média de hoje: {fmt(linha.w, 2)}.
              </p>
            ) : null}

            {/* Carimbadas §14: tendenciaInstituto / primeiraRodada / delta zero */}
            {anterior && deltaAbs !== null ? (
              deltaAbs < 0.05 ? (
                <p className="numeros">
                  Comparada com a pesquisa anterior do mesmo instituto (
                  <LinkInterno href={`/pesquisas/${anterior.slug}`} className="text-corpo">
                    {fmtData(anterior.pesquisa.fim)}
                  </LinkInterno>
                  ), a diferença ficou onde estava. Cada casa tem um jeito próprio de medir.
                  Comparar a casa com ela mesma tira boa parte desse jeito da conta — a folga de
                  cada medida continua valendo.
                </p>
              ) : (
                <p className="numeros">
                  Comparada com a pesquisa anterior do mesmo instituto (
                  <LinkInterno href={`/pesquisas/${anterior.slug}`} className="text-corpo">
                    {fmtData(anterior.pesquisa.fim)}
                  </LinkInterno>
                  ), a diferença andou {fmt(deltaAbs)} pontos na direção de {candidatoDelta}. Cada
                  casa tem um jeito próprio de medir. Comparar a casa com ela mesma tira boa parte
                  desse jeito da conta — a folga de cada medida continua valendo.
                </p>
              )
            ) : (
              <p>
                É a primeira pesquisa deste instituto no painel — ainda não há com o que comparar.
              </p>
            )}
          </div>
        </Bloco>
      </Secao>

      <JsonLd
        dados={{
          "@context": "https://schema.org",
          "@type": "Dataset",
          name: `Pesquisa ${p.instituto}, ${periodo} — registro TSE ${p.tse}`,
          description:
            `Intenção de voto para presidente do Brasil em 2026 (Lula × Flávio Bolsonaro), ` +
            `medida por ${p.instituto} com ${inteiroBr(p.n)} entrevistas e margem de erro de ` +
            `${fmt(p.moe)} pontos.`,
          url: `${URL_SITE}/pesquisas/${slug}`,
          inLanguage: "pt-BR",
          isAccessibleForFree: true,
          license: "https://creativecommons.org/licenses/by/4.0/",
          temporalCoverage: `${p.inicio}/${p.fim}`,
          spatialCoverage: { "@type": "Country", name: "Brasil" },
          creator: { "@type": "Organization", name: p.instituto },
          sdPublisher: { "@id": `${URL_SITE}#org` },
          ...(p.fonte ? { isBasedOn: p.fonte } : {}),
          isPartOf: { "@type": "Dataset", name: NOME_SITE, url: URL_SITE },
          variableMeasured: [
            {
              "@type": "PropertyValue",
              name: "Intenção de voto em Lula (2º turno)",
              value: p.t2.lula,
              unitText: "%",
            },
            {
              "@type": "PropertyValue",
              name: "Intenção de voto em Flávio Bolsonaro (2º turno)",
              value: p.t2.flavio,
              unitText: "%",
            },
          ],
        }}
      />
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
            {
              "@type": "ListItem",
              position: 3,
              name: `${p.instituto} — ${periodo}`,
              item: `${URL_SITE}/pesquisas/${slug}`,
            },
          ],
        }}
      />
    </main>
  );
}
