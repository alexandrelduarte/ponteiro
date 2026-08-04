/**
 * Rodapé (COPY-DECK §T).
 *
 * A versão simples fica ACIMA do aviso legal, não no lugar dele: o texto legal
 * completo permanece íntegro, palavra por palavra. R3: a instrução "digite
 * «atualizar» no chat" saiu — não existe gatilho público de atualização.
 */
import { LinkInterno } from "@/components/ui/blocos";
import { ROTAS } from "@/app/_lib/site";
import { Simbolo } from "./marca";

export function Rodape() {
  return (
    <footer className="mx-auto mt-8 w-full max-w-pagina px-goteira pb-16 md:px-goteira-md lg:px-goteira-lg">
      <div className="rounded-bloco bg-placa p-bloco md:p-bloco-md">
        <div className="flex items-start gap-3">
          <Simbolo className="mt-1 h-7 w-auto shrink-0 text-ameixa" />
          <h2 className="text-pergunta text-tinta">Antes de sair, três coisas</h2>
        </div>

        <div className="mt-4 grid max-w-none gap-4 text-corpo text-tinta-media md:grid-cols-2">
          <p>
            <b className="font-semibold text-tinta">Isto não é previsão.</b> O que está aqui é uma
            chance: em quantas eleições parecidas com esta cada candidato termina eleito. Chance
            alta não é garantia, e chance baixa não é impossibilidade — um resultado de 20 em 100
            acontece uma vez a cada cinco disputas parecidas.
          </p>
          <p>
            <b className="font-semibold text-tinta">Os números não são nossos.</b> Cada pesquisa é
            de um instituto, tem registro na Justiça Eleitoral e link para a publicação original. Se
            a nossa leitura discordar da publicação, vale a publicação.
          </p>
          <p>
            <b className="font-semibold text-tinta">Ninguém aqui torce.</b> Esta é uma ferramenta de
            estudo, sem ligação com candidato, partido, instituto de pesquisa ou jornal. As
            suposições ficam à vista e você pode mexer em todas.
          </p>
          <p>
            <b className="font-semibold text-tinta">A lista só cresce com gente conferindo.</b>{" "}
            Pesquisa encontrada automaticamente fica esperando aprovação de uma pessoa, e toda
            entrada e saída fica registrada numa lista pública.
          </p>
        </div>

        <p className="mt-4 text-corpo text-tinta numeros">
          Eleições: 1º turno <b className="font-semibold">04/10/2026</b> · 2º turno{" "}
          <b className="font-semibold">25/10/2026</b>.
        </p>

        <nav aria-label="Páginas do site" className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
          {ROTAS.map((r) => (
            <LinkInterno key={r.href} href={r.href} className="text-corpo font-semibold">
              {r.titulo}
            </LinkInterno>
          ))}
        </nav>

        <div className="mt-6 rounded-nicho bg-nicho p-4 text-micro text-tinta-media">
          <p>
            <b className="font-semibold text-tinta">Aviso:</b> ferramenta estatística e educacional,
            sem vínculo com candidatos, partidos, institutos de pesquisa ou veículos de imprensa. Os
            números pertencem aos respectivos institutos e estão registrados no TSE sob os números
            indicados em cada linha da série; os links levam sempre à publicação original, que
            prevalece sobre qualquer leitura feita aqui.
          </p>
          <p className="mt-2">
            O que este site publica é uma <b className="font-semibold text-tinta">probabilidade</b>,
            não um resultado: a fração de cenários compatíveis com os dados em que cada candidato
            termina eleito, dadas premissas que ficam expostas e que você pode mudar nos parâmetros.
            Probabilidade alta não é garantia, e probabilidade baixa não é impossibilidade — um
            desfecho de 20% acontece uma vez a cada cinco disputas parecidas.
          </p>
          <p className="mt-2">
            A série só cresce por decisão humana: rodadas encontradas automaticamente entram como
            pendentes e alguém precisa aprová-las, com registro em auditoria pública. Simulações
            feitas na página (adicionar ou remover pesquisas, mover os sliders) valem apenas no seu
            navegador e nunca alteram a base oficial.
          </p>
          <p className="mt-2 numeros">
            Eleições: 1º turno <b className="font-semibold text-tinta">04/10/2026</b> · 2º turno{" "}
            <b className="font-semibold text-tinta">25/10/2026</b>.
          </p>
        </div>
      </div>
    </footer>
  );
}
