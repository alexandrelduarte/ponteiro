# DESIGN — Agregador Presidencial 2026

Especificação de design do painel. **Fonte da verdade visual:** `agregador-presidencial-2026.jsx`.
**Implementação:** `src/app/tokens.css` (Tailwind v4 `@theme static`). Zero hex em componente.

Este documento é normativo: a Fase 4 implementa contra ele e a Fase 6 audita contra o
**checklist de aceite** (§11). Onde ele diverge do protótipo, a divergência está marcada
**[CORREÇÃO]** com a razão — sempre acessibilidade ou regra R1–R8, nunca gosto.

---

## 1. O problema de design

Publicar uma probabilidade eleitoral é publicar um número que a maior parte dos leitores vai
ler como um resultado. O painel existe para o contrário: mostrar **quanta coisa ainda cabe**
dentro dos dados. Todas as decisões abaixo derivam disso.

Três restrições de contexto moldam a solução:

1. **390px é o viewport primário.** O painel é lido no ônibus, uma mão, tela suja, sol.
2. **Neutralidade é auditável** (R4). Simetria entre os dois lados não é estética: é a
   condição de credibilidade do produto.
3. **O leitor manda nas premissas.** Sliders e cenários deixam o leitor derrubar o próprio
   número-manchete. Isso é o antídoto estrutural contra "o site disse que Fulano ganha".

---

## 2. Princípios de comunicação de probabilidade (pesquisa)

Cada princípio traz a fonte. Foram extraídos **princípios**, nunca assets ou layout.

### P1 — O número nunca aparece sozinho: o verbo vem antes

Painéis que lideram com a percentagem crua treinam o leitor a ler probabilidade como placar.
A prática do 538 é subordinar o número a uma frase calibrada — a manchete de topo dizia
"Biden is favored to win the election" com o lembrete "Don't count the underdog out!"
([CJR, _The good and bad of election prediction data_](https://www.cjr.org/data_points/election_prediction_data.php)).

**No painel:** o bloco `veredito` (título em caixa alta + texto explicativo) é hierarquicamente
_irmão_ do número, no mesmo cartucho da tela da urna, e é ele que carrega o significado. O
cabeçalho da tela repete, sempre visível: `LEITURA DOS DADOS · NÃO É PREVISÃO`.

### P2 — Precisão falsa é ruído: arredonde a probabilidade

Reportar probabilidade de vitória com casas decimais "cria notícia do nada" — uma variação de
1 ponto na probabilidade corresponde a cerca de um décimo de ponto na intenção de voto prevista
([Gelman, _Graphical display of election forecast uncertainty_, statmodeling, 2025](https://statmodeling.stat.columbia.edu/2025/02/02/graphical-display-of-election-forecast-uncertainty/)).

**No painel:** `pct()` arredonda para inteiro e **assim fica**. Proibido exibir 63,4%.
Proibido animar, destacar ou notificar variação de probabilidade entre atualizações.

### P3 — Não dramatize a incerteza com movimento: o caso do "needle"

O ponteiro trêmulo do NYT em 2016 oscilava entre os percentis 25 e 75 com ruído de Perlin,
por decisão deliberada: segundo o autor, "fazer o mostrador flutuar um pouco comunicava a
incerteza da nossa previsão melhor do que simplesmente listar esses percentis"
([Gregor Aisch, _Why we used jittery gauges in our live election forecast_](http://www.vis4.net/blog/jittery-gauges-election-forecast/)).
Os leitores leram outra coisa: que o tremor "implicava uma TENDÊNCIA onde não havia nenhuma", e
chamaram a peça de "design irresponsável" (mesma fonte, seção de críticas). O próprio autor
reconhece que faltou a anotação que explicasse o que o movimento significava. O NYT sustentou
depois que "o Needle não estava errado, apenas foi mal compreendido", e que a confusão central
era não perceber que 75% de chance de vitória são também **1 em 4 de derrota**
([Poynter, 2024](https://www.poynter.org/tech-tools/2024/ny-times-election-needle/)).

**No painel — três regras duras:**

- **Nada de movimento a serviço de dado.** Recharts com `isAnimationActive={false}`; nenhuma
  transição em números; a única animação da página é o cursor `▊` (decorativo, e desligado sob
  `prefers-reduced-motion`).
- **Toda probabilidade vem com a incerteza no rótulo**, não numa nota de rodapé:
  `Projetado para o dia da votação (04–25/10, incerteza ±σ p.p.)`.
- **A frequência natural é escrita por extenso**, resolvendo exatamente a confusão do 1-em-4:
  a nota do cenário-base ("acontece 1 vez a cada N eleições parecidas") é obrigatória e fica
  **acima** da dobra do bloco, não escondida em `<details>`.

### P4 — Duas linhas, não uma: hoje ≠ dia da votação

Cobertura de pesquisas confunde sistematicamente _nowcast_ e _forecast_, e trata a
interpretação como certa quando não é
([Bauer, Klima, Gauß, Kümpel, Bender & Küchenhoff, _Mundus vult decipi, ergo decipiatur:
Visual Communication of Uncertainty in Election Polls_, 2021, arXiv:2105.07811](https://arxiv.org/abs/2105.07811)).
O mesmo trabalho recomenda comunicar **probabilidades de eventos** em vez de percentuais de
partido — que é exatamente o que o painel faz ("chance de ser eleito", "chance de haver 2º turno").

**No painel:** as duas linhas da tela da urna (**dia da votação** grande, **hoje** menor) são
inegociáveis, e a nota externa explica que a diferença entre elas **é o tempo**. A linha maior é
a mais incerta — a hierarquia visual está deliberadamente invertida em relação à certeza, para
que o número mais cravado nunca seja o mais gritado.

### P5 — Mostre a distribuição, não só o ponto

Nenhuma visualização isolada dá conta da incerteza; um _conjunto_ de gráficos pensados ajuda o
leitor a apreender incerteza e a aprender as premissas do modelo ao longo do tempo
([Gelman, Hullman, Wlezien & Morris, _Information, incentives, and goals in election forecasts_,
Judgment and Decision Making, 2020](https://sites.stat.columbia.edu/gelman/research/published/jdm200907b.pdf)).
Em estudo longitudinal com 1.327 participantes nas midterms de 2022, comparando dotplot de
quantis simples, dotplot duplo, **intervalos de histograma duplos** e a variante animada
"Plinko", os intervalos duplos tiveram o efeito mais forte em confiança e resposta emocional
([Kale, Hullman et al., Northwestern](https://www.hullmanlab.northwestern.edu/paper/2023/08/01/swaying-the-public.html);
ver também [_In Dice We Trust_, CHI 2024, DOI 10.1145/3613904.3642371](https://dl.acm.org/doi/10.1145/3613904.3642371)).
O 538 em 2024 assumiu intervalos mais largos que os concorrentes justamente para não vender
precisão que não tem ([538/ABC News, _How 538's 2024 presidential election forecast works_](https://abcnews.com/538/538s-2024-presidential-election-forecast-works/story?id=110867585);
crítica e comparação em [statmodeling, 2024](https://statmodeling.stat.columbia.edu/2024/07/19/my-comments-on-nate-silvers-comments-on-the-fivethirtyeight-election-forecast/)).

**No painel — quatro representações da mesma incerteza, nesta ordem de leitura:**

| Representação                                       | Onde                     | O que responde                                                |
| --------------------------------------------------- | ------------------------ | ------------------------------------------------------------- |
| Faixa 80% da margem (`int80`)                       | cartão 2ºT, cenário-base | "entre que valores isso deve cair?"                           |
| Bandas discretas de margem (4 faixas + banda modal) | cenário-base             | "qual cenário é o mais provável, e quanto sobra pros outros?" |
| Densidade da margem (`AreaChart`, 121 pontos, ±4σ)  | seção de gráficos        | "qual o formato da incerteza? onde fica o zero?"              |
| Curva de sensibilidade ao viés (−3…+10)             | histórico de erros       | "e se as pesquisas estiverem erradas de novo?"                |

O bloco de bandas é a nossa versão do "intervalo de histograma": faixas rotuladas com
percentual, banda modal marcada `● mais provável`. **[CORREÇÃO]** ver §5.5 sobre a cor do rótulo.

### P6 — Vocabulário calibrado, com a régua publicada

Palavras carregam probabilidade implícita e cada leitor calibra a sua. Silver mantém política
explícita de conservadorismo em mudanças de modelo justamente para não "lutar a guerra
passada" ([Silver Bulletin, _Model methodology 2024_](https://www.natesilver.net/p/model-methodology-2024)).

**No painel:** a régua é publicada e usada literalmente — 50–60% empate técnico projetado ·
60–75% leve favoritismo · 75–90% favorito · 90%+ amplamente favorito. O título do veredito
**nunca** usa palavra fora dessa tabela, e a tabela vive em `/metodologia`.

### P7 — "Empate técnico" precisa de definição operacional visível

A imprensa brasileira raramente dá espaço proporcional à margem de erro, ao perfil da amostra e
às limitações — o dado bruto é apresentado como retrato da realidade e o intervalo de confiança,
quando aparece, vira nota de rodapé
([Nota Alta/ESPM, _Margem de erro, empate técnico e eleições_](https://notaalta.espm.br/fala-professor/margem-de-erro-empate-tecnico-e-eleicoes/)).

**No painel:** o chip `Leitura 2ºT` de cada linha da série carrega a leitura já resolvida
(`empate técnico` / `Lula à frente` / `Flávio à frente`) e a definição (`diferença ≤ 2× margem
de erro`) fica em `/metodologia`. Uma pesquisa nunca aparece só com dois números.

### P8 — Comparabilidade entre institutos não é dada: é construída e declarada

O agregador do Poder360 aplica média móvel ponderada numa janela de 60 dias para atenuar
disparidades de método, e declara em texto que "o gráfico não tem o objetivo de prever
resultados eleitorais, mas mostrar o comportamento dos resultados ao longo do tempo", e que
resultados de institutos diferentes "não são comparáveis entre si"
([Poder360, _Conheça o agregador de pesquisas eleitorais_](https://www.poder360.com.br/pesquisas/conheca-o-agregador-de-pesquisas-eleitorais-do-poder360/)).

**No painel:** a ressalva equivalente é a **tendência pareada** — cada instituto comparado
**com ele mesmo** — e ela precisa aparecer ao lado das médias, não escondida. O peso `w` de cada
pesquisa é uma coluna visível da série, e linhas com `w < 0,15` ficam esmaecidas.

### P9 — Rastreabilidade em cada linha (R4)

Convenção consolidada na apuração brasileira (G1, Poder360, TSE): o número vem sempre com sua
procedência colada — instituto, período de campo e registro. Observação do produto; não há
racional de design publicado por essas redações, então tratamos como convenção local, não como
princípio com fonte.

**No painel:** instituto **é** o link para a fonte; registro TSE é coluna/linha própria; período
de campo sempre em `dd/mm–dd/mm`; entradas de origem automática levam o selo
`(auto — confira a fonte)`. Nada disso pode cair no layout mobile.

### P10 — Deixe o leitor quebrar o modelo

Consequência prática de P3 + P6: se o leitor pode mover o viés para +6,3 e ver a seção
inteira passar a descrever a vitória do outro candidato, ele aprende que o "cenário mais
provável" é função das premissas. Os sliders são **conteúdo editorial**, não configuração
avançada — por isso ficam na página, não atrás de um menu.

---

## 3. Direção de identidade — boletim de urna

Decisão tomada; aqui ela vira regra.

### 3.1 A metáfora

A página é um **boletim de urna**: papel bege de impressora térmica, tinta preta, filetes finos,
tipografia mono para tudo que é número. Dentro dela, **um único objeto** é a tela fósforo da urna
eletrônica — verde escuro, vinheta interna, texto fósforo, cursor piscando. É o elemento-assinatura.

| Material         | Token                                       | Papel                                                                     |
| ---------------- | ------------------------------------------- | ------------------------------------------------------------------------- |
| Papel do boletim | `--color-papel` `#E8E8DF`                   | fundo da página                                                           |
| Papel do canhoto | `--color-cartao` `#F6F6F0`                  | cartões                                                                   |
| Recibo interno   | `--color-mini` `#EFEFE6`                    | mini-cartão, caixa de nota                                                |
| Tela da urna     | `--color-tela` `#0E241A`                    | **só** o cartucho da probabilidade, a síntese de contexto e o replay 2022 |
| Fósforo          | `--color-fosforo` / `--color-fosforo-forte` | texto dentro da tela — em lugar nenhum mais                               |

### 3.2 A regra do único momento escuro

A tela da urna é o **único** fundo escuro da página (mais o tooltip dos gráficos, que é a mesma
lógica: um painel de leitura instantânea). Consequências:

- **Não existe dark mode.** A página tem um modo. `prefers-color-scheme` é ignorado.
  A "versão escura" da página é a tela da urna, e ela já está lá o tempo todo.
- Toda vez que se pensar em "destacar" algo com fundo escuro, a resposta é **não**: destaque com
  peso tipográfico, com filete de topo colorido no cartão (`border-top: 3px`) ou com espaço.
- Três blocos podem usar `--color-tela`: **(1)** o cartucho da chance de eleição, **(2)** o
  cartão "Síntese do contexto", **(3)** o Replay 2022. Um quarto exige registro em `DECISOES.md`.

### 3.3 Proibições

- Gradientes decorativos, `backdrop-filter`, glassmorphism, sombras coloridas, _glow_.
- Sombras de "elevação" (blur difuso). As três sombras do sistema são físicas:
  a vinheta do CRT (`--shadow-tela`), o relevo de tecla (`--shadow-botao`, `0 2px 0`, sem blur)
  e o assentamento do cartão selecionado (`--shadow-ativo`).
- Ícones decorativos e ilustração. Os únicos glifos permitidos são funcionais e já estão no
  protótipo: `▊ ▶ ↺ ⚠ ✓ ▲ ▼ ▬ ◆ ■ ● × ⏳ ×`.
- **Imagem de pessoa, partido, bandeira ou símbolo partidário** (R4) — nem como favicon,
  nem como OG image, nem em silhueta.
- Fonte fora de Archivo e IBM Plex Mono. Cor fora de `tokens.css`.

---

## 4. Sistema tipográfico

### 4.1 As duas famílias e a divisão do trabalho

| Família                         | Token         | Uso — regra literal                                                                                                                                                                               |
| ------------------------------- | ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Archivo** (400/600/700/900)   | `--font-sans` | prosa, títulos, rótulos de UI, nome de instituto e de candidato                                                                                                                                   |
| **IBM Plex Mono** (400/500/600) | `--font-mono` | **TODO dado numérico**, sem exceção: percentuais, margens, `n`, MoE, pesos, datas, contadores, registro TSE, ticks e tooltips de gráfico, valores de slider, etiquetas em caixa alta com tracking |

Autofalante da regra: se o conteúdo muda quando o modelo recalcula, é mono. Se é redação, é Archivo.

Carga via `next/font` (self-host) no `layout.tsx`, expondo `--font-archivo` e `--font-plex-mono`;
`tokens.css` só consome. **Proibido `@import` de fonte por URL** — o protótipo usa Google Fonts
por CSS e isso não sobrevive à produção (privacidade, LCP, offline).

### 4.2 Escala fluida

Todos os degraus são `clamp()`, medidos de 390px a 1140px. Tokens em `tokens.css` §6.

| Token             | Valor                            | 390px  | 1140px | Onde                                           |
| ----------------- | -------------------------------- | ------ | ------ | ---------------------------------------------- |
| `text-manchete`   | `clamp(2.4rem, 8vw, 4.4rem)`     | 38,4px | 70,4px | os dois percentuais da linha principal da urna |
| `text-manchete-2` | `clamp(1.3rem, 4vw, 2rem)`       | 20,8px | 32px   | percentuais da linha "se fosse hoje"           |
| `text-titulo`     | `clamp(1.8rem, 5vw, 3rem)`       | 28,8px | 48px   | `h1` PRESIDENTE 2026                           |
| `text-veredito`   | `clamp(1.05rem, 3vw, 1.5rem)`    | 16,8px | 24px   | título do veredito                             |
| `text-secao`      | `clamp(1rem, 2.6vw, 1.35rem)`    | 16px   | 21,6px | título do cenário-base                         |
| `text-placar`     | `clamp(1.5rem, 5.5vw, 1.875rem)` | 24px   | 30px   | placares dos cartões 1ºT/2ºT                   |
| `text-dado`       | `1.25rem`                        | 20px   | 20px   | número de mini-cartão e contador do cabeçalho  |

Abaixo disso valem os degraus padrão do Tailwind: `text-sm` (14px) para prosa de apoio e
`text-xs` (12px) **só** para metadados (rótulo de cartão, nota de fonte, chip). **Piso absoluto:
12px.** Nenhum texto do produto pode ser menor — inclusive tick de gráfico (11px do protótipo
sobe para 12px em mobile; ver §7.6). **[CORREÇÃO]**

### 4.3 A regra do dominante único

**Em qualquer viewport, exatamente um elemento ocupa o topo da hierarquia visual: o par de
percentuais da linha principal da tela da urna.** Verificação: se você apertar os olhos até a
página borrar, deve sobrar _um_ bloco legível. Se sobrarem dois, algo está grande demais.

Ordem de peso, do maior para o menor — nada pode trocar de posição:

1. `text-manchete` sobre `--color-fosforo-forte` na tela (percentual do dia da votação)
2. `text-titulo` (`h1`, Archivo black, `--color-tinta`)
3. `text-veredito` (Archivo black, caixa alta, fósforo forte)
4. `text-placar` nos cartões 1ºT/2ºT
5. `text-dado` nos mini-cartões e contadores
6. `text-sm` prosa · `text-xs` metadado

Corolários operacionais:

- O `h1` é menor que a manchete da urna. Isso é intencional: o assunto da página é a
  probabilidade, não o nome da página.
- Títulos de seção usam **caixa alta + tracking + `text-xs` mono em `--color-cinza`**
  (padrão `Cartao`), não corpo grande. Cabeçalho de seção não compete com dado.
- Negrito é reservado a números e a ~3 palavras por parágrafo. Parágrafo com mais de um
  trecho em negrito perde a função.

### 4.4 Tracking e leading

| Token                  | Valor     | Uso                                                               |
| ---------------------- | --------- | ----------------------------------------------------------------- |
| `tracking-titulo`      | `-0.02em` | `h1`                                                              |
| `tracking-botao`       | `0.06em`  | rótulo de botão em caixa alta                                     |
| `tracking-dado`        | `0.1em`   | etiqueta mono em caixa alta dentro da tela                        |
| `tracking-etiqueta`    | `0.12em`  | rótulo de cartão                                                  |
| `tracking-tela`        | `0.14em`  | cabeçalho da tela da urna                                         |
| `tracking-sobretitulo` | `0.18em`  | sobretítulo "Apuração de pesquisas · registro obrigatório no TSE" |
| `leading-leitura`      | `1.6`     | parágrafos longos (aviso legal, "por que este é o cenário-base")  |
| `leading-compacto`     | `1.5`     | prosa dentro de cartão                                            |

Números grandes (`text-manchete`, `text-placar`) usam `line-height: 1` ou menos — dígito não tem
descendente e leading frouxo desmonta o alinhamento do par de percentuais.

Medida de leitura: parágrafos longos limitados a `max-w-texto` (48rem). Prosa dentro de cartão
herda a largura do cartão.

---

## 5. Cor e neutralidade (R4)

### 5.1 A regra de simetria

> Para todo tratamento visual aplicado a um candidato, existe o tratamento espelhado, de mesmo
> peso perceptual, aplicado ao outro — na mesma ordem de leitura e no mesmo tamanho.

Verificações que a Fase 6 roda:

- Trocar `--color-lula` por `--color-flavio` e vice-versa não pode mudar a _impressão_ da
  página, só os nomes.
- Lula sempre à esquerda, Flávio sempre à direita, em toda barra, tabela, tooltip e legenda.
- Ambos os lados aparecem no mesmo degrau tipográfico e com a mesma quantidade de dígitos.
- Nenhum lado ganha ícone, seta ou marcador que o outro não tenha.

### 5.2 O problema real: os hex originais não têm peso equivalente

`#C4122F` e `#16418C` **não** são perceptualmente equivalentes. Medido em OKLCH e em contraste
WCAG contra o papel:

|                | Hex       | OKLCH L | Croma | Contraste sobre `--color-papel` |
| -------------- | --------- | ------- | ----- | ------------------------------- |
| Lula (CORES)   | `#C4122F` | 0,524   | 0,203 | **4,90:1**                      |
| Flávio (CORES) | `#16418C` | 0,393   | 0,134 | **7,86:1**                      |

O azul é 0,13 mais escuro em clareza perceptual e tem 60% mais contraste. Em texto, isso faz o
lado azul parecer mais firme e o vermelho mais lavado — um viés visual gratuito.

**Não dá para "corrigir" os hex base:** eles vêm de `CORES` e de `CANDIDATOS`, que têm paridade
byte a byte com o protótipo. A solução é separar os papéis:

- **Cor de marca** (`--color-lula`, `--color-flavio`): barras, linhas, pontos de dispersão,
  áreas do gráfico, filete de topo de cartão. Aqui a regra é **1.4.11 (3:1 não-texto)**, que
  ambas cumprem folgado, e a leitura é por _matiz_, não por peso.
- **Cor de texto** (`--color-lula-escuro`, `--color-flavio-escuro`): qualquer glifo colorido —
  numeral, nome, rótulo, `×` entre placares. Este par foi **derivado para contraste igual**.

### 5.3 As escalas espelhadas

Método: manter o matiz de cada lado, resolver a clareza (OKLCH L) para que o **contraste WCAG
contra `--color-papel` seja o mesmo nos dois lados** (critério mensurável e o que o leitor
percebe como peso), e igualar croma onde o gamut sRGB permite.

| Degrau    | Lula                | Flávio              | ΔL (OKLCH) | Papel no sistema                                    |
| --------- | ------------------- | ------------------- | ---------- | --------------------------------------------------- |
| `-escuro` | `#B30026` (L 0,484) | `#2A55A2` (L 0,462) | 0,022      | **texto e numeral** sobre papel/cartão              |
| base      | `#C4122F` (L 0,524) | `#16418C` (L 0,393) | 0,130      | **marca**: barra, linha, ponto, área, filete        |
| `-medio`  | `#D96A7A` (L 0,659) | `#648FE7` (L 0,659) | 0,001      | banda intermediária de margem                       |
| `-suave`  | `#E8A4AE` (L 0,786) | `#9EBAEE` (L 0,787) | 0,000      | banda externa de margem                             |
| `-claro`  | `#FF9AA8` (L 0,794) | `#9FC0FF` (L 0,807) | 0,013      | **sobre fundo escuro**: tooltip e tela da urna      |
| `-fundo`  | `#FFDFDD` (L 0,929) | `#DBE9FF` (L 0,930) | 0,001      | tinta de fundo, realce de linha, área com opacidade |

Notas:

- `-medio` e `-suave` são exatamente os tons do protótipo (`#D96A7A`, `#E8A4AE`) e seus
  **espelhos azuis inéditos**, gerados no mesmo L e croma. O protótipo só tinha o lado vermelho
  porque as bandas de margem só se subdividem do lado do líder; o espelho existe para que o
  componente continue simétrico se o líder virar. **[CORREÇÃO / R4]**
- `-claro` mantém os hex do protótipo (`#FF9AA8`, `#9FC0FF`) verbatim. ΔL de 0,013 e Δcontraste
  de 0,79 sobre a tela — ambos muito acima de AA e abaixo do limiar de percepção de peso.
  Preservar a paridade venceu o ajuste cosmético.
- Croma exatamente igual entre matizes é impossível em sRGB (o gamut do azul e o do vermelho têm
  formatos diferentes). Igualamos L — que é o que dirige contraste e peso — e reportamos o croma.

### 5.4 Tabela de contrastes (WCAG 2.x, calculada)

Fórmula `(L1+0,05)/(L2+0,05)` com luminância relativa sRGB. Piso: **4,5:1** para texto (1.4.3
AA) e **3:1** para componentes de UI e limites gráficos significativos (1.4.11 AA).

#### Sobre papel `#E8E8DF`, cartão `#F6F6F0` e mini-cartão `#EFEFE6`

| Frente                     | papel     | cartão    | mini      | Veredito       | Uso                                    |
| -------------------------- | --------- | --------- | --------- | -------------- | -------------------------------------- |
| `tinta` `#181C18`          | **13,99** | **15,89** | **14,91** | AAA            | texto e números                        |
| `cinza` `#63685F`          | **4,64**  | **5,27**  | **4,94**  | AA             | texto secundário                       |
| `lula-escuro` `#B30026`    | **5,79**  | **6,57**  | **6,17**  | AA             | numeral/rótulo Lula                    |
| `flavio-escuro` `#2A55A2`  | **5,84**  | **6,63**  | **6,22**  | AA             | numeral/rótulo Flávio                  |
| `alerta-texto` `#8A4510`   | **5,80**  | **6,59**  | **6,18**  | AA             | texto de alerta                        |
| `confirma-texto` `#155A34` | **6,70**  | **7,61**  | **7,14**  | AA             | sobretítulo, valor de slider, foco     |
| `lula` `#C4122F`           | **4,90**  | **5,57**  | **5,23**  | AA / marca     | barra, linha, ponto                    |
| `flavio` `#16418C`         | **7,86**  | **8,93**  | **8,37**  | AAA / marca    | barra, linha, ponto                    |
| `linha-forte` `#727267`    | **3,95**  | **4,48**  | —         | ≥3 (não-texto) | borda significativa, contorno de barra |
| `linha` `#C6C6B8`          | 1,40      | 1,59      | —         | isento         | filete **decorativo** apenas           |

#### Sobre a tela da urna `#0E241A` e o trilho interno `#0A1A12`

| Frente                    | tela      | trilho    | Veredito | Uso                          |
| ------------------------- | --------- | --------- | -------- | ---------------------------- |
| `fosforo` `#A7EFBB`       | **12,21** | **13,43** | AAA      | rótulos e corpo na tela      |
| `fosforo-forte` `#D8FBE2` | **14,63** | **16,09** | AAA      | manchete e veredito          |
| `tela-alerta` `#F0B27A`   | **8,83**  | —         | AAA      | aviso de viés dentro da tela |
| `lula-claro` `#FF9AA8`    | **8,12**  | **8,93**  | AAA      | marca Lula sobre escuro      |
| `flavio-claro` `#9FC0FF`  | **8,91**  | **9,80**  | AAA      | marca Flávio sobre escuro    |
| `tela-borda` `#1E3A2C`    | 1,32      | —         | isento   | moldura **decorativa**       |

#### Tooltip escuro `#181C18`, chips, rodapé e botões

| Frente                     | Fundo                      | Razão     | Veredito              |
| -------------------------- | -------------------------- | --------- | --------------------- |
| `texto-inverso` `#F2F2EA`  | `tinta` `#181C18`          | **15,32** | AAA                   |
| `lula-claro` `#FF9AA8`     | `tinta` `#181C18`          | **8,57**  | AAA                   |
| `flavio-claro` `#9FC0FF`   | `tinta` `#181C18`          | **9,41**  | AAA                   |
| `alerta-texto` `#8A4510`   | `alerta-fundo` `#F7E4D2`   | **5,78**  | AA                    |
| `confirma-texto` `#155A34` | `confirma-fundo` `#DFF0E5` | **6,97**  | AA                    |
| `rodape-texto` `#6B3A0E`   | `rodape-fundo` `#F3E7D9`   | **7,71**  | AAA                   |
| branco                     | `confirma` `#1E7A46`       | **5,35**  | AA — botão primário   |
| branco                     | `tinta` `#181C18`          | **17,24** | AAA — aba/botão ativo |

#### Rótulos sobre as bandas de margem

| Frente            | Banda                    | Razão    | Regra                       |
| ----------------- | ------------------------ | -------- | --------------------------- |
| `papel` `#E8E8DF` | `lula` `#C4122F`         | **4,90** | banda escura → rótulo claro |
| `papel` `#E8E8DF` | `flavio` `#16418C`       | **7,86** | banda escura → rótulo claro |
| `tinta` `#181C18` | `lula-medio` `#D96A7A`   | **5,17** | banda clara → rótulo escuro |
| `tinta` `#181C18` | `lula-suave` `#E8A4AE`   | **8,50** | banda clara → rótulo escuro |
| `tinta` `#181C18` | `flavio-medio` `#648FE7` | **5,44** | espelho                     |
| `tinta` `#181C18` | `flavio-suave` `#9EBAEE` | **8,79** | espelho                     |

### 5.5 Usos proibidos (falhas medidas no protótipo — corrigir na Fase 4)

| Combinação no protótipo                                                                                 | Razão                                             | Correção                                                                                                                                                                                  |
| ------------------------------------------------------------------------------------------------------- | ------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `#D96A1B` (alerta) como **texto** — selos `(usuário)` / `(auto — confira a fonte)`, seta ▼ de tendência | **2,83:1** ❌                                     | usar `--color-alerta-texto` `#8A4510` (5,80:1). `#D96A1B` fica só como borda/marca                                                                                                        |
| `#1E7A46` (confirma) como **texto** — sobretítulo, valor de slider, ênfase «atualizar»                  | **4,34:1** ❌                                     | usar `--color-confirma-texto` `#155A34` (6,70:1). `#1E7A46` fica como fundo de botão (branco sobre ele dá 5,35)                                                                           |
| branco sobre `#E8A4AE` e `#D96A7A` — percentuais dentro das bandas de margem                            | **2,03** e **3,34** ❌                            | rótulo comuta por clareza da banda: `--color-tinta` nas bandas claras, `--color-papel` nas escuras (§5.4)                                                                                 |
| `#E8791D` (Zema) como **texto** e como preenchimento na aba "todos"                                     | **2,37:1** ❌ (falha até o piso de 3:1 não-texto) | nome do candidato sempre em `--color-tinta`; a cor do candidato aparece só como preenchimento de barra **com contorno de 1px em `--color-linha-forte`**, que garante o limite discernível |
| branco sobre `#D96A1B`                                                                                  | **3,48:1** ❌                                     | não existe botão âmbar. Se surgir, texto em `--color-tinta`                                                                                                                               |

Cores dos demais candidatos (dado, não token): Renan 4,62 · Caiado 4,01 · Zema 2,37 · Cury 3,99 ·
Daciolo 4,44 · Samara 5,02 · Barbosa 6,13 sobre papel. Por isso a regra do contorno acima — ela
resolve todos de uma vez sem tocar no dado.

### 5.6 Cor nunca é o único canal

Requisito 1.4.1. Em toda peça, o lado do candidato é identificável sem cor:

- Barras e placares: rótulo textual (`Lula` / `Flávio`) sempre presente.
- Chip `Leitura 2ºT`: o **texto** diz a leitura; a cor só reforça.
- Tendências: glifo `▲ ▼ ▬` + sinal `+/−` além da cor.
- Bandas de margem: rótulo por extenso na legenda + `● mais provável` na banda modal.
- Gráfico de distribuição: `ReferenceLine` no zero e legenda textual "espaço de virada".

### 5.7 Foco

Anel de 2px com offset de 2px. `--color-foco` `#155A34` sobre papel (6,70:1); dentro da tela da
urna comuta para `--color-foco-tela` `#A7EFBB` (12,21:1). Regra global já em `tokens.css`.

---

## 6. Layout, grid e ritmo

### 6.1 Breakpoints

| Nome | Token      | px   | O que muda                                                              |
| ---- | ---------- | ---- | ----------------------------------------------------------------------- |
| base | —          | 390  | coluna única; tabela vira cartões; contadores em linha                  |
| `sm` | `40rem`    | 640  | mostra o par `LEITURA DOS DADOS · NÃO É PREVISÃO` no cabeçalho da tela  |
| `md` | `48rem`    | 768  | **tabela completa volta**; cartões 1ºT/2ºT lado a lado; grades 2–4 col  |
| `lg` | `71.25rem` | 1140 | goteiras largas; coluna de leitura atinge 1024px; 3 col no cenário-base |

Coluna de conteúdo: `--container-leitura` = 64rem (1024px), paridade com o `max-w-5xl` do
protótipo. O `lg` em 1140px é exatamente 1024 + goteiras confortáveis dos dois lados: acima
disso nada cresce, só a margem.

Breakpoints em `rem` de propósito — acompanham o zoom de fonte do sistema.

### 6.2 Ritmo vertical

Base 4px (`--spacing: 0.25rem`): todo espaçamento é múltiplo de 4.

| Papel                            | Token     | 390    | md  | lg  |
| -------------------------------- | --------- | ------ | --- | --- |
| Goteira lateral da página        | `goteira` | 16     | 16  | 24  |
| Entre seções                     | `secao`   | 24     | 32  | 40  |
| Padding de cartão                | `cartao`  | 16     | 20  | 20  |
| Padding da tela da urna          | `tela`    | 20     | 28  | 28  |
| Entre blocos dentro de um cartão | —         | 8 / 12 | 12  | 12  |
| Alvo de toque mínimo             | `toque`   | 44     | 44  | 44  |

Regra de proximidade: o espaço **acima** de um título de seção é sempre maior que o espaço
**abaixo** dele (24/8 no mobile, 32/12 em md+). Rótulo colado no seu dado, seção separada da
anterior.

### 6.3 A dobra de 390px

Ordem obrigatória no primeiro scroll, sem exceção:

1. Sobretítulo + `h1` + subtítulo (2 linhas)
2. Selo de frescor **[MUDA R3: substitui o botão "Atualizar agora"]**
3. Contadores 1ºT/2ºT em **uma linha**
4. **Tela da urna começa acima da dobra** — o cabeçalho fósforo e o começo da linha principal
   precisam estar visíveis sem scroll em 390×844.

Orçamento vertical até a dobra (390×844, descontando ~120px de barra do navegador): cabeçalho
≈ 200px, contadores ≈ 64px, respiro ≈ 24px → sobram ≈ 430px para a tela da urna começar e
mostrar a manchete inteira. É folgado; se estourar, o que encolhe é o subtítulo, nunca a tela.

---

## 7. Especificação dos componentes críticos (mobile-first)

Notação: **390** = base, **md** = ≥768, **lg** = ≥1140.

### 7.1 Cabeçalho e contadores

**390**

- `h1` em `text-titulo`, `--color-tinta`; "2026" em `--color-cinza`; quebra permitida.
- Sobretítulo `text-xs` mono caixa alta, `tracking-sobretitulo`, `--color-confirma-texto`. **[CORREÇÃO]**
- Subtítulo `text-sm` `--color-cinza`, máximo 2 linhas; a contagem de pesquisas e a data-base
  em mono e `--color-tinta`.
- **Contadores compactam para UMA linha**: `flex`, dois blocos de largura igual (`flex-1`), cada
  um com o número em `text-dado` mono + rótulo em `text-xs`. Layout interno vira horizontal:
  `48` `dias p/ 1º turno · 04/10`. O `<br/>` do protótipo cai abaixo de md. Altura total ≤ 64px.
- Selo de frescor: chip `--color-confirma-fundo` / `--color-confirma-texto`, `text-xs` mono,
  ocupando a linha inteira, com texto "verificado automaticamente hoje às 09h · última pesquisa
  incluída em dd/mm". Sem botão público de atualização (R3).

**md** — cabeçalho e contadores voltam ao `justify-between` do protótipo; contadores empilham
número sobre rótulo em dois cartõezinhos.

**lg** — sem mudança estrutural; só goteira maior.

### 7.2 Tela da urna — o número-manchete

**390**

- Container `rounded-tela`, `bg-tela`, `border` em `--color-tela-borda`, `shadow-tela`, `p-tela`.
- Cabeçalho fósforo `text-xs` mono, `tracking-tela`. `CHANCE DE SER ELEITO · LULA (esq.) ×
FLÁVIO (dir.)` sempre visível; `LEITURA DOS DADOS · NÃO É PREVISÃO` + cursor `▊` aparecem a
  partir de `sm`. **Abaixo de `sm` a frase não some: vai para uma segunda linha** logo abaixo,
  ainda dentro do cabeçalho. **[CORREÇÃO — é o disclaimer central de P1/P3; não pode ser
  responsivo-opcional.]**
- Linha principal, três colunas em `flex`: percentual Lula (`text-manchete`, mono, semibold,
  `--color-fosforo-forte`) · barra bicolor (`h-2.5`, `rounded-full`, fundo `--color-tela-fundo`,
  `flex-1`, mínimo 96px) · percentual Flávio, alinhado à direita.
  Rótulo acima em `text-xs` mono `--color-fosforo` com a incerteza **no próprio rótulo**.
- Linha secundária idêntica em `text-manchete-2`, `opacity-90`.
- Aviso de viés (quando `vies ≠ 0`): `text-xs` mono `--color-tela-alerta`, com `⚠`.
- Veredito: separador tracejado `--color-tela-borda`, título `text-veredito` Archivo black caixa
  alta `--color-fosforo-forte`, texto `text-sm` `--color-fosforo` `leading-compacto`, largura
  máxima `max-w-texto`.
- Nota externa (fora da moldura, sobre papel) `text-xs` `--color-cinza`.

**Legibilidade a um braço de distância.** Em 390px a manchete tem 38,4px. Numa tela de ~72mm de
largura útil (5,42 CSS px/mm), isso dá ~7,1mm de corpo e ~4,9mm de altura de dígito no IBM Plex
Mono. A 600mm (braço estendido), o ângulo visual é ≈ **28 minutos de arco** — cerca de 1,4× o
tamanho angular do texto de corpo de jornal lido a 40cm. Aprovado. **O `clamp()` não pode ter o
mínimo reduzido abaixo de 2,4rem sem refazer esta conta.**

**Sanidade de caber:** com `4 dígitos` (`100%`) de cada lado a 38,4px mono (~0,6em/glifo ≈ 92px),
mais dois `gap-3` (24px), sobram ~110px de barra em 390px — acima do mínimo de 96px. OK.

**md/lg** — `p-tela-md`; a manchete cresce pelo `clamp` até 70,4px em 1140px. Sem mudança de estrutura.

### 7.3 Abas (Disputa principal × Todos os candidatos)

**390** — as duas abas ocupam a largura toda (`flex`, `flex-1`), altura mínima 44px, texto
`text-sm` bold; o rótulo da primeira aba encurta para `Principal · Lula × Flávio`. O parágrafo
explicativo ("o par é definido pelos dados") vai **abaixo** do par de abas, `text-xs`.
Marcação: `role="tablist"` / `role="tab"` / `aria-selected`.

**md** — volta ao inline do protótipo, com o texto explicativo ao lado.

### 7.4 Cartões 1ºT / 2ºT

**390** — empilhados, `p-cartao`, filete de topo 3px na cor de destaque.
Placar em `text-placar`: `48,3%` `×` `43,6%` em uma linha; a legenda ("média ponderada
(estimulada)" / "margem … · válidos …") **quebra para a linha de baixo** em `text-xs`
`--color-cinza` — nunca disputa espaço horizontal com o placar. Numerais em
`--color-lula-escuro` / `--color-flavio-escuro`. **[CORREÇÃO §5.2]**
As três tendências ficam empilhadas (já estão). Mini-cartões em `grid-cols-2` `gap-2`,
`bg-mini`, número em `text-dado` mono.

**md** — `md:grid-cols-2`, cartões lado a lado.

### 7.5 Série de pesquisas — tabela ⇄ cartões

Este é o componente que mais muda. **Abaixo de `md`: cartões empilhados. A partir de `md`:
tabela completa.** Não é uma tabela com scroll horizontal e não é a tabela com `display:block`
— são duas árvores, alternadas por `hidden` / `md:block`, para preservar semântica em ambos os
casos (padrão documentado em
[Smashing Magazine, _Accessible Front-End Patterns For Responsive Tables_](https://www.smashingmagazine.com/2022/12/accessible-front-end-patterns-responsive-tables-part1/)
— o "stacked/card" derruba a semântica de tabela em alguns navegadores, então o correto é
oferecer a lista como lista).

**Cartão (390) — conteúdo exato, nesta ordem:**

```
┌────────────────────────────────────────────┐
│ ATLASINTEL                        peso 0,82│  ← instituto = link p/ fonte (Archivo semibold,
│ campo 12/07–15/07                          │     sublinhado pontilhado); peso mono text-xs
│                                            │     à direita, --color-cinza
│   2º TURNO                                 │  ← rótulo mono caixa alta, tracking-etiqueta
│   Lula 48,3%   ×   Flávio 43,6%            │  ← text-dado mono, cores -escuro
│   ┌──────────────────────────────────────┐ │
│   │ empate técnico                       │ │  ← chip de leitura (§5.5)
│   └──────────────────────────────────────┘ │
│                                            │
│   1º turno  40,1% × 32,4%   ·  n 2.000     │  ← text-xs mono, --color-cinza; "n/d" quando nulo
│   ±2,0 p.p. · BR-01234/2026                │  ← registro TSE sempre visível (P9)
│                                    [ × ]   │  ← remover: 44×44, aria-label completo
└────────────────────────────────────────────┘
```

Regras do cartão:

- `bg-cartao`, `border` `--color-linha`, `rounded-cartao`, `p-cartao`; lista em `<ul>/<li>`
  com `aria-label="Série de pesquisas"`.
- Ordem: mais recente → mais antiga (igual à tabela).
- `w < 0,15` → `opacity-55` **e** o texto `peso baixo` ao lado do peso. **[CORREÇÃO 1.4.1:
  opacidade sozinha não é um canal acessível.]**
- Selos `(usuário)` / `(auto — confira a fonte)` em `--color-alerta-texto`, logo abaixo do nome.
- O botão `×` fica no canto inferior direito, 44×44px, `aria-label="Remover pesquisa do
Instituto X, campo dd/mm a dd/mm (simulação)"`.
- Densidade: espaçamento vertical de 8px entre blocos internos, 12px entre cartões.

**Tabela (md+)** — exatamente as 10 colunas do protótipo (Instituto, Campo, n, ±MoE, 1ºT L×F,
2ºT L×F, Leitura 2ºT, Peso, Registro TSE, remover). Requisitos:

- `<caption class="sr-only">` descrevendo a série; `<th scope="col">` em todos os cabeçalhos.
- Wrapper com `overflow-x:auto`, `role="group"`, `tabindex="0"` e `aria-labelledby` apontando
  para o título — sem isso o container rolável é inacessível ao teclado (Smashing, acima).
- `<th>` do cabeçalho com `position: sticky; top: 0` quando a série passar de ~15 linhas.
- Numerais coloridos em `-escuro`; alinhamento numérico à direita, texto à esquerda.

**Modo simulação (R5)** — ver §8.4.

### 7.6 Gráficos

Comuns: `isAnimationActive={false}`; ticks e tooltip em `--font-mono`; tooltip com
`bg-tinta` / `text-texto-inverso` e as marcas em `--color-lula-claro` / `--color-flavio-claro`;
`--shadow-tip`.

**390**

- Altura 220px (evolução) e 200px (distribuição, sensibilidade).
- **Ticks reduzidos:** eixo X com no máximo 4 marcas (`interval="preserveStartEnd"` +
  `minTickGap={48}`), formato `dd/mm`; eixo Y com 4 marcas. Tamanho do tick **12px**, não 11.
  **[CORREÇÃO — piso tipográfico §4.2.]**
- **Tooltip acionável por toque:** `<Tooltip trigger="click">` e cada ponto de dispersão com
  raio de toque ≥ 22px (`activeDot={{ r: 6 }}` + `<Scatter>` com área de acerto ampliada).
  Hover não existe em toque — se o tooltip só abrir no hover, a informação é inacessível no
  viewport primário. O tooltip aberto fecha ao tocar fora.
- Legenda **acima** do gráfico, não dentro (dentro come área útil em 390px).
- **Alternativa textual obrigatória:** todo gráfico tem, logo abaixo, uma frase que enuncia o que
  ele mostra com os números atuais (a série de evolução já tem a nota do 1ºT; distribuição e
  sensibilidade precisam da equivalente). Serve a leitor de tela e a quem não lê gráfico.

**md** — altura 260/240px, ticks liberados (6–8), legenda pode voltar para dentro.
**lg** — altura 300px na evolução.

Domínios fixos do protótipo (`[30,55]` / `[20,50]`) são preservados: eixo Y com domínio fixo é
o que impede que uma variação de 0,3 p.p. pareça um terremoto (P2).

### 7.7 Parâmetros do modelo (sliders)

**390**

- Um slider por linha, `gap-5` entre eles.
- **Thumb ≥ 24px** de diâmetro visível (`--spacing-thumb`) e **área de toque ≥ 44×44px**
  (`::-webkit-slider-thumb` com `height/width: 24px` + o `<input type=range>` com
  `min-height: 44px` e `padding-block`). O mínimo do WCAG 2.2 AA (SC 2.5.8) é 24×24 CSS px, mas
  o alvo do produto é o AAA/plataforma: 44×44 (SC 2.5.5; Apple HIG 44pt; Material 48dp)
  ([WCAG 2.2 SC 2.5.8](https://wcag22aa.org/new-criteria/target-size/)).
- Trilho `h-1.5`, `--color-linha-forte`; preenchimento e thumb em `--color-confirma`.
- Rótulo (Archivo semibold, `text-sm`) e valor (mono, `--color-confirma-texto`) na mesma linha,
  `justify-between`. A dica fica **abaixo**, `text-xs` `--color-cinza`, sem truncar.
- `aria-valuetext` em português com unidade ("4,0 pontos percentuais"), porque `aria-valuenow`
  sozinho lê "4" sem sentido.
- Ao mudar um slider fora do padrão, o botão "↺ Restaurar parâmetros padrão" sai de
  `disabled` e o estado de "simulação ativa" acende (§8.4).

**md** — `md:grid-cols-2`. **lg** — `lg:grid-cols-2` com a caixa de fórmulas na coluna lateral.

Caixa de fórmulas: mono, `bg-mini`, `text-xs`, uma fórmula por linha; nunca em duas colunas.

### 7.8 Curva de sensibilidade e cartões de cenário

- A curva é **clicável para aplicar o viés**. Em toque isso é uma afordância invisível: exigir
  legenda explícita `toque na curva para aplicar aquele viés ao painel` acima do gráfico, e
  os **3 cartões de cenário** logo abaixo como caminho alternativo acessível (são `button`
  com `aria-pressed`, alvo ≥44px, borda ativa `2px` em `--color-tinta`).
- **390:** cartões empilhados; **md:** `grid-cols-3`.
- O ponto de virada e a linha "◆ atual" ganham rótulo textual, não só marca no gráfico.

### 7.9 Rodapé e avisos

`bg-rodape-fundo`, borda `--color-alerta`, texto `--color-rodape-texto`, `text-xs`,
`leading-leitura`, `p-cartao`. Aviso legal ampliado; a instrução "digite «atualizar» no chat"
sai (R3). Ocupa a largura da coluna de leitura.

---

## 8. Estados

Todo componente que depende de dado tem os quatro estados abaixo especificados. Nenhum deles
pode mudar a altura do bloco a ponto de empurrar a página (evitar CLS).

### 8.1 Carregando — esqueleto, não spinner

- Só onde há carregamento real de cliente. **A tela da urna e os números-manchete são
  renderizados no servidor** (CLAUDE.md): eles não têm estado de carregando.
- Esqueleto = retângulo `bg-linha` com `opacity-40`, `rounded-controle`, **sem animação de
  shimmer** (§3.3 e P3; e sob `prefers-reduced-motion` shimmer é proibido de qualquer modo).
- O esqueleto tem **a altura exata** do conteúdo final: cartão de pesquisa = 148px em 390px;
  linha de tabela = 44px; gráfico = a altura fixa do §7.6.
- `aria-busy="true"` no container e um `<span class="sr-only">Carregando…</span>`.
- Botão em ação: rótulo troca para `⏳ Buscando…`, `cursor: wait`, `disabled`, **largura
  travada** para não pular.

### 8.2 Vazio

- **Série sem pesquisas** (estado do protótipo): tela centrada, `min-h-screen`, mensagem
  `A série está vazia — nenhuma pesquisa no agregado.` + botão `↺ Restaurar dados oficiais`
  (44px). Nada de modelo é renderizado (evita divisão por zero e números fantasma).
- **Seção sem dado suficiente** (ex.: tendência sem par): o texto do protótipo
  `sem base p/ tendência` em `--color-cinza`, no lugar do valor — nunca `—` sozinho, nunca `0`.
- **Aba "todos" sem dado de 1º turno:** frase explicando por que, com link para a metodologia.

### 8.3 Erro

- **Erro nunca derruba a página (R8).** A falha é sempre local e degradada: o bloco afetado
  mostra o chip de erro, o resto da página segue com o seed local.
- Chip de erro: `bg-alerta-fundo`, borda `--color-alerta`, texto `--color-alerta-texto`,
  `text-xs` mono, prefixo `⚠`, mensagem em português dizendo **o que fica indisponível** e o que
  ainda vale ("não foi possível confirmar rodadas novas · a série exibida é a última verificada
  em dd/mm").
- `role="status"` (não `alert`) — a página não é uma emergência.
- Nunca exibir stack, código HTTP ou nome de serviço.

### 8.4 Simulação ativa (R5)

O estado mais importante do produto: o leitor precisa saber, a qualquer momento, se está olhando
a base oficial ou o brinquedo dele.

Dispara quando: pesquisa adicionada ou removida **ou** qualquer parâmetro fora de `PARAMS_PADRAO`.

- **Faixa persistente** logo abaixo do cabeçalho, largura total da coluna:
  `bg-alerta-fundo` · borda `--color-alerta` · texto `--color-alerta-texto` · mono `text-xs` ·
  `⚠ simulação ativa — não altera a base oficial` + botão `↺ voltar ao oficial` (44px).
  Em `md+` ela pode virar `sticky top-0` com `z-10`; em 390px **não** é sticky (rouba altura).
- **Marca no ponto de origem:** o cartão/linha adicionado pelo leitor leva o selo `(usuário)`;
  o painel de parâmetros mostra `↺ Restaurar parâmetros padrão (…)` habilitado.
- **A tela da urna também sinaliza**, dentro da moldura, em `--color-tela-alerta`: o aviso de
  viés já existente serve de gancho; quando a simulação vem de pesquisa adicionada/removida,
  a mensagem é `⚠ série em simulação (N pesquisas)`.
- `aria-live="polite"` na faixa, para anunciar entrada e saída do modo.
- **A simulação nunca é persistida nem compartilhada por engano:** a URL só carrega
  `?vies=…&sys=…` (parâmetros), e a página aberta com esses parâmetros **nasce em modo
  simulação com a faixa visível**.

### 8.5 Frescor dos dados (substitui o botão público — R3)

Selo permanente no cabeçalho, `text-xs` mono, `--color-confirma-texto` sobre
`--color-confirma-fundo`: `verificado hoje às 09h · última pesquisa incluída em dd/mm`.
Se a última verificação passar de 48h, o selo comuta para as cores de alerta e diz há quanto
tempo. O selo é informativo — não é botão, não tem afordância de clique.

---

## 9. Acessibilidade — piso do produto

| Item                | Regra                                                                  | Verificação                                                         |
| ------------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------- |
| Contraste de texto  | ≥ 4,5:1 (AA 1.4.3)                                                     | tabela §5.4; nenhum par novo sem cálculo                            |
| Contraste não-texto | ≥ 3:1 (AA 1.4.11)                                                      | bordas significativas em `--color-linha-forte`; barras com contorno |
| Alvo de toque       | ≥ 44×44 CSS px                                                         | sliders, `×`, abas, cartões de cenário, links do rodapé             |
| Cor sozinha         | proibida                                                               | §5.6                                                                |
| Foco                | visível em 100% dos interativos, 2px + offset 2px                      | §5.7                                                                |
| Movimento           | só o cursor; desligado em `prefers-reduced-motion`                     | regra global em `tokens.css`                                        |
| Idioma              | `lang="pt-BR"`                                                         | `layout.tsx`                                                        |
| Zoom                | 200% sem perda de conteúdo nem scroll horizontal                       | testar 390px @ 200%                                                 |
| Tabela              | `caption`, `th scope`, wrapper rolável com `role=group` + `tabindex=0` | §7.5                                                                |
| Gráfico             | alternativa textual abaixo de cada um                                  | §7.6                                                                |
| Ordem de foco       | igual à ordem visual; sem `tabindex` positivo                          | —                                                                   |
| Texto mínimo        | 12px                                                                   | §4.2                                                                |

---

## 10. Regras de implementação

1. **Zero hex em componente.** Só classes utilitárias ou `var(--color-*)` (necessário nos
   inline styles do Recharts, que não aceitam classe).
2. `tokens.css` usa `@theme static` — **todas** as variáveis são emitidas em `:root`
   independentemente de uso, porque o Recharts consome cor por `var()` em props, fora do
   alcance do scanner do Tailwind. Não trocar por `@theme` simples.
3. Fontes só por `next/font` (`--font-archivo`, `--font-plex-mono`). Nenhum `@import` de URL.
4. As únicas regras não-token em `tokens.css` são três: `@keyframes pisca`, o `:focus-visible`
   global e o bloco `prefers-reduced-motion`. Qualquer quarta regra global vai para `globals.css`
   e passa por revisão.
5. Nenhum `dangerouslySetInnerHTML`; links externos com `rel="noopener noreferrer"`.
6. Números-manchete renderizados no servidor (sem flash de valor).
7. Novo par de cores → calcular contraste, registrar na tabela §5.4, e só então usar.
8. Novo tratamento visual para um candidato → implementar o espelho na mesma entrega (R4).

---

## 11. Checklist de aceite (Fase 6)

**Identidade**

- [ ] Um único fundo escuro além do tooltip: a tela da urna (máx. 3 blocos, §3.2).
- [ ] Zero gradiente, glassmorphism, sombra difusa, ícone decorativo, imagem de pessoa/partido.
- [ ] Todo dado numérico em IBM Plex Mono; toda prosa em Archivo.
- [ ] Cursor `▊` presente e parado sob `prefers-reduced-motion`.

**Hierarquia**

- [ ] Teste do olho apertado em 390px: sobra **um** bloco dominante (a manchete da urna).
- [ ] `h1` menor que a manchete da urna.
- [ ] Nenhum texto abaixo de 12px, incluindo ticks de gráfico.

**Probabilidade**

- [ ] Nenhuma probabilidade com casa decimal.
- [ ] Toda probabilidade acompanhada da incerteza no próprio rótulo.
- [ ] `NÃO É PREVISÃO` visível em 390px sem scroll horizontal e sem depender de `sm`.
- [ ] Frase de frequência natural ("1 vez a cada N eleições parecidas") visível sem abrir `<details>`.
- [ ] Zero animação em valor numérico; Recharts com `isAnimationActive={false}`.

**Neutralidade (R4)**

- [ ] Lula à esquerda e Flávio à direita em 100% das peças.
- [ ] Nenhum numeral colorido usa a cor base — só `-escuro`.
- [ ] Cada tratamento visual tem o espelho do outro lado.
- [ ] Registro TSE e fonte visíveis em todas as linhas/cartões da série.

**Acessibilidade**

- [ ] axe-core sem violação em `/`, `/historico`, `/metodologia`.
- [ ] Todos os pares de cor conferem com a tabela §5.4.
- [ ] Nenhum dos 5 usos proibidos de §5.5 sobreviveu.
- [ ] Alvos de toque ≥ 44px medidos em 390px.
- [ ] Navegação completa por teclado, incluindo o wrapper rolável da tabela.
- [ ] 390px @ 200% de zoom sem scroll horizontal.

**Responsivo**

- [ ] Abaixo de md a série é lista de cartões; a partir de md é tabela com `caption` e `scope`.
- [ ] Contadores do cabeçalho em uma linha em 390px, altura ≤ 64px.
- [ ] Tooltip dos gráficos abre por toque.
- [ ] Nenhum scroll horizontal na página em 390 / 768 / 1140.

**Estados**

- [ ] Vazio, erro, carregando e simulação implementados nos 4 blocos que dependem de dado.
- [ ] Faixa de "simulação ativa" aparece em toda alteração de série ou parâmetro.
- [ ] Página builda e roda sem envs do Supabase (R8), sem estado de erro visível ao leitor.

---

## 12. Fontes

Comunicação de probabilidade e incerteza

- Aisch, G. — [_Why we used jittery gauges in our live election forecast_](http://www.vis4.net/blog/jittery-gauges-election-forecast/) (vis4.net) — racional e crítica do "needle" do NYT.
- Poynter (2024) — [_The New York Times is wheeling out its Needle election predictor — probably_](https://www.poynter.org/tech-tools/2024/ny-times-election-needle/).
- Bauer, Klima, Gauß, Kümpel, Bender & Küchenhoff (2021) — [_Mundus vult decipi, ergo decipiatur: Visual Communication of Uncertainty in Election Polls_](https://arxiv.org/abs/2105.07811), arXiv:2105.07811.
- Gelman, Hullman, Wlezien & Morris (2020) — [_Information, incentives, and goals in election forecasts_](https://sites.stat.columbia.edu/gelman/research/published/jdm200907b.pdf), Judgment and Decision Making.
- Kale, Hullman et al. — [_Swaying the public?_](https://www.hullmanlab.northwestern.edu/paper/2023/08/01/swaying-the-public.html) (estudo longitudinal, midterms 2022) e [_In Dice We Trust_](https://dl.acm.org/doi/10.1145/3613904.3642371), CHI 2024.
- Gelman, A. (2025) — [_Graphical display of election forecast uncertainty_](https://statmodeling.stat.columbia.edu/2025/02/02/graphical-display-of-election-forecast-uncertainty/) e (2024) [_My comments on Nate Silver's comments on the FiveThirtyEight election forecast_](https://statmodeling.stat.columbia.edu/2024/07/19/my-comments-on-nate-silvers-comments-on-the-fivethirtyeight-election-forecast/).
- CJR — [_The good and bad of election prediction data_](https://www.cjr.org/data_points/election_prediction_data.php).
- Nieman Lab (2020) — [_Should news outlets stop making election forecasts based on polling data?_](https://www.niemanlab.org/2020/10/should-news-outlets-stop-making-election-forecasts-based-on-polling-data/).

Modelos de referência

- 538 / ABC News (2024) — [_How 538's 2024 presidential election forecast works_](https://abcnews.com/538/538s-2024-presidential-election-forecast-works/story?id=110867585).
- Silver, N. — [_Model methodology 2024_](https://www.natesilver.net/p/model-methodology-2024), Silver Bulletin.
- Poder360 — [_Conheça o agregador de pesquisas eleitorais_](https://www.poder360.com.br/pesquisas/conheca-o-agregador-de-pesquisas-eleitorais-do-poder360/) e [_Agregador de Pesquisas_](https://www.poder360.com.br/iframe-ap/).
- Nota Alta / ESPM — [_Margem de erro, empate técnico e eleições_](https://notaalta.espm.br/fala-professor/margem-de-erro-empate-tecnico-e-eleicoes/).

Interface e acessibilidade

- Smashing Magazine (2022) — [_Accessible Front-End Patterns For Responsive Tables_, parte 1](https://www.smashingmagazine.com/2022/12/accessible-front-end-patterns-responsive-tables-part1/) e [parte 2](https://www.smashingmagazine.com/2022/12/accessible-front-end-patterns-responsive-tables-part2/).
- W3C — WCAG 2.2 SC 1.4.3 (Contrast Minimum), 1.4.11 (Non-text Contrast), 2.5.5 e [2.5.8 (Target Size)](https://wcag22aa.org/new-criteria/target-size/).
- Roselli, A. — [_A Responsive Accessible Table_](http://adrianroselli.com/2017/11/a-responsive-accessible-table.html).

_Contrastes de §5.4 e escalas de §5.3 calculados a partir dos hex, com luminância relativa sRGB
(WCAG 2.x) e OKLCH (Ottosson) — não estimados._
