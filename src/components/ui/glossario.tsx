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
 * Alvo de toque SEM margem negativa, e proporcional ao texto que hospeda.
 *
 * A margem negativa é a armadilha óbvia aqui: ela devolve o alvo de toque sem
 * "gastar" altura de linha — e, como um `inline-flex` só empurra a linha pela
 * altura da sua caixa de margem, o chip passa a ser pintado POR CIMA das linhas
 * vizinhas. Sem ela, a linha que hospeda o chip simplesmente cresce, e nenhuma
 * palavra é coberta.
 *
 * A altura mínima é `max(1.5rem, 1.75em)`, não `2rem` fixos: `em` aqui resolve
 * contra o corpo DO PRÓPRIO CHIP (0,95em do texto em volta), então o chip
 * acompanha o texto em vez de estufar a linha. Medido: em prosa de 18px o chip
 * vai de 32 para 29,9px (1,66× → 1,55× da entrelinha); em `text-micro` de 14px
 * vai de 32 para 24px (163% → 122%). Os 24px são o piso do WCAG 2.2 SC 2.5.8 e
 * ficam garantidos pelo `max()`. Nenhum dos 65 pontos de uso muda.
 */
const CLASSE_CHIP = [
  "inline-flex min-h-[max(1.5rem,1.75em)] items-center gap-1 rounded-plena bg-bruma px-2.5 py-0.5",
  // A entrelinha do chip é a DELE, não a da prosa: com o 1,6 herdado a caixa de
  // texto sozinha media 27,4px e era ela — não o `min-h` — que definia a altura,
  // então o chip continuava estufando a linha. Com 1,35 quem manda passa a ser
  // o piso proporcional, que é o ponto do cálculo acima.
  "leading-[1.35]",
  "align-middle text-[0.95em] font-medium text-atencao",
  "shadow-[inset_0_0_0_1.5px_var(--color-atencao)]",
  "transition-colors duration-(--dur-rapida) ease-(--ease-padrao) hover:bg-atencao-fundo",
].join(" ");

/**
 * O "?" é SOBRESCRITO, não pontuação.
 *
 * No corpo pleno ele media 17,1px contra os 18px da prosa (95%) e lia como um
 * ponto de interrogação perdido no meio da frase — foi o primeiro defeito que
 * o dono do produto apontou a olho nu. Aqui ele cai para 11,1px na prosa, com
 * piso duro de 11px em `text-micro` (abaixo disso vira sujeira), sobe 0,15em
 * pelo `translate` — que NÃO empurra a linha, porque não participa do fluxo —
 * e ancora no topo da caixa (`self-start`) para ficar na altura das
 * ascendentes, que é onde um sobrescrito mora.
 */
const CLASSE_INTERROGACAO =
  "self-start -translate-y-[0.15em] text-[max(0.65em,11px)] leading-none font-semibold";

/**
 * O gatilho SÓ-"?" — o padrão da 2ª camada.
 *
 * Onde o texto foi resumido na tela (as dicas das réguas, a leitura dos cartões
 * de contexto, o registro de uma pesquisa), o resto não some: ele fica atrás
 * desta mesma pastilha, sem rótulo, porque o rótulo já é a frase que está
 * visível ao lado. Sozinho o "?" não é sobrescrito de nada — então aqui ele é
 * centrado, e a pastilha é quadrada com os 24px do SC 2.5.8 nos dois eixos.
 */
const CLASSE_SO_INTERROGACAO = [
  "inline-flex min-h-[max(1.5rem,1.75em)] min-w-[max(1.5rem,1.75em)] items-center justify-center",
  "rounded-plena bg-bruma px-1 align-middle leading-none",
  "text-[max(0.75em,11px)] font-semibold text-atencao",
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
          <span aria-hidden="true" className={CLASSE_INTERROGACAO}>
            ?
          </span>
        </>
      }
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
