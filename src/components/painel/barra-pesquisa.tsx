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

export function BarraPesquisa({
  linha,
  escala,
  className,
}: {
  linha: LinhaModelo;
  escala: EscalaBarra;
  className?: string;
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
    <div
      role="img"
      aria-label={rotulo}
      className={["relative h-6 w-full min-w-[7rem]", className].filter(Boolean).join(" ")}
    >
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
