"use client";

/**
 * O HERO — a chance de SER ELEITO (docs/DESIGN-V2.md §2.1 e §5.1, COPY-DECK §C).
 *
 * Ordem obrigatória no primeiro scroll de 390px, sem exceção:
 *   wordmark + tagline (cabeçalho do site) → linha de tempo → manchete serif
 *   → enxame → micro-legenda do enxame → "isto não é previsão".
 * Os três últimos moram na MESMA placa: fora dela, o "isto não é previsão"
 * começava em y=839 de 844 e a dobra o cortava pelas ascendentes.
 *
 * A manchete é SEMPRE a chance de ser eleito (`eleito.dia`) — o número que o
 * OG, o JSON-LD e o compartilhamento também publicam. O enxame logo abaixo é
 * a diferença no 2º turno (`pL2dia`), e a micro-legenda reconcilia os dois na
 * MESMA tela, nunca atrás de um clique: é a correção mandatória §2.1.
 *
 * Tudo aqui sai pronto do HTML do servidor. Nenhum número espera JavaScript.
 */
import { Nicho, Bloco, Aviso, Colunas } from "@/components/ui/blocos";
import { Termo } from "@/components/ui/glossario";
import { Contagem } from "@/components/ui/movimento";
import { abs1, direcaoVies, faixaVeredito, parEmCem } from "@/components/ui/textos";
import { fmt, fmtSinal } from "@/lib/modelo";
import { Enxame, montarEnxame } from "./enxame";
import { EXPLICA_FRESCOR, type SeloFrescor } from "./frescor";
import { usePainel } from "./estado";

/** Chance publicada: conta quando muda, e respeita piso e teto (H13). */
function NumeroChance({ texto, className }: { texto: string; className?: string }) {
  const n = Number(texto);
  if (!Number.isFinite(n)) return <span className={className}>{texto}</span>;
  return <Contagem valor={n} className={className} />;
}

export function Hero({ selo }: { selo: SeloFrescor }) {
  const { M, params, pesquisas } = usePainel();

  const [eleitoL, eleitoF] = parEmCem(M.eleito.dia.l);
  const [eleitoHojeL, eleitoHojeF] = parEmCem(M.eleito.hoje.l);
  const [p2t, p1tDef] = parEmCem(M.p2Tacontece);

  const layout = montarEnxame(M.margemAj, M.sigmaDia2);
  const nLula = String(layout.nLula);
  const nFlavio = String(layout.nFlavio);

  const institutos = new Set(pesquisas.map((p) => p.instituto)).size;
  const lider = M.eleito.dia.l >= 0.5 ? "Lula" : "Flávio";
  const faixa = faixaVeredito(Math.max(M.eleito.dia.l, M.eleito.dia.f));

  return (
    <div className="mx-auto w-full max-w-pagina px-goteira pt-3 md:px-goteira-md lg:px-goteira-lg">
      {/* 1. Linha de tempo */}
      <p className="entra text-etiqueta text-tinta-media numeros">
        2º turno · 25 de outubro · faltam {M.dias2T} dias
      </p>

      {/* 2. Título da página — a primeira aparição dos dois nomes é completa. */}
      <h1 className="entra mt-1 text-secao font-normal text-tinta-media">
        Presidente 2026 · Lula (PT) × Flávio Bolsonaro (PL)
      </h1>

      {/* 3. A manchete. Sem animação de entrada: é o LCP e não pode nascer
             invisível. Os dois números somam 100 e são o mesmo inteiro que o
             resto do site publica. */}
      <p className="mt-4 max-w-[15ch] font-display text-manchete text-tinta md:max-w-[17ch]">
        Em 100 eleições parecidas com esta, Lula é eleito em{" "}
        <span data-testid="manchete-lula" className="text-lula numeros">
          <NumeroChance texto={eleitoL} />
        </span>{" "}
        e Flávio em{" "}
        <span data-testid="manchete-flavio" className="text-flavio numeros">
          <NumeroChance texto={eleitoF} />
        </span>
        .
      </p>

      <p className="entra mt-2 max-w-texto text-corpo text-tinta-media">
        o mesmo que dizer {eleitoL}% de{" "}
        <Termo chave="chance" idTeste="chip-glossario-chance">
          chance
        </Termo>{" "}
        para Lula e {eleitoF}% para Flávio
      </p>

      {/* 4. O enxame, dentro da placa (é contra ela que a bolinha faz o 3:1).
             Ele ocupa a PLACA INTEIRA em qualquer largura: a versão de duas
             colunas (desenho | legenda) resolvia a faixa morta a 1440, mas
             cobrava o preço errado — travava a bolinha do hero em 16px contra
             20px do enxame de "Isso ainda pode virar?", e a fazia ENCOLHER
             quando o viewport crescia (18px a 768 → 16px a 1440). O
             elemento-assinatura não pode ser o menor da página. A faixa morta
             não volta: quem chega à borda direita agora é o próprio desenho. */}
      <Bloco className="mt-4">
        <Enxame
          layout={layout}
          escala="hero"
          idTeste="enxame"
          rotuloAcessivel={`Cem bolinhas, uma por cenário da decisão de 25 de outubro: ${nLula} caem do lado de Lula e ${nFlavio} do lado de Flávio.`}
        />

        {/* 5 e 6, lado a lado a partir de lg — e NA MESMA ORDEM DO DOM.
               A micro-legenda e o "isto não é previsão" são as duas frases que
               fecham o hero, e empilhadas deixavam 44,8% da placa em branco à
               direita. Como `Colunas` só vira grade em `lg`, a 390 a ordem de
               leitura continua exatamente a de §5.1 (legenda → não é previsão)
               e a dobra de 844px não muda um pixel. */}
        <Colunas arranjo="principal" className="mt-3">
          {/* 5. A micro-legenda, na redação assinada pelo data-scientist
                 (AUDITORIA-COPY §10.2): 55 palavras, com DUAS marcas de dúvida
                 dentro — "nenhuma é o resultado" e a cláusula literal de H2,
                 "até outubro isso ainda pode mudar". É ela que garante que a
                 primeira dobra de 390px carregue dúvida mesmo quando o
                 veredito desce para baixo da linha do horizonte.
                 Os fechos condicionais por líder ficaram APOSENTADOS: duas
                 fontes para o mesmo fato foi como o 83 ↔ 82 nasceu. */}
          <p data-testid="legenda-enxame" className="max-w-texto text-corpo text-tinta-media">
            Cada bolinha é um resultado possível: nenhuma é o resultado —{" "}
            <b className="font-semibold text-tinta">até outubro isso ainda pode mudar</b>. Aqui, só
            a decisão de 25 de outubro: {nLula} do lado de Lula, {nFlavio} do lado de Flávio. Em{" "}
            {p1tDef} de cada 100 cenários não há 2º turno; esses entram na frase de cima, que dá{" "}
            {eleitoL} e {eleitoF}.
          </p>

          {/* 6. "Não é previsão" — nunca some a 390px (H4), e §5.1 pede os seis
                 elementos no primeiro scroll "sem exceção". Ele ficava FORA da
                 placa e começava em y=839 dos 844: sobravam 5px de ascendentes.
                 Dentro da placa ele sobe o vão de 16px mais o respiro de 20px do
                 fim do cartão — e passa a caber inteiro. */}
          <p data-testid="disclaimer" className="mt-3 max-w-texto text-intro text-tinta lg:mt-0">
            Isto não é previsão. É o que as {pesquisas.length} pesquisas registradas no TSE dizem
            hoje, mais o tanto que a corrida ainda pode andar até outubro.
          </p>
        </Colunas>
      </Bloco>

      <Bloco className="mt-4">
        {params.vies !== 0 ? (
          <Aviso className="mb-4">
            <span data-testid="aviso-vies">
              Simulação: você está supondo que as pesquisas estão puxando {abs1(params.vies)} pontos{" "}
              {direcaoVies(params.vies)}. A diferença medida ({fmtSinal(M.margem)}) vira{" "}
              {fmtSinal(M.margemAj)} pontos nesta conta.
            </span>
          </Aviso>
        ) : null}

        {/* O VEREDITO e o que "chance" quer dizer, pareados a partir de lg.
            O título mais o parágrafo da faixa ficam na medida de leitura à
            esquerda; as duas frases que ensinam a ler o número — antes soltas
            depois dos nichos, num grid de 2 colunas próprio — sobem para a
            coluna da direita. Um pareamento no lugar de duas faixas mortas. */}
        <Colunas arranjo="principal">
          <div>
            <h2 data-testid="veredito-titulo" className="text-pergunta text-tinta">
              {faixa === "empate" ? "Está em aberto — dá para os dois lados" : null}
              {faixa === "leve"
                ? `${lider} está na frente por pouco — e isso ainda pode mudar`
                : null}
              {faixa === "favorito" ? (
                <>
                  {lider} está na frente — provável, mas <b>ainda pode mudar</b>
                </>
              ) : null}
              {faixa === "amplo" ? `${lider} está bem na frente — mas não é garantia` : null}
            </h2>

            <p className="mt-2 max-w-texto text-corpo text-tinta-media">
              {faixa === "empate" ? (
                <>
                  A diferença de {abs1(M.margemAj)} pontos na decisão é pequena diante da dúvida,
                  que é de cerca de {fmt(M.sigmaDia2)} pontos para cada lado. Pelos números de hoje,
                  qualquer um dos dois pode ser eleito.
                </>
              ) : null}
              {faixa === "leve" ? (
                <>
                  A vantagem existe, mas cabe dentro do erro que as pesquisas já cometeram antes,
                  somado aos {M.dias2T} dias que ainda faltam. Virada segue possível.
                </>
              ) : null}
              {faixa === "favorito" ? (
                <>
                  A vantagem de {abs1(M.margemAj)} pontos na decisão é grande diante da dúvida de
                  hoje, que é de cerca de {fmt(M.sigmaHoje)} pontos para cada lado. Mesmo assim, um
                  erro das pesquisas do tamanho do de 2022, ou a campanha na TV, ainda permitiriam a
                  virada.
                </>
              ) : null}
              {faixa === "amplo" ? (
                <>
                  A vantagem aparece na maioria das pesquisas e resiste ao erro que elas já
                  cometeram antes. Para virar, seria preciso um erro de pesquisa maior que os já
                  vistos e uma mudança de opinião fora do padrão. Improvável não é impossível.
                </>
              ) : null}
              {params.vies !== 0 ? (
                <>
                  {" "}
                  Nesta conta você supôs uma puxada de {abs1(params.vies)} pontos{" "}
                  {direcaoVies(params.vies)}: a diferença medida ({fmtSinal(M.margem)}) virou{" "}
                  {fmtSinal(M.margemAj)}.
                </>
              ) : null}
            </p>
          </div>

          <div className="mt-4 lg:mt-0">
            <p className="max-w-texto text-corpo text-tinta-media">
              Chance não é resultado. O painel monta 100 cenários compatíveis com as pesquisas de
              hoje{" "}
              <b className="font-semibold text-tinta">
                e com o quanto a corrida ainda pode andar até outubro
              </b>
              , e conta em quantos deles cada um termina eleito.
            </p>
            <p className="mt-3 max-w-texto text-corpo text-tinta-media">
              Um resultado que aparece em {M.eleito.dia.l >= 0.5 ? eleitoF : eleitoL} de 100
              cenários é pouco provável — não é impossível.
            </p>
          </div>
        </Colunas>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <Nicho>
            <p className="text-corpo text-tinta">
              Se a votação fosse hoje: Lula seria eleito em <b className="numeros">{eleitoHojeL}</b>{" "}
              de cada 100 cenários; Flávio, em <b className="numeros">{eleitoHojeF}</b>.
            </p>
            <p className="mt-2 text-micro text-tinta-media">
              A diferença entre as duas linhas é o tempo. O número de outubro soma o quanto a
              corrida ainda pode andar — propaganda na TV, debates, fato novo. Por isso o número de
              outubro carrega mais dúvida que o de hoje.
            </p>
          </Nicho>
          <Nicho>
            <p className="text-corpo text-tinta">
              Como a eleição se decide: <b className="numeros">{p2t}</b> de cada 100 cenários
              terminam com decisão no <Termo chave="segundoTurno">2º turno</Termo>, em 25 de
              outubro. Em <b className="numeros">{p1tDef}</b> de cada 100, a eleição acaba já no 1º
              turno.
            </p>
            <p className="mt-2 text-micro text-tinta-media">
              1º turno · 4 de outubro · faltam {M.dias1T} dias
            </p>
          </Nicho>
        </div>
      </Bloco>

      {/* 7. Procedência | selo de frescor — o terceiro pareamento do hero.
             De onde vêm os números fica à esquerda, na medida de leitura; o
             quão frescos eles são (selo + explicação) à direita. */}
      <Colunas arranjo="principal" className="entra mt-4">
        <p className="max-w-texto text-corpo text-tinta-media">
          {pesquisas.length} pesquisas de {institutos} institutos, todas com{" "}
          <Termo chave="registroTse">registro no TSE</Termo>. Cada uma tem link para a publicação
          original.
        </p>
        <div className="mt-2 max-w-texto lg:mt-0">
          <p
            data-testid="selo-frescor"
            className={`text-micro ${selo.alerta ? "text-atencao" : "text-tinta-media"}`}
          >
            <span aria-hidden="true">{selo.alerta ? "⚠ " : "✓ "}</span>
            {selo.texto}
          </p>
          <p className="mt-1 text-micro text-tinta-media">{EXPLICA_FRESCOR}</p>
        </div>
      </Colunas>
    </div>
  );
}
