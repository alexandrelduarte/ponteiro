/**
 * /quem-somos — quem responde pelo site, quem paga a conta, o compromisso de
 * neutralidade (R4) e os canais de correção e de direito de resposta.
 *
 * Página de prosa no mesmo desenho da /metodologia (§5.7): coluna na medida de
 * leitura sobre a bruma, zero cartão decorativo. Fora da barra fixa por medida
 * (três itens): a porta de entrada é o rodapé — ver ROTAS_INSTITUCIONAIS.
 *
 * As bios de uma linha dos responsáveis chegam depois: até lá cada nome leva a
 * frase neutra "responsável pelo projeto" — verdadeira, sem placeholder.
 */
import type { Metadata } from "next";
import { Bloco, LinkExterno, LinkInterno, Nicho, Pergunta, Secao } from "@/components/ui/blocos";

export const metadata: Metadata = {
  title: "Quem faz o PONTEIRO",
  description:
    "Quem responde pelo site, quem paga a conta (só os autores — sem publicidade, doações ou " +
    "vínculos), o compromisso de neutralidade, como reportar um erro e como pedir direito de " +
    "resposta.",
  alternates: { canonical: "/quem-somos" },
};

const REPO = "https://github.com/alexandrelduarte/ponteiro";
const ISSUES = `${REPO}/issues`;

/** Nome forte + tinta média no corpo: o mesmo par da prosa da /metodologia. */
const B = "font-semibold text-tinta";

/** Seção de prosa: título + parágrafos na medida de leitura, dentro da placa. */
function SecaoProsa({
  id,
  titulo,
  children,
}: {
  id: string;
  titulo: string;
  children: React.ReactNode;
}) {
  return (
    <section aria-labelledby={id} className="mt-8 break-inside-avoid-column">
      <Pergunta id={id}>{titulo}</Pergunta>
      <div className="mt-2 max-w-texto space-y-3 text-corpo text-tinta-media">{children}</div>
    </section>
  );
}

export default function QuemSomos() {
  return (
    /* Mesma gramática do painel e do /historico: placas sobre a bruma,
       cabeçalho em duas colunas a partir de lg, prosa em DUAS colunas de
       leitura dentro da placa (recomposição desktop, DECISOES.md). */
    <main>
      <Secao>
        <Bloco rotuladoPor="titulo-quem-somos">
          <div className="lg:grid lg:grid-cols-[minmax(0,34rem)_minmax(0,1fr)] lg:items-start lg:gap-10">
            <div>
              <h1 id="titulo-quem-somos" className="text-pergunta text-tinta">
                Quem faz o PONTEIRO
              </h1>
              <p className="mt-3 max-w-texto">
                <LinkInterno href="/" className="text-corpo font-semibold">
                  ← voltar ao painel
                </LinkInterno>
              </p>
            </div>
            <p className="mt-2 max-w-texto text-intro text-tinta lg:mt-0">
              Duas pessoas respondem por este site — com nome, canal de contato e regras públicas
              para corrigir o que estiver errado.
            </p>
          </div>
        </Bloco>
      </Secao>

      <Secao>
        <Bloco rotuladoPor="responsaveis">
          <Pergunta id="responsaveis">Os responsáveis</Pergunta>
          <ul className="mt-3 grid gap-3 lg:grid-cols-2 lg:gap-10">
            <li>
              <Nicho>
                <p className="text-secao text-tinta">Alexandre Duarte</p>
                <p className="mt-1 text-corpo text-tinta-media">Responsável pelo projeto.</p>
              </Nicho>
            </li>
            <li>
              <Nicho>
                <p className="text-secao text-tinta">Pedro Nolasco</p>
                <p className="mt-1 text-corpo text-tinta-media">Responsável pelo projeto.</p>
              </Nicho>
            </li>
          </ul>
        </Bloco>
      </Secao>

      <Secao>
        <Bloco>
          <div className="lg:columns-2 lg:gap-10 lg:[column-fill:balance] lg:[&>section]:mt-0 lg:[&>section]:mb-8">
            <SecaoProsa id="financiamento" titulo="Quem paga a conta">
              <p>
                O PONTEIRO é financiado <b className={B}>exclusivamente pelos autores</b>. Não há
                publicidade. Não há doações. Não há qualquer vínculo com partidos, campanhas,
                candidatos, institutos de pesquisa ou veículos de imprensa.
              </p>
            </SecaoProsa>

            <SecaoProsa id="neutralidade" titulo="O compromisso de neutralidade">
              <p>
                Os dois candidatos recebem <b className={B}>o mesmo tratamento</b> em toda a tela:
                mesmo espaço, mesma letra, mesmo destaque. O vermelho e o azul existem só para
                marcar os dados de cada um — não são cor de torcida.
              </p>
              <p>
                Nenhuma página mostra imagem de pessoa, partido ou bandeira. E este site{" "}
                <b className={B}>não pede voto</b>: publica o que as pesquisas registradas no TSE
                mediram, sempre com o número de registro e o link da fonte à vista.
              </p>
            </SecaoProsa>

            <SecaoProsa id="auditoria" titulo="Tudo pode ser conferido">
              <p>
                O código do site é público, sob a licença AGPL-3.0, no{" "}
                <LinkExterno href={REPO}>repositório no GitHub</LinkExterno>. O modelo estatístico
                tem testes de paridade que comparam cada conta com a versão original, com tolerância
                de um bilionésimo (1e-9).
              </p>
              <p>
                Como cada número é calculado está na{" "}
                <LinkInterno href="/metodologia" className="text-corpo">
                  metodologia
                </LinkInterno>
                . Tudo o que entrou ou saiu da base está em{" "}
                <LinkInterno href="/historico" className="text-corpo">
                  o que já mudou
                </LinkInterno>
                , com data.
              </p>
            </SecaoProsa>

            <SecaoProsa id="correcoes" titulo="Achou um erro? Assim ele é corrigido">
              <p>
                Por ora, o canal é{" "}
                <LinkExterno href={ISSUES}>abrir uma issue no repositório do GitHub</LinkExterno> —
                um registro público, que qualquer pessoa pode acompanhar. Um e-mail dedicado entra
                em breve nesta página.
              </p>
              <p>
                O compromisso: analisamos todo aviso de erro <b className={B}>em até 72 horas</b>.
                Correção publicada aparece na{" "}
                <LinkInterno href="/historico" className="text-corpo">
                  lista do que já mudou
                </LinkInterno>
                , com data — o rastro técnico de cada alteração já existe e é público.
              </p>
              <p>
                Pesquisa <b className={B}>suspensa ou cassada pela Justiça Eleitoral</b> sai do ar
                em até 24 horas depois de tomarmos conhecimento da decisão.
              </p>
            </SecaoProsa>

            <SecaoProsa id="direito-de-resposta" titulo="Direito de resposta">
              <p>
                Quem se sentir atingido por algo publicado aqui tem{" "}
                <b className={B}>direito de resposta</b>, garantido pela Lei 13.188/2015. O pedido
                entra pelo mesmo canal acima.
              </p>
              <p>
                A resposta, quando devida, é publicada de forma{" "}
                <b className={B}>proporcional e com o mesmo destaque</b> do conteúdo que a motivou.
              </p>
            </SecaoProsa>
          </div>
        </Bloco>
      </Secao>
    </main>
  );
}
