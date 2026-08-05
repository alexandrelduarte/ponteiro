/**
 * Rodapé (COPY-DECK §T).
 *
 * UMA FONTE SÓ POR PÁGINA. O rodapé trazia dois textos empilhados — "Antes de
 * sair, três coisas" (editorial, quatro parágrafos em corpo) e o "Aviso:"
 * (jurídico, três parágrafos em micro) — que diziam a mesma coisa duas vezes,
 * na mesma tela, nas três páginas públicas: 40 palavras verbatim só no primeiro
 * par ("Chance alta não é garantia, e chance baixa não é impossibilidade — um
 * resultado de 20 em 100 acontece uma vez a cada cinco disputas parecidas"),
 * mais a propriedade dos números e a aprovação humana da lista. VOZ §4 bane
 * explicar o óbvio duas vezes na mesma tela, e em /historico o par ocupava
 * 43,5% da página inteira.
 *
 * A versão que fica é a JURÍDICA, íntegra palavra por palavra — é ela que
 * carrega a obrigação. O editorial não some do produto: cada uma das suas
 * quatro afirmações já estava dita dentro do aviso (não é previsão · os
 * números são dos institutos e a publicação prevalece · sem vínculo com
 * ninguém e as suposições ficam à vista · a lista só cresce por decisão
 * humana). O que ele tinha de próprio era o DESTAQUE: por isso o parágrafo da
 * chance sobe para primeiro e ganha o mesmo "Isto não é previsão." em negrito.
 *
 * R3: a instrução "digite «atualizar» no chat" saiu — não existe gatilho
 * público de atualização.
 */
import { LinkInterno } from "@/components/ui/blocos";
import { ROTAS } from "@/app/_lib/site";

export function Rodape() {
  return (
    <footer className="mx-auto mt-8 w-full max-w-pagina px-goteira pb-16 md:px-goteira-md lg:px-goteira-lg">
      <div className="rounded-bloco bg-placa p-bloco md:p-bloco-md">
        {/* Sem o símbolo como ornamento: MARCA.md §6.6.10 dá ao PONTEIRO uma
            aparição por tela, e ela é o cabeçalho. */}
        <h2 className="text-pergunta text-tinta">Antes de sair</h2>

        {/* O aviso legal, TRADUZIDO — ele é a superfície de 100% de alcance
            (aparece nas três páginas públicas) e carregava cinco palavras
            banidas por VOZ §5.1: "probabilidade", "premissas", "parâmetros",
            "rodadas" e "sliders" (esta última em inglês). Nada foi retirado:
            cada obrigação legal continua dita, com as palavras do deck.
            A linha das datas fica FORA daqui — ela é informação de calendário,
            não obrigação legal. */}
        {/* A partir de lg o aviso vira TRÊS colunas: numa placa de 1056px, o
            parágrafo corrido passava de 110 caracteres de medida — o dobro do
            que §5.7 aceita —, e em duas colunas o terceiro parágrafo ficava
            órfão numa fileira só dele. São três parágrafos: são três colunas,
            de ~310px cada, dentro da medida de leitura em `text-micro`. */}
        <div className="mt-4 grid gap-x-10 gap-y-2 rounded-nicho bg-nicho p-4 text-micro text-tinta-media lg:grid-cols-3 lg:items-start">
          <p>
            <b className="font-semibold text-tinta">Isto não é previsão.</b> O que este site publica
            é uma <b className="font-semibold text-tinta">chance</b>, não um resultado: em quantas
            eleições parecidas com esta cada candidato termina eleito, dadas as suposições que ficam
            à vista e que você pode mudar nas réguas. Chance alta não é garantia, e chance baixa não
            é impossibilidade — um resultado de 20 em 100 acontece uma vez a cada cinco disputas
            parecidas.
          </p>
          <p>
            <b className="font-semibold text-tinta">Aviso:</b> ferramenta estatística e educacional,
            sem vínculo com candidatos, partidos, institutos de pesquisa ou veículos de imprensa. Os
            números pertencem aos respectivos institutos e estão registrados no TSE sob os números
            indicados em cada linha da lista; os links levam sempre à publicação original, que
            prevalece sobre qualquer leitura feita aqui.
          </p>
          <p>
            A lista só cresce por decisão humana: as pesquisas encontradas automaticamente entram
            como pendentes e uma pessoa precisa aprová-las, com registro numa lista pública. As
            simulações feitas na página (acrescentar ou tirar pesquisas, mexer nas réguas) valem só
            no seu navegador e nunca alteram a base oficial.
          </p>
        </div>

        <p className="mt-4 text-corpo text-tinta numeros">
          Eleições: 1º turno <b className="font-semibold">04/10/2026</b> · 2º turno{" "}
          <b className="font-semibold">25/10/2026</b>.
        </p>

        <nav aria-label="Todas as páginas" className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
          {ROTAS.map((r) => (
            <LinkInterno key={r.href} href={r.href} className="text-corpo font-semibold">
              {r.titulo}
            </LinkInterno>
          ))}
        </nav>
      </div>
    </footer>
  );
}
