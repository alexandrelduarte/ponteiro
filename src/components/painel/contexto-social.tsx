/**
 * "Por que a disputa está assim?" — contexto social (COPY-DECK §J).
 *
 * Server Component: texto fixo, zero JavaScript enviado ao navegador.
 *
 * Os NÚMEROS dos cinco cartões são medidos por institutos e não mudam: eles
 * vivem em `src/data/contexto.ts`. O que a tela faz é traduzir — o título vira
 * a pergunta do leitor (aqui) e o `dado`/`leitura` passam pela camada de
 * apresentação de `copia-contexto.ts`, do mesmo jeito que `copia-erros.ts`
 * traduz o histórico de erros. O dado continua intocado.
 */
import { Bloco, Cabecalho, LinkExterno, Nicho, Subtitulo } from "@/components/ui/blocos";
import { aspasCurvas } from "@/components/ui/textos";
import { CONTEXTO_TRADUZIDO } from "./copia-contexto";

/** Títulos-pergunta, na ordem de `CONTEXTO`. */
const TITULOS = [
  "Quanta gente aprova o governo",
  "Quanta gente diz que não votaria de jeito nenhum",
  "Quanta gente já está decidida",
  "O que ainda vai acontecer até a votação",
  "O que está por trás desta disputa",
];

export function ContextoSocial() {
  return (
    <Bloco rotuladoPor="titulo-contexto">
      <Cabecalho
        id="titulo-contexto"
        pergunta="Por que a disputa está assim?"
        resposta={
          <>
            Os dois lados têm voto fechado e rejeição alta. Por isso a diferença anda devagar, e
            quase sempre dentro da mesma faixa.
          </>
        }
        traduzindo={
          <>
            Estes cartões não são opinião: são números medidos por institutos, com a fonte em cada
            um. Eles não entram na conta da chance — servem para entender por que ela se mexe tão
            pouco.
          </>
        }
      />

      <div className="mt-5 grid items-start gap-4 md:grid-cols-2 lg:grid-cols-3">
        {CONTEXTO_TRADUZIDO.map((c, i) => (
          <Nicho key={c.titulo}>
            <Subtitulo>{TITULOS[i] ?? c.titulo}</Subtitulo>
            <p className="mt-2 text-corpo text-tinta numeros">{aspasCurvas(c.dado)}</p>
            <p className="mt-2 text-micro text-tinta-media">{aspasCurvas(c.leitura)}</p>
            <p className="mt-3">
              <LinkExterno href={c.fonte} className="text-micro">
                Ver a fonte deste número
              </LinkExterno>
            </p>
          </Nicho>
        ))}

        {/* Este cartão repetia, palavra quase por palavra, a resposta do topo
            do bloco ("Os dois lados têm voto fechado e rejeição alta. Por isso
            a diferença anda devagar") — duas vezes a mesma frase na mesma tela,
            que é o que VOZ §4 proíbe. Fica só o que ele tinha de próprio: a
            lista do que ainda pode mexer. */}
        <Nicho tom="faixa">
          <Subtitulo>O que ainda pode mexer</Subtitulo>
          <p className="mt-2 text-corpo text-tinta">
            Os cerca de 10% que estão em cima do muro, a propaganda na TV a partir do fim de agosto
            e fato novo na economia ou na Justiça.
          </p>
        </Nicho>
      </div>
    </Bloco>
  );
}
