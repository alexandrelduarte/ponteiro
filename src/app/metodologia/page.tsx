/**
 * /metodologia — os `<details>` do protótipo viram uma página de leitura.
 * Todo o texto foi preservado; o que mudou é o que a arquitetura de produção
 * mudou de verdade (R3: não existe botão público de atualização).
 */
import type { Metadata } from "next";
import Link from "next/link";
import { LinkExterno } from "@/components/ui/basicos";
import { Rodape } from "@/components/site/rodape";
import { FONTES_ERROS } from "@/data/fontes-erros";
import { getPesquisasPublicadas } from "@/lib/dados";
import { fmtData } from "@/lib/modelo";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Metodologia",
  description:
    "Como o agregado é calculado: pesos por recência e amostra, tendência pareada por instituto, " +
    "as duas probabilidades (hoje e no dia da votação), a classificação dos cenários, as limitações " +
    "conhecidas e todas as fontes da série.",
  alternates: { canonical: "/metodologia" },
};

function Bloco({
  titulo,
  children,
  id,
}: {
  titulo: string;
  children: React.ReactNode;
  id: string;
}) {
  return (
    <section aria-labelledby={id} className="mt-secao md:mt-secao-md">
      <h2 id={id} className="text-secao">
        {titulo}
      </h2>
      <div className="mt-2 space-y-3 text-sm leading-leitura text-cinza">{children}</div>
    </section>
  );
}

export default async function Metodologia() {
  const pesquisas = await getPesquisasPublicadas();

  return (
    <>
      <main className="mx-auto w-full max-w-leitura px-goteira pt-8 lg:px-goteira-lg">
        <p className="font-mono text-xs tracking-sobretitulo text-confirma-texto uppercase">
          Como o painel calcula
        </p>
        <h1 className="mt-1 text-titulo">METODOLOGIA</h1>
        <p className="mt-2 max-w-texto text-sm text-cinza">
          O modelo inteiro cabe em três ideias: uma média que dá mais peso ao que é recente e maior,
          uma incerteza que cresce com o tempo que falta, e uma probabilidade que é a fração de
          cenários compatíveis com os dados.{" "}
          <Link
            href="/"
            className="font-semibold text-confirma-texto underline decoration-dotted underline-offset-2"
          >
            ← voltar ao painel
          </Link>
        </p>

        <div className="max-w-texto">
          <Bloco id="medias" titulo="Média, pesos e as duas probabilidades">
            <p>
              Peso = recência (decaimento exponencial) × √(amostra/2000), teto 1,5. A probabilidade
              «no cenário atual» usa a incerteza de hoje (dispersão entre institutos + erro
              sistemático possível de todo o setor). A probabilidade «no dia da votação» soma a
              deriva da opinião, que cresce com a raiz do tempo restante — por isso ela é sempre
              menos cravada que a de hoje. A chance de eleição combina os caminhos: vitória direta
              no 1º turno (mais de 50% dos válidos) ou vitória no 2º turno.
            </p>
            <p>
              As probabilidades são arredondadas para número inteiro e assim ficam. Casa decimal em
              probabilidade de vitória é precisão falsa: uma variação de 1 ponto na probabilidade
              corresponde a cerca de um décimo de ponto na intenção de voto prevista.
            </p>
          </Bloco>

          <Bloco id="tendencia" titulo="Como a tendência é calculada">
            <p>
              Para evitar que diferenças de metodologia entre institutos virem «tendência» falsa, o
              indicador compara cada instituto com ele mesmo: última rodada menos a rodada anterior
              (até 75 dias), e tira a média desses pares. |Δ| menor que 0,8 p.p. é tratado como
              estável. As linhas do gráfico são a média ponderada recalculada ao longo do tempo.
            </p>
          </Bloco>

          <Bloco id="classificacao" titulo="Classificação dos cenários">
            <p>
              Sobre a chance de eleição projetada: 50–60% empate técnico projetado · 60–75% leve
              favoritismo · 75–90% favorito · 90%+ amplamente favorito. Em cada pesquisa isolada,
              «empate técnico» = diferença ≤ 2× margem de erro. O modelo assume que os dois
              primeiros colocados vão ao 2º turno — nas pesquisas atuais o 3º colocado tem no máximo
              8%.
            </p>
            <p>
              A régua acima é publicada de propósito e usada literalmente: o título do veredito, na
              tela da urna, nunca usa uma palavra que não esteja nesta tabela. Palavras carregam
              probabilidade implícita, e cada leitor calibra a sua — então a nossa fica à vista.
            </p>
          </Bloco>

          <Bloco id="limitacoes" titulo="Limitações que você deve conhecer">
            <p>
              Pesquisas são retratos. Em 2022 parte dos institutos subestimou a votação da direita —
              o erro sistemático do modelo existe por isso e é ajustável. O erro sistemático padrão
              (4,0) é ancorado no estado não calibrado dos institutos: o gabarito que reduziu o erro
              para +3,1 em 2022 — o resultado real do 1º turno — só existirá depois de 04/10/2026.
              Cenários estimulados variam (lista de nomes, presencial × telefone × on-line). Rodadas
              antigas de alguns institutos não divulgaram o 1º turno ou o detalhe de brancos/nulos
              (marcadas n/d) — elas entram só onde há dado. A Datafolha de julho não detalhou
              brancos/nulos do 1º turno, então fica fora do cálculo de votos válidos do 1º turno.
            </p>
            <p>
              Resultados de institutos diferentes não são estritamente comparáveis entre si: método,
              lista de nomes e modo de coleta mudam. É por isso que a tendência é sempre pareada e
              que o peso de cada rodada aparece na série, em vez de tudo virar uma média anônima.
            </p>
          </Bloco>

          <Bloco
            id="atualizacao"
            titulo="Como a série é atualizada (e por que não há botão público)"
          >
            <p>
              Uma vez por dia, uma rotina no servidor consulta a web em busca de rodadas novas dos
              institutos (posteriores à pesquisa mais recente da série), extrai os números em
              formato estruturado e aplica checagens de sanidade: faixas plausíveis de intenção de
              voto, coerência das datas, URL de fonte obrigatória e deduplicação por instituto e
              data de campo.
            </p>
            <p>
              O que essa rotina encontra <b className="text-tinta">não entra na série sozinho</b>:
              nasce como <i>pendente</i> e só é publicado depois de aprovação humana, registrada em
              auditoria pública — que você pode conferir na{" "}
              <Link
                href="/historico"
                className="font-semibold text-confirma-texto underline decoration-dotted underline-offset-2"
              >
                linha do tempo de transparência
              </Link>
              . Não existe gatilho público de atualização: sem essa regra, qualquer pessoa poderia
              forçar a entrada de uma rodada conveniente no momento conveniente.
            </p>
            <p>
              O parâmetro de <b className="text-tinta">viés direcional</b> é a resposta quantitativa
              à pergunta «e se as pesquisas estiverem erradas de novo?»: ele aplica ao agregado o
              padrão de erro observado em 2018 e 2022 (subestimação da direita). Mover esse slider
              no painel muda todos os números da página, inclusive o cenário-base — é assim que se
              vê que o «cenário mais provável» é função das premissas, não um palpite.
            </p>
          </Bloco>

          <Bloco
            id="fontes-serie"
            titulo={`Fontes da série (${pesquisas.length}) · registro no TSE`}
          >
            {/* Cada fonte é um alvo de toque de 44px (docs/DESIGN.md §9). */}
            <ul className="font-mono text-xs">
              {pesquisas.map((p) => (
                <li key={p.id} className="flex min-h-toque flex-wrap items-center gap-x-1">
                  {p.fonte ? (
                    <LinkExterno href={p.fonte}>{p.instituto}</LinkExterno>
                  ) : (
                    <span className="text-tinta">{p.instituto}</span>
                  )}
                  <span>
                    · campo {fmtData(p.inicio)}–{fmtData(p.fim)}/2026 · {p.tse}
                  </span>
                </li>
              ))}
            </ul>
          </Bloco>

          <Bloco id="fontes-erros" titulo="Fontes do histórico de erros">
            <ul className="font-mono text-xs">
              {FONTES_ERROS.map((f) => (
                <li key={f.url} className="flex min-h-toque items-center">
                  <LinkExterno href={f.url}>{f.nome}</LinkExterno>
                </li>
              ))}
            </ul>
          </Bloco>
        </div>
      </main>

      <Rodape />
    </>
  );
}
