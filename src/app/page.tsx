/**
 * Painel — a página principal.
 *
 * Server Component com ISR de 5 minutos. Duas decisões estruturais:
 *
 *  1. `hojeMs` é calculado UMA vez aqui e desce por prop. O modelo é
 *     determinístico nesse instante, então o HTML do servidor e a hidratação
 *     produzem exatamente os mesmos números — e o cliente nunca lê o relógio.
 *  2. Os números-manchete saem prontos do servidor (o painel nasce com a base
 *     oficial e os parâmetros padrão). Só os gráficos carregam depois, com
 *     esqueleto da mesma altura.
 */
import { Suspense } from "react";
import { PARAMS_PADRAO } from "@/data/constantes";
import { getFrescor, getPesquisasPublicadas } from "@/lib/dados";
import { rodarModelo } from "@/lib/modelo";
import { Secao } from "@/components/ui/basicos";
import { JsonLd } from "@/components/site/json-ld";
import { Rodape } from "@/components/site/rodape";
import { Abas } from "@/components/painel/abas";
import { Cabecalho } from "@/components/painel/cabecalho";
import { CenarioBase } from "@/components/painel/cenario-base";
import { ContextoSocial } from "@/components/painel/contexto-social";
import { FaixaSimulacao } from "@/components/painel/faixa-simulacao";
import { HistoricoErros } from "@/components/painel/historico-erros";
import { MetodologiaResumo } from "@/components/painel/metodologia-resumo";
import { PainelProvider } from "@/components/painel/estado";
import { Parametros } from "@/components/painel/parametros";
import { SeriePesquisas } from "@/components/painel/serie-pesquisas";
import { SincronizadorURL } from "@/components/painel/sincronizador-url";
import { TelaUrna } from "@/components/painel/tela-urna";
import { montarSelo } from "@/components/painel/frescor";
import { instanteDoRender } from "./_lib/relogio";
import { DESCRICAO_PADRAO, NOME_SITE, URL_SITE } from "./_lib/site";

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

          <Cabecalho selo={selo} />
          <FaixaSimulacao />

          <section className="mx-auto w-full max-w-leitura px-goteira lg:px-goteira-lg">
            <TelaUrna />
          </section>

          <Abas />

          <Secao>
            <ContextoSocial />
          </Secao>

          <Secao>
            <Parametros />
          </Secao>

          <Secao>
            <HistoricoErros />
          </Secao>

          <Secao>
            <CenarioBase />
          </Secao>

          <Secao>
            <SeriePesquisas />
          </Secao>

          <Secao>
            <MetodologiaResumo />
          </Secao>
        </PainelProvider>
      </main>

      <Rodape />

      <JsonLd
        dados={{
          "@context": "https://schema.org",
          "@type": "Dataset",
          name: "Agregado de pesquisas presidenciais 2026 (Brasil)",
          description: DESCRICAO_PADRAO,
          url: `${URL_SITE}/`,
          inLanguage: "pt-BR",
          isAccessibleForFree: true,
          creator: { "@type": "Organization", name: NOME_SITE },
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
                  value: Math.round(oficial.eleito.dia.f * 100),
                  unitText: "%",
                },
                {
                  "@type": "PropertyValue",
                  name: "Margem agregada no 2º turno (Lula − Flávio)",
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
