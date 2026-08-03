/**
 * Rodapé — aviso legal ampliado (R3: a instrução "digite «atualizar» no chat"
 * saiu; não existe gatilho público de atualização) + navegação do site.
 */
import Link from "next/link";
import { ROTAS } from "@/app/_lib/site";

/**
 * `medida="texto"`: em páginas que são só prosa (nenhum cartão de largura
 * cheia acima), o aviso legal se alinha à medida de leitura em vez de avançar
 * ~212px para fora da margem direita de tudo o que está acima.
 */
export function Rodape({ medida = "leitura" }: { medida?: "leitura" | "texto" }) {
  return (
    <footer className="mx-auto mt-8 w-full max-w-leitura px-goteira pb-16 lg:px-goteira-lg">
      <nav aria-label="Páginas do site" className="mb-3 flex flex-wrap gap-x-4 gap-y-2 text-sm">
        {ROTAS.map((r) => (
          <Link
            key={r.href}
            href={r.href}
            className="inline-flex min-h-toque items-center font-semibold text-confirma-texto underline decoration-dotted underline-offset-2"
          >
            {r.titulo}
          </Link>
        ))}
      </nav>

      <div
        className={[
          "rounded-cartao border border-alerta bg-rodape-fundo p-cartao text-xs leading-leitura text-rodape-texto",
          medida === "texto" ? "max-w-texto" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <p>
          <b>Aviso:</b> ferramenta estatística e educacional, sem vínculo com candidatos, partidos,
          institutos de pesquisa ou veículos de imprensa. Os números pertencem aos respectivos
          institutos e estão registrados no TSE sob os números indicados em cada linha da série; os
          links levam sempre à publicação original, que prevalece sobre qualquer leitura feita aqui.
        </p>
        <p className="mt-2">
          O que este site publica é uma <b>probabilidade</b>, não um resultado: a fração de cenários
          compatíveis com os dados em que cada candidato termina eleito, dadas premissas que ficam
          expostas e que você pode mudar nos parâmetros. Probabilidade alta não é garantia, e
          probabilidade baixa não é impossibilidade — um desfecho de 20% acontece uma vez a cada
          cinco disputas parecidas.
        </p>
        <p className="mt-2">
          A série só cresce por decisão humana: rodadas encontradas automaticamente entram como
          pendentes e alguém precisa aprová-las, com registro em auditoria pública. Simulações
          feitas na página (adicionar ou remover pesquisas, mover os sliders) valem apenas no seu
          navegador e nunca alteram a base oficial.
        </p>
        <p className="mt-2">
          Eleições: 1º turno <b>04/10/2026</b> · 2º turno <b>25/10/2026</b>.
        </p>
      </div>
    </footer>
  );
}
