/**
 * /metodologia — página de prosa (COPY-DECK §U, DESIGN-V2 §5.7).
 *
 * A CAMADA TÉCNICA PERMANECE INTACTA, palavra por palavra: ela é o conteúdo
 * aqui, e é ela que vale para quem quiser conferir a conta. O que a v2 põe por
 * cima é uma abertura em linguagem simples para cada bloco e um seletor entre
 * as duas leituras.
 *
 * Zero cartão decorativo, coluna na medida de leitura, corpo em 16–18px.
 */
import type { Metadata } from "next";
import {
  Bloco,
  LinkExterno,
  LinkInterno,
  Pergunta,
  Secao,
  Subtitulo,
} from "@/components/ui/blocos";
import { SeletorMetodologia } from "@/components/site/seletor-metodologia";
import { FONTES_TRADUZIDAS } from "@/components/painel/copia-erros";
import { GLOSSARIO, ORDEM_GLOSSARIO, registroTse } from "@/components/ui/textos";
import { getPesquisasPublicadas } from "@/lib/dados";
import { fmtData, meioCampo } from "@/lib/modelo";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Metodologia",
  description:
    "Como os números são calculados: pesos por recência e amostra, tendência pareada por " +
    "instituto, as duas chances (hoje e no dia da votação), a classificação dos cenários, as " +
    "limitações conhecidas e todas as fontes.",
  alternates: { canonical: "/metodologia" },
};

/** Só visível no modo "explicação simples". */
const SO_SIMPLES = "group-data-[modo=tecnica]:hidden";
/** Só visível no modo "explicação técnica". */
const SO_TECNICA = "group-data-[modo=simples]:hidden";

/**
 * Uma seção de prosa — SEM placa própria.
 *
 * §5.7 é explícito: a /metodologia é "página de prosa, coluna na medida de
 * leitura, ZERO cartão decorativo". A página entregue era uma pilha de placas
 * brancas sobre bruma, igual à home, e cada placa era pura decoração: aqui o
 * conteúdo é texto corrido, e texto corrido não precisa de moldura. As seções
 * agora dividem uma folha só (a `<Folha>` abaixo), separadas por filete.
 */
function BlocoMetodo({
  id,
  titulo,
  simples,
  children,
}: {
  id: string;
  titulo: string;
  simples: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <section aria-labelledby={id} className="mt-8 first:mt-0">
      <Pergunta id={id}>{titulo}</Pergunta>
      <div className={`mt-2 max-w-texto text-corpo text-tinta-media ${SO_SIMPLES}`}>{simples}</div>
      {children ? (
        <div className={SO_TECNICA}>
          <p className="mt-2 max-w-texto text-micro text-tinta-media">
            Abaixo, o texto técnico completo — é ele que vale para quem quiser conferir a conta.
          </p>
          <div className="mt-2 max-w-texto space-y-3 text-corpo text-tinta-media">{children}</div>
        </div>
      ) : null}
    </section>
  );
}

/** A folha única de prosa: uma placa para a página inteira, não uma por bloco. */
function Folha({ children }: { children: React.ReactNode }) {
  return (
    <Secao>
      <Bloco>{children}</Bloco>
    </Secao>
  );
}

export default async function Metodologia() {
  const pesquisas = await getPesquisasPublicadas();

  // MESMA ordem da lista de pesquisas do painel (da mais recente para a mais
  // antiga, pelo meio do campo): a lista existe para o leitor conferir linha a
  // linha — com ordens divergentes ele teria de procurar cada item.
  const fontes = [...pesquisas].sort((a, b) => meioCampo(b) - meioCampo(a));

  return (
    <main>
      <Secao>
        <Bloco>
          <h1 className="text-pergunta text-tinta">De onde vêm os números desta página?</h1>
          <p className="mt-2 max-w-texto text-intro text-tinta">
            O modelo inteiro cabe em três ideias: uma média que dá mais peso ao que é recente e
            maior, uma dúvida que cresce com o tempo que falta, e uma chance que é a fração de
            cenários compatíveis com os dados.
          </p>
          <p className="mt-3">
            <LinkInterno href="/" className="text-corpo font-semibold">
              ← voltar ao painel
            </LinkInterno>
          </p>
        </Bloco>
      </Secao>

      <SeletorMetodologia>
        <Folha>
          <BlocoMetodo
            id="medias"
            titulo="Média, pesos e as duas chances"
            simples={
              <p>
                Cada pesquisa entra na média com um peso: mais nova e com mais gente ouvida pesa
                mais. Depois o painel calcula duas chances — uma se a votação fosse hoje e outra
                para o dia da votação. A segunda carrega mais dúvida, porque até lá a corrida ainda
                pode andar. A chance final soma os dois caminhos: ganhar já no 1º turno, ou ganhar
                no 2º.
              </p>
            }
          >
            <p>
              Peso = recência (decaimento exponencial) × √(amostra/2000), teto 1,5. A probabilidade
              “no cenário atual” usa a incerteza de hoje (dispersão entre institutos + erro
              sistemático possível de todo o setor). A probabilidade “no dia da votação” soma a
              deriva da opinião, que cresce com a raiz do tempo restante — por isso ela é sempre
              menos cravada que a de hoje. A chance de eleição combina os caminhos: vitória direta
              no 1º turno (mais de 50% dos válidos) ou vitória no 2º turno.
            </p>
            <p>
              As probabilidades são arredondadas para número inteiro e assim ficam. Casa decimal em
              probabilidade de vitória é precisão falsa: uma variação de 1 ponto na probabilidade
              corresponde a cerca de um décimo de ponto na intenção de voto prevista.
            </p>
          </BlocoMetodo>

          <BlocoMetodo
            id="tendencia"
            titulo="Como a tendência é calculada"
            simples={
              <p>
                Para saber se a diferença subiu ou desceu, o painel compara cada instituto com ele
                mesmo: a pesquisa nova contra a anterior da mesma casa, até 75 dias de distância.
                Assim, diferença de método entre institutos não vira movimento falso. Mudança menor
                que 0,8 ponto é tratada como “ficou igual”.
              </p>
            }
          >
            <p>
              Para evitar que diferenças de metodologia entre institutos virem “tendência” falsa, o
              indicador compara cada instituto com ele mesmo: última rodada menos a rodada anterior
              (até 75 dias), e tira a média desses pares. |Δ| menor que 0,8 p.p. é tratado como
              estável. As linhas do gráfico são a média ponderada recalculada ao longo do tempo.
            </p>
          </BlocoMetodo>

          <BlocoMetodo
            id="classificacao"
            titulo="Classificação dos cenários"
            simples={
              <p>
                São quatro faixas para descrever a chance: de 50 a 60 em 100{" "}
                <b className="font-semibold text-tinta">está em aberto</b>; de 60 a 75, na frente
                por pouco; de 75 a 90, na frente; acima de 90, bem na frente — e nem aí é garantia.
                Numa pesquisa isolada, empate técnico é quando a diferença é menor que o dobro da
                folga da medida.
              </p>
            }
          >
            <p>
              Sobre a chance de eleição projetada: 50–60% empate técnico projetado · 60–75% leve
              favoritismo · 75–90% favorito · 90%+ amplamente favorito. Em cada pesquisa isolada,
              “empate técnico” = diferença ≤ 2× a margem de erro. O modelo assume que os dois
              primeiros colocados vão ao 2º turno — nas pesquisas atuais o 3º colocado tem no máximo
              8%.
            </p>
            <p>
              A régua acima é publicada de propósito e usada literalmente: o título do veredito
              nunca usa uma palavra que não esteja nesta tabela. Palavras carregam probabilidade
              implícita, e cada leitor calibra a sua — então a nossa fica à vista.
            </p>
          </BlocoMetodo>

          <BlocoMetodo
            id="limitacoes"
            titulo="Limitações que você deve conhecer"
            simples={
              <p>
                Pesquisa é uma foto do momento, e foto sai errada às vezes. Aqui estão, sem
                maquiagem, os pontos em que este painel pode errar — inclusive os que a gente não
                tem como consertar.
              </p>
            }
          >
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
          </BlocoMetodo>

          <BlocoMetodo
            id="atualizacao"
            titulo="Como a lista é atualizada (e por que não há botão)"
            simples={
              <p>
                Pesquisa nova não entra sozinha. Um robô procura todo dia, e uma pessoa precisa
                conferir a fonte e aprovar. Tudo o que entra ou sai fica registrado numa lista
                pública. Não existe botão de atualizar nesta página, de propósito.
              </p>
            }
          >
            <p>
              Uma vez por dia, uma rotina no servidor consulta a web em busca de rodadas novas dos
              institutos (posteriores à pesquisa mais recente da série), extrai os números em
              formato estruturado e aplica checagens de sanidade: faixas plausíveis de intenção de
              voto, coerência das datas, URL de fonte obrigatória e deduplicação por instituto e
              data de campo.
            </p>
            <p>
              O que essa rotina encontra{" "}
              <b className="font-semibold text-tinta">não entra na série sozinho</b>: nasce como{" "}
              <i>pendente</i> e só é publicado depois de aprovação humana, registrada em auditoria
              pública — que você pode conferir na{" "}
              <LinkInterno href="/historico" className="text-corpo">
                lista do que já mudou
              </LinkInterno>
              . Não existe gatilho público de atualização: sem essa regra, qualquer pessoa poderia
              forçar a entrada de uma rodada conveniente no momento conveniente.
            </p>
            <p>
              O parâmetro de <b className="font-semibold text-tinta">viés direcional</b> é a
              resposta quantitativa à pergunta “e se as pesquisas estiverem erradas de novo?”: ele
              aplica ao agregado o padrão de erro observado em 2018 e 2022 (subestimação da
              direita). Mover esse slider no painel muda todos os números da página, inclusive o
              cenário-base — é assim que se vê que o “cenário mais provável” é função das premissas,
              não um palpite.
            </p>
          </BlocoMetodo>

          <BlocoMetodo
            id="glossario"
            titulo="Todas as palavras explicadas"
            simples={
              <p>
                São as mesmas explicações que abrem quando você toca num chip no painel, reunidas
                aqui em uma página só.
              </p>
            }
          >
            <p>As mesmas definições publicadas nos chips do painel, reunidas para consulta.</p>
          </BlocoMetodo>

          <section aria-labelledby="glossario-lista" className="mt-6">
            <Subtitulo id="glossario-lista" className="sr-only">
              Lista das palavras explicadas
            </Subtitulo>
            <dl className="max-w-texto space-y-4">
              {ORDEM_GLOSSARIO.map((chave) => (
                <div key={chave}>
                  <dt className="text-secao text-tinta">{GLOSSARIO[chave].termo}</dt>
                  <dd className="mt-1 text-corpo text-tinta-media numeros">
                    {GLOSSARIO[chave].texto}
                  </dd>
                </div>
              ))}
            </dl>
          </section>

          <BlocoMetodo
            id="fontes-serie"
            titulo={`As ${pesquisas.length} pesquisas que alimentam o painel`}
            simples={
              <p>
                Estas são as {pesquisas.length} pesquisas que alimentam o painel, com o número do
                registro no TSE e o link da publicação original de cada uma.
              </p>
            }
          >
            <p>Fontes da série ({pesquisas.length}), com período de campo e registro no TSE.</p>
          </BlocoMetodo>

          <section className="mt-6">
            <Subtitulo>Lista completa</Subtitulo>
            <ul className="mt-2 text-micro numeros">
              {fontes.map((p) => (
                <li
                  key={p.id}
                  className="flex min-h-toque flex-wrap items-center gap-x-4 gap-y-0.5 py-1"
                >
                  {p.fonte ? (
                    <LinkExterno href={p.fonte} className="whitespace-nowrap">
                      {p.instituto}
                    </LinkExterno>
                  ) : (
                    <span className="whitespace-nowrap text-tinta">{p.instituto}</span>
                  )}
                  <span className="whitespace-nowrap text-tinta-media">
                    pesquisa de {fmtData(p.inicio)}–{fmtData(p.fim)}/2026
                  </span>
                  <span className="text-tinta-media">{registroTse(p.tse)}</span>
                </li>
              ))}
            </ul>
          </section>

          <BlocoMetodo
            id="fontes-erros"
            titulo="De onde vieram os números de erro"
            simples={
              <p>
                Estas são as reportagens e os registros de onde saíram os números de erro de 2018,
                2022 e 2024.
              </p>
            }
          >
            <p>Fontes do histórico de erros das pesquisas.</p>
          </BlocoMetodo>

          <section className="mt-6">
            <ul className="text-micro">
              {FONTES_TRADUZIDAS.map((f) => (
                <li key={f.url} className="flex min-h-toque items-center">
                  <LinkExterno href={f.url}>{f.nome}</LinkExterno>
                </li>
              ))}
            </ul>
          </section>
        </Folha>
      </SeletorMetodologia>
    </main>
  );
}
