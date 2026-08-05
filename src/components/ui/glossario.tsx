"use client";

/**
 * Chip de glossário (docs/DESIGN-V2.md §5.2 e §6.5, COPY-DECK §O).
 *
 * Palavra difícil é para TOCAR: o termo fica inline na prosa, com tinta e
 * contorno em âmbar-queimado sobre campo bruma, e a definição de 1–2 frases
 * abre na mesma tela. O chip é atalho, não condição: a explicação essencial
 * já está no corpo do texto (VOZ §1.3) — nada importante mora atrás do clique.
 *
 * O "?" é decorativo (`aria-hidden`); o nome acessível diz "o que é <termo>",
 * que contém o rótulo visível (WCAG 2.5.3).
 */
import { Revelador } from "./revelador";
import { GLOSSARIO, type ChaveGlossario } from "./textos";

/**
 * Alvo de 32px de altura (§6.5) SEM margem negativa.
 *
 * A margem negativa é a armadilha óbvia aqui: ela devolve o alvo de toque sem
 * "gastar" altura de linha — e, como um `inline-flex` só empurra a linha pela
 * altura da sua caixa de margem, o chip passa a ser pintado POR CIMA das linhas
 * vizinhas. Sem ela, a linha que hospeda o chip simplesmente cresce, e nenhuma
 * palavra é coberta.
 */
const CLASSE_CHIP = [
  "inline-flex min-h-8 items-center gap-1 rounded-plena bg-bruma px-2.5 py-0.5",
  "align-middle text-[0.95em] font-medium text-atencao",
  "shadow-[inset_0_0_0_1.5px_var(--color-atencao)]",
  "transition-colors duration-(--dur-rapida) ease-(--ease-padrao) hover:bg-atencao-fundo",
].join(" ");

export function Termo({
  chave,
  children,
  idTeste,
}: {
  chave: ChaveGlossario;
  /** rótulo visível — por padrão, o nome canônico do termo */
  children?: React.ReactNode;
  idTeste?: string;
}) {
  const verbete = GLOSSARIO[chave];
  /* WCAG 2.5.3: o nome acessível CONTÉM o rótulo visível. Quando o chip mostra
     um texto próprio (ex.: "folga da medida" para a chave margemErro), o nome
     deriva DELE — a API passa a impor a invariante que antes era só comentário. */
  const rotuloVisivel = typeof children === "string" ? children : verbete.termo;
  return (
    <Revelador
      rotuloAcessivel={`o que é ${rotuloVisivel}`}
      titulo={verbete.termo}
      classeGatilho={CLASSE_CHIP}
      idTeste={idTeste}
      conteudoGatilho={
        <>
          {children ?? verbete.termo}
          <span aria-hidden="true" className="font-semibold">
            ?
          </span>
        </>
      }
    >
      {verbete.texto}
    </Revelador>
  );
}
