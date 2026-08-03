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
          return (
            <li
              key={l.id}
              className={[
                "rounded-cartao border border-linha p-cartao",
                // Peso baixo: fundo recuado + o texto "peso baixo" (1.4.1).
                // O `opacity-55` do protótipo derrubava o contraste do texto
                // para ~4,2:1 — abaixo do piso AA de docs/DESIGN.md §9.
                baixo ? "bg-mini" : "bg-cartao",
              ].join(" ")}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-semibold text-tinta">
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
              <p className="text-dado font-mono">
                <span className="text-lula-escuro">Lula {fmt(l.t2.lula)}%</span>
                <span className="text-cinza"> × </span>
                <span className="text-flavio-escuro">Flávio {fmt(l.t2.flavio)}%</span>
              </p>
              <p className="mt-2">
                <Chip tom={chip.tom}>{chip.texto}</Chip>
              </p>

              <p className="mt-2 font-mono text-xs text-cinza">
                1º turno{" "}
                {l.t1 && l.t1.lula != null ? `${fmt(l.t1.lula)}% × ${fmt(l.t1.flavio)}%` : "n/d"} ·
                n {fmtInt(l.n)}
              </p>
              <div className="flex items-end justify-between gap-2">
                <p className="font-mono text-xs text-cinza">
                  ±{fmt(l.moe, 1)} p.p. · {l.tse}
                </p>
                <button
                  type="button"
                  onClick={() => removerPesquisa(l.id)}
                  aria-label={rotuloRemover(l)}
                  className="min-h-toque min-w-toque rounded-controle text-cinza"
                >
                  ×
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      {/* ---------- md+: tabela completa ---------- */}
      <div
        className="hidden overflow-x-auto md:block"
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
                "Instituto",
                "Campo",
                "n",
                "±MoE",
                "1ºT L×F",
                "2ºT L×F",
                "Leitura 2ºT",
                "Peso",
                "Registro TSE",
              ].map((t) => (
                <th
                  key={t}
                  scope="col"
                  className={[
                    "py-2 pr-3 font-medium",
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
              return (
                <tr key={l.id} className={`border-t border-linha ${baixo ? "bg-mini" : ""}`}>
                  <th
                    scope="row"
                    className="py-2 pr-3 text-left font-sans font-semibold text-tinta"
                  >
                    <NomeInstituto l={l} />
                  </th>
                  <td className="py-2 pr-3 whitespace-nowrap">
                    {fmtData(l.inicio)}–{fmtData(l.fim)}
                  </td>
                  <td className="py-2 pr-3 text-right">{fmtInt(l.n)}</td>
                  <td className="py-2 pr-3 text-right">{fmt(l.moe, 1)}</td>
                  <td className="py-2 pr-3 whitespace-nowrap">
                    {l.t1 && l.t1.lula != null ? (
                      <>
                        <span className="text-lula-escuro">{fmt(l.t1.lula)}</span>×
                        <span className="text-flavio-escuro">{fmt(l.t1.flavio)}</span>
                      </>
                    ) : (
                      "n/d"
                    )}
                  </td>
                  <td className="py-2 pr-3 whitespace-nowrap">
                    <span className="text-lula-escuro">{fmt(l.t2.lula)}</span>×
                    <span className="text-flavio-escuro">{fmt(l.t2.flavio)}</span>
                  </td>
                  <td className="py-2 pr-3">
                    <Chip tom={chip.tom}>{chip.texto}</Chip>
                  </td>
                  <td className="py-2 pr-3 text-right">
                    {fmt(l.w, 2)}
                    {baixo ? <span className="block text-xs">peso baixo</span> : null}
                  </td>
                  <td className="py-2 pr-3 text-xs whitespace-nowrap">{l.tse}</td>
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
