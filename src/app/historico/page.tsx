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
  LinkInterno,
  Pergunta,
  Resposta,
  Secao,
  Subtitulo,
  Traduzindo,
  Vazio,
} from "@/components/ui/blocos";
import { GraficoHistorico } from "@/components/historico/grafico";
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
  const [runs, feed] = await Promise.all([getSerieRuns(), getFeedTransparencia()]);

  const dados = runs
    .filter((r) => r.lula !== null && r.flavio !== null)
    .map((r) => ({
      x: Date.parse(r.em),
      l: (r.lula as number) * 100,
      f: (r.flavio as number) * 100,
    }))
    .filter((p) => Number.isFinite(p.x));

  return (
    <main>
      <Secao>
        <Bloco rotuladoPor="titulo-historico">
          <h1 id="titulo-historico" className="text-pergunta text-tinta">
            O que já mudou nesta página?
          </h1>
          <Resposta>
            Toda pesquisa que entrou ou saiu da lista está registrada aqui, com data.
          </Resposta>
          <Traduzindo>
            Este é o histórico do próprio painel. Ele existe para você poder conferir se algum
            número mudou de um dia para o outro — e por quê. Quem fez a alteração não aparece; o que
            aparece é o ato.
          </Traduzindo>
          <p className="mt-4">
            <LinkInterno href="/" className="text-corpo font-semibold">
              ← voltar ao painel
            </LinkInterno>
          </p>
        </Bloco>
      </Secao>

      <Secao>
        <Bloco rotuladoPor="titulo-grafico-historico">
          <Pergunta id="titulo-grafico-historico">Como a chance mudou com o tempo</Pergunta>
          <Traduzindo>
            Cada ponto é a chance calculada naquele dia, projetada para o dia da votação.
          </Traduzindo>

          {dados.length >= 2 ? (
            <>
              <div className="mt-4">
                <GraficoHistorico dados={dados} />
              </div>
              <p className="mt-2 text-micro text-tinta-media numeros">
                Vermelho: Lula. Azul: Flávio. {dados.length} retratos registrados, de{" "}
                {formatInTimeZone(dados[0].x, TZ, "dd/MM/yyyy")} a{" "}
                {formatInTimeZone(dados[dados.length - 1].x, TZ, "dd/MM/yyyy")}. Último valor: Lula{" "}
                {Math.round(dados[dados.length - 1].l)} em 100 × Flávio{" "}
                {Math.round(dados[dados.length - 1].f)} em 100.
              </p>
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
          <Pergunta id="titulo-linha-tempo">O que entrou e o que saiu da lista</Pergunta>
          {feed.length ? (
            <>
              <Traduzindo>
                Registro automático, gravado no momento da ação. Mostramos o ato e a data; não
                mostramos quem executou — publicar o nome de quem aprova convida a pressão sobre uma
                pessoa, e a auditoria não precisa disso para funcionar.
              </Traduzindo>
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
          <p className="mt-1 max-w-texto text-corpo text-tinta-media">
            Se a lista pudesse ser ajustada em silêncio — uma pesquisa inconveniente removida aqui,
            uma favorável adicionada ali — o número do topo seria opinião com cara de estatística.
            Quem quiser conferir não precisa da nossa boa-fé: compara esta lista com a publicação
            original de cada pesquisa.
          </p>
        </Bloco>
      </Secao>
    </main>
  );
}
