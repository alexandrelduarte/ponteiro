/**
 * /historico — a memória pública do painel.
 *
 * Duas peças: como a probabilidade se moveu ao longo do tempo (um ponto por
 * snapshot gravado) e a linha do tempo de transparência (o que entrou e o que
 * saiu da série, e quando). O feed é ANÔNIMO por desenho: mostra o ato, nunca
 * quem o praticou.
 */
import type { Metadata } from "next";
import Link from "next/link";
import { formatInTimeZone } from "date-fns-tz";
import { Cartao } from "@/components/ui/cartao";
import { Secao, Vazio } from "@/components/ui/basicos";
import { GraficoHistorico } from "@/components/historico/grafico";
import { Rodape } from "@/components/site/rodape";
import { getFeedTransparencia, getSerieRuns, type EventoTransparencia } from "@/lib/dados";

export const revalidate = 300;

const TZ = "America/Sao_Paulo";

export const metadata: Metadata = {
  title: "Histórico e transparência",
  description:
    "Como a probabilidade de eleição se moveu ao longo do tempo e o registro público de tudo " +
    "que entrou ou saiu da série de pesquisas — a prova de que o agregado não é ajustado a gosto.",
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
  const alvo = campo ? `pesquisa do ${instituto} (campo até ${campo})` : `pesquisa do ${instituto}`;

  if (e.acao === "aprovacao") return `${alvo} entrou na série`;
  if (e.acao === "inclusao_manual") return `${alvo} foi incluída manualmente na série`;
  return `${alvo} saiu da série`;
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
    <>
      <main>
        <header className="mx-auto w-full max-w-leitura px-goteira pt-8 lg:px-goteira-lg">
          <p className="font-mono text-xs tracking-sobretitulo text-confirma-texto uppercase">
            Memória pública do agregado
          </p>
          <h1 className="mt-1 text-titulo">HISTÓRICO E TRANSPARÊNCIA</h1>
          <p className="mt-2 max-w-texto text-sm leading-leitura text-cinza">
            Um agregador só vale o que vale a sua rastreabilidade. Se a série pudesse ser ajustada
            em silêncio — uma rodada inconveniente removida aqui, uma favorável adicionada ali — o
            número da capa seria opinião com cara de estatística. Por isso duas coisas ficam
            públicas: <b className="text-tinta">a trajetória da probabilidade</b>, que mostra se o
            painel mudou de ideia e quando, e{" "}
            <b className="text-tinta">o registro de cada entrada e saída da série</b>, gravado no
            mesmo instante em que acontece. Quem quiser auditar não precisa da nossa boa-fé: compara
            a linha do tempo com as fontes originais de cada pesquisa.{" "}
            <Link
              href="/"
              className="font-semibold text-confirma-texto underline decoration-dotted underline-offset-2"
            >
              ← voltar ao painel
            </Link>
          </p>
        </header>

        <Secao>
          <Cartao
            titulo="Probabilidade de ser eleito ao longo do tempo (projeção para o dia da votação)"
            destaque="tinta"
          >
            {dados.length >= 2 ? (
              <>
                <p className="mb-2 text-xs text-cinza">
                  Vermelho: Lula · Azul: Flávio. Cada ponto é um retrato gravado do modelo, com os
                  parâmetros padrão do painel. A linha tracejada em 50% é o limiar do favoritismo.
                </p>
                <GraficoHistorico dados={dados} />
                <p className="mt-1 text-xs text-cinza">
                  {dados.length} retratos registrados, de{" "}
                  {formatInTimeZone(dados[0].x, TZ, "dd/MM/yyyy")} a{" "}
                  {formatInTimeZone(dados[dados.length - 1].x, TZ, "dd/MM/yyyy")}. Último valor:
                  Lula {Math.round(dados[dados.length - 1].l)}% × Flávio{" "}
                  {Math.round(dados[dados.length - 1].f)}%.
                </p>
              </>
            ) : (
              <Vazio titulo="Ainda não há retratos suficientes para desenhar uma trajetória.">
                O gráfico precisa de pelo menos dois registros do modelo, e eles são gravados uma
                vez por dia. Enquanto o painel roda apenas sobre a base editorial — sem banco
                conectado — nenhum retrato é persistido, então esta série começa vazia por
                construção, e não por falha. O painel principal continua completo e correto.
              </Vazio>
            )}
          </Cartao>
        </Secao>

        <Secao>
          {/* Mesmo filete do cartão irmão: não há diferença semântica entre os
              dois blocos que justifique cores diferentes de régua. */}
          <Cartao titulo="Linha do tempo — o que entrou e o que saiu da série" destaque="tinta">
            {feed.length ? (
              <>
                <p className="mb-3 text-xs text-cinza">
                  Registro automático, gravado no momento da ação. Mostramos o ato e a data; não
                  mostramos quem executou — publicar o nome de quem aprova convida a pressão sobre
                  uma pessoa, e a auditoria não precisa disso para funcionar.
                </p>
                <ol className="space-y-2">
                  {feed.map((e) => (
                    <li key={e.id} className="flex gap-3 border-t border-linha pt-2 text-sm">
                      <span className="font-mono text-xs whitespace-nowrap text-cinza">
                        {formatInTimeZone(Date.parse(e.em), TZ, "dd/MM/yyyy HH:mm")}
                      </span>
                      <span className="text-tinta">{frase(e)}</span>
                    </li>
                  ))}
                </ol>
              </>
            ) : (
              <Vazio titulo="Nenhuma alteração registrada até agora.">
                A série exibida é a base editorial inicial, publicada de uma vez — não houve
                inclusão nem remoção depois disso. A partir da primeira aprovação, cada entrada e
                cada saída aparecem aqui automaticamente, com data e hora, sem depender de alguém
                lembrar de anotar.
              </Vazio>
            )}
          </Cartao>
        </Secao>
      </main>

      <Rodape />
    </>
  );
}
