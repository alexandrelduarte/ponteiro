"use client";

/**
 * Série de pesquisas — tabela ⇄ cartões (docs/DESIGN.md §7.5).
 *
 * Abaixo de `md` a série é uma LISTA de cartões; a partir de `md` é uma tabela
 * completa com `caption`/`scope`. São duas árvores alternadas por `hidden`, e
 * não uma tabela com `display:block`, para preservar a semântica nos dois casos.
 *
 * Adicionar/remover/restaurar são MODO SIMULAÇÃO (R5): estado local rotulado,
 * a base oficial nunca muda.
 */
import { useState } from "react";
import { Cartao } from "@/components/ui/cartao";
import { Chip, LinkExterno } from "@/components/ui/basicos";
import { fmt, fmtData, type LinhaModelo } from "@/lib/modelo";
import { usePainel } from "./estado";
import { FormularioPesquisa } from "./formulario-pesquisa";

/** Inteiro no formato brasileiro, sem depender de ICU (hidratação estável). */
const fmtInt = (n: number | null | undefined): string =>
  n == null || !isFinite(n) ? "–" : String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ".");

const PESO_BAIXO = 0.15;

/**
 * `n` e `±MoE` só a partir de `lg` (docs/DESIGN.md §7.5).
 *
 * Entre `md` (768) e `lg` (1140) as 10 colunas somavam 808px de conteúdo em um
 * wrapper de 694px: o registro do TSE — dado obrigatório de P9 — aparecia como
 * `BR-07…` em todas as 13 linhas e o `×` ficava fora da área visível, no
 * retrato de iPad, que é justamente a largura em que a spec manda a tabela
 * completa voltar. Amostra e margem de erro são as duas colunas SECUNDÁRIAS da
 * linha (continuam nos cartões abaixo de `md` e voltam inteiras em `lg`),
 * então são elas que cedem para o resto caber sem gesto.
 */
const COLUNA_SECUNDARIA = "hidden lg:table-cell";

function leitura(l: LinhaModelo) {
  if (l.empate2) return { texto: "empate técnico", tom: "alerta" as const };
  return {
    texto: l.margem2 >= 0 ? "Lula à frente" : "Flávio à frente",
    tom: "confirma" as const,
  };
}

function rotuloRemover(l: LinhaModelo) {
  return `Remover pesquisa do ${l.instituto}, campo ${fmtData(l.inicio)} a ${fmtData(
    l.fim,
  )} (simulação)`;
}

function Selos({ l }: { l: LinhaModelo }) {
  if (!l.usuario && !l.auto) return null;
  return (
    <span className="ml-1 text-xs text-alerta-texto">
      {l.usuario ? "(usuário)" : "(auto — confira a fonte)"}
    </span>
  );
}

function NomeInstituto({ l }: { l: LinhaModelo }) {
  return (
    <>
      {l.fonte ? <LinkExterno href={l.fonte}>{l.instituto}</LinkExterno> : l.instituto}
      <Selos l={l} />
    </>
  );
}

/**
 * Hierarquia de peso sem tocar em contraste (P8 / §7.5): linhas com `w < 0,15`
 * recuam para `--color-cinza` (4,64:1 sobre papel, 4,94:1 sobre o mini) em vez
 * de perder opacidade — `opacity-55` derrubava o texto abaixo do piso AA. O
 * fundo `bg-mini` e o rótulo «peso baixo» completam os três canais.
 */
const tomLinha = (baixo: boolean) => ({
  nome: baixo ? "text-cinza" : "text-tinta",
  lula: baixo ? "text-cinza" : "text-lula-escuro",
  flavio: baixo ? "text-cinza" : "text-flavio-escuro",
  fundo: baixo ? "bg-mini" : "bg-cartao",
});

/** O registro do TSE é inquebrável; a exceção textual («registrada (nº n/d na
 *  fonte)») pode quebrar — era ela que inflava a coluna em 90px e empurrava a
 *  página inteira para a rolagem horizontal em 768. */
const classeTse = (tse: string) => (tse.includes(" ") ? "" : "whitespace-nowrap");

export function SeriePesquisas() {
  const { M, pesquisas, removerPesquisa, restaurarSerie, adicionarPesquisa, serieAlterada } =
    usePainel();
  const [formAberto, setFormAberto] = useState(false);

  const linhas = [...M.linhas].reverse();

  return (
    <Cartao
      idTitulo="titulo-serie"
      titulo={`Série de pesquisas (${pesquisas.length}) · da mais recente para a mais antiga`}
    >
      {serieAlterada ? (
        <p
          role="status"
          aria-live="polite"
          className="mb-3 rounded-controle border border-alerta bg-alerta-fundo px-3 py-2 font-mono text-xs text-alerta-texto"
        >
          ⚠ simulação — não altera a base oficial. As linhas marcadas «(usuário)» só existem nesta
          sessão.
        </p>
      ) : null}

      {/* ---------- 390px: cartões empilhados ---------- */}
      <ul className="flex flex-col gap-3 md:hidden" aria-label="Série de pesquisas">
        {linhas.map((l) => {
          const chip = leitura(l);
          const baixo = l.w < PESO_BAIXO;
          const tom = tomLinha(baixo);
          return (
            <li key={l.id} className={`rounded-cartao border border-linha p-cartao ${tom.fundo}`}>
              <div className="flex items-start justify-between gap-2">
                <p className={`text-sm font-semibold ${tom.nome}`}>
                  <NomeInstituto l={l} />
                </p>
                <p className="font-mono text-xs whitespace-nowrap text-cinza">
                  peso {fmt(l.w, 2)}
                  {baixo ? <span className="block text-right">peso baixo</span> : null}
                </p>
              </div>
              <p className="mt-1 font-mono text-xs text-cinza">
                campo {fmtData(l.inicio)}–{fmtData(l.fim)}
              </p>

              <p className="mt-2 font-mono text-xs tracking-etiqueta text-cinza uppercase">
                2º turno
              </p>
              {/* Os dois candidatos ficam LADO A LADO em uma linha só (§7.5):
                  cada nome viaja colado ao seu número (`whitespace-nowrap`) e o
                  nome recua um degrau para o par caber em 390px. */}
              <p className="flex items-baseline justify-between gap-2 font-mono">
                <span className={`whitespace-nowrap ${tom.lula}`}>
                  <span className="text-sm">Lula</span>{" "}
                  <span className="text-dado">{fmt(l.t2.lula)}%</span>
                </span>
                <span className="text-cinza">×</span>
                <span className={`whitespace-nowrap ${tom.flavio}`}>
                  <span className="text-sm">Flávio</span>{" "}
                  <span className="text-dado">{fmt(l.t2.flavio)}%</span>
                </span>
              </p>
              <p className="mt-2">
                <Chip tom={chip.tom}>{chip.texto}</Chip>
              </p>

              <p className="mt-2 font-mono text-xs text-cinza">
                1º turno{" "}
                {l.t1 && l.t1.lula != null ? `${fmt(l.t1.lula)}% × ${fmt(l.t1.flavio)}%` : "n/d"} ·
                n {fmtInt(l.n)}
              </p>
              {/* `items-center`: o botão de 44px define a altura da linha e o
                  metadado se assenta ao lado dele, sempre — antes o `items-end`
                  deixava uma faixa vazia acima em quase todos os cartões. */}
              <div className="flex items-center justify-between gap-2">
                <p className="font-mono text-xs text-cinza">
                  ±{fmt(l.moe, 1)} p.p. · {l.tse}
                </p>
                <button
                  type="button"
                  onClick={() => removerPesquisa(l.id)}
                  aria-label={rotuloRemover(l)}
                  className="min-h-toque min-w-toque shrink-0 rounded-controle text-cinza"
                >
                  ×
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      {/* ---------- md+: tabela completa ----------
          `relative` não é decoração: sem posicionar o wrapper, o `sr-only` do
          último `<th>` (que é `position:absolute`) escapa do recorte da região
          rolável, tem a viewport como bloco contêiner e empurrava o
          `documentElement.scrollWidth` para 858px em um viewport de 768 —
          rolagem horizontal na PÁGINA, que o §11 proíbe. Com o wrapper
          posicionado, a rolagem fica onde deve: dentro dele, com a afordância
          de borda de `.rolagem-x`. */}
      <div
        className="relative hidden overflow-x-auto md:block rolagem-x"
        role="group"
        tabIndex={0}
        aria-labelledby="titulo-serie"
      >
        <table className="w-full font-mono text-sm">
          <caption className="sr-only">
            Série de pesquisas do agregado, da mais recente para a mais antiga: instituto, período
            de campo, amostra, margem de erro, resultados de 1º e 2º turno, leitura do 2º turno,
            peso no agregado e registro no TSE.
          </caption>
          <thead>
            <tr className="text-left text-xs text-cinza uppercase">
              {[
                { t: "Instituto" },
                { t: "Campo" },
                { t: "n", secundaria: true },
                { t: "±MoE", secundaria: true },
                { t: "1ºT L×F" },
                { t: "2ºT L×F" },
                { t: "Leitura 2ºT" },
                { t: "Peso" },
                { t: "Registro TSE" },
              ].map(({ t, secundaria }) => (
                <th
                  key={t}
                  scope="col"
                  className={[
                    "py-2 pr-1.5 lg:pr-3 font-medium",
                    secundaria ? COLUNA_SECUNDARIA : "",
                    linhas.length > 15 ? "sticky top-0 bg-cartao" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  {t}
                </th>
              ))}
              <th scope="col" className="py-2 font-medium">
                <span className="sr-only">Remover da simulação</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {linhas.map((l) => {
              const chip = leitura(l);
              const baixo = l.w < PESO_BAIXO;
              const tom = tomLinha(baixo);
              return (
                <tr key={l.id} className={`border-t border-linha ${baixo ? "bg-mini" : ""}`}>
                  <th
                    scope="row"
                    className={`py-2 pr-1.5 lg:pr-3 text-left font-sans font-semibold ${tom.nome}`}
                  >
                    <NomeInstituto l={l} />
                  </th>
                  <td className="py-2 pr-1.5 lg:pr-3 whitespace-nowrap">
                    {fmtData(l.inicio)}–{fmtData(l.fim)}
                  </td>
                  <td className={`py-2 pr-1.5 lg:pr-3 text-right ${COLUNA_SECUNDARIA}`}>
                    {fmtInt(l.n)}
                  </td>
                  <td className={`py-2 pr-1.5 lg:pr-3 text-right ${COLUNA_SECUNDARIA}`}>
                    {fmt(l.moe, 1)}
                  </td>
                  <td className="py-2 pr-1.5 lg:pr-3 whitespace-nowrap">
                    {l.t1 && l.t1.lula != null ? (
                      <>
                        <span className={tom.lula}>{fmt(l.t1.lula)}</span>×
                        <span className={tom.flavio}>{fmt(l.t1.flavio)}</span>
                      </>
                    ) : (
                      "n/d"
                    )}
                  </td>
                  <td className="py-2 pr-1.5 lg:pr-3 whitespace-nowrap">
                    <span className={tom.lula}>{fmt(l.t2.lula)}</span>×
                    <span className={tom.flavio}>{fmt(l.t2.flavio)}</span>
                  </td>
                  <td className="py-2 pr-1.5 lg:pr-3">
                    <Chip tom={chip.tom} className="whitespace-nowrap">
                      {chip.texto}
                    </Chip>
                  </td>
                  {/* O número e o rótulo são inquebráveis CADA UM NA SUA linha
                      (o rótulo em bloco próprio não pode partir em «peso» /
                      «baixo»); o que segue proibido é o nowrap na CÉLULA, que
                      forçaria «0,15 peso baixo» numa linha só de 80px e
                      empurraria o registro do TSE para fora em 768. */}
                  <td className="py-2 pr-1.5 lg:pr-3 text-right">
                    <span className="whitespace-nowrap">{fmt(l.w, 2)}</span>
                    {baixo ? (
                      <span className="block text-xs whitespace-nowrap">peso baixo</span>
                    ) : null}
                  </td>
                  <td className={`py-2 pr-1.5 lg:pr-3 text-xs ${classeTse(l.tse)}`}>{l.tse}</td>
                  <td className="py-2 text-right">
                    <button
                      type="button"
                      onClick={() => removerPesquisa(l.id)}
                      aria-label={rotuloRemover(l)}
                      className="min-h-toque min-w-toque rounded-controle text-cinza"
                    >
                      ×
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          data-testid="abrir-form-simulacao"
          onClick={() => setFormAberto((v) => !v)}
          aria-expanded={formAberto}
          className="min-h-toque rounded-controle bg-confirma px-3 text-sm font-semibold text-campo shadow-botao"
        >
          {formAberto ? "Fechar formulário" : "+ Adicionar nova pesquisa (simulação)"}
        </button>
        <button
          type="button"
          data-testid="restaurar-serie"
          onClick={restaurarSerie}
          disabled={!serieAlterada}
          className={[
            "min-h-toque rounded-controle border px-3 text-sm font-semibold",
            serieAlterada
              ? "border-cinza text-tinta"
              : "cursor-default border-dashed border-linha text-cinza opacity-70",
          ].join(" ")}
        >
          ↺ Restaurar dados oficiais
        </button>
      </div>

      {formAberto ? (
        <FormularioPesquisa onIncluir={adicionarPesquisa} onFechar={() => setFormAberto(false)} />
      ) : null}
    </Cartao>
  );
}
