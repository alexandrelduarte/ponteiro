/**
 * /historico — a memória pública do painel (COPY-DECK §V).
 *
 * Duas peças: como a chance se moveu ao longo do tempo (um ponto por retrato
 * gravado) e a lista do que entrou e do que saiu da série. O feed é ANÔNIMO por
 * desenho: mostra o ato, nunca quem o praticou.
 *
 * Mesma gramática do painel: título-pergunta, blocos-conversa, régua do empate
 * onde houver diferença.
 */
import type { Metadata } from "next";
import { formatInTimeZone } from "date-fns-tz";
import {
  Bloco,
  Cabecalho,
  LinkInterno,
  Resposta,
  Secao,
  Subtitulo,
  Traduzindo,
  Vazio,
} from "@/components/ui/blocos";
import { GraficoHistorico } from "@/components/historico/grafico";
import { prepararSerieHistorico } from "@/components/historico/serie";
import { parEmCem } from "@/components/ui/textos";
import { getFeedTransparencia, getSerieRuns, type EventoTransparencia } from "@/lib/dados";

export const revalidate = 300;

const TZ = "America/Sao_Paulo";

export const metadata: Metadata = {
  title: "O que já mudou",
  description:
    "Como a chance de cada candidato se moveu ao longo do tempo e o registro público de tudo " +
    "que entrou ou saiu da lista de pesquisas — a prova de que os números não são ajustados a gosto.",
  alternates: { canonical: "/historico" },
};

const texto = (v: unknown): string | null =>
  typeof v === "string" && v.trim().length > 0 && v.length <= 80 ? v : null;

function ddmm(iso: string | null): string | null {
  if (!iso) return null;
  const [, m, d] = iso.split("-");
  return d && m ? `${d}/${m}` : null;
}

/** Frase pública do evento — sem ator, sem identificadores internos. */
function frase(e: EventoTransparencia): string {
  const instituto = texto(e.detalhes?.instituto_id) ?? "instituto não identificado";
  const campo = ddmm(texto(e.detalhes?.campo_fim));
  const alvo = campo ? `${instituto}, pesquisa de ${campo}` : instituto;
  return e.acao === "remocao" ? `saiu: ${alvo}` : `entrou: ${alvo}`;
}

export default async function Historico() {
  const [runs, feed] = await Promise.all([getSerieRuns(500), getFeedTransparencia()]);
  const serie = prepararSerieHistorico(runs);
  const { dados, fronteiraMs, nRegistrados, nReconstituidos } = serie;

  // Par publicado soma SEMPRE 100, com piso/teto de prosa (H3/H13 — carimbo
  // §13.4); datas com ano só quando a série cruza ano (VOZ §8).
  const ultimo = dados[dados.length - 1];
  const parUltimo = ultimo ? parEmCem((ultimo.l ?? ultimo.lR ?? 0) / 100) : ["–", "–"];
  const formatoData =
    dados.length &&
    formatInTimeZone(dados[0].x, TZ, "yyyy") ===
      formatInTimeZone(dados[dados.length - 1].x, TZ, "yyyy")
      ? "dd/MM"
      : "dd/MM/yyyy";

  return (
    <main>
      <Secao>
        {/* Mesma disposição de duas colunas dos blocos da home a partir de lg:
            a resposta na medida de leitura à esquerda e o traduzindo na faixa
            que sobrava à direita. Em coluna única este bloco deixava 46,6% da
            placa de 936px em branco — o mesmo "L" que a home já tinha
            corrigido. A ORDEM DE LEITURA não muda: é a do DOM. */}
        <Bloco rotuladoPor="titulo-historico">
          <div className="lg:grid lg:grid-cols-[minmax(0,34rem)_minmax(0,1fr)] lg:items-start lg:gap-10">
            <div>
              <h1 id="titulo-historico" className="text-pergunta text-tinta">
                O que já mudou nesta página?
              </h1>
              <Resposta>
                Toda pesquisa que entrou ou saiu da lista está registrada aqui, com data.
              </Resposta>
            </div>
            <Traduzindo className="lg:mt-0">
              Este é o histórico do próprio painel. Ele existe para você poder conferir se algum
              número mudou de um dia para o outro — e por quê. Quem fez a alteração não aparece; o
              que aparece é o ato.
            </Traduzindo>
          </div>
          <p className="mt-4">
            <LinkInterno href="/" className="text-corpo font-semibold">
              ← voltar ao painel
            </LinkInterno>
          </p>
        </Bloco>
      </Secao>

      <Secao>
        <Bloco rotuladoPor="titulo-grafico-historico">
          <Cabecalho
            id="titulo-grafico-historico"
            pergunta="Como a chance mudou com o tempo"
            traduzindo="Cada ponto é a chance projetada para o dia da votação, calculada só com as pesquisas conhecidas até aquela data."
          />

          {dados.length >= 2 ? (
            <>
              <div className="mt-4">
                <GraficoHistorico dados={dados} fronteiraMs={fronteiraMs} />
              </div>
              {nReconstituidos > 0 ? (
                <p className="mt-2 text-micro text-tinta-media">
                  A linha tracejada foi calculada depois: este painel ainda não existia. Fizemos a
                  mesma conta em cada data passada, usando só as pesquisas conhecidas até ali.
                  {fronteiraMs !== null ? (
                    <>
                      {" "}
                      A linha cheia é o registro feito no próprio dia, desde{" "}
                      {formatInTimeZone(fronteiraMs, TZ, formatoData)}.
                    </>
                  ) : null}
                </p>
              ) : null}
              <p className="mt-2 text-micro text-tinta-media numeros">
                Vermelho: Lula. Azul: Flávio. {nRegistrados}{" "}
                {nRegistrados === 1 ? "retrato registrado" : "retratos registrados"} no dia
                {nReconstituidos > 0
                  ? ` e ${nReconstituidos} ${
                      nReconstituidos === 1 ? "ponto calculado" : "pontos calculados"
                    } depois`
                  : ""}
                , de {formatInTimeZone(dados[0].x, TZ, formatoData)} a{" "}
                {formatInTimeZone(dados[dados.length - 1].x, TZ, formatoData)}. Último valor: Lula{" "}
                {parUltimo[0]} em 100 × Flávio {parUltimo[1]} em 100.
              </p>
              {nReconstituidos > 0 ? (
                <p className="mt-2 max-w-texto text-micro text-tinta-media">
                  Na linha tracejada, &ldquo;conhecida&rdquo; quer dizer: trabalho de campo
                  encerrado até aquela data. Na época, cada pesquisa só chegou ao público depois do
                  fim do campo — em geral, alguns dias depois. Então a linha tracejada enxerga cada
                  pesquisa um pouco antes do que o público enxergou. Parte do movimento de um dia
                  para o outro também vem do calendário: quanto menos tempo falta, menos a corrida
                  ainda pode andar.
                </p>
              ) : null}
            </>
          ) : (
            <div className="mt-4">
              <Vazio
                titulo="Ainda não há pesquisas suficientes para desenhar uma linha do tempo."
                ilustracao={{ src: "/ilustracoes/vazio-sem-conexao.svg", alt: "" }}
              >
                Assim que houver, ela aparece aqui. O gráfico precisa de pelo menos dois retratos do
                modelo, e eles são gravados uma vez por dia — enquanto o painel roda só com a lista
                guardada no próprio site, nenhum retrato é persistido. O painel principal continua
                completo e correto.
              </Vazio>
            </div>
          )}
        </Bloco>
      </Secao>

      <Secao>
        <Bloco rotuladoPor="titulo-linha-tempo">
          <Cabecalho
            id="titulo-linha-tempo"
            pergunta="O que entrou e o que saiu da lista"
            traduzindo="Registro automático, gravado no momento da ação. Mostramos o ato e a data; não mostramos quem executou — publicar o nome de quem aprova convida a pressão sobre uma pessoa, e a auditoria não precisa disso para funcionar."
          />
          {feed.length ? (
            <>
              <ol className="mt-4 space-y-2">
                {feed.map((e) => (
                  <li key={e.id} className="flex flex-wrap gap-x-3 border-t border-filete pt-2">
                    <span className="text-micro whitespace-nowrap text-tinta-media numeros">
                      {formatInTimeZone(Date.parse(e.em), TZ, "dd/MM/yyyy HH:mm")}
                    </span>
                    <span className="text-corpo text-tinta">{frase(e)}</span>
                  </li>
                ))}
              </ol>
            </>
          ) : (
            <div className="mt-4">
              <Vazio titulo="Nenhuma mudança registrada até agora.">
                A lista exibida é a inicial, publicada de uma vez — não houve inclusão nem remoção
                depois disso. A partir da primeira aprovação, cada entrada e cada saída aparecem
                aqui automaticamente, com data e hora, sem depender de alguém lembrar de anotar.
              </Vazio>
            </div>
          )}
          <Subtitulo className="mt-6">Por que isto existe</Subtitulo>
          <div className="mt-1 lg:grid lg:grid-cols-2 lg:items-start lg:gap-10">
            <p className="max-w-texto text-corpo text-tinta-media">
              Se a lista pudesse ser ajustada em silêncio — uma pesquisa inconveniente removida
              aqui, uma favorável adicionada ali — o número do topo seria opinião com cara de
              estatística.
            </p>
            <p className="mt-3 max-w-texto text-corpo text-tinta-media lg:mt-0">
              Quem quiser conferir não precisa da nossa boa-fé: compara esta lista com a publicação
              original de cada pesquisa.
            </p>
          </div>
        </Bloco>
      </Secao>
    </main>
  );
}
