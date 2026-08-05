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
import type { ReactNode } from "react";
import { Revelador } from "./revelador";
import { GLOSSARIO, type ChaveGlossario } from "./textos";

/**
 * TERMO SUBLINHADO, não pílula (decisão do dono, missão v2.1 rodada 2).
 *
 * A pílula com anel interrompia o ritmo da frase — "84% de [BOTÃO] para Lula" —
 * e o "?" sobrescrito lia como glifo quebrado. O padrão editorial consagrado
 * para "esta palavra tem definição" é o sublinhado PONTILHADO no próprio termo
 * (Wikipedia, FT, MDN): o texto fica no fluxo da prosa, herda a cor de quem o
 * hospeda, e só o pontilhado âmbar (≥3:1, afordância não-textual) diz "toque
 * aqui". Sem anel, sem fundo, sem glifo — a informação volta a falar mais alto
 * que a afordância.
 *
 * `inline-block` de propósito: o termo nunca quebra no meio ("empate téc- /
 * nico" seria pior que qualquer pílula). `cursor-help` é a convenção de
 * definição. O alvo de toque usa a exceção de alvo inline do WCAG 2.5.8
 * (termo dentro de frase), com um respiro de ±2px que não desloca layout.
 */
const CLASSE_TERMO = [
  "inline-block cursor-help rounded-[3px] px-0.5 -mx-0.5 text-inherit font-medium",
  "underline decoration-atencao decoration-dotted decoration-2 underline-offset-[0.22em]",
  "transition-colors duration-(--dur-rapida) ease-(--ease-padrao)",
  "hover:bg-atencao-fundo hover:decoration-solid",
].join(" ");

/**
 * O gatilho SÓ-"?" — a 2ª camada de um texto resumido.
 *
 * Aqui o "?" é o elemento inteiro, não um apêndice: um selo redondo, macio
 * (campo âmbar-fundo, sem anel — a fadiga de contorno foi apontada pelo dono),
 * com o glifo CENTRADO em tamanho pleno. 24px nos dois eixos (SC 2.5.8).
 */
const CLASSE_SO_INTERROGACAO = [
  "inline-flex min-h-6 min-w-6 items-center justify-center",
  "rounded-plena bg-atencao-fundo align-middle leading-none",
  "text-[max(0.8em,12px)] font-semibold text-atencao",
  "transition-colors duration-(--dur-rapida) ease-(--ease-padrao)",
  "hover:bg-bruma hover:shadow-[inset_0_0_0_1.5px_var(--color-atencao)]",
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
      classeGatilho={CLASSE_TERMO}
      idTeste={idTeste}
      conteudoGatilho={children ?? verbete.termo}
    >
      {verbete.texto}
    </Revelador>
  );
}

/**
 * A 2ª camada de um texto que a tela resumiu: mesmo gesto do glossário, mesma
 * folha no toque e mesmo popover no ponteiro fino (§5.3 bane `title` nativo).
 *
 * O que fica visível é sempre PREFIXO LITERAL do que abre aqui — a dieta corta
 * no ponto final, nunca reescreve. Quem garante isso é quem chama.
 */
export function MaisSobre({
  titulo,
  rotuloAcessivel,
  children,
  idTeste,
}: {
  /** título da folha/popover — normalmente o do bloco que foi resumido */
  titulo: string;
  /** nome acessível do botão: diz o que vai abrir */
  rotuloAcessivel: string;
  children: ReactNode;
  idTeste?: string;
}) {
  return (
    <Revelador
      rotuloAcessivel={rotuloAcessivel}
      titulo={titulo}
      classeGatilho={CLASSE_SO_INTERROGACAO}
      idTeste={idTeste}
      conteudoGatilho={<span aria-hidden="true">?</span>}
    >
      {children}
    </Revelador>
  );
}
