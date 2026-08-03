"use client";

/**
 * Bloco de gráficos do painel (docs/DESIGN.md §7.6).
 * Legenda ACIMA do gráfico (dentro come área útil em 390px) e, abaixo de cada
 * um, a alternativa textual obrigatória com os números atuais.
 */
import { useMemo } from "react";
import { Cartao } from "@/components/ui/cartao";
import { CaixaGrafico, ALTURA } from "@/components/graficos/comum";
import { DistribuicaoLazy, EvolucaoLazy } from "@/components/graficos/carregados";
import { calcDadosDist, calcPontosGrafico, fmt, pct } from "@/lib/modelo";
import { usePainel } from "./estado";

function Legenda({ children }: { children?: React.ReactNode }) {
  return (
    <p className="mb-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-cinza">
      {children}
    </p>
  );
}

function Amostra({ cor, children }: { cor: "lula" | "flavio"; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1">
      <span
        aria-hidden="true"
        className={`inline-block h-3 w-3 rounded-[2px] border border-linha-forte ${
          cor === "lula" ? "bg-lula" : "bg-flavio"
        }`}
      />
      {/* Um só filho ao lado da amostra: o `gap-1` do flex separa CADA filho, e
          com o número em `<span>` próprio apareciam folgas dentro do parêntese. */}
      <span>{children}</span>
    </span>
  );
}

export function Graficos() {
  const { M, turnoGrafico, definirTurnoGrafico } = usePainel();

  const pontos = useMemo(() => calcPontosGrafico(M, turnoGrafico), [M, turnoGrafico]);
  const dadosDist = useMemo(() => calcDadosDist(M), [M]);
  const serie = turnoGrafico === 2 ? M.serie2 : M.serie1;

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Cartao
        titulo={
          <span className="flex flex-wrap items-center gap-3">
            <span>Evolução — pontos por pesquisa + média ponderada</span>
            <span
              className="inline-flex overflow-hidden rounded-controle border border-cinza"
              role="group"
              aria-label="Turno exibido no gráfico de evolução"
            >
              {([1, 2] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  data-testid={`turno-grafico-${t}`}
                  onClick={() => definirTurnoGrafico(t)}
                  aria-pressed={turnoGrafico === t}
                  className={`min-h-toque px-3 text-xs font-semibold ${
                    turnoGrafico === t ? "bg-tinta text-texto-inverso" : "text-tinta"
                  }`}
                >
                  {t}º turno
                </button>
              ))}
            </span>
          </span>
        }
      >
        <Legenda>
          <Amostra cor="lula">Lula</Amostra>
          <Amostra cor="flavio">Flávio</Amostra>
          <span>linha = média ponderada · ponto = pesquisa</span>
        </Legenda>
        <CaixaGrafico altura={ALTURA.evolucao}>
          <EvolucaoLazy serie={serie} pontos={pontos} turno={turnoGrafico} />
        </CaixaGrafico>
        <p className="mt-1 text-xs text-cinza">
          Vermelho: Lula · Azul: Flávio. Linhas = média ponderada por recência e amostra; pontos =
          pesquisas individuais.
          {turnoGrafico === 1
            ? " Nem todo instituto divulgou o 1º turno nas rodadas antigas — a série é mais curta."
            : ""}{" "}
          Hoje a média do {turnoGrafico}º turno está em{" "}
          <span className="font-mono">{fmt(serie.at(-1)?.l)}%</span> para Lula e{" "}
          <span className="font-mono">{fmt(serie.at(-1)?.f)}%</span> para Flávio. Toque no gráfico
          para ver os valores de cada ponto.
        </p>
      </Cartao>

      <Cartao titulo="Distribuição projetada da margem no dia da eleição (2º turno)">
        <Legenda>
          <Amostra cor="lula">
            Lula vence (<span className="font-mono">{pct(M.pL2dia)}</span>)
          </Amostra>
          <Amostra cor="flavio">
            Flávio vence (<span className="font-mono">{pct(1 - M.pL2dia)}</span>)
          </Amostra>
          <span>eixo: margem Lula−Flávio (p.p.)</span>
        </Legenda>
        <CaixaGrafico altura={ALTURA.distribuicao}>
          <DistribuicaoLazy dados={dadosDist} />
        </CaixaGrafico>
        <p className="mt-1 text-xs text-cinza">
          Eixo: margem Lula−Flávio (p.p.). Área vermelha = cenários em que Lula vence o 2º turno (
          <span className="font-mono">{pct(M.pL2dia)}</span>); azul = Flávio (
          <span className="font-mono">{pct(1 - M.pL2dia)}</span>). A área azul existente à esquerda
          do zero é exatamente o «espaço de virada» que os dados ainda comportam. O centro da
          distribuição está em <span className="font-mono">{fmt(M.margemAj)} p.p.</span>, com desvio
          de <span className="font-mono">±{fmt(M.sigmaDia2)} p.p.</span>
        </p>
      </Cartao>
    </div>
  );
}
