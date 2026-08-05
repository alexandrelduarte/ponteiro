/**
 * As peças do sistema ENXAME (docs/DESIGN-V2.md §5.2, §6.1, §6.5).
 *
 * A página é uma CONVERSA em blocos arredondados e generosos, sem borda e sem
 * filete, boiando numa página tingida de ameixa. Hierarquia por tinta de fundo
 * — bruma (página) → placa (bloco) → nicho (caixa dentro do bloco) —, nunca por
 * moldura e nunca por sombra: bloco parado não leva sombra (§3.5).
 *
 * Cada bloco abre com um título-PERGUNTA que conclui (`<h2>`), depois a
 * RESPOSTA com o número, depois o TRADUZINDO, e só então o gráfico ou a tabela
 * (VOZ §7). Nenhum bloco começa por gráfico; nenhum começa por número solto.
 *
 * Tudo aqui é Server Component: nenhum hook, nenhum estado.
 */
import Link from "next/link";
import type { ReactNode } from "react";

const junta = (...classes: (string | false | null | undefined)[]) =>
  classes.filter(Boolean).join(" ");

/* ------------------------------------------------------------------ *
 * Coluna e ritmo                                                     *
 * ------------------------------------------------------------------ */

/** Faixa de conteúdo: coluna de 1200px, goteiras 16/24/40 e respiro entre blocos. */
export function Secao({
  children,
  className,
  id,
  rotuladaPor,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
  rotuladaPor?: string;
}) {
  return (
    <section
      id={id}
      aria-labelledby={rotuladaPor}
      className={junta(
        "mx-auto w-full max-w-pagina px-goteira md:px-goteira-md lg:px-goteira-lg",
        "mt-respiro md:mt-respiro-md",
        className,
      )}
    >
      {children}
    </section>
  );
}

/* ------------------------------------------------------------------ *
 * Colunas — a composição de lg                                       *
 * ------------------------------------------------------------------ */

export type ArranjoColunas = "iguais" | "principal" | "tres" | "leitura-dado";

/**
 * Os quatro arranjos de duas/três colunas que a página inteira usa a partir de
 * `lg`, e nenhum a mais.
 *
 * Por que um primitivo e não `grid-cols-2` solto em cada seção: a medida de
 * leitura (≤58ch, §6.1) só sobrevive se as colunas tiverem SEMPRE a mesma
 * largura útil. Com o container em 1200, a placa interna vale 1056 a 1440 e
 * 996 na entrada de `lg` — nos dois casos `iguais` dá colunas de 478 a 508px,
 * que é a medida de leitura, não um parágrafo esticado. A largura se preenche
 * com LAYOUT; nenhum `max-w-texto` cresce um pixel por causa disto.
 *
 * `Record` de strings literais porque o scanner do Tailwind lê o código-fonte:
 * classe montada por concatenação não seria compilada.
 *
 * Abaixo de `lg` isto é um `div` comum e os filhos empilham na ORDEM DO DOM —
 * é o que mantém 390 e 768 byte-comparáveis ao que já estava aprovado.
 */
const ARRANJO: Record<ArranjoColunas, string> = {
  /** duas colunas de igual peso — dois textos, ou texto + texto */
  iguais: "lg:grid lg:grid-cols-2 lg:items-start lg:gap-10",
  /** a medida de leitura à esquerda, o que sobra à direita (o mesmo do Cabecalho) */
  principal: "lg:grid lg:grid-cols-[minmax(0,34rem)_minmax(0,1fr)] lg:items-start lg:gap-10",
  /** três colunas — listas curtas que deixavam órfão em duas */
  tres: "lg:grid lg:grid-cols-3 lg:items-start lg:gap-8",
  /** texto à esquerda, desenho de 32rem à direita (o teto do mini-enxame) */
  "leitura-dado": "lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,32rem)] lg:items-start lg:gap-10",
};

export function Colunas({
  arranjo = "iguais",
  children,
  className,
}: {
  arranjo?: ArranjoColunas;
  children: ReactNode;
  className?: string;
}) {
  return <div className={junta(ARRANJO[arranjo], className)}>{children}</div>;
}

/* ------------------------------------------------------------------ *
 * Estados de ponteiro reutilizados (DESIGN-V2 §7.1b)                  *
 * ------------------------------------------------------------------ */

/**
 * Cartão que É um controle (botão de cenário, gatilho de folha).
 *
 * A sombra só existe em INTERATIVO + HOVER: §3.5 continua valendo para bloco
 * parado, e é justamente por isso que a sombra aqui informa — ela aparece
 * apenas no que responde ao ponteiro. O deslocamento de 1px e o `scale` de
 * pressed são `motion-safe`: em `prefers-reduced-motion` sobra só a troca de
 * campo, seca.
 */
export const CARTAO_INTERATIVO = [
  "transition-[background-color,box-shadow,translate,scale]",
  "duration-(--dur-rapida) ease-(--ease-padrao)",
  "motion-safe:hover:-translate-y-px hover:shadow-flutua",
  "motion-safe:active:scale-[0.995]",
].join(" ");

/**
 * Linha de tabela que responde ao ponteiro. `group` porque o gatilho de dentro
 * da linha (o balão da folga, o registro no TSE) reage ao hover da LINHA
 * inteira — a linha é a unidade de leitura, não a célula.
 */
export const LINHA_TABELA =
  "group transition-colors duration-(--dur-rapida) ease-(--ease-padrao) hover:bg-nicho";

/**
 * Link e gatilho de texto: cor mais funda, sublinhado que engrossa e afasta.
 *
 * EXCEÇÃO NOMEADA ao orçamento de "só transform e opacity" (§7.1): a espessura
 * e o deslocamento do sublinhado repintam UMA linha de 1–2px, não uma caixa —
 * o custo é de outra ordem de grandeza, e sem isso o único sinal de hover num
 * link seria a cor, que §7 já proíbe usar como canal único.
 */
export const TEXTO_INTERATIVO = [
  "transition-[color,text-decoration-color,text-decoration-thickness,text-underline-offset]",
  "duration-(--dur-rapida) ease-(--ease-padrao)",
  "hover:text-ameixa-forte hover:decoration-2 hover:underline-offset-4",
].join(" ");

/* ------------------------------------------------------------------ *
 * Bloco-conversa                                                     *
 * ------------------------------------------------------------------ */

/** Placa branca, raio 24, sem borda e sem sombra. O bloco da conversa. */
export function Bloco({
  children,
  className,
  id,
  rotuladoPor,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
  rotuladoPor?: string;
}) {
  return (
    <div
      id={id}
      aria-labelledby={rotuladoPor}
      className={junta("rounded-bloco bg-placa p-bloco md:p-bloco-md", className)}
    >
      {children}
    </div>
  );
}

/** Título-pergunta do bloco: `<h2>`, Lexend 600, a pergunta que a pessoa faz. */
export function Pergunta({
  children,
  id,
  className,
}: {
  children: ReactNode;
  id?: string;
  className?: string;
}) {
  return (
    <h2 id={id} className={junta("text-pergunta text-tinta", className)}>
      {children}
    </h2>
  );
}

/** Primeira linha do bloco: conclui e traz o número (VOZ §7). */
export function Resposta({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={junta("mt-2 max-w-texto text-intro text-tinta", className)}>{children}</p>;
}

/** 2 a 3 frases explicando o que a pessoa está vendo e de onde saiu. */
export function Traduzindo({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={junta("mt-3 max-w-texto text-corpo text-tinta-media", className)}>{children}</p>
  );
}

/** Subtítulo dentro do bloco. */
export function Subtitulo({
  children,
  id,
  className,
}: {
  children: ReactNode;
  id?: string;
  className?: string;
}) {
  return (
    <h3 id={id} className={junta("text-secao text-tinta", className)}>
      {children}
    </h3>
  );
}

/**
 * Cabeçalho do bloco-conversa: pergunta → resposta → traduzindo.
 *
 * A ordem de leitura é sempre essa, e é a do DOM. O que muda em `lg` é só a
 * DISPOSIÇÃO: a resposta fica na medida de leitura à esquerda e o traduzindo
 * ocupa a faixa que sobrava à direita. A 1440 metade dos blocos deixava 46%
 * da largura vazia enquanto a outra metade ia até a borda — a página lia como
 * um "L". Aqui o ritmo passa a ser o mesmo em todo bloco, sem encolher a
 * medida de leitura de nenhum parágrafo (cada coluna continua ≤ ~58ch).
 */
export function Cabecalho({
  id,
  pergunta,
  resposta,
  traduzindo,
  ilustracao,
}: {
  id?: string;
  pergunta: ReactNode;
  resposta?: ReactNode;
  traduzindo?: ReactNode;
  /** desenho de apoio — irmão do TRADUZINDO, na coluna da direita */
  ilustracao?: ReactNode;
}) {
  return (
    <Colunas arranjo="principal">
      <div>
        <Pergunta id={id}>{pergunta}</Pergunta>
        {resposta ? <Resposta>{resposta}</Resposta> : null}
      </div>
      {traduzindo || ilustracao ? (
        <div>
          {traduzindo ? <Traduzindo className="lg:mt-0">{traduzindo}</Traduzindo> : null}
          {ilustracao ? <div className="mt-3">{ilustracao}</div> : null}
        </div>
      ) : null}
    </Colunas>
  );
}

/* ------------------------------------------------------------------ *
 * Nichos (caixa dentro do bloco)                                     *
 * ------------------------------------------------------------------ */

export type TomNicho = "neutro" | "lula" | "flavio" | "atencao" | "faixa";

const CAMPO_NICHO: Record<TomNicho, string> = {
  neutro: "bg-nicho",
  lula: "bg-lula-fundo",
  flavio: "bg-flavio-fundo",
  atencao: "bg-atencao-fundo",
  faixa: "bg-faixa",
};

/** Caixa dentro da placa: raio 16, tinta de fundo própria, sem borda. */
export function Nicho({
  children,
  tom = "neutro",
  className,
}: {
  children: ReactNode;
  tom?: TomNicho;
  className?: string;
}) {
  return <div className={junta("rounded-nicho p-4", CAMPO_NICHO[tom], className)}>{children}</div>;
}

/* ------------------------------------------------------------------ *
 * Chips e etiquetas                                                  *
 * ------------------------------------------------------------------ */

export type TomChip = "neutro" | "ameixa" | "atencao" | "lula" | "flavio";

/**
 * Selo de estado = CONTORNO + campo bruma, nunca campo cheio.
 *
 * §3.1 é explícito: o âmbar-queimado é TINTA, não campo — e o chip de
 * glossário do MESMO termo ("empate técnico ?") já era contorno sobre bruma.
 * Campo cheio dava dois tratamentos visuais para a mesma palavra na mesma
 * tela. O contorno de 1,5px cumpre o 3:1 de objeto gráfico contra placa e
 * contra nicho (atenção 6,11/5,6 · lula 6,18/5,3 · flávio 9,50/8,2).
 */
/* Campo macio, SEM anel (fadiga de contorno apontada pelo dono, v2.1 rodada 2):
   o tom vem do fundo suave do próprio lado + tinta forte por cima. Contrastes
   (tokens §comentários): atencao/atencao-fundo 5,23 · lula/lula-fundo 4,80 ·
   flavio/flavio-fundo ≥4,5. */
const CAMPO_CHIP: Record<TomChip, string> = {
  neutro: "bg-nicho text-tinta-media",
  ameixa: "bg-ameixa-bruma text-tinta",
  atencao: "bg-atencao-fundo text-atencao",
  lula: "bg-lula-fundo text-lula",
  flavio: "bg-flavio-fundo text-flavio",
};

/** Etiqueta curta e arredondada. Nunca em caixa alta (P3). */
export function Chip({
  tom = "neutro",
  children,
  className,
  ...resto
}: {
  tom?: TomChip;
  children: ReactNode;
  className?: string;
} & React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      {...resto}
      className={junta(
        "inline-block rounded-plena px-3 py-1 text-micro font-medium",
        CAMPO_CHIP[tom],
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Rótulo pequeno acima de um valor. Caixa normal, nunca espacejada. */
export function Etiqueta({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={junta("text-etiqueta text-tinta-media", className)}>{children}</p>;
}

/* ------------------------------------------------------------------ *
 * Botões                                                             *
 * ------------------------------------------------------------------ */

type PropsBotao = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variante?: "primario" | "fantasma";
  children: ReactNode;
};

/**
 * `scale(0.985)` no pressed: o botão AFUNDA sob o dedo/ponteiro em vez de só
 * trocar de campo. É `motion-safe` e some inteiro em reduced-motion; e o
 * `disabled:` zera para que um botão desligado não finja responder.
 */
const BASE_BOTAO =
  "inline-flex min-h-toque items-center justify-center gap-2 rounded-plena px-5 " +
  "text-corpo font-semibold transition-[background-color,color,box-shadow,scale] " +
  "duration-(--dur-rapida) ease-(--ease-padrao) " +
  "motion-safe:active:scale-[0.985] disabled:scale-100 " +
  "disabled:cursor-default";

const PRIMARIO =
  "bg-ameixa text-tinta-inversa hover:bg-ameixa-forte active:bg-ameixa-pressa " +
  "disabled:bg-nicho disabled:text-tinta-media";

/** Contorno por `box-shadow: inset` — `border` come o raio e desalinha o texto (§6.5). */
const FANTASMA =
  "bg-placa text-ameixa shadow-[inset_0_0_0_2px_var(--color-ameixa)] " +
  "hover:bg-ameixa-tenue active:bg-ameixa-bruma " +
  "disabled:text-tinta-media disabled:shadow-[inset_0_0_0_2px_var(--color-contorno)]";

export function Botao({ variante = "primario", children, className, ...resto }: PropsBotao) {
  return (
    <button
      type="button"
      {...resto}
      className={junta(BASE_BOTAO, variante === "primario" ? PRIMARIO : FANTASMA, className)}
    >
      {children}
    </button>
  );
}

/* ------------------------------------------------------------------ *
 * Links                                                              *
 * ------------------------------------------------------------------ */

/** Link para fora do site — sempre `noopener noreferrer`; alvo de ~44px. */
export function LinkExterno({
  href,
  children,
  className,
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={junta(
        "-mx-2 -my-[13px] inline-block rounded-campo px-2 py-[13px]",
        "text-ameixa underline decoration-from-font underline-offset-2",
        TEXTO_INTERATIVO,
        className,
      )}
    >
      {children}
    </a>
  );
}

/** Link interno com o mesmo alvo de toque e a mesma tinta de link. */
export function LinkInterno({
  href,
  children,
  className,
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={junta(
        "inline-flex min-h-toque items-center rounded-campo",
        "text-ameixa underline decoration-from-font underline-offset-2",
        TEXTO_INTERATIVO,
        className,
      )}
    >
      {children}
    </Link>
  );
}

/* ------------------------------------------------------------------ *
 * Detalhe (revelação em linha)                                       *
 * ------------------------------------------------------------------ */

/**
 * `<details>` com afordância de CONTROLE.
 *
 * Texto ameixa em negrito, sozinho, não parece controle: na mesma página os
 * links reais são sublinhados, e o leitor não tem como saber que aquilo abre
 * alguma coisa. Aqui o gatilho ganha o mesmo sublinhado dos links MAIS um
 * chevron que gira ao abrir — dois sinais, nenhum deles só de cor.
 *
 * O marcador nativo sai (`list-none` + `::-webkit-details-marker`), porque
 * ele varia de forma entre navegadores e brigaria com o chevron.
 */
export function Detalhe({
  titulo,
  children,
  className,
  idTeste,
}: {
  titulo: ReactNode;
  children: ReactNode;
  className?: string;
  idTeste?: string;
}) {
  return (
    <details className={junta("detalhe", className)} data-testid={idTeste}>
      {/* O sublinhado mora no `<span>`, não no `<summary>` — então quem reage
          ao hover do gatilho inteiro é o `group-hover` do span. */}
      <summary className="group inline-flex min-h-toque items-center gap-2 text-corpo font-semibold text-ameixa transition-colors duration-(--dur-rapida) ease-(--ease-padrao) hover:text-ameixa-forte">
        <span
          className={junta(
            "underline decoration-from-font underline-offset-2",
            "transition-[text-decoration-color,text-decoration-thickness,text-underline-offset]",
            "duration-(--dur-rapida) ease-(--ease-padrao)",
            "group-hover:decoration-2 group-hover:underline-offset-4",
          )}
        >
          {titulo}
        </span>
        <span aria-hidden="true" className="chevron text-etiqueta">
          ▾
        </span>
      </summary>
      {children}
    </details>
  );
}

/* ------------------------------------------------------------------ *
 * Estados                                                            *
 * ------------------------------------------------------------------ */

/**
 * Nota âmbar dentro do bloco (§5.9): diz o que ficou indisponível e o que
 * ainda vale. `role="status"` — a página não é uma emergência. Não existe
 * "perigo vermelho" neste sistema: vermelho é de candidato (R4).
 *
 * Sem o glifo "⚠": VOZ §1.7 pede zero enfeite, e ele não carregava informação
 * nenhuma — quem marca a nota é o campo âmbar, e quem diz o que houve é o
 * texto, que nunca depende de cor para ser entendido.
 */
export function Aviso({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p
      role="status"
      className={junta("rounded-nicho bg-atencao-fundo px-4 py-3 text-corpo text-tinta", className)}
    >
      {children}
    </p>
  );
}

/** Bloco de estado vazio com a voz do produto. */
export function Vazio({
  titulo,
  children,
  ilustracao,
}: {
  titulo: string;
  children?: ReactNode;
  ilustracao?: { src: string; alt: string };
}) {
  return (
    <div className="rounded-nicho bg-nicho p-5">
      {ilustracao ? (
        // eslint-disable-next-line @next/next/no-img-element -- SVG estático, sem otimização a fazer
        <img
          src={ilustracao.src}
          alt={ilustracao.alt}
          width={320}
          height={118}
          className="mb-3 h-auto w-full max-w-[20rem]"
        />
      ) : null}
      <p className="text-secao text-tinta">{titulo}</p>
      {children ? (
        <div className="mt-2 max-w-texto text-corpo text-tinta-media">{children}</div>
      ) : null}
    </div>
  );
}

/**
 * Esqueleto de carregamento: retângulo parado, sem shimmer, com a ALTURA
 * EXATA do conteúdo final (§5.9) — é o que mantém o CLS em zero.
 */
export function Esqueleto({ className, rotulo }: { className: string; rotulo: string }) {
  return (
    <div aria-busy="true" className={junta("rounded-nicho bg-nicho", className)}>
      <span className="sr-only">{rotulo}</span>
    </div>
  );
}

/** Separador decorativo dentro do bloco. Não delimita conteúdo. */
export function Filete({ className }: { className?: string }) {
  return <hr className={junta("border-0 border-t border-filete", className)} />;
}
