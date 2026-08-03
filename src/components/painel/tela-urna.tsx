"use client";

/**
 * Tela da urna — o elemento-assinatura e o ÚNICO dominante visual da página
 * (docs/DESIGN.md §4.3 e §7.2).
 *
 * Duas linhas de probabilidade: dia da votação (grande, mais incerta) e cenário
 * atual (menor). A hierarquia é deliberadamente invertida em relação à certeza,
 * para que o número mais cravado nunca seja o mais gritado (P4).
 *
 * Renderizada no servidor com os parâmetros padrão: a manchete nunca espera JS.
 */
import { fmt, fmtSinal, pct } from "@/lib/modelo";
import { usePainel } from "./estado";

function LinhaProbabilidade({
  rotulo,
  pl,
  grande,
  idTeste,
}: {
  rotulo: string;
  pl: number;
  grande: boolean;
  idTeste: string;
}) {
  const larguraLula = Math.round(pl * 100);
  const tamanho = grande ? "text-manchete" : "text-manchete-2";

  return (
    <div className={grande ? "" : "opacity-90"}>
      <div className="font-mono text-xs tracking-dado text-fosforo uppercase">{rotulo}</div>
      <div className="mt-1 flex items-end justify-between gap-3">
        <div data-testid={`${idTeste}-lula`} className={`${tamanho} font-mono text-fosforo-forte`}>
          {pct(pl)}
        </div>
        <div
          className="mb-2 flex h-2.5 min-w-24 flex-1 overflow-hidden rounded-full bg-tela-fundo"
          role="img"
          aria-label={`Lula ${larguraLula}%, Flávio ${100 - larguraLula}%`}
        >
          <div className="bg-lula" style={{ width: `${larguraLula}%` }} />
          <div className="bg-flavio" style={{ width: `${100 - larguraLula}%` }} />
        </div>
        <div
          data-testid={`${idTeste}-flavio`}
          className={`${tamanho} font-mono text-right text-fosforo-forte`}
        >
          {pct(1 - pl)}
        </div>
      </div>
    </div>
  );
}

export function TelaUrna() {
  const { M, params, serieAlterada, pesquisas } = usePainel();
  const definicao1T = M.p1 ? M.p1.lulaDia + M.p1.flavioDia : null;

  return (
    <>
      <div className="tela-urna rounded-tela border border-tela-borda bg-tela p-tela shadow-tela md:p-tela-md">
        <div className="flex flex-col gap-1 font-mono text-xs tracking-tela text-fosforo uppercase sm:flex-row sm:items-center sm:justify-between">
          <span>CHANCE DE SER ELEITO · LULA (esq.) × FLÁVIO (dir.)</span>
          <span data-testid="disclaimer">
            LEITURA DOS DADOS · NÃO É PREVISÃO
            <span aria-hidden="true" className="animate-cursor">
              ▊
            </span>
          </span>
        </div>

        <div className="mt-4 space-y-5">
          <LinhaProbabilidade
            rotulo={`Projetado para o dia da votação (04–25/10, incerteza ±${fmt(M.sigmaDia2)} p.p.)`}
            pl={M.eleito.dia.l}
            grande
            idTeste="manchete"
          />
          <LinhaProbabilidade
            rotulo={`No cenário atual — se a votação fosse hoje (incerteza ±${fmt(M.sigmaHoje)} p.p.)`}
            pl={M.eleito.hoje.l}
            grande={false}
            idTeste="hoje"
          />
        </div>

        {params.vies !== 0 ? (
          <p data-testid="aviso-vies" className="mt-3 font-mono text-xs text-tela-alerta">
            ⚠ cenário com viés assumido de {fmt(params.vies)} p.p. pró-direita nas pesquisas (média
            bruta {fmtSinal(M.margem)} → margem efetiva {fmtSinal(M.margemAj)} p.p.)
          </p>
        ) : null}

        {serieAlterada ? (
          <p className="mt-2 font-mono text-xs text-tela-alerta">
            ⚠ série em simulação ({pesquisas.length} pesquisas)
          </p>
        ) : null}

        <div className="mt-5 border-t border-dashed border-tela-borda pt-4">
          <h2 data-testid="veredito-titulo" className="text-veredito text-fosforo-forte uppercase">
            {M.titulo}
          </h2>
          <p className="mt-1 max-w-texto text-sm leading-compacto text-fosforo">
            {M.texto} Caminho mais provável: {pct(M.p2Tacontece)} de chance de decisão no 2º turno
            em 25/10; definição já no 1º turno tem {pct(definicao1T)} de probabilidade.
          </p>
        </div>
      </div>

      <p className="mt-2 max-w-texto text-xs text-cinza">
        A diferença entre as duas linhas é o tempo: a projeção para outubro soma a «deriva» da
        opinião pública (campanha de TV, debates, fatos novos) à incerteza de hoje. Probabilidade
        não é previsão — é a fração de cenários compatíveis com os dados em que cada candidato
        termina eleito.
      </p>
    </>
  );
}
