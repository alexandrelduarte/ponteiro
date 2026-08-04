/**
 * Camada de TEXTO e de RENDERIZAÇÃO NUMÉRICA da superfície pública.
 *
 * Fonte: `docs/COPY-DECK.md` (redações auditadas — não reescrever) e as regras
 * de `docs/VOZ.md`. Nada aqui entra no modelo: `src/lib/modelo` tem paridade
 * byte a byte com o protótipo e é intocável. Isto é apresentação.
 *
 * As três regras de renderização do §A.3 do deck vivem aqui, e só aqui:
 *  1. PISO E TETO — toda CHANCE publicada passa por `emCem`, que devolve
 *     "menos de 1" e "mais de 99" nos extremos. Nunca "0", nunca "100":
 *     improbabilidade não é impossibilidade, e o espelho vale para os dois
 *     lados (R4/H13). O "de cada 100" é da frase, não da função.
 *  2. COMPLEMENTO, NUNCA ARREDONDAMENTO DUPLO — em todo par que deve somar
 *     100, `parEmCem` arredonda UM número e devolve `100 − ele` no outro.
 *     Arredondar os dois em separado publica 101 (H3/VOZ §2.3).
 *  3. ORDEM FIXA — Lula à esquerda, Flávio à direita, sempre, porque essa é a
 *     posição deles na régua da diferença (VOZ §2.4).
 */
import { fmt } from "@/lib/modelo";

/* ------------------------------------------------------------------ *
 * 1. Chances: piso, teto e complemento                               *
 * ------------------------------------------------------------------ */

/** Extremos publicáveis de uma chance (H13). O "de cada 100" vem da frase. */
export const PISO = "menos de 1";
export const TETO = "mais de 99";

/**
 * Chance (0–1) → o número que a frase publica, em base 100.
 *   p < 0,5%  → "menos de 1"   ·   p > 99,5% → "mais de 99"
 * Fora dos extremos, o inteiro arredondado. `null` → "–".
 */
export function emCem(p: number | null | undefined): string {
  if (p == null || !isFinite(p)) return "–";
  if (p > 0 && p < 0.005) return PISO;
  if (p < 1 && p > 0.995) return TETO;
  return String(Math.round(p * 100));
}

/**
 * Par que precisa somar 100: arredonda UM e complementa o outro, com piso e
 * teto espelhados. Devolve sempre [lado de `p`, lado do complemento].
 */
export function parEmCem(p: number | null | undefined): [string, string] {
  if (p == null || !isFinite(p)) return ["–", "–"];
  if (p > 0 && p < 0.005) return [PISO, TETO];
  if (p < 1 && p > 0.995) return [TETO, PISO];
  const n = Math.round(p * 100);
  return [String(n), String(100 - n)];
}

/** Inteiro puro de uma chance, para contas de apresentação (nunca publicado só). */
export const inteiroEmCem = (p: number): number => Math.round(p * 100);

/* ------------------------------------------------------------------ *
 * 2. Diferença, direção e unidades                                   *
 * ------------------------------------------------------------------ */

/** |x| com uma casa — a frase já diz quem está na frente (VOZ §10.12). */
export const abs1 = (v: number | null | undefined): string =>
  v == null || !isFinite(v) ? "–" : fmt(Math.abs(v), 1);

/** "NN pontos" traduzido em pessoas: `round(|margem|)` (VOZ §2.1). */
export const pessoasEmCem = (margem: number): number => Math.round(Math.abs(margem));

/** Direção da puxada suposta, por extenso (VOZ §10.10). */
export const direcaoVies = (vies: number): string =>
  vies > 0 ? "a favor de Lula" : "a favor de Flávio";

/** Inteiro em formato brasileiro, sem depender de ICU (hidratação estável). */
export const inteiroBr = (n: number | null | undefined): string =>
  n == null || !isFinite(n) ? "–" : String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ".");

/* ------------------------------------------------------------------ *
 * 3. Veredito — as quatro faixas do modelo (COPY-DECK §C)             *
 * ------------------------------------------------------------------ *
 * A faixa vem de `pLider = max(eleito.dia)`, exatamente como no protótipo.
 * A cláusula de ressalva é obrigatória e definida pela faixa (H2): abaixo de
 * 90 em 100 é "ainda pode mudar"; de 90 para cima vira "não é garantia".
 */

export type FaixaVeredito = "empate" | "leve" | "favorito" | "amplo";

export function faixaVeredito(pLider: number): FaixaVeredito {
  if (pLider < 0.6) return "empate";
  if (pLider < 0.75) return "leve";
  if (pLider < 0.9) return "favorito";
  return "amplo";
}

/* ------------------------------------------------------------------ *
 * 4. Glossário — 13 termos (COPY-DECK §O)                             *
 * ------------------------------------------------------------------ */

export interface VerbeteGlossario {
  /** nome do termo, como aparece no chip e no rótulo acessível */
  termo: string;
  /** 1–2 frases; nunca mais que isso */
  texto: string;
}

export const GLOSSARIO = {
  margemErro: {
    termo: "margem de erro",
    texto:
      "É a folga da medida. A pesquisa ouviu uma parte das pessoas, não todas — então o número " +
      "real pode estar um pouco para cima ou um pouco para baixo. Exemplo: folga de 2 pontos com " +
      "Lula em 47% quer dizer que o número real está, provavelmente, entre 45% e 49%.",
  },
  segundoTurno: {
    termo: "2º turno",
    texto:
      "Se ninguém passar da metade dos votos válidos no 1º turno, os dois mais votados disputam " +
      "de novo, três semanas depois. Em 2026: 4 de outubro e 25 de outubro.",
  },
  votosValidos: {
    termo: "votos válidos",
    texto:
      "É o bolo de votos depois de tirar os brancos e os nulos. Nas pesquisas também se tira quem " +
      "ainda não sabe, porque essa pessoa ainda não escolheu. É esse bolo que decide se alguém " +
      "passou da metade e ganhou já no 1º turno.",
  },
  tendencia: {
    termo: "tendência",
    texto:
      "É a comparação de cada instituto com ele mesmo: a pesquisa nova contra a anterior da mesma " +
      "casa. Mostra se a diferença subiu ou desceu. Não diz que vai continuar subindo.",
  },
  vies: {
    termo: "viés",
    texto:
      "É a pergunta “e se todas as pesquisas estiverem puxando para o mesmo lado?”. Você diz o " +
      "tamanho da puxada e o painel refaz a conta. É um teste, não uma acusação.",
  },
  empateTecnico: {
    termo: "empate técnico",
    texto:
      "É quando a diferença entre os dois é menor que o dobro da folga da medida — a folga de cada " +
      "número vale em dobro quando se comparam os dois. Não quer dizer que estão iguais: quer " +
      "dizer que a pesquisa não consegue dizer quem está na frente.",
  },
  projecao: {
    termo: "projeção",
    texto:
      "É o número calculado para o dia da votação, não para hoje. Ele junta o retrato de hoje com " +
      "o quanto a corrida ainda pode andar até lá.",
  },
  peso: {
    termo: "peso da pesquisa",
    texto:
      "É o quanto cada pesquisa conta na média. Mais nova e com mais gente ouvida conta mais. A " +
      "antiga vai perdendo peso, mas continua na lista para mostrar o movimento.",
  },
  pontos: {
    termo: "ponto",
    texto:
      "Ponto é a unidade da diferença. Uma diferença de 5 pontos quer dizer cerca de 5 pessoas a " +
      "mais em cada 100.",
  },
  chance: {
    termo: "chance",
    texto:
      "Chance é quantas vezes uma coisa acontece em 100 situações parecidas. 10 em 100 é o mesmo " +
      "que 1 em 10: pouco, mas não impossível.",
  },
  amostra: {
    termo: "quantas pessoas foram ouvidas",
    texto:
      "É o tamanho da pesquisa. Quanto mais gente ouvida, menor a folga da medida — mas ouvir mais " +
      "gente não conserta erro de método.",
  },
  deriva: {
    termo: "o quanto a corrida ainda pode andar",
    texto:
      "É o espaço que sobra para a opinião mudar até a votação, por causa da propaganda na TV, dos " +
      "debates e de fatos novos. Quanto mais longe o dia da votação, maior esse espaço.",
  },
  registroTse: {
    termo: "registro no TSE",
    texto:
      "Toda pesquisa eleitoral precisa ser registrada na Justiça Eleitoral antes de ser divulgada, " +
      "com um número que fica público. Pesquisa sem registro não entra aqui.",
  },
} as const satisfies Record<string, VerbeteGlossario>;

export type ChaveGlossario = keyof typeof GLOSSARIO;

/** Ordem de exibição na página de metodologia (a mesma do deck §O). */
export const ORDEM_GLOSSARIO = Object.keys(GLOSSARIO) as ChaveGlossario[];

/* ------------------------------------------------------------------ *
 * 5. Ações e microcopy repetidos (COPY-DECK §P)                       *
 * ------------------------------------------------------------------ */

export const ACOES = {
  verRegistro: "Ver o registro completo",
  verFonte: "Ver a publicação original",
  verMetodologia: "Ler a metodologia completa",
  verHistorico: "Ver o que já mudou na lista",
  compartilhar: "Compartilhar o que estou vendo",
  compartilharCopiado: "✓ Link copiado — ele reabre a página do jeito que você deixou",
  compartilharErro: "Não deu para copiar. Selecione o endereço lá em cima e copie.",
  restaurarOficial: "Trazer as pesquisas oficiais de volta",
  restaurarParametros: "Voltar as réguas para o padrão",
  voltarOficial: "↺ Voltar ao oficial",
  abrirGlossario: "O que é isso?",
  fecharFolha: "Fechar",
  adicionarPesquisa: "Adicionar uma pesquisa (só na minha simulação)",
  incluirPesquisa: "Incluir na minha simulação",
  fecharFormulario: "Fechar",
  aplicarCenario: "Aplicar este cenário ao painel",
} as const;

/** Rótulo do modo simulação (R5/H7) — a palavra "simulação" nunca some. */
export const SIMULACAO = {
  faixa: "Modo de teste — não muda os dados oficiais",
  detalheSerie: (n: number) => `· lista alterada por você (${n} pesquisas)`,
  detalheReguas: "· réguas alteradas por você",
  rotuloResultado: "nesta simulação",
  naoOficial: "Este número é da sua simulação. O número oficial do painel está no topo da página.",
} as const;
