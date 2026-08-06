/**
 * O MEDIDOR — a outra forma de ver o mesmo número do enxame (aba "ponteiro").
 *
 * Um mostrador semicircular: esquerda é o lado de Flávio (naval), direita o de
 * Lula (carmim), e a zona central é a dúvida (o lilás da faixa, como em todo o
 * produto). A agulha aponta o MESMO número publicado na manchete — "em 100
 * eleições parecidas, N terminam com Lula eleito" — em tinta NEUTRA (nenhum
 * dos dois azuis/vermelhos: a agulha não torce).
 *
 * HONESTIDADE: nenhum número novo. O medidor é apresentação alternativa do
 * `eleito.dia` já carimbado; a legenda acessível reusa a frase da manchete.
 * SALVAGUARDA DE MARCA (MARCA.md §6.6.3): a agulha do LOGO nunca vira
 * instrumento — este medidor é linguagem de GRÁFICO (traço reto, pivô de
 * dado), não reutiliza o glifo da marca (DECISOES.md).
 *
 * Sem animação: agulha estática (nada anima dado — DESIGN-V2 §7.2).
 */

const CX = 100;
const CY = 100;
const RAIO = 88;
const ESPESSURA = 15;

/** Ângulo em graus para um valor 0–100: 180° = Flávio 100, 0° = Lula 100. */
function angulo(valor: number): number {
  return 180 - (valor / 100) * 180;
}

function polar(r: number, grausAng: number): [number, number] {
  const rad = (grausAng * Math.PI) / 180;
  return [CX + r * Math.cos(rad), CY - r * Math.sin(rad)];
}

/** Arco de `v1` a `v2` (valores 0–100) no raio `r`. */
function arco(v1: number, v2: number, r: number): string {
  const [x1, y1] = polar(r, angulo(v1));
  const [x2, y2] = polar(r, angulo(v2));
  return `M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r} ${r} 0 0 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`;
}

export function Medidor({
  valorLula,
  rotuloAcessivel,
}: {
  /** inteiro 0–100: em quantos dos 100 cenários Lula termina eleito */
  valorLula: number;
  /** reusa a frase carimbada da manchete — nenhum texto novo aqui */
  rotuloAcessivel: string;
}) {
  const v = Math.max(0, Math.min(100, valorLula));
  const ang = angulo(v);
  const [ax, ay] = polar(RAIO - ESPESSURA - 6, ang);
  const [tx, ty] = polar(RAIO + 14, ang);

  return (
    <figure role="img" aria-label={rotuloAcessivel} data-testid="medidor">
      <svg viewBox="0 0 200 118" className="mx-auto block w-full max-w-[34rem]">
        {/* trilho: lado Flávio · zona da dúvida (lilás, 45–55) · lado Lula */}
        <path
          d={arco(0, 45, RAIO)}
          fill="none"
          stroke="var(--color-flavio-fundo)"
          strokeWidth={ESPESSURA}
        />
        <path
          d={arco(45, 55, RAIO)}
          fill="none"
          stroke="var(--color-faixa)"
          strokeWidth={ESPESSURA}
        />
        <path
          d={arco(55, 100, RAIO)}
          fill="none"
          stroke="var(--color-lula-fundo)"
          strokeWidth={ESPESSURA}
        />
        {/* bordas finas dão o 3:1 de objeto gráfico de cada lado */}
        <path
          d={arco(0, 45, RAIO + ESPESSURA / 2)}
          fill="none"
          stroke="var(--color-flavio)"
          strokeWidth={1.5}
        />
        <path
          d={arco(45, 55, RAIO + ESPESSURA / 2)}
          fill="none"
          stroke="var(--color-faixa-borda)"
          strokeWidth={1.5}
        />
        <path
          d={arco(55, 100, RAIO + ESPESSURA / 2)}
          fill="none"
          stroke="var(--color-lula)"
          strokeWidth={1.5}
        />

        {/* ticks de escala: 0 · 25 · 50 · 75 · 100 */}
        {[0, 25, 50, 75, 100].map((t) => {
          const [x1, y1] = polar(RAIO - ESPESSURA / 2 - 2, angulo(t));
          const [x2, y2] = polar(RAIO + ESPESSURA / 2 + 2, angulo(t));
          return (
            <line
              key={t}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="var(--color-contorno)"
              strokeWidth={t === 50 ? 1.6 : 0.9}
            />
          );
        })}

        {/* rótulo da zona central — frase já consagrada nos gráficos */}
        <text
          x={CX}
          y={8}
          textAnchor="middle"
          fontSize={7.5}
          fill="var(--color-tinta-media)"
          className="rotulo-grafico"
        >
          metade a metade
        </text>

        {/* a agulha: tinta NEUTRA, pivô de dado — não é o glifo da marca */}
        <line
          x1={CX}
          y1={CY}
          x2={ax.toFixed(2)}
          y2={ay.toFixed(2)}
          stroke="var(--color-tinta)"
          strokeWidth={3}
          strokeLinecap="round"
        />
        <circle cx={CX} cy={CY} r={5} fill="var(--color-tinta)" />
        {/* o valor, encostado na ponta do lado apontado */}
        <text
          x={tx.toFixed(2)}
          y={ty.toFixed(2)}
          textAnchor={v >= 50 ? "start" : "end"}
          fontSize={9}
          fontWeight={600}
          fill="var(--color-tinta)"
          className="numeros"
        >
          {v}
        </text>

        {/* extremos nomeados — cor é codificação de DADO, nomes sempre juntos */}
        <text x={12} y={114} fontSize={8} fontWeight={600} fill="var(--color-flavio)">
          ← Flávio
        </text>
        <text
          x={188}
          y={114}
          textAnchor="end"
          fontSize={8}
          fontWeight={600}
          fill="var(--color-lula)"
        >
          Lula →
        </text>
        <text x={12} y={104} fontSize={7} fill="var(--color-tinta-media)" className="numeros">
          100
        </text>
        <text
          x={188}
          y={104}
          textAnchor="end"
          fontSize={7}
          fill="var(--color-tinta-media)"
          className="numeros"
        >
          100
        </text>
      </svg>
    </figure>
  );
}
