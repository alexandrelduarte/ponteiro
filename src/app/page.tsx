/**
 * Painel — a página principal.
 *
 * Server Component com ISR de 5 minutos. Duas decisões estruturais que a v2
 * mantém, porque continuam certas:
 *
 *  1. `hojeMs` é calculado UMA vez aqui e desce por prop. O modelo é
 *     determinístico nesse instante, então o HTML do servidor e a hidratação
 *     produzem exatamente os mesmos números — e o cliente nunca lê o relógio.
 *  2. Os números-manchete saem prontos do servidor, e o ENXAME junto: ele é
 *     SVG feito à mão, sem Recharts e sem medir o DOM. Só os gráficos de
 *     evolução e de sensibilidade carregam depois, com esqueleto da mesma
 *     altura (CLS 0).
 *
 * A ordem das seções é a do COPY-DECK: hero → como ler → quem está na frente →
 * pode virar → evolução → as pesquisas → outros candidatos → contexto → réguas
 * → erro de 2022 → cenário-base → método.
 */
import { Suspense } from "react";
import { PARAMS_PADRAO } from "@/data/constantes";
import { getFrescor, getPesquisasPublicadas } from "@/lib/dados";
import { rodarModelo } from "@/lib/modelo";
import { Secao } from "@/components/ui/blocos";
import { JsonLd } from "@/components/site/json-ld";
import { CenarioBase } from "@/components/painel/cenario-base";
import { ComoLer } from "@/components/painel/como-ler";
import { ContextoSocial } from "@/components/painel/contexto-social";
import { Erro2022 } from "@/components/painel/erro-2022";
import { Evolucao } from "@/components/painel/evolucao";
import { FaixaSimulacao } from "@/components/painel/faixa-simulacao";
import { Frente } from "@/components/painel/frente";
import { Hero } from "@/components/painel/hero";
import { MetodologiaResumo } from "@/components/painel/metodologia-resumo";
import { OutrosCandidatos } from "@/components/painel/outros-candidatos";
import { PainelProvider } from "@/components/painel/estado";
import { Parametros } from "@/components/painel/parametros";
import { SeriePesquisas } from "@/components/painel/serie-pesquisas";
import { SincronizadorURL } from "@/components/painel/sincronizador-url";
import { Virada } from "@/components/painel/virada";
import { montarSelo } from "@/components/painel/frescor";
import { instanteDoRender } from "./_lib/relogio";
import { DESCRICAO_PADRAO, NOME_DESCRITIVO, NOME_SITE, URL_SITE } from "./_lib/site";

export const revalidate = 300;

export default async function Painel() {
  const [pesquisas, frescor, hojeMs] = await Promise.all([
    getPesquisasPublicadas(),
    getFrescor(),
    instanteDoRender(),
  ]);
  const selo = montarSelo(frescor, hojeMs);

  // Só para o JSON-LD: os números que a página publica no cenário oficial.
  const oficial = rodarModelo(pesquisas, PARAMS_PADRAO, hojeMs);
  const datas = pesquisas.flatMap((p) => [p.inicio, p.fim]).sort();
  const cobertura = datas.length ? `${datas[0]}/${datas[datas.length - 1]}` : undefined;

  return (
    <>
      <main>
        <PainelProvider hojeMs={hojeMs} pesquisasOficiais={pesquisas}>
          <Suspense fallback={null}>
            <SincronizadorURL />
          </Suspense>

          <FaixaSimulacao />
          <Hero selo={selo} />

          <Secao>
            <ComoLer />
          </Secao>

          <Secao>
            <Frente />
          </Secao>

          <Secao>
            <Virada />
          </Secao>

          <Secao>
            <Evolucao />
          </Secao>

          <Secao>
            <SeriePesquisas />
          </Secao>

          <Secao>
            <OutrosCandidatos />
          </Secao>

          <Secao>
            <ContextoSocial />
          </Secao>

          <Secao>
            <Parametros />
          </Secao>

          <Secao>
            <Erro2022 />
          </Secao>

          <Secao>
            <CenarioBase />
          </Secao>

          <Secao>
            <MetodologiaResumo />
          </Secao>
        </PainelProvider>
      </main>

      <JsonLd
        dados={{
          "@context": "https://schema.org",
          "@type": "Dataset",
          name: `${NOME_SITE} — ${NOME_DESCRITIVO}`,
          alternateName: NOME_DESCRITIVO,
          description: DESCRICAO_PADRAO,
          url: URL_SITE,
          inLanguage: "pt-BR",
          isAccessibleForFree: true,
          license: "https://creativecommons.org/licenses/by/4.0/",
          citation: `${NOME_SITE} (oponteiro.com.br), dados CC-BY-4.0`,
          creator: { "@id": `${URL_SITE}#org` },
          ...(cobertura ? { temporalCoverage: cobertura } : {}),
          spatialCoverage: { "@type": "Country", name: "Brasil" },
          measurementTechnique:
            "Média ponderada por recência (decaimento exponencial) e tamanho de amostra, " +
            "com tendência pareada por instituto e projeção normal para o dia da votação.",
          variableMeasured: oficial
            ? [
                {
                  "@type": "PropertyValue",
                  name: "Chance de Lula ser eleito (projeção para o dia da votação)",
                  value: Math.round(oficial.eleito.dia.l * 100),
                  unitText: "%",
                },
                {
                  "@type": "PropertyValue",
                  name: "Chance de Flávio Bolsonaro ser eleito (projeção para o dia da votação)",
                  value: 100 - Math.round(oficial.eleito.dia.l * 100),
                  unitText: "%",
                },
                {
                  "@type": "PropertyValue",
                  name: "Diferença agregada no 2º turno (Lula − Flávio)",
                  value: Number(oficial.margem.toFixed(2)),
                  unitText: "p.p.",
                },
              ]
            : undefined,
          dateModified: new Date(hojeMs).toISOString(),
        }}
      />
    </>
  );
}
