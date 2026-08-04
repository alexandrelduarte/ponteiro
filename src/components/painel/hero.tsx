"use client";

/**
 * O HERO — a chance de SER ELEITO (docs/DESIGN-V2.md §2.1 e §5.1, COPY-DECK §C).
 *
 * Ordem obrigatória no primeiro scroll de 390px, sem exceção:
 *   wordmark + tagline (cabeçalho do site) → linha de tempo → manchete serif
 *   → enxame → micro-legenda do enxame → parágrafo de procedência.
 *
 * A manchete é SEMPRE a chance de ser eleito (`eleito.dia`) — o número que o
 * OG, o JSON-LD e o compartilhamento também publicam. O enxame logo abaixo é
 * a diferença no 2º turno (`pL2dia`), e a micro-legenda reconcilia os dois na
 * MESMA tela, nunca atrás de um clique: é a correção mandatória §2.1.
 *
 * Tudo aqui sai pronto do HTML do servidor. Nenhum número espera JavaScript.
 */
import { Nicho, Bloco, Aviso } from "@/components/ui/blocos";
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
  const lulaNaFrenteNo1T = M.p1 ? M.p1.lulaDia >= M.p1.flavioDia : true;

  return (
    <div className="mx-auto w-full max-w-pagina px-goteira pt-4 md:px-goteira-md lg:px-goteira-lg">
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
      <p className="mt-4 max-w-[22ch] font-display text-manchete text-tinta md:max-w-[26ch]">
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

      <p className="entra mt-3 max-w-texto text-corpo text-tinta-media">
        o mesmo que dizer {eleitoL}% de{" "}
        <Termo chave="chance" idTeste="chip-glossario-chance">
          chance
        </Termo>{" "}
        para Lula e {eleitoF}% para Flávio
      </p>

      {/* 4. O enxame, dentro da placa (é contra ela que a bolinha faz o 3:1). */}
      <Bloco className="mt-5">
        <Enxame
          layout={layout}
          idTeste="enxame"
          rotuloAcessivel={`Cem bolinhas, uma por cenário da decisão de 25 de outubro: ${nLula} caem do lado de Lula e ${nFlavio} do lado de Flávio.`}
        />

        {/* 5. A micro-legenda que reconcilia os dois números. Obrigatória, na
               mesma tela, e não pode ser encurtada até perder a explicação. */}
        <p className="mt-4 max-w-texto text-corpo text-tinta-media">
          Cada bolinha é um resultado possível, e todas valem o mesmo. Aqui elas mostram{" "}
          <b className="font-semibold text-tinta">só a decisão de 25 de outubro</b>: {nLula} caem do
          lado de Lula e {nFlavio} do lado de Flávio. A frase de cima conta outra coisa: quem
          termina eleito pelos dois caminhos juntos. Em {p1tDef} de cada 100 cenários a eleição
          acaba já em 4 de outubro — nesses não existe 2º turno para a bolinha cair de um lado, e
          eles entram na frase de cima a favor de quem venceu no 1º turno.{" "}
          {lulaNaFrenteNo1T ? (
            <>
              Hoje quase todos esses cenários terminam com Lula eleito — por isso na frase de cima
              ele fica com {eleitoL}, um pouco acima das {nLula} bolinhas, e Flávio com {eleitoF},
              um pouco abaixo das {nFlavio} dele.
            </>
          ) : (
            <>
              Hoje quase todos esses cenários terminam com Flávio eleito — por isso na frase de cima
              ele fica com {eleitoF}, um pouco acima das {nFlavio} bolinhas, e Lula com {eleitoL},
              um pouco abaixo das {nLula} dele.
            </>
          )}
        </p>
      </Bloco>

      {/* 6. "Não é previsão" — nunca some a 390px (H4). */}
      <p data-testid="disclaimer" className="mt-5 max-w-texto text-intro text-tinta">
        Isto não é previsão. É o que as {pesquisas.length} pesquisas registradas no TSE dizem hoje,
        mais o tanto que a corrida ainda pode andar até outubro.
      </p>

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

        <h2 data-testid="veredito-titulo" className="text-pergunta text-tinta">
          {faixa === "empate" ? "Está em aberto — dá para os dois lados" : null}
          {faixa === "leve" ? `${lider} está na frente por pouco — e isso ainda pode mudar` : null}
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
              A diferença de {abs1(M.margemAj)} pontos na decisão é pequena diante da dúvida, que é
              de cerca de {fmt(M.sigmaDia2)} pontos para cada lado. Pelos números de hoje, qualquer
              um dos dois pode ser eleito.
            </>
          ) : null}
          {faixa === "leve" ? (
            <>
              A vantagem existe, mas cabe dentro do erro que as pesquisas já cometeram antes, somado
              aos {M.dias2T} dias que ainda faltam. Virada segue possível.
            </>
          ) : null}
          {faixa === "favorito" ? (
            <>
              A vantagem de {abs1(M.margemAj)} pontos na decisão é grande diante da dúvida de hoje,
              que é de cerca de {fmt(M.sigmaHoje)} pontos para cada lado. Mesmo assim, um erro das
              pesquisas do tamanho do de 2022, ou a campanha na TV, ainda permitiriam a virada.
            </>
          ) : null}
          {faixa === "amplo" ? (
            <>
              A vantagem aparece na maioria das pesquisas e resiste ao erro que elas já cometeram
              antes. Para virar, seria preciso um erro de pesquisa maior que os já vistos e uma
              mudança de opinião fora do padrão. Improvável não é impossível.
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

        <p className="mt-4 max-w-texto text-corpo text-tinta-media">
          Chance não é resultado. O painel monta 100 cenários compatíveis com as pesquisas de hoje{" "}
          <b className="font-semibold text-tinta">
            e com o quanto a corrida ainda pode andar até outubro
          </b>
          , e conta em quantos deles cada um termina eleito. Um resultado que aparece em{" "}
          {M.eleito.dia.l >= 0.5 ? eleitoF : eleitoL} de 100 cenários é pouco provável — não é
          impossível.
        </p>
      </Bloco>

      {/* 7. Procedência + selo de frescor. */}
      <div className="entra mt-4 max-w-texto">
        <p className="text-corpo text-tinta-media">
          {pesquisas.length} pesquisas de {institutos} institutos, todas com{" "}
          <Termo chave="registroTse">registro no TSE</Termo>. Cada uma tem link para a publicação
          original.
        </p>
        <p
          data-testid="selo-frescor"
          className={`mt-2 text-micro ${selo.alerta ? "text-atencao" : "text-tinta-media"}`}
        >
          <span aria-hidden="true">{selo.alerta ? "⚠ " : "✓ "}</span>
          {selo.texto}
        </p>
        <p className="mt-1 text-micro text-tinta-media">{EXPLICA_FRESCOR}</p>
      </div>
    </div>
  );
}
