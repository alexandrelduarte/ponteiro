"use client";

/**
 * "O que dizem as N pesquisas?" — a série (COPY-DECK §H, DESIGN-V2 §5.4/§6.3).
 *
 * Abaixo de `lg` a série é uma LISTA de cartões (duas colunas a partir de md);
 * a partir de `lg` é uma tabela real com `caption`/`scope`. São DUAS árvores
 * alternadas por `hidden`, não uma tabela com `display:block`: a semântica
 * precisa sobreviver nos dois casos.
 *
 * O breakpoint da tabela era `md` e subiu para `lg` na Fase 7: a 768 as dez
 * colunas não cabiam e o registro no TSE saía cortado no meio da string
 * ("BR- / 07845/"), atrás de uma rolagem lateral que §6.3 bane — e ele é
 * justamente o dado que R4/H12 mandam manter sempre alcançável.
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
  Colunas,
  Detalhe,
  LINHA_TABELA,
  LinkExterno,
  LinkInterno,
  Pergunta,
  Resposta,
  Traduzindo,
} from "@/components/ui/blocos";
import { Termo } from "@/components/ui/glossario";
import { Revelador } from "@/components/ui/revelador";
import { ACOES, inteiroBr, registroTse } from "@/components/ui/textos";
import { fmt, fmtData, type LinhaModelo } from "@/lib/modelo";
import { BarraPesquisa, ReguaPesquisas, escalaDaSerie, type EscalaBarra } from "./barra-pesquisa";
import { FormularioPesquisa } from "./formulario-pesquisa";
import { usePainel } from "./estado";

const PESO_BAIXO = 0.15;

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

/** Pastilha do gatilho de registro no cartão (abaixo de lg). */
const GATILHO_CARTAO =
  "inline-flex min-h-toque items-center rounded-plena px-3 text-micro font-semibold text-ameixa " +
  "shadow-[inset_0_0_0_2px_var(--color-ameixa)] transition-colors duration-(--dur-rapida) " +
  "ease-(--ease-padrao) hover:bg-ameixa-tenue";

/**
 * Gatilho do registro NA TABELA: o próprio número do TSE é o rótulo visível.
 *
 * A coluna "Registro no TSE" era texto morto de 15 caracteres que empurrava a
 * tabela para fora da placa. Ela continua ali — R4/H12 mandam manter o registro
 * sempre alcançável —, mas agora ela é a PORTA: o número está impresso e, ao
 * tocá-lo, abre a folha com o resto da ficha (pessoas ouvidas, peso, 1º turno,
 * folga, link da fonte). É o mesmo gesto que o cartão de 390 já ensinava, agora
 * também no desktop. `line-clamp-2` é válvula, não corte: o registro tem
 * tamanho fixo e cabe numa linha na coluna de 15%.
 */
const GATILHO_TSE =
  "-mx-1 inline-block rounded-campo px-1 py-2 text-left text-ameixa underline " +
  "decoration-from-font underline-offset-2 transition-[color,text-decoration-thickness," +
  "text-underline-offset] duration-(--dur-rapida) ease-(--ease-padrao) " +
  "hover:text-ameixa-forte hover:decoration-2 hover:underline-offset-4 " +
  "group-hover:decoration-2 group-hover:underline-offset-4";

function DetalheRegistro({ l, rotulo }: { l: LinhaModelo; rotulo?: string }) {
  /* WCAG 2.5.3: o nome acessível COMEÇA pelo rótulo visível — na tabela o
     rótulo é o número do registro, no cartão é "Ver o registro completo". */
  const visivel = rotulo ?? ACOES.verRegistro;
  return (
    <Revelador
      rotuloAcessivel={
        rotulo
          ? `${visivel} — ${ACOES.verRegistro} de ${l.instituto}`
          : `${visivel}: ${l.instituto}, pesquisa de ${fmtData(l.inicio)} a ${fmtData(l.fim)}`
      }
      titulo={`${l.instituto} · pesquisa de ${fmtData(l.inicio)}–${fmtData(l.fim)}`}
      classeGatilho={rotulo ? GATILHO_TSE : GATILHO_CARTAO}
      conteudoGatilho={rotulo ? <span className="line-clamp-2">{visivel}</span> : visivel}
    >
      <p className="numeros">
        {inteiroBr(l.n)} pessoas ouvidas · folga da medida de {fmt(l.moe)} pontos · registro no TSE{" "}
        {registroTse(l.tse)} · peso na média de hoje: {fmt(l.w, 2)}.
      </p>
      {/* Contratante: item obrigatório de divulgação (Res.-TSE 23.600, art. 10,
          "se for o caso, de quem contratou") — o dado sempre existiu no seed;
          faltava renderizar (auditoria de conformidade, DECISOES.md). */}
      {l.contratante ? <p className="mt-1">Contratante: {l.contratante}.</p> : null}
      {/* O 1º turno desceu da tabela para cá junto com as outras colunas
          secundárias: ele é ficha da pesquisa, não a resposta da seção. */}
      <p className="mt-3 numeros">
        1º turno:{" "}
        {l.t1 && l.t1.lula != null
          ? `Lula ${fmt(l.t1.lula)}% × Flávio ${fmt(l.t1.flavio)}%`
          : "não divulgado nesta pesquisa"}
        .
      </p>
      {l.fonte ? (
        <p className="mt-3">
          <LinkExterno href={l.fonte}>{ACOES.verFonte}</LinkExterno>
        </p>
      ) : null}
      <p className="mt-1">
        <LinkExterno href="https://www.tse.jus.br/eleicoes/pesquisa-eleitorais/consulta-as-pesquisas-registradas">
          Conferir o registro no site do TSE
        </LinkExterno>
      </p>
      {l.slug ? (
        <p className="mt-1">
          <LinkInterno href={`/pesquisas/${l.slug}`}>Ver a página desta pesquisa</LinkInterno>
        </p>
      ) : null}
    </Revelador>
  );
}

/** Quantos cartões ficam abertos abaixo de `lg` antes do "ver as outras". */
const CARTOES_ABERTOS = 5;

function CartaoPesquisa({
  l,
  escala,
  onRemover,
  rotuloRemover,
}: {
  l: LinhaModelo;
  escala: EscalaBarra;
  onRemover: () => void;
  rotuloRemover: string;
}) {
  const chip = leitura(l);
  const baixo = l.w < PESO_BAIXO;
  return (
    <li className="rounded-nicho bg-nicho p-4">
      {/* `items-center`: com `items-start` o × de 44px nascia ~10px abaixo da
          linha de base do nome, nos 13 cartões. */}
      <div className="flex items-center justify-between gap-3">
        <p className="text-secao text-tinta">
          {l.fonte ? <LinkExterno href={l.fonte}>{l.instituto}</LinkExterno> : l.instituto}
          <Selos l={l} />
        </p>
        <button
          type="button"
          onClick={onRemover}
          aria-label={rotuloRemover}
          className="min-h-toque min-w-toque shrink-0 rounded-plena text-corpo text-tinta-media transition-colors duration-(--dur-rapida) hover:bg-ameixa-bruma hover:text-tinta"
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
        {l.t1 && l.t1.lula != null
          ? `${fmt(l.t1.lula)}% × ${fmt(l.t1.flavio)}%`
          : "não divulgado nesta pesquisa"}
      </p>
      <p className="mt-1 text-micro text-tinta-media">Registro no TSE {registroTse(l.tse)}</p>

      <p className="mt-3">
        <DetalheRegistro l={l} />
      </p>
    </li>
  );
}

export function SeriePesquisas() {
  const { M, pesquisas, removerPesquisa, restaurarSerie, adicionarPesquisa, serieAlterada } =
    usePainel();
  const [formAberto, setFormAberto] = useState(false);

  const linhas = [...M.linhas].reverse();
  const recentes = linhas.slice(0, CARTOES_ABERTOS);
  const antigas = linhas.slice(CARTOES_ABERTOS);
  const escala = escalaDaSerie(M.linhas);
  const naoEmpate = M.qtdRecentes - M.qtdEmpate;

  const rotuloRemover = (l: LinhaModelo) => `Tirar ${l.instituto} da minha simulação`;

  return (
    <Bloco rotuladoPor="titulo-serie">
      {/* Cabeçalho em TRÊS colunas de alturas parecidas (v2.1 rodada 2): com a
          ilustração empilhada sob o traduzindo, a coluna direita ficava ~350px
          mais alta que a esquerda e abria um buraco branco sob o título. Em
          terços — pergunta+resposta | traduzindo | exemplo — as alturas casam
          (≈3, ≈6 e ≈6 linhas) e o topo fecha sem vazio. A 390 empilha na mesma
          ordem de leitura de antes. */}
      <Colunas arranjo="tres">
        <div>
          <Pergunta id="titulo-serie">O que dizem as {pesquisas.length} pesquisas?</Pergunta>
          <Resposta>
            <span className="numeros">{M.qtdEmpate}</span> das{" "}
            <span className="numeros">{M.qtdRecentes}</span> pesquisas dos últimos 35 dias estão em{" "}
            <Termo chave="empateTecnico">empate técnico</Termo>; nas outras{" "}
            <span className="numeros">{naoEmpate}</span>, Lula aparece na frente.
          </Resposta>
        </div>
        <Traduzindo className="lg:mt-0">
          Cada linha é uma pesquisa registrada no TSE, da mais nova para a mais antiga. O{" "}
          <Termo chave="peso">peso</Termo> diz o quanto ela conta na média: mais nova e com mais
          gente ouvida pesa mais. A barra mostra <b className="font-semibold text-tinta">o dobro</b>{" "}
          da <Termo chave="margemErro">folga da medida</Termo> — é essa a folga da diferença entre
          os dois. Quando a barra cruza a régua do empate, não dá para dizer quem está na frente.
        </Traduzindo>
        {/* A ilustração é EXEMPLO, e diz isso. Sem a legenda, ela ficava colada
            na frase "nas outras 4, Lula aparece na frente" e mostrava exatamente
            quatro cápsulas, uma delas inteiramente do lado de Flávio: o leitor
            lia "1 em 4 pesquisas com Flávio à frente" onde o painel tem 1 em 13.
            O acoplamento era falso e visível. */}
        <figure className="mt-3 w-full max-w-[15rem] lg:mt-0">
          {/* eslint-disable-next-line @next/next/no-img-element -- SVG estático, sem otimização a fazer */}
          <img
            src="/ilustracoes/explicando-empate.svg"
            alt=""
            width={320}
            height={190}
            className="h-auto w-full"
          />
          <figcaption className="mt-1 text-micro text-tinta-media">
            Exemplo: quatro pesquisas imaginárias, só para mostrar como ler a barra. Não são as
            pesquisas da lista.
          </figcaption>
        </figure>
      </Colunas>

      {serieAlterada ? (
        <p
          role="status"
          aria-live="polite"
          className="mt-4 rounded-nicho bg-atencao-fundo px-4 py-3 text-corpo text-tinta"
        >
          Modo de teste — não muda os dados oficiais. As linhas marcadas “você adicionou nesta
          simulação” só existem nesta visita.
        </p>
      ) : null}

      {/* ---------------- abaixo de lg: cartões ----------------
          O breakpoint da tabela subiu de `md` para `lg`. A 768 as dez colunas
          não cabiam: o registro no TSE saía cortado no meio da string
          ("BR- / 07845/"), e ele é justamente o dado que R4/H12 mandam manter
          sempre alcançável. Em md os cartões viram duas colunas — a largura
          extra vira leitura, não rolagem lateral. */}
      {/* UMA RÉGUA POR COLUNA. Em coluna única a régua servia as barras de
          todas as linhas — mas a partir de md a lista vira duas colunas e a
          régua continuava sendo uma só, esticada sobre as duas: o "empate" do
          rótulo caía no VÃO entre as colunas, a 167px das duas réguas de tinta
          que ele deveria nomear. Cada cópia repete o recuo de 16px do padding
          do cartão, que é o que faz o rótulo cair no mesmo x da barra.
          A segunda é `aria-hidden`: é a mesma frase, e o leitor de tela não
          precisa ouvi-la duas vezes. */}
      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 lg:hidden">
        <div className="px-4">
          <ReguaPesquisas escala={escala} />
        </div>
        <div aria-hidden="true" className="hidden px-4 md:block">
          <ReguaPesquisas escala={escala} />
        </div>
      </div>
      <ul
        className="mt-1 grid grid-cols-1 gap-3 md:grid-cols-2 lg:hidden"
        aria-label="Pesquisas da série"
      >
        {recentes.map((l) => (
          <CartaoPesquisa
            key={l.id}
            l={l}
            escala={escala}
            onRemover={() => removerPesquisa(l.id)}
            rotuloRemover={rotuloRemover(l)}
          />
        ))}
      </ul>
      {/* As mais antigas, a um toque. Treze cartões quase idênticos custavam
          seis telas de rolagem a 390 — e as antigas quase não mexem na média
          (o peso de cada uma está escrito no próprio cartão). Nenhuma sai da
          página: a lista completa também está inteira em /metodologia e na
          tabela a partir de lg. */}
      {antigas.length ? (
        <Detalhe
          titulo={`Ver as outras ${antigas.length} pesquisas, mais antigas`}
          className="mt-3 lg:hidden"
        >
          <ul
            className="mt-2 grid grid-cols-1 gap-3 md:grid-cols-2"
            aria-label="Pesquisas mais antigas da série"
          >
            {antigas.map((l) => (
              <CartaoPesquisa
                key={l.id}
                l={l}
                escala={escala}
                onRemover={() => removerPesquisa(l.id)}
                rotuloRemover={rotuloRemover(l)}
              />
            ))}
          </ul>
        </Detalhe>
      ) : null}

      {/* ---------------- lg+: a tabela, sem rolagem POR CONSTRUÇÃO ----------
          Dez colunas com pisos em `ch` e `rem` pediam 943px onde a placa tem
          936: a tabela rolava exatamente 7px em QUALQUER monitor, e os dois
          gradientes de afordância ficavam acesos o tempo todo anunciando um
          conteúdo escondido que era, na prática, meio caractere.

          A cura não é apertar: é escolher. Sete colunas, `table-fixed` com
          `<colgroup>` em porcentagem — a tabela passa a valer exatamente 100%
          do contêiner, em qualquer largura, e nenhuma célula pode empurrá-la.
          As quatro colunas secundárias (pessoas ouvidas, peso, 1º turno,
          registro em texto) não sumiram: elas moram na folha por linha, que já
          existia e que o cartão de 390 já usava — e o registro no TSE, que R4
          manda manter alcançável, virou o próprio GATILHO dessa folha, com o
          número impresso na tabela.

          Sem `overflow-x`, os gradientes de `rolagem-x` saem junto, e a região
          deixa de ser um alvo de tabulação que não rola para lugar nenhum.
          `relative` FICA: sem ele o `sr-only` da régua escapa e empurra o
          `scrollWidth` da PÁGINA. */}
      <div className="relative mt-4 hidden lg:block">
        <table className="w-full table-fixed text-micro">
          <caption className="sr-only">
            As {pesquisas.length} pesquisas que alimentam o painel, da mais nova para a mais antiga.
          </caption>
          <colgroup>
            <col className="w-[17%]" />
            <col className="w-[11%]" />
            <col className="w-[11%]" />
            <col className="w-[24%]" />
            <col className="w-[15%]" />
            <col className="w-[15%]" />
            <col className="w-[7%]" />
          </colgroup>
          <thead>
            <tr className="text-left align-bottom text-tinta-media">
              <th scope="col" className="py-2 pr-3 font-medium">
                Instituto
              </th>
              <th scope="col" className="py-2 pr-3 font-medium">
                Quando foi feita
              </th>
              <th scope="col" className="py-2 pr-3 font-medium">
                2º turno · Lula × Flávio
              </th>
              {/* A barra ganhou cabeçalho próprio: sem ele ela era uma coluna
                  sem nome, e a promessa de §4.3 ("empate técnico deixa de ser
                  palavra") não se cumpria. */}
              <th scope="col" className="py-2 pr-3 font-medium">
                Onde a folga cai
              </th>
              <th scope="col" className="py-2 pr-3 font-medium">
                O que essa pesquisa diz
              </th>
              <th scope="col" className="py-2 pr-3 font-medium">
                Registro no TSE
              </th>
              <th scope="col" className="py-2 font-medium">
                Tirar
              </th>
            </tr>
          </thead>
          <tbody>
            {linhas.map((l) => {
              const chip = leitura(l);
              const baixo = l.w < PESO_BAIXO;
              return (
                <tr key={l.id} className={`border-t border-filete align-top ${LINHA_TABELA}`}>
                  <th scope="row" className="py-3 pr-3 text-left font-semibold text-tinta">
                    {l.fonte ? (
                      <LinkExterno href={l.fonte}>{l.instituto}</LinkExterno>
                    ) : (
                      l.instituto
                    )}
                    <Selos l={l} />
                  </th>
                  <td className="py-3 pr-3 text-tinta-media numeros">
                    <span className="whitespace-nowrap">
                      {fmtData(l.inicio)}–{fmtData(l.fim)}
                    </span>
                    {/* O alerta desceu da coluna de peso, que saiu: ele fala de
                        IDADE da pesquisa, e é aqui que a idade está escrita. */}
                    {baixo ? <span className="block text-atencao">conta pouco hoje</span> : null}
                  </td>
                  <td className="py-3 pr-3 whitespace-nowrap numeros">
                    <span className="text-lula">{fmt(l.t2.lula)}</span>
                    <span className="text-tinta-media"> × </span>
                    <span className="text-flavio">{fmt(l.t2.flavio)}</span>
                  </td>
                  {/* Andar ÚNICO (v2.1 rodada 2): a linha "folga de N pontos"
                      repetida 13× criava linhas de dois andares e ruído — o
                      número já vive no balão da PRÓPRIA barra (hover) e no
                      registro da linha; o cabeçalho da seção ensina a leitura
                      uma vez. */}
                  <td className="py-3 pr-3 align-middle">
                    <BarraPesquisa linha={l} escala={escala} balaoNaLinha />
                  </td>
                  <td className="py-3 pr-3">
                    {/* Sem `whitespace-nowrap`: numa tabela de larguras fixas o
                        chip precisa poder quebrar em vez de vazar da célula. */}
                    <Chip tom={chip.tom}>{chip.texto}</Chip>
                  </td>
                  <td className="py-3 pr-3">
                    <DetalheRegistro l={l} rotulo={registroTse(l.tse)} />
                  </td>
                  <td className="py-3 text-right">
                    <button
                      type="button"
                      onClick={() => removerPesquisa(l.id)}
                      aria-label={rotuloRemover(l)}
                      className="min-h-toque min-w-toque rounded-plena text-corpo text-tinta-media transition-[background-color,color,scale] duration-(--dur-rapida) ease-(--ease-padrao) motion-safe:active:scale-[0.985] hover:bg-ameixa-bruma hover:text-tinta"
                    >
                      <span aria-hidden="true">×</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <ReguaPesquisas escala={escala} className="sr-only" />
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
