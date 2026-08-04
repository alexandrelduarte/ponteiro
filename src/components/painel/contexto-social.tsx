/**
 * "Por que a disputa está assim?" — contexto social (COPY-DECK §J).
 *
 * Server Component: texto fixo, zero JavaScript enviado ao navegador.
 *
 * Os campos `dado`, `leitura` e `fonte` dos cinco cartões são NÚMEROS MEDIDOS e
 * permanecem exatamente como estão em `src/data/constantes.ts`. O que muda é o
 * título, que passa a ser a pergunta do leitor.
 */
import {
  Bloco,
  LinkExterno,
  Nicho,
  Pergunta,
  Resposta,
  Subtitulo,
  Traduzindo,
} from "@/components/ui/blocos";
import { CONTEXTO } from "@/data/contexto";

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
      <Pergunta id="titulo-contexto">Por que a disputa está assim?</Pergunta>
      <Resposta>
        Os dois lados têm voto fechado e rejeição alta. Por isso a diferença anda devagar, e quase
        sempre dentro da mesma faixa.
      </Resposta>
      <Traduzindo>
        Estes cartões não são opinião: são números medidos por institutos, com a fonte em cada um.
        Eles não entram na conta da probabilidade — servem para entender por que ela se mexe tão
        pouco.
      </Traduzindo>

      <div className="mt-5 grid items-start gap-4 md:grid-cols-2 lg:grid-cols-3">
        {CONTEXTO.map((c, i) => (
          <Nicho key={c.titulo}>
            <Subtitulo>{TITULOS[i] ?? c.titulo}</Subtitulo>
            <p className="mt-2 text-corpo text-tinta numeros">{c.dado}</p>
            <p className="mt-2 text-micro text-tinta-media">{c.leitura}</p>
            <p className="mt-3">
              <LinkExterno href={c.fonte} className="text-micro">
                Ver a fonte deste número
              </LinkExterno>
            </p>
          </Nicho>
        ))}

        <Nicho tom="faixa">
          <Subtitulo>Juntando tudo</Subtitulo>
          <p className="mt-2 text-corpo text-tinta">
            Os dois lados têm eleitorado fechado e rejeição alta. Sobra pouca gente para conquistar
            — por isso a diferença se move devagar. O que ainda pode mexer: os cerca de 10% que
            estão em cima do muro, a propaganda na TV a partir do fim de agosto e fato novo na
            economia ou na Justiça.
          </p>
        </Nicho>
      </div>
    </Bloco>
  );
}
