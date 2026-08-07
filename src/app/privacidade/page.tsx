/**
 * /privacidade — a política de privacidade, aberta pelo que NÃO existe.
 *
 * O site não coleta nada de quem visita: sem cadastro, sem cookie para
 * visitante, sem publicidade, sem venda de dados, sem rastreamento entre
 * sites. O que sobra para declarar é pouco — medição agregada sem cookie,
 * logs de infraestrutura e um cookie de sessão restrito ao /admin — e está
 * declarado aqui, com base legal e canal para exercer direitos.
 *
 * Página de prosa no mesmo desenho da /metodologia (§5.7). Fora da barra fixa
 * por medida (três itens): a porta de entrada é o rodapé — ROTAS_INSTITUCIONAIS.
 */
import type { Metadata } from "next";
import { Bloco, LinkExterno, LinkInterno, Pergunta, Secao } from "@/components/ui/blocos";

export const metadata: Metadata = {
  title: "Privacidade",
  description:
    "Sem cadastro, sem cookie para visitante, sem publicidade, sem venda de dados. O que " +
    "existe: medição de audiência agregada e sem cookie, logs de infraestrutura e um cookie " +
    "de sessão só para os administradores — com base legal e canal para exercer seus direitos.",
  alternates: { canonical: "/privacidade" },
  openGraph: {
    title: "Privacidade",
    url: "/privacidade",
  },
  twitter: { title: "Privacidade" },
};

const REPO = "https://github.com/alexandrelduarte/ponteiro";
const ISSUES = `${REPO}/issues`;

/** Termo forte + tinta média no corpo: o mesmo par da prosa da /metodologia. */
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

export default function Privacidade() {
  return (
    /* Mesma gramática do painel: placas + cabeçalho em 2 colunas + prosa em
       2 colunas de leitura dentro da placa (recomposição desktop). */
    <main>
      <Secao>
        <Bloco rotuladoPor="titulo-privacidade">
          <div className="lg:grid lg:grid-cols-[minmax(0,34rem)_minmax(0,1fr)] lg:items-start lg:gap-10">
            <div>
              <h1 id="titulo-privacidade" className="text-pergunta text-tinta">
                Privacidade
              </h1>
              <p className="mt-3 max-w-texto">
                <LinkInterno href="/" className="text-corpo font-semibold">
                  ← voltar ao painel
                </LinkInterno>
              </p>
            </div>
            <p className="mt-2 max-w-texto text-intro text-tinta lg:mt-0">
              Este site não pede cadastro, não usa cookie para quem visita, não mostra publicidade,
              não vende nem compartilha seus dados e não rastreia você em outros sites.
            </p>
          </div>
        </Bloco>
      </Secao>

      <Secao>
        <Bloco>
          <div className="lg:columns-2 lg:gap-10 lg:[column-fill:balance] lg:[&>section]:mt-0 lg:[&>section]:mb-8">
            <SecaoProsa id="o-que-nao-existe" titulo="O que não existe aqui">
              <ul className="list-disc space-y-1 pl-5">
                <li>
                  <b className={B}>Sem cadastro:</b> você não informa nada para ler o site.
                </li>
                <li>
                  <b className={B}>Sem cookie para visitante:</b> nenhum — por isso não há banner de
                  cookies.
                </li>
                <li>
                  <b className={B}>Sem publicidade:</b> nenhum anúncio, nenhuma rede de anúncios.
                </li>
                <li>
                  <b className={B}>Sem venda ou compartilhamento de dados</b> com quem quer que
                  seja.
                </li>
                <li>
                  <b className={B}>Sem rastreamento entre sites:</b> o que você faz fora daqui não
                  nos interessa.
                </li>
              </ul>
            </SecaoProsa>

            <SecaoProsa id="audiencia" titulo="Como medimos a audiência">
              <p>
                Usamos o <b className={B}>Vercel Web Analytics</b>, uma medição{" "}
                <b className={B}>agregada e sem cookie</b>: contamos acessos, páginas vistas e
                origem do tráfego. Um identificador temporário, derivado da visita, se descarta
                diariamente. Nenhum visitante é identificado individualmente.
              </p>
              <p>
                Base legal: legítimo interesse (art. 7º, IX, da LGPD — Lei 13.709/2018) em saber
                quantas pessoas usam o site e o que leem, sem identificar ninguém.
              </p>
            </SecaoProsa>

            <SecaoProsa id="o-que-e-tratado" titulo="O que é tratado, afinal">
              <p>
                <b className={B}>Logs de infraestrutura</b>: endereço IP, tipo de navegador e
                horário de acesso, gerados automaticamente pela Vercel e pelo Supabase — as
                plataformas que servem o site. Servem para segurança e estabilidade: detectar
                ataque, abuso e falha.
              </p>
              <p>
                A retenção segue o prazo padrão dessas plataformas. Esses registros só são
                fornecidos a terceiros por <b className={B}>ordem judicial</b> (art. 15, § 3º, do
                Marco Civil da Internet — Lei 12.965/2014).
              </p>
            </SecaoProsa>

            <SecaoProsa id="cookies" titulo="Cookies">
              <p>
                Existe um único cookie no site: o <b className={B}>cookie de sessão</b> que mantém
                os dois administradores autenticados na área restrita (/admin). Para o público,
                nenhum — e é por isso que não há banner de cookies.
              </p>
            </SecaoProsa>

            <SecaoProsa id="pessoas-publicas" titulo="Conteúdo sobre pessoas públicas">
              <p>
                O site publica números de candidatos à Presidência, a partir de pesquisas
                registradas no TSE. Esse tratamento tem <b className={B}>fim jornalístico</b> (art.
                4º, II, &ldquo;a&rdquo;, da LGPD) e, por isso, fica fora do escopo material da lei.
              </p>
            </SecaoProsa>

            <SecaoProsa id="operadores" titulo="Quem opera a infraestrutura">
              <ul className="list-disc space-y-1 pl-5">
                <li>
                  <b className={B}>Vercel</b> — hospedagem do site e medição de audiência (Estados
                  Unidos).
                </li>
                <li>
                  <b className={B}>Supabase</b> — banco de dados e login dos administradores (região
                  São Paulo).
                </li>
                <li>
                  <b className={B}>OpenAI</b> — busca automatizada de pesquisas novas.{" "}
                  <b className={B}>Nenhum dado de visitante é enviado</b>: a IA só consulta a web
                  aberta, no servidor.
                </li>
              </ul>
            </SecaoProsa>

            <SecaoProsa id="seus-direitos" titulo="Seus direitos">
              <p>
                A LGPD (art. 18) garante a você, entre outros: confirmar se tratamos algum dado seu,
                acessar, corrigir, anonimizar ou eliminar esse dado, e saber com quem ele foi
                compartilhado.
              </p>
              <p>
                O canal para exercer esses direitos é o mesmo da página{" "}
                <LinkInterno href="/quem-somos" className="text-corpo">
                  quem faz o PONTEIRO
                </LinkInterno>
                : por ora,{" "}
                <LinkExterno href={ISSUES}>uma issue no repositório do GitHub</LinkExterno>; um
                e-mail dedicado entra em breve.
              </p>
              <p>
                O PONTEIRO se enquadra como{" "}
                <b className={B}>agente de tratamento de pequeno porte</b> (Resolução CD/ANPD nº
                2/2022): as obrigações formais são as simplificadas dessa norma, e os seus direitos
                valem por inteiro.
              </p>
            </SecaoProsa>

            <SecaoProsa id="versao" titulo="Versão desta política">
              <p className="numeros">
                Esta versão é de <b className={B}>05/08/2026</b>. O histórico de alterações fica no{" "}
                <LinkExterno href={REPO}>repositório público</LinkExterno>.
              </p>
            </SecaoProsa>
          </div>
        </Bloco>
      </Secao>
    </main>
  );
}
