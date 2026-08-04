"use client";

/**
 * "O que dizem as N pesquisas?" — a série (COPY-DECK §H, DESIGN-V2 §5.4/§6.3).
 *
 * Abaixo de `md` a série é uma LISTA de cartões; a partir de `md` é uma tabela
 * real com `caption`/`scope`. São DUAS árvores alternadas por `hidden`, não uma
 * tabela com `display:block`: a semântica precisa sobreviver nos dois casos.
 *
 * Em todas as larguras cada linha traz a barra de §4.3 — a folga da medida
 * contra a régua do empate. É ali que "empate técnico" deixa de ser palavra.
 *
 * Instituto, registro no TSE e link da fonte são SEMPRE alcançáveis (R4/H12):
 * na tabela, na própria linha; no cartão, a um toque, na folha de detalhe.
 * Adicionar e remover são MODO SIMULAÇÃO (R5) — a base oficial nunca muda.
 */
import { useState } from "react";
import {
  Bloco,
  Botao,
  Chip,
  LinkExterno,
  Pergunta,
  Resposta,
  Traduzindo,
} from "@/components/ui/blocos";
import { Termo } from "@/components/ui/glossario";
import { Revelador } from "@/components/ui/revelador";
import { ACOES, inteiroBr } from "@/components/ui/textos";
import { fmt, fmtData, type LinhaModelo } from "@/lib/modelo";
import { BarraPesquisa, escalaDaSerie } from "./barra-pesquisa";
import { FormularioPesquisa } from "./formulario-pesquisa";
import { usePainel } from "./estado";

const PESO_BAIXO = 0.15;

/** `n` e folga da medida só a partir de `lg`: são as colunas secundárias. */
const COLUNA_SECUNDARIA = "hidden lg:table-cell";

function leitura(l: LinhaModelo) {
  if (l.empate2) return { texto: "empate técnico", tom: "atencao" as const };
  return l.margem2 >= 0
    ? { texto: "Lula na frente", tom: "lula" as const }
    : { texto: "Flávio na frente", tom: "flavio" as const };
}

function Selos({ l }: { l: LinhaModelo }) {
  if (!l.usuario && !l.auto) return null;
  return (
    <span className="ml-2 text-micro text-atencao">
      {l.usuario
        ? "você adicionou nesta simulação"
        : "encontrada automaticamente — confira a fonte"}
    </span>
  );
}

function DetalheRegistro({ l }: { l: LinhaModelo }) {
  return (
    <Revelador
      rotuloAcessivel={`${ACOES.verRegistro}: ${l.instituto}, pesquisa de ${fmtData(l.inicio)} a ${fmtData(l.fim)}`}
      titulo={`${l.instituto} · pesquisa de ${fmtData(l.inicio)}–${fmtData(l.fim)}`}
      classeGatilho="inline-flex min-h-toque items-center rounded-plena px-3 text-micro font-semibold text-ameixa shadow-[inset_0_0_0_2px_var(--color-ameixa)] transition-colors duration-(--dur-rapida) ease-(--ease-padrao) hover:bg-ameixa-tenue"
      conteudoGatilho={ACOES.verRegistro}
    >
      <p className="numeros">
        {inteiroBr(l.n)} pessoas ouvidas · folga da medida de {fmt(l.moe)} pontos · registro no TSE{" "}
        {l.tse} · peso na média de hoje: {fmt(l.w, 2)}.
      </p>
      {l.fonte ? (
        <p className="mt-3">
          <LinkExterno href={l.fonte}>{ACOES.verFonte}</LinkExterno>
        </p>
      ) : null}
    </Revelador>
  );
}

export function SeriePesquisas() {
  const { M, pesquisas, removerPesquisa, restaurarSerie, adicionarPesquisa, serieAlterada } =
    usePainel();
  const [formAberto, setFormAberto] = useState(false);

  const linhas = [...M.linhas].reverse();
  const escala = escalaDaSerie(M.linhas);
  const naoEmpate = M.qtdRecentes - M.qtdEmpate;

  const rotuloRemover = (l: LinhaModelo) => `Tirar ${l.instituto} da minha simulação`;

  return (
    <Bloco rotuladoPor="titulo-serie">
      <Pergunta id="titulo-serie">O que dizem as {pesquisas.length} pesquisas?</Pergunta>
      <Resposta>
        <span className="numeros">{M.qtdEmpate}</span> das{" "}
        <span className="numeros">{M.qtdRecentes}</span> pesquisas dos últimos 35 dias estão em{" "}
        <Termo chave="empateTecnico">empate técnico</Termo>; nas outras{" "}
        <span className="numeros">{naoEmpate}</span>, Lula aparece na frente.
      </Resposta>
      <div className="flex flex-wrap items-start gap-5">
        <Traduzindo className="min-w-[16rem] flex-1">
          Cada linha é uma pesquisa registrada no TSE, da mais nova para a mais antiga. O{" "}
          <Termo chave="peso">peso</Termo> diz o quanto ela conta na média: mais nova e com mais
          gente ouvida pesa mais. A barra mostra <b className="font-semibold text-tinta">o dobro</b>{" "}
          da <Termo chave="margemErro">folga da medida</Termo> — é essa a folga da diferença entre
          os dois. Quando a barra cruza a régua do empate, não dá para dizer quem está na frente.
        </Traduzindo>
        {/* eslint-disable-next-line @next/next/no-img-element -- SVG estático, sem otimização a fazer */}
        <img
          src="/ilustracoes/explicando-empate.svg"
          alt=""
          width={320}
          height={190}
          className="mt-3 h-auto w-full max-w-[15rem]"
        />
      </div>

      {serieAlterada ? (
        <p
          role="status"
          aria-live="polite"
          className="mt-4 rounded-nicho bg-atencao-fundo px-4 py-3 text-corpo text-tinta"
        >
          <span aria-hidden="true" className="mr-1 font-semibold text-atencao">
            ⚠
          </span>
          Modo de teste — não muda os dados oficiais. As linhas marcadas “você adicionou nesta
          simulação” só existem nesta visita.
        </p>
      ) : null}

      {/* ---------------- abaixo de md: cartões ---------------- */}
      <ul className="mt-4 flex flex-col gap-3 md:hidden" aria-label="Pesquisas da série">
        {linhas.map((l) => {
          const chip = leitura(l);
          const baixo = l.w < PESO_BAIXO;
          return (
            <li key={l.id} className="rounded-nicho bg-nicho p-4">
              <div className="flex items-start justify-between gap-3">
                <p className="text-secao text-tinta">
                  {l.fonte ? <LinkExterno href={l.fonte}>{l.instituto}</LinkExterno> : l.instituto}
                  <Selos l={l} />
                </p>
                <button
                  type="button"
                  onClick={() => removerPesquisa(l.id)}
                  aria-label={rotuloRemover(l)}
                  className="min-h-toque min-w-toque shrink-0 rounded-plena text-tinta-media transition-colors duration-(--dur-rapida) hover:bg-ameixa-bruma hover:text-tinta"
                >
                  <span aria-hidden="true">×</span>
                </button>
              </div>

              <p className="mt-1 text-micro text-tinta-media numeros">
                {fmtData(l.inicio)}–{fmtData(l.fim)} · peso na média {fmt(l.w, 2)}
              </p>
              {baixo ? (
                <p className="text-micro text-atencao">
                  Esta pesquisa já está velha: conta pouco na média de hoje.
                </p>
              ) : null}

              <p className="mt-3 flex flex-wrap items-baseline gap-x-3 text-dado numeros">
                <span className="text-lula">Lula {fmt(l.t2.lula)}%</span>
                <span aria-hidden="true" className="text-micro text-tinta-media">
                  ×
                </span>
                <span className="text-flavio">Flávio {fmt(l.t2.flavio)}%</span>
              </p>

              <BarraPesquisa linha={l} escala={escala} className="mt-2" />

              <p className="mt-2">
                <Chip tom={chip.tom}>{chip.texto}</Chip>
              </p>

              <p className="mt-2 text-micro text-tinta-media numeros">
                1º turno{" "}
                {l.t1 && l.t1.lula != null ? `${fmt(l.t1.lula)}% × ${fmt(l.t1.flavio)}%` : "–"}
              </p>

              <p className="mt-3">
                <DetalheRegistro l={l} />
              </p>
            </li>
          );
        })}
      </ul>

      {/* ---------------- md+: tabela completa ----------------
          `relative` não é decoração: sem posicionar o wrapper, o `sr-only` do
          último `<th>` escapa do recorte da região rolável e empurra o
          `scrollWidth` da PÁGINA. */}
      <div
        className="rolagem-x relative mt-4 hidden overflow-x-auto md:block"
        role="group"
        tabIndex={0}
        aria-labelledby="titulo-serie"
      >
        <table className="w-full text-micro">
          <caption className="sr-only">
            As {pesquisas.length} pesquisas que alimentam o painel, da mais nova para a mais antiga.
          </caption>
          <thead>
            <tr className="text-left text-tinta-media">
              <th scope="col" className="py-2 pr-3 font-medium">
                Instituto
              </th>
              <th scope="col" className="py-2 pr-3 font-medium">
                Quando foi feita
              </th>
              <th
                scope="col"
                className={`coluna-numerica min-w-[7ch] py-2 pr-3 font-medium ${COLUNA_SECUNDARIA}`}
              >
                Pessoas ouvidas
              </th>
              <th
                scope="col"
                className={`coluna-numerica min-w-[6ch] py-2 pr-3 font-medium ${COLUNA_SECUNDARIA}`}
              >
                Folga da medida
              </th>
              <th scope="col" className="py-2 pr-3 font-medium">
                1º turno · Lula × Flávio
              </th>
              <th scope="col" className="py-2 pr-3 font-medium">
                2º turno · Lula × Flávio
              </th>
              <th scope="col" className="py-2 pr-3 font-medium">
                O que essa pesquisa diz
              </th>
              <th scope="col" className="coluna-numerica min-w-[7ch] py-2 pr-3 font-medium">
                Peso na média
              </th>
              <th scope="col" className="py-2 pr-3 font-medium">
                Registro no TSE
              </th>
              <th scope="col" className="py-2 font-medium">
                <span className="sr-only">Tirar da simulação</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {linhas.map((l) => {
              const chip = leitura(l);
              const baixo = l.w < PESO_BAIXO;
              return (
                <tr key={l.id} className="border-t border-filete align-top">
                  <th scope="row" className="py-3 pr-3 text-left font-semibold text-tinta">
                    {l.fonte ? (
                      <LinkExterno href={l.fonte}>{l.instituto}</LinkExterno>
                    ) : (
                      l.instituto
                    )}
                    <Selos l={l} />
                  </th>
                  <td className="py-3 pr-3 whitespace-nowrap text-tinta-media numeros">
                    {fmtData(l.inicio)}–{fmtData(l.fim)}
                  </td>
                  <td
                    className={`coluna-numerica min-w-[7ch] py-3 pr-3 text-tinta-media numeros ${COLUNA_SECUNDARIA}`}
                  >
                    {inteiroBr(l.n)}
                  </td>
                  <td
                    className={`coluna-numerica min-w-[6ch] py-3 pr-3 text-tinta-media numeros ${COLUNA_SECUNDARIA}`}
                  >
                    {fmt(l.moe)}
                  </td>
                  <td className="py-3 pr-3 whitespace-nowrap numeros">
                    {l.t1 && l.t1.lula != null ? (
                      <>
                        <span className="text-lula">{fmt(l.t1.lula)}</span>
                        <span className="text-tinta-media"> × </span>
                        <span className="text-flavio">{fmt(l.t1.flavio)}</span>
                      </>
                    ) : (
                      <span className="text-tinta-media">–</span>
                    )}
                  </td>
                  <td className="py-3 pr-3 whitespace-nowrap numeros">
                    <span className="text-lula">{fmt(l.t2.lula)}</span>
                    <span className="text-tinta-media"> × </span>
                    <span className="text-flavio">{fmt(l.t2.flavio)}</span>
                    <BarraPesquisa linha={l} escala={escala} className="mt-1 max-w-[10rem]" />
                  </td>
                  <td className="py-3 pr-3">
                    <Chip tom={chip.tom} className="whitespace-nowrap">
                      {chip.texto}
                    </Chip>
                  </td>
                  <td className="coluna-numerica min-w-[7ch] py-3 pr-3 text-tinta-media numeros">
                    <span className="whitespace-nowrap">{fmt(l.w, 2)}</span>
                    {baixo ? <span className="block text-atencao">conta pouco hoje</span> : null}
                  </td>
                  <td className="py-3 pr-3 text-tinta-media">{l.tse}</td>
                  <td className="py-3 text-right">
                    <button
                      type="button"
                      onClick={() => removerPesquisa(l.id)}
                      aria-label={rotuloRemover(l)}
                      className="min-h-toque min-w-toque rounded-plena text-tinta-media transition-colors duration-(--dur-rapida) hover:bg-ameixa-bruma hover:text-tinta"
                    >
                      <span aria-hidden="true">×</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="mt-4 max-w-texto text-micro text-tinta-media">
        Toda pesquisa eleitoral precisa ser registrada na Justiça Eleitoral antes de ser divulgada.
        Sem registro, ela não entra aqui.
      </p>

      <div className="mt-4 flex flex-wrap gap-3">
        <Botao
          variante="fantasma"
          data-testid="abrir-form-simulacao"
          onClick={() => setFormAberto((v) => !v)}
          aria-expanded={formAberto}
        >
          {formAberto ? ACOES.fecharFormulario : ACOES.adicionarPesquisa}
        </Botao>
        <Botao
          data-testid="restaurar-serie"
          onClick={restaurarSerie}
          disabled={!serieAlterada}
          variante={serieAlterada ? "primario" : "fantasma"}
        >
          {ACOES.restaurarOficial}
        </Botao>
      </div>

      {formAberto ? (
        <FormularioPesquisa onIncluir={adicionarPesquisa} onFechar={() => setFormAberto(false)} />
      ) : null}
    </Bloco>
  );
}
