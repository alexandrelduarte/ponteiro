"use client";

/**
 * "Quer mexer nos números você mesmo?" (COPY-DECK §K).
 *
 * As quatro réguas são as suposições do painel, e ficam NA PÁGINA — não atrás
 * de um menu de "configurações avançadas". Mexer numa delas rotula a página
 * inteira como simulação (R5/H7), e o caminho de volta ao oficial fica sempre
 * a um toque, sem rolagem.
 *
 * O resultado é dito na MESMA linguagem de frequência do hero: as mesmas 100
 * bolinhas, mesma régua, mesma gramática (§4.2) — é o que permite comparar
 * maçã com maçã sem reaprender nada.
 */
import {
  Bloco,
  Botao,
  LinkInterno,
  Nicho,
  Pergunta,
  Resposta,
  Subtitulo,
  Traduzindo,
} from "@/components/ui/blocos";
import { Termo } from "@/components/ui/glossario";
import { Celebra, Contagem } from "@/components/ui/movimento";
import { ACOES, abs1, direcaoVies, parEmCem } from "@/components/ui/textos";
import { PARAMS_PADRAO } from "@/data/constantes";
import { fmt, fmtSinal } from "@/lib/modelo";
import { Compartilhar } from "./compartilhar";
import { Deslizador } from "./deslizador";
import { Enxame, montarEnxame } from "./enxame";
import { FAIXAS } from "./parametros-url";
import { usePainel } from "./estado";

export function Parametros() {
  const { M, Moficial, params, definirParam, restaurarParams, paramsAlterados, simulando } =
    usePainel();

  const derivaPt = fmt(M.deriva2);
  // O efeito em pontos que a régua no PADRÃO produziria: a deriva é linear no
  // coeficiente, então basta reescalar a que já está publicada (sem recalcular
  // raiz de dias, que arredondaria diferente do modelo).
  const derivaPadrao = fmt((M.deriva2 * PARAMS_PADRAO.coefDeriva) / params.coefDeriva);
  const [simLula, simFlavio] = parEmCem(M.eleito.dia.l);
  const [eleitoLula, eleitoFlavio] = parEmCem(Moficial?.eleito.dia.l ?? null);
  const layout = montarEnxame(M.margemAj, M.sigmaDia2);
  const viesAbs = abs1(params.vies);

  return (
    <Bloco rotuladoPor="titulo-simulacao">
      <Pergunta id="titulo-simulacao">Quer mexer nos números você mesmo?</Pergunta>
      <Resposta>
        Estas quatro réguas são as suposições que o painel usa. Mexa nelas e o número muda na hora.
      </Resposta>
      <Traduzindo>
        É teste seu: nada aqui altera os dados oficiais, e ninguém mais vê o que você mexeu. O botão
        de voltar ao oficial fica sempre à vista. Se você mexer em alguma régua, o painel inteiro
        passa a mostrar “simulação”.
      </Traduzindo>

      <div className="mt-5 grid gap-6 md:grid-cols-2">
        <Deslizador
          rotulo="Quanto tempo uma pesquisa continua valendo"
          valorExibido={`${fmt(params.meiaVida, 0)} dias`}
          leituraAcessivel={`Uma pesquisa passa a valer metade depois de ${fmt(params.meiaVida, 0)} dias`}
          valor={params.meiaVida}
          faixa={FAIXAS.meiaVida}
          idTeste="slider-meia"
          onChange={(v) => definirParam("meiaVida", v)}
          dica={
            <>
              Pesquisa mais nova conta mais na média. Aqui você diz em quantos dias uma pesquisa
              passa a valer a metade. Diminuindo, o painel reage mais rápido às pesquisas novas. As
              antigas não somem da lista: elas continuam contando para mostrar se a diferença subiu
              ou desceu.
            </>
          }
        />

        <Deslizador
          rotulo="O quanto as pesquisas podem errar todas juntas"
          valorExibido={`${fmt(params.sigmaSys)} pontos`}
          leituraAcessivel={`Erro que todas as pesquisas podem cometer juntas: ${fmt(params.sigmaSys)} pontos`}
          valor={params.sigmaSys}
          faixa={FAIXAS.sigmaSys}
          idTeste="slider-sys"
          onChange={(v) => definirParam("sigmaSys", v)}
          dica={
            <>
              Às vezes o erro não é de uma pesquisa só: todas erram para o mesmo lado. Em 2022 esse
              erro foi de 6,3 pontos{" "}
              <b className="font-semibold text-tinta">na diferença entre os dois</b> no 1º turno e
              de 3,1 no 2º. A diferença é que, entre um turno e outro, os institutos corrigiram o
              método usando o resultado real do 1º turno. As pesquisas de hoje ainda não passaram
              por essa correção — por isso o padrão fica em 4,0, entre os dois números. Parte
              daqueles 6,3 foi gente mudando de ideia na última hora, e isso já entra na régua de
              baixo.
            </>
          }
        />

        <Deslizador
          rotulo="O quanto a corrida ainda pode andar"
          valorExibido={`cerca de ${derivaPt} pontos para cada lado, até 25 de outubro`}
          leituraAcessivel={`A corrida ainda pode andar cerca de ${derivaPt} pontos até 25 de outubro`}
          valor={params.coefDeriva}
          faixa={FAIXAS.coefDeriva}
          idTeste="slider-deriva"
          onChange={(v) => definirParam("coefDeriva", v)}
          dica={
            <>
              Até a votação ainda tem propaganda na TV, debate e fato novo. Esta régua diz{" "}
              <Termo chave="deriva">o quanto a corrida ainda pode andar</Termo> até lá. Ela muda só
              o número projetado para o dia da votação — o retrato de hoje fica igual. É ela que faz
              as duas linhas do topo serem diferentes.
            </>
          }
        />

        <Deslizador
          rotulo="E se as pesquisas estiverem puxando para um lado?"
          valorExibido={
            params.vies === 0 ? "nenhuma puxada" : `${viesAbs} pontos ${direcaoVies(params.vies)}`
          }
          leituraAcessivel={
            params.vies === 0
              ? "Nenhuma puxada suposta"
              : `Puxada suposta: ${viesAbs} pontos ${direcaoVies(params.vies)}`
          }
          valor={params.vies}
          faixa={FAIXAS.vies}
          idTeste="slider-vies"
          onChange={(v) => definirParam("vies", v)}
          dica={
            <>
              Aqui você supõe que todas as pesquisas estão puxando para o mesmo lado, e diz o
              tamanho da puxada. Para um lado, as pesquisas estariam dando a Lula mais do que ele
              tem; para o outro, dando a Flávio mais do que ele tem. Em 2022 a puxada medida foi de
              6,3 pontos <b className="font-semibold text-tinta">na diferença entre os dois</b> no
              1º turno e de 3,1 no 2º — e elas não se somam: a do 2º turno já foi medida em
              pesquisas refeitas depois do 1º. Isto é um teste, não uma acusação.{" "}
              <Termo chave="vies" />
            </>
          }
        />
      </div>

      {/* ---------------- resultado, na mesma linguagem do hero ----------------
          Duas chaves EXCLUDENTES, na redação assinada pelo data-scientist
          (AUDITORIA-COPY §10.1). O rótulo "nesta simulação" existe para marcar
          o que NÃO é oficial: usá-lo com tudo no padrão invertia H7 e fazia o
          leitor concluir que o número da manchete era simulado.

          A condição é DUPLA — réguas no padrão E série igual à oficial. Tirar
          ou acrescentar uma pesquisa já é simulação, mesmo com as quatro
          réguas intocadas: os dois eixos são independentes. */}
      <Nicho className="mt-6">
        {simulando ? (
          <>
            <p data-testid="resultado-simulacao" className="text-intro text-tinta">
              Nesta simulação, Lula é eleito em{" "}
              <Celebra chave={simLula}>
                <b className="text-dado text-lula numeros">
                  {Number.isFinite(Number(simLula)) ? (
                    <Contagem valor={Number(simLula)} />
                  ) : (
                    simLula
                  )}
                </b>
              </Celebra>{" "}
              de cada 100 cenários, e Flávio em <b className="text-flavio numeros">{simFlavio}</b>.
              No painel oficial são <span className="numeros">{eleitoLula}</span> e{" "}
              <span className="numeros">{eleitoFlavio}</span>.
            </p>
            <p className="sr-only" role="status" aria-live="polite">
              Resultado da sua simulação: {simLula} em 100 para Lula, {simFlavio} em 100 para
              Flávio.
            </p>
          </>
        ) : (
          <>
            <p data-testid="resultado-oficial" className="text-intro text-tinta">
              Com as réguas no padrão, este é o número oficial do painel: Lula é eleito em{" "}
              <b className="text-dado text-lula numeros">{eleitoLula}</b> de cada 100 cenários, e
              Flávio em <b className="text-flavio numeros">{eleitoFlavio}</b>.
            </p>
            <p className="sr-only" role="status" aria-live="polite">
              Resultado com as réguas no padrão: {eleitoLula} em 100 para Lula, {eleitoFlavio} em
              100 para Flávio.
            </p>
          </>
        )}

        <div className="mt-4">
          <Enxame
            layout={layout}
            escala="mini"
            idTeste="enxame-simulacao"
            rotuloAcessivel={`Cem bolinhas, uma por cenário da decisão de 25 de outubro: ${layout.nLula} do lado de Lula e ${layout.nFlavio} do lado de Flávio.`}
          />
          {/* A frase colada no desenho usa O NÚMERO DO DESENHO (§10.1c). O
              mini-enxame desenha os quantis da margem do 2º turno; a frase
              acima soma também o caminho que acaba em 4 de outubro. Sem esta
              reconciliação, escrito e desenhado discordavam sem aviso (H3).
              A cláusula do meio ensina a ler a FORMA, não só a contar os lados:
              o desenho carregava a dúvida na largura da pilha e nenhuma legenda
              do produto dizia isso — o leitor aprendia a contar as bolinhas de
              cada lado e ia embora sem saber o que o espalhamento significa. */}
          <p
            data-testid="legenda-mini-enxame"
            className="mt-3 max-w-texto text-micro text-tinta-media"
          >
            As bolinhas mostram só a decisão de 25 de outubro: {layout.nLula} caem do lado de Lula e{" "}
            {layout.nFlavio} do lado de Flávio. A largura da pilha é o tamanho da dúvida no dia da
            votação: quanto mais espalhadas, menos fechada está a disputa. A frase acima soma também
            quem ganha já em 4 de outubro — por isso dá outro número.
          </p>
        </div>
      </Nicho>

      {/* ---------------- as contas ---------------- */}
      <div className="mt-5">
        <Subtitulo>As contas, em uma linha cada</Subtitulo>
        {/* Duas colunas a partir de lg: em coluna única as três contas
            deixavam 32% da placa de 936px em branco à direita. Cada coluna
            continua na medida de leitura. */}
        <div className="mt-2 space-y-2 text-corpo text-tinta-media numeros lg:grid lg:grid-cols-2 lg:items-start lg:gap-x-10 lg:gap-y-2 lg:space-y-0">
          <p className="max-w-texto">
            Diferença nas pesquisas: {fmtSinal(M.margem)} menos a puxada suposta (
            {fmtSinal(params.vies)}) ={" "}
            <b className="font-semibold text-tinta">{fmtSinal(M.margemAj)} pontos</b>.
          </p>
          <p className="max-w-texto">
            Dúvida de hoje: o quanto a média das pesquisas ainda pode variar, combinado com o erro
            que todas podem cometer juntas — dá{" "}
            <b className="font-semibold text-tinta">± {fmt(M.sigmaHoje)} pontos</b>. As duas dúvidas
            não se somam: juntas dão menos que a soma.
          </p>
          <p className="max-w-texto">
            Dúvida no dia da votação: a dúvida de hoje combinada com o quanto a corrida ainda pode
            andar — dá <b className="font-semibold text-tinta">± {fmt(M.sigmaDia2)} pontos</b>. Aqui
            também não se somam: {fmt(M.sigmaHoje)} e {derivaPt} juntos dão {fmt(M.sigmaDia2)}, não
            a soma dos dois.
          </p>
        </div>
        {/* O rótulo tem de dizer o destino (VOZ §5.3). "Ver a fórmula exata"
            levava a uma página que abre na explicação simples, onde não há
            fórmula nenhuma: o link agora leva à explicação TÉCNICA, e a
            /metodologia entende essa âncora e já abre nela. */}
        <p className="mt-2">
          <LinkInterno href="/metodologia#explicacao-tecnica" className="text-corpo">
            Ver a fórmula exata na explicação técnica da metodologia
          </LinkInterno>
        </p>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <Botao
          onClick={restaurarParams}
          disabled={!paramsAlterados}
          data-testid="restaurar-parametros"
          variante={paramsAlterados ? "primario" : "fantasma"}
        >
          {paramsAlterados ? ACOES.restaurarParametros : "As réguas já estão no padrão"}
        </Botao>
        <Compartilhar />
      </div>
      {paramsAlterados ? (
        <p className="mt-2 text-micro text-tinta-media numeros">
          {PARAMS_PADRAO.meiaVida} dias · {fmt(PARAMS_PADRAO.sigmaSys)} pontos · corrida pode andar{" "}
          {derivaPadrao} pontos · sem puxada
        </p>
      ) : null}
    </Bloco>
  );
}
