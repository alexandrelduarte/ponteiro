"use client";

/**
 * "De onde vêm esses números?" — o método em quatro linhas (COPY-DECK §N).
 * O texto completo (limitações, classificação, fontes) mora em /metodologia.
 */
import { Bloco, Cabecalho, LinkInterno } from "@/components/ui/blocos";
import { Termo } from "@/components/ui/glossario";
import { usePainel } from "./estado";

export function MetodologiaResumo() {
  const { pesquisas } = usePainel();

  return (
    <Bloco rotuladoPor="titulo-metodo">
      <Cabecalho
        id="titulo-metodo"
        pergunta="De onde vêm esses números?"
        resposta={
          <>
            De {pesquisas.length} pesquisas registradas no TSE, misturadas numa média que dá mais
            peso às mais novas e às que ouviram mais gente.
          </>
        }
        traduzindo={
          <>
            Depois da média, o painel calcula duas chances: uma se a votação fosse hoje e outra para
            o dia da votação. A segunda carrega mais dúvida, porque até lá a corrida ainda pode
            andar. Nada aqui é torcida: as contas estão abertas e as quatro suposições do painel
            ficam à vista.
          </>
        }
      />

      {/* Quatro itens curtos empilhados numa coluna de 512px deixavam 45,9% da
          placa em branco. Duas colunas a partir de lg — uma linha de classe, e
          cada item continua na medida de leitura. */}
      <ul className="mt-4 space-y-2 text-corpo text-tinta-media numeros lg:grid lg:grid-cols-2 lg:items-start lg:gap-x-10 lg:gap-y-3 lg:space-y-0">
        <li className="max-w-texto">
          <b className="font-semibold text-tinta">O peso de cada pesquisa</b> vem de duas coisas:
          quando ela foi feita e quantas pessoas ouviu.
        </li>
        <li className="max-w-texto">
          <b className="font-semibold text-tinta">A tendência</b> compara cada instituto com ele
          mesmo, para que diferença de método não vire movimento falso.
        </li>
        <li className="max-w-texto">
          <b className="font-semibold text-tinta">As faixas:</b> de 50 a 60 em 100{" "}
          <b className="font-semibold text-tinta">está em aberto</b>; de 60 a 75, na frente por
          pouco; de 75 a 90, na frente; acima de 90, bem na frente — e nem aí é garantia.
        </li>
        <li className="max-w-texto">
          <b className="font-semibold text-tinta">
            <Termo chave="empateTecnico">Empate técnico</Termo>
          </b>
          , em uma pesquisa isolada, é quando a diferença é menor que o dobro da folga da medida.
        </li>
      </ul>

      <p className="mt-4">
        <LinkInterno href="/metodologia" className="text-corpo font-semibold">
          Ler a metodologia completa, com as limitações e as fontes →
        </LinkInterno>
      </p>
    </Bloco>
  );
}
