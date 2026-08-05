/**
 * A barra de cada pesquisa contra a linha do empate (docs/DESIGN-V2.md §4.3).
 *
 * É a terceira escala do elemento-assinatura: mesma régua, mesmo zero chamado
 * "empate", mesma convenção esquerda/direita. E é o que faz "empate técnico"
 * deixar de ser um selo de texto e virar geometria — quando a barra ATRAVESSA
 * a régua, não dá para dizer quem está na frente, e isso se vê.
 *
 * A barra tem o comprimento do DOBRO da folga da medida, porque é essa a folga
 * que vale na diferença entre dois candidatos (H5). Ela é monocromática, no
 * lilás da dúvida: os dois fundos de candidato são isócromos por exigência de
 * R4, então uma barra bicolor dividida no zero teria contraste ≈1,0 e sumiria
 * em P&B. Quem mostra o cruzamento é a régua de tinta (12,09:1 sobre o lilás).
 *
 * DOM e CSS puros: nada de Recharts numa lista de 13 linhas (P9).
 */
import type { LinhaModelo } from "@/lib/modelo";
import { abs1 } from "@/components/ui/textos";

export interface EscalaBarra {
  min: number;
  max: number;
}

/** Domínio comum a todas as linhas — sem ele as barras não são comparáveis. */
export function escalaDaSerie(linhas: readonly LinhaModelo[]): EscalaBarra {
  let alcance = 4;
  for (const l of linhas) {
    alcance = Math.max(alcance, Math.abs(l.margem2) + 2 * (l.moe || 2));
  }
  const limite = Math.ceil(alcance) + 1;
  return { min: -limite, max: limite };
}

const posicao = (v: number, escala: EscalaBarra) =>
  ((v - escala.min) / (escala.max - escala.min)) * 100;

/**
 * A RÉGUA da lista, rotulada uma vez no topo.
 *
 * Sem ela, cada cartão trazia uma barra sem eixo, sem rótulo e sem a palavra
 * "empate" ao lado da linha de tinta — a promessa de §4.3 ("empate técnico
 * deixa de ser badge de texto e passa a ser VISTO") não se cumpria, e o cartão
 * continuava dependendo do selo escrito. As três marcas usam exatamente a
 * mesma escala das barras, então o "empate" do rótulo cai no mesmo x da régua
 * de tinta de todas as linhas.
 *
 * O invariante só vale se a régua tiver A MESMA LARGURA E O MESMO RECUO das
 * barras que ela nomeia: uma régua esticada sobre um grid de duas colunas
 * aponta para o vão entre elas. Quem renderiza é responsável por isso — em
 * `serie-pesquisas.tsx` há uma cópia por coluna, cada uma com o recuo de 16px
 * do padding do cartão.
 */
export function ReguaPesquisas({ escala, className }: { escala: EscalaBarra; className?: string }) {
  return (
    /* DUAS FILEIRAS: "empate" em cima, sozinho, e as duas pontas embaixo. Numa
       fileira só, o rótulo do meio encostava em "← Flávio na frente" assim que
       a régua ficava estreita — a partir de md ela mede ~288px por coluna do
       grid, e a ponta esquerda sozinha já come 125 dos 144 que a metade tem.
       Empilhado, o rótulo do meio não disputa largura com ninguém e continua
       ancorado no mesmo x da régua de tinta. Ele fica na fileira DE BAIXO, que
       é a que encosta nos cartões: é dali que o olho desce para a régua de
       tinta de cada barra. */
    <p
      className={["relative h-10 text-micro text-tinta-media", className].filter(Boolean).join(" ")}
    >
      <span className="absolute top-0 left-0">← Flávio na frente</span>
      <span className="absolute top-0 right-0">Lula na frente →</span>
      <span
        className="absolute bottom-0 -translate-x-1/2 font-semibold whitespace-nowrap text-tinta"
        style={{ left: `${posicao(0, escala)}%` }}
      >
        empate
      </span>
    </p>
  );
}

export function BarraPesquisa({
  linha,
  escala,
  className,
  balaoNaLinha = false,
}: {
  linha: LinhaModelo;
  escala: EscalaBarra;
  className?: string;
  /**
   * Na tabela (lg+), a frase que o leitor de tela já ouvia vira BALÃO visível
   * quando o ponteiro passa pela linha. É o segundo momento-assinatura: a
   * barra que só era geometria passa a dizer, com todas as letras, por que
   * aquela pesquisa é ou não empate técnico. Só foi possível porque a rolagem
   * lateral do wrapper morreu — com `overflow-x: auto` o balão era recortado.
   */
  balaoNaLinha?: boolean;
}) {
  const folga = 2 * (linha.moe || 2);
  const inicio = posicao(linha.margem2 - folga, escala);
  const fim = posicao(linha.margem2 + folga, escala);
  const zero = posicao(0, escala);
  const ponto = posicao(linha.margem2, escala);
  const lado = linha.margem2 >= 0 ? "Lula" : "Flávio";

  const rotulo = linha.empate2
    ? `Diferença de ${abs1(linha.margem2)} pontos, dentro da folga de ${abs1(folga)} pontos: a barra atravessa a régua do empate.`
    : `Diferença de ${abs1(linha.margem2)} pontos a favor de ${lado}, fora da folga de ${abs1(folga)} pontos.`;

  return (
    /* Sem `min-w`: na tabela de larguras fixas um piso em `rem` dentro da
       célula era conteúdo estourando a coluna, e era ele que empurrava a
       tabela para os 943px que não cabiam nos 936 da placa. Onde a barra
       precisa de largura (o cartão), ela já tem a do cartão inteiro. */
    <div
      role="img"
      aria-label={rotulo}
      className={["relative h-6 w-full", className].filter(Boolean).join(" ")}
    >
      {/* `aria-hidden` + `pointer-events-none`: é a MESMA frase do `aria-label`
          acima, agora também para quem enxerga. Nada de novo é dito, nada
          recebe foco, e o balão nunca intercepta o ponteiro. */}
      {balaoNaLinha ? (
        <span
          aria-hidden="true"
          className={[
            "pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 hidden w-max max-w-[18rem]",
            "-translate-x-1/2 rounded-nicho bg-placa px-3 py-2 text-micro text-tinta shadow-erguido",
            "opacity-0 transition-opacity duration-(--dur-rapida) ease-(--ease-padrao)",
            "lg:block group-hover:opacity-100",
          ].join(" ")}
        >
          {rotulo}
        </span>
      ) : null}
      {/* A dúvida: comprimento = 2× a folga da medida, raio pleno, sem contorno. */}
      <span
        aria-hidden="true"
        className="absolute top-1/2 h-3 -translate-y-1/2 rounded-plena bg-faixa"
        style={{ left: `${inicio}%`, width: `${Math.max(fim - inicio, 0)}%` }}
      />
      {/* A régua do empate, à frente do lilás e atrás do ponto. */}
      <span
        aria-hidden="true"
        className="absolute inset-y-0 w-[3px] -translate-x-1/2 rounded-plena bg-tinta"
        style={{ left: `${zero}%` }}
      />
      {/* O valor medido, na cor de quem aparece à frente, com halo de placa. */}
      <span
        aria-hidden="true"
        className={[
          "absolute top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-plena",
          "shadow-[0_0_0_2px_var(--color-placa)]",
          linha.margem2 >= 0 ? "bg-lula" : "bg-flavio",
        ].join(" ")}
        style={{ left: `${ponto}%` }}
      />
    </div>
  );
}
