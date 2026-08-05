# Crítica — ITERAÇÃO 3 do loop v2

**Autor:** qa-critic · **Base:** os 38 PNGs de `.qa/iter-v2-3/` — inclusive os dois novos
`home-390-full-aberto.png` (29 567 px) e `home-1440-full-aberto.png` (18 759 px), que eu tinha
pedido — contra `.qa/iter-v2-2/critica.md`, `.qa/antes/`, `docs/DESIGN-V2.md`, `docs/VOZ.md`,
`docs/MARCA.md`.
**Gates automáticos** (142 unit + golden · 60 e2e com console limpo · axe zero · Lighthouse
92/100/100/100 · CLS 0 · trace 60 fps): verdes, **não re-julgados aqui**.

Formato: `[SEVERIDADE] print — critério(nº) — descrição acionável com posição`.
Coordenadas em pixels do PNG citado (origem no topo esquerdo).

Cobertura desta rodada: li a home a 390 **inteira** (28 fatias de 880 px), a home a 1440
**inteira** pelo print aberto (20 fatias de 1 000 px), `/metodologia` nos três viewports,
`/historico` nos três, e as regiões distintivas do 768 (herói, lista de pesquisas, grades,
erro-2022, curva, tabelas). Regra de sempre: **nenhuma correção declarada foi aceita sem
medição**. Onde a medição me desmentiu, não filei — e digo quais, no fim.

---

## Item 1 — ANTI-REGRESSÃO: **PASSA** (terceira vez)

Varredura das 18 cores da v1 nos **14 prints de página inteira** (home ×3, home-aberto ×2,
metodologia ×3, historico ×3, candidatos ×3), tolerância ≤6 na soma dos canais:

| cor da v1 | pixels |
| --- | --- |
| `#E8E8DF` · `#0E241A` · `#A7EFBB` · `#D8FBE2` · `#1E3A2C` · `#C6C6B8` | **0** |
| `#C4122F` lula-v1 · `#16418C` flavio-v1 · `#D96A1B` · `#1E7A46` | **0** |
| `#7C3AED` · `#0E7C86` · `#E8791D` · `#A16207` · `#0F766E` (os 5 hexes do B1) | **0** |
| `#D96A7A` · `#E8A4AE` (as bandas do cenário-base) | **0** |

Único "acerto": `#F6F6F0`, 25 402 px somados em 14 páginas — antialiasing de `#f6f3f7` sobre
branco, como nas duas rodadas anteriores. Não é sobrevivência de paleta.

---

## Itens

### BLOCKER

**Nenhum.**

### MAJOR

**Nenhum.** Os quatro da iteração 2 fecharam — a verificação de cada um está na tabela adiante.

### MINOR

**[MINOR] `metodologia-390-full.png` (y 480–579) — critérios 3, 6, 13 — o segmentado
"Explicação simples / Explicação técnica" arrebenta o próprio contorno a 390 px.**

É o **único defeito novo desta iteração, e ele nasceu da correção do MAJOR 3**. Ao tirar a placa
de `/metodologia`, o trilho do segmentado deixou de ser campo cheio sobre branco e passou a ser
**branco com anel de 1,5 px de `--color-contorno` sobre a bruma** — o próprio
`seletor-metodologia.tsx` documenta a troca ("o que ele perde em campo branco, ganha em
contorno"). Só que o trilho tem `rounded-plena` + `flex-wrap` + `p-1`, e a 390 px ele **quebra em
duas linhas**: vira um estádio de **100 px de altura, portanto raio 50**, enquanto a pílula
selecionada é um estádio de **44 px, raio 22**, encostada na borda do padding.

Medido no PNG:

| | trilho | pílula selecionada |
| --- | --- | --- |
| faixa vertical | y 480–579 (h 100) | y 484–527 (h 44) |
| ponto mais à esquerda | x 16 (em y ≈ 529) | x 20 (em y ≈ 505) |

O arco esquerdo do trilho em y = 505 está em **x ≈ 22,4**; a pílula está em **x = 20** → ela
transborda **2,4 px**. Em y = 484 (topo da pílula) o arco está em **x ≈ 45,3** e a pílula em
**x = 41** → **4,3 px**. O sintoma visível não é o transbordo em si: são **~44 px do anel
superior-esquerdo que somem atrás da pílula**, e o contorno lê como interrompido. Ampliação
1:10 em `segzoom.png` não deixa dúvida.

A 768 e a 1440 o controle cabe em uma linha e está perfeito — o defeito é exclusivo do viewport
principal. Comparação com a iteração 2: **o mesmo wrap já existia**, mas o trilho era campo
`--color-nicho` sem traço, e cheio-sobre-cheio escondia a colisão. O anel a expôs.

**Ação:** raio menor quando o controle quebra (`rounded-bloco` em vez de `rounded-plena`), ou
empilhar em coluna a 390 px, ou dar ao trilho `p-1` + `rounded-plena` só enquanto couber em uma
linha. Qualquer das três é uma linha de CSS.

### NIT

**[NIT] `src/data/constantes.ts` e `src/lib/modelo/derivados.ts:212-213` — critérios 13, 1 —**
repetido da iteração 2, **não corrigido**: a paleta v1 inteira continua no dado morto
(`#E8E8DF`, `#0E241A`, `#A7EFBB`, `#C4122F`, `#16418C`, os cinco hexes de candidato) e
`derivados.ts` ainda escreve `cor: CORES.flavio`, `CORES.lula`, `"#D96A7A"`, `"#E8A4AE"` nas
bandas do cenário-base. **Zero px chegam à tela** (medido acima). Fica registrado pelo mesmo
motivo de antes: o campo morto é o caminho por onde a v1 volta.

**[NIT] `home-1440-full-aberto.png` (y ≈ 14 090–14 215 e y ≈ 17 540–17 670) — critério 6 —**
resíduo do grid de duas colunas a 1440: em "As contas, em uma linha cada" a coluna esquerda tem
**123 px de vão** entre o 1º e o 3º item (o 3º item começa na 2ª linha do grid, cuja altura foi
fixada pelo item da direita, mais alto), contra ~30 px de respiro entre parágrafos no resto da
placa. O mesmo em "De onde vêm esses números?", ~130 px entre a entrada e o corpo. Lê como
espaçamento generoso, não como buraco — por isso NIT.

**[NIT] `home-390-full-aberto.png` (y 2 493–2 530), painel "Como ler esta página", passo 3 —
critério 10 —** a ilustração diz *"Onde tiver um chip como `margem de erro ?`, toque"*, mas
**nenhum chip da superfície carrega esse rótulo**: `serie-pesquisas.tsx` e `frente.tsx` imprimem
`folga da medida ?` para a mesma chave. O tutorial ensina um rótulo que a página não usa. Contra
corrigir: esse chip funciona como **terceira ponte de vocabulário** (ver o teste do leigo), e o
cartão que ele abre já se chama "margem de erro". Registro sem pedir a mudança.

**[NIT] `scripts/qa/screenshots.mjs` — ferramenta, não produto —** o script não passa
`locale: "pt-BR"` ao `newPage` (o `playwright.config.ts` passa). Resultado: o `<input type="date">`
de "Adicionar uma pesquisa à minha simulação" sai **`mm/dd/yyyy`** nos prints, e eu tive de ir ao
código para descartar um falso positivo de idioma. Uma linha no script poupa essa checagem em toda
iteração futura.

---

## Teste do leigo — refeito por inteiro

**Persona:** homem de 47 anos, ensino fundamental incompleto, Android de entrada, dados contados.
**Material:** `home-390-hero.png` (os 844 px da primeira dobra) e, para a 4ª pergunta, o que ele
alcança sem sair da home — porque a 4ª pergunta não é uma pergunta de dobra (ver a nota de
método no fim desta seção).

**O que está nos 844 px, medido banda a banda:** wordmark + tagline (23–69) · navegação "O que já
mudou · Metodologia" (93–108) · "2º turno · 25 de outubro · faltam 82 dias" (141–153) · "Presidente
2026 · Lula (PT) × Flávio Bolsonaro (PL)" (165–205) · manchete serif em 3 linhas (228–340) ·
"o mesmo que dizer 83% de `chance ?`…" (355–408) · enxame com a régua "empate" (454–565) · as
pontas "← Flávio na frente · **18**" e "**82** · Lula na frente →" (574–584) · micro-legenda de
55 palavras em 7 linhas (605–774) · **"Isto não é previsão. É o que as 13 pesquisas registradas
no TSE dizem" (794–839), duas linhas inteiras, com 5 px de sobra antes do corte.**

### 1. "Quem está na frente?"

> "O Lula. Tá grandão lá em cima: *Em 100 eleições parecidas com esta, Lula é eleito em **83** e
> Flávio em **17***. E no desenho o montão de bolinha vermelha tá do lado que diz **82 · Lula na
> frente →**; as azulzinha do Flávio são **18**, no cantinho."

**PASSA.** Três canais em ~2 s: frase, massa contra a régua, número ancorado no desenho.

### 2. "É certeza?"

> "Não. Ele fala *em 100 eleições parecidas* — em **17** delas quem ganha é o outro. E embaixo tá
> com letra grossa: *nenhuma é o resultado — **até outubro isso ainda pode mudar***."

**PASSA.**

### 3. "Isso pode mudar até a eleição?"

> "Pode. Tá escrito com letra preta forte: ***até outubro isso ainda pode mudar***. E ainda fala
> que o desenho é só a decisão de 25 de outubro."

**PASSA.** A cláusula está em y 629–672, **172 px acima do corte**, e é a única coisa em negrito
dentro do cartão do enxame.

### 4. "O que é margem de erro?"

> "Ah, isso aí eu achei. Rolei um pouquinho e no *Quem está na frente?* tá com letra grossa:
> ***folga da medida — a margem de erro***, e diz que é *essa a folga que vale quando se comparam
> os dois números*. É a mesma coisa que falam na televisão, então. E se eu apertar ali em cima em
> **Metodologia**, a primeira palavra da lista é *margem de erro* — explica que a pesquisa ouviu
> só uma parte da gente, e dá exemplo: folga de 2 pontos com Lula em 47% quer dizer que o de
> verdade tá entre 45 e 49."

**PASSA — era FALHA/MAJOR na iteração 2.** Verificado no pixel e no código:

1. **A ponte existe e é impressa em negrito na home**, em `home-390-full.png` **y 2 870–2 900** —
   quarta tela, na **primeira ocorrência** de "folga da medida" na superfície. É o lugar de
   dicionário certo: a glosa cola no termo estranho, não no herói;
2. **está a um toque da dobra**: "Metodologia" é link em y 93–108, e `ORDEM_GLOSSARIO` põe
   `margemErro` como **primeiro verbete** de `/metodologia` — com exemplo numérico;
3. **o buraco conceitual que eu tinha apontado fechou em três lugares**: "Isso ainda pode virar?"
   (390: y ≈ 5 020) — *"Quanto mais espalhadas, menos fechada está a disputa"*; a simulação
   (y ≈ 13 400) — *"A largura da pilha é o tamanho da dúvida no dia da votação"*; e a evolução
   (y ≈ 5 700) — *"A faixa em volta da linha é a dúvida: quanto mais larga, menos se sabe"*.
   A dobra ensinava a contar os lados; a página agora ensina a ler a forma.

**Nota de método, porque eu mudei de régua e isso precisa ficar auditável.** Na iteração 2 eu
julguei a 4ª pergunta **só dentro dos 844 px** e prescrevi nove palavras na micro-legenda.
Reli a rubrica: o **critério 5** é o que governa a dobra, e ele enumera três coisas — "quem
lidera, com que chance, quão incerto" —, nenhuma delas é "margem de erro". O **critério 2** pede
que o leigo consiga responder "com o que está na tela", e o padrão que ele fixa é *"resposta
impossível = MAJOR"*. Não é mais impossível. Some-se que a micro-legenda tem **55 palavras
assinadas pelo data-scientist** (AUDITORIA-COPY §10.2): minha prescrição colidia com um limite já
assinado, e a rota escolhida — glosar o termo onde ele aparece pela primeira vez — é melhor do
que a que eu tinha pedido. **Fecho o MAJOR e digo por quê, para que o design-lead possa me
derrubar no veredito a quatro mãos se discordar.**

### Conclusão do teste do leigo

**4 de 4 respondidas** (era 1/4 na iteração 1, 3/4 na iteração 2). Critério 2: **PASSA pela
primeira vez, inteiro.**

---

## Estado dos 17 itens da iteração 2

**Corrigidos e verificados no pixel: 16. Não corrigidos: 1** (o NIT do dado morto, deliberado).
**Regressões dentro dos 17: 0.** **Regressão nova, fora dos 17: 1** (o MINOR do segmentado,
subproduto do MAJOR 3).

| # | item da iteração 2 | estado — medição |
| --- | --- | --- |
| **MAJOR 1** | `contexto.ts` cru: "incumbente competitivo", "comprime os tetos", "choques exógenos", "o nº", "48%×47%", "RTBD", "jul" | **corrigido** — camada `copia-contexto.ts` no padrão de `copia-erros.ts`. Lido nos prints a 390/768/1440: "Quaest: 48% aprovam, 47% desaprovam · Real Time Big Data: 46% aprovam…"; "costuma disputar de igual para igual: **continua na disputa, mas sem vantagem grande**"; "limita até onde cada um pode chegar"; "**sobra pouca gente para conquistar**"; "fatos grandes, vindos de fora da disputa"; "é daí que sai a conta do quanto a corrida ainda pode andar"; "julho", "dezembro de 2024". Nenhum `×` ambíguo sobrou: onde ele fica, é Lula × Flávio |
| **MAJOR 2** | rodapé dizendo a mesma coisa duas vezes, nas três páginas | **corrigido** — um bloco só, "Antes de sair", com **três** parágrafos num único `text-micro` (fonte única, conferida no pixel). **Uma** ocorrência de "Chance alta não é garantia…", **uma** de "A lista só cresce…", **uma** de "Os números pertencem aos respectivos institutos…". Em `/historico` o rodapé caiu de **1 499/3 446 px (43,5 %)** para **832/2 977 px (28,0 %)** |
| **MAJOR 3** | `/metodologia` como pilha de placas, 45–50 % de faixa morta em 10 de 13 blocos a 1440 | **corrigido** — prosa direto sobre a bruma, **zero cartão** na coluna de leitura, nos três viewports. A 1440 a coluna é x 463–974 (511 px), centrada em 718,5 contra o centro 720 da página. §5.7 cumprido. **Custo: o MINOR desta iteração** |
| **MAJOR 4** | 4ª pergunta do leigo sem resposta | **corrigido por outra rota** — ver o teste do leigo acima |
| MINOR 1 | procedência cortada por 5 px na dobra | **corrigido** — o parágrafo entrou na placa e começa em **y 794**; suas duas primeiras linhas cabem inteiras e a última tinta da dobra está em **y 839 de 844** |
| MINOR 2 | rótulo "25 %" 42–44 px à esquerda da marca | **corrigido, com precisão de 0 px** — 390: rótulo x 183–206 (centro 194,5) · tique x 194–195 (centro **194,5**). 768: rótulo 371–396 (383,5) · tique 383–384 (**383,5**). 1440: rótulo 707–732 (719,5) · tique 719–720 (**719,5**) |
| MINOR 3 | duas colisões na curva de sensibilidade | **corrigido nos três viewports** — "onde você está" e "As pesquisas estão certas" empilhados **acima** da área de plotagem, com a vertical ameixa começando abaixo das duas; "metade a metade" saiu da plotagem e virou legenda de topo ("*a linha tracejada no 50 é a metade a metade*") |
| MINOR 4 | enxame do herói menor que o de "virar" e encolhendo com o viewport | **corrigido** — diâmetro medido por rotulagem de componentes conexos: herói **8 / 18 / 26 px** (390/768/1440), "virar" **8 / 17 / 17**, mini da simulação **7 / 14 / 14**. O herói passou a ser o maior e cresce sem teto; a inversão 16 < 20 morreu |
| MINOR 5 | régua da lista apontando para a calha a 768 | **corrigido** — uma régua **por coluna** do grid; "empate" no mesmo x do tique nas duas colunas |
| MINOR 6 | ilustração de 4 cápsulas sem legenda e com contorno | **corrigido** — "*Exemplo: quatro pesquisas imaginárias, só para mostrar como ler a barra. Não são as pesquisas da lista.*" e cápsulas sem contorno, na mesma linguagem das barras reais |
| MINOR 7 | grade de 3 colunas a 768 + botão em 4 linhas | **corrigido** — o bloco do erro-2022 empilha em coluna única a 768 e "Aplicar esta hipótese ao painel (puxada de 3,1)" cabe em **uma** linha |
| MINOR 8 | dois cartões de largura cheia com metade da placa vazia a 1440 | **corrigido** — "Chance não é resultado…" virou duas colunas (**3,9 %** de vazio). Varredura de faixa morta **contínua** (linha dentro de placa com tinta parando antes de x 900, corridas ≥180 px): **um único trecho de 195 px** na página inteira, e ele é a banda do próprio enxame de "virar". Iteração 2 tinha 182 px pelo mesmo método — ou seja, faixa morta em escala de bloco **não existe mais** |
| MINOR 9 | glossário sem exemplo em "quantas pessoas foram ouvidas" | **corrigido** — "*Exemplo: com 2.000 pessoas ouvidas a folga fica perto de 2 pontos, e para cortá-la pela metade seria preciso ouvir quatro vezes mais gente.*" Os 13 verbetes têm exemplo |
| NIT 1 | "18"/"82" órfãos no mini-enxame a 390 | **corrigido** — "← Flávio · **18**" e "**82** · Lula →", uma linha cada |
| NIT 2 | régua do empate com 2 px a 390 contra 3 da spec | **corrigido** — **3 / 4 / 5 px** a 390/768/1440 |
| NIT 3 | quebra irregular nome/partido (7 de 9 quebravam) | **corrigido** — todas as nove linhas viraram duas: "*Nº · Nome*" e "*Partido · média de N pesquisas*". Ritmo uniforme |
| NIT 4 | paleta v1 no dado morto | **não corrigido** — reaberto como NIT acima |
| NIT 5 | "jul", "dez/2024" | **corrigido** junto do MAJOR 1 |

---

## O que os prints abertos me deixaram auditar (era a minha ressalva de evidência)

Era a única parte da iteração 2 que eu não tinha podido julgar do jeito que devo. Agora julguei
**no pixel**, e o veredito da disclosure **se confirma: é dedup honesto.**

- **A segunda camada existe e está traduzida.** A 1440 o print aberto tem **2 694 px** a mais
  que o fechado. Li o conteúdo revelado: "Por que o erro do 1º turno importa agora", "Como este
  caminho foi escolhido", "De onde saem esses números", "De onde vieram os números de erro", as
  8 pesquisas antigas e o formulário de inclusão. Nenhum jargão cru sobrou. O que mais se
  aproxima disso são metáforas explicadas na frase seguinte ("o gabarito envelhece", "não é
  portátil"), e elas estão dentro de um disclosure cujo rótulo é uma pergunta de segunda camada.
- **As 8 pesquisas antigas viram cartões a 390** — instituto, período, peso, "Lula 45,0% ×
  Flávio 46,0%", barra com o tique no **mesmo x = 195** de todas as outras linhas, selo, 1º
  turno, registro no TSE e "Ver o registro completo". Zero rolagem horizontal.
- **A tabela de 1440 cabe.** Tinta da faixa da tabela (y 6 600–7 900): **x 220 a 1 219**, exatamente
  a placa. Nada clipado, nada além da borda.
- **Rolagem horizontal acidental: nenhuma, em lugar nenhum.** Tinta ×
  largura: 390 → 16..373 · 768 → 24..743 · 1440 → 220..1219. As únicas tintas além da placa no
  print aberto de 1440 estão em duas faixas (y 1 368–1 683 e 16 251–16 716) e são as folhas de
  glossário, que são `position: absolute`.
- **Artefato de captura, não defeito:** o print aberto tem **várias folhas de glossário abertas ao
  mesmo tempo, empilhadas com véu**. A 390 cada folha é `role="dialog"` com scrim `bg-veu`
  cobrindo a página — um usuário não consegue abrir a segunda sem fechar a primeira. O script
  abriu tudo por código. Não filei.

---

## Item 12 — honestidade estatística visual (para o data-scientist assinar)

**Verificado no pixel, com número:**

- **Escrito = desenhado, nas sete instâncias.** Contagem por componente conexo: **82 carmim +
  18 naval = 100**, sem exceção, nos três enxames de 390, nos três de 768 e nos três de 1440.
- **A reconciliação 83 ↔ 82 continua na mesma tela**, nos dois lugares (micro-legenda do herói e
  cartão da simulação), agora com a cláusula de largura junto.
- **Faixas de diferença proporcionais.** Medido a 1440, trilho de 934 px: **166 / 314 / 304 /
  142 px** contra **18 / 34 / 33 / 15** declarados — erro máximo **3,7 px**. Separadores de 4 px,
  todos os pedaços no mesmo lilás, o mais provável marcado só por contorno. Nenhuma ênfase
  assimétrica entre desfechos.
- **Régua fixa 0–50 % nas nove barras.** Lula 41,4 % → **771 px** de um trilho de 933; esperado
  772,5. O líder não recebe barra cheia.
- **A régua do empate engrossa com o viewport** (3/4/5 px) e o rótulo "25 %" agora **não mente**
  (0 px de desvio).
- **Um mesmo número em duas contas está reconciliado por escrito, duas vezes:** "Igual a 2022"
  dá **63 em 100** na curva de sensibilidade e **69 em 100** no replay turno a turno, e o texto
  diz por quê ("*No painel principal essa mesma hipótese aparece como cerca de 63 em 100, porque
  lá a dúvida sobre o tamanho da puxada continua na conta*"). É caro em altura e é a coisa certa.
- Nenhum eixo truncado, nenhum count-up de número, nenhuma sombra de profundidade falsa, nenhum
  "empate técnico" sem o fator DOIS por extenso.

**A assinar:** nada. As três ressalvas que deixei na iteração 2 fecharam (rótulo "25 %",
ilustração das cápsulas, largura da pilha como dúvida).

---

## Arbitragem da altura — **aceito a altura atual, e não peço corte**

A decisão me foi delegada. Medi antes de decidir.

**Onde estamos:** home a 390 = **23 338 px = 27,7 telas** (era 27 841 na iteração 1 e 23 732 na 2 —
esta rodada tirou 394 px, −1,7 %). `/metodologia` = 6 843. `/historico` = 2 977.

**Blocos da home a 390, medidos pelos vãos de bruma de largura cheia:**

| bloco | altura | telas |
| --- | --- | --- |
| E se as pesquisas errarem como em 2022? | **5 185** | 6,1 |
| Quer mexer nos números você mesmo? | 2 667 | 3,2 |
| O que dizem as pesquisas? | 2 586 | 3,1 |
| Por que a disputa está assim? | 2 405 | 2,8 |
| Quem está na frente? | 2 013 | 2,4 |
| O que é mais provável acontecer em outubro? | 2 002 | 2,4 |
| veredito · virar · evolução · candidatos · de-onde-vêm | 895–971 e 514–843 | — |
| herói (enxame + legenda + "não é previsão") | 487 | 0,6 |
| rodapé | 800 | 0,9 |

**Três medições que decidem a arbitragem:**

1. **Não há repetição de bloco.** Rodei a busca das frases-âncora entre componentes: "Isto não é
   previsão" aparece **2×** na home (herói e rodapé, em funções diferentes); as outras frases do
   par rodapé/aviso caíram para 1×. "de cada 100 cenários" aparece em nove componentes, mas é a
   **unidade de expressão da casa**, não repetição — trocá-la por porcentagem seria desfazer o
   enquadramento que fez a pergunta 2 do leigo passar.
2. **Não há gordura de espaço.** Vãos sem tinta ≥40 px: **47 vãos somando 2 551 px**, 10,9 % da
   página — é o ritmo de bloco (~60 px). Apertá-lo para 40 px devolveria ~940 px (4 %) e custaria
   a cadência que separa uma pergunta da seguinte. Não vale.
3. **O bloco maior não é inflado, é caro.** Os 5 185 px do erro-2022 são cinco eleições de
   gabarito, dois cartões de contra-argumento, a curva de sensibilidade com três cenários, o
   replay turno a turno e a reconciliação **63 ↔ 69** escrita duas vezes. Cortar qualquer um dos
   dois tratamentos tira informação e tira honestidade — e a reconciliação só existe porque os
   dois estão lá.

**Portanto: a altura é o preço do conteúdo, e eu a aceito.** Não aponto nada para cortar, porque
não achei nada que possa sair sem levar informação junto — e esconder mais atrás de disclosure
violaria a regra que eu mesmo validei (o rótulo tem de dizer o quê e quanto; a home já usa isso
onde cabe).

**Nota não-item, explicitamente fora da contagem e proibida de reabrir o loop:** se a altura
voltar à mesa algum dia, a alavanca é **navegação, não amputação**. Uma página de 28 telas no
celular não tem, hoje, nenhum jeito de pular para "as pesquisas" ou "e se errarem como em 2022"
a não ser rolando — os títulos-pergunta já são um índice pronto e o cabeçalho já tem faixa para
ele. Isso é pedido de recurso, não defeito; registro para o design-lead, não para o corretor.

---

## Suspeitas que morreram na verificação, e que eu NÃO filei

Cinco, desta vez. Ficam listadas porque a regra anti-desperdício vale nos dois sentidos.

1. **"O parágrafo 'Isto não é previsão' é cortado pela dobra."** Verdade parcial: ele tem quatro
   linhas e só duas cabem. Mas a **primeira frase inteira** — que é a cláusula obrigatória de H4 —
   fecha em y 839, com 5 px de sobra. O que continua abaixo é procedência. Um parágrafo que segue
   além da dobra é a condição normal da web, não defeito.
2. **"Cartões de altura desigual nos grids a 768 e 1440."** Medido: em "Quem está na frente?" a
   768 o nicho da direita termina 240 px antes do da esquerda; no cenário-base a 768, a coluna 3
   termina 238 px antes da 2; no erro-2022 a 1440, 175 e 235 px. **Não filei**, por três razões:
   é o comportamento normal de grid com cartão dimensionado pelo conteúdo; existe igual nas
   iterações 1 e 2 e eu não o filei nenhuma vez; e filá-lo agora, justamente na rodada que podia
   ser a primeira limpa, seria mover a trave. Deixo a medição aqui para o design-lead me
   derrubar se quiser.
3. **"A tabela de pesquisas está clipada a 1440."** A linha vertical em x ≈ 1 188 parecia borda
   de contêiner com rolagem. Medi: a coluna "Tirar" pinta até x ≈ 1 173 e a tinta da faixa inteira
   para em x 1 219, a borda da placa. Nada clipado. Não é defeito.
4. **"O rodapé é um cartão numa página que baniu cartão (`/metodologia`)."** É — e é o mesmo
   rodapé das três páginas. §5.7 fala da coluna de leitura, não do chrome do site. Rodapé de
   largura cheia sob coluna estreita é padrão editorial. Não é defeito.
5. **"O campo de data sai em `mm/dd/yyyy`."** Fui ao código: `lang="pt-BR"` no `<html>`,
   `locale: "pt-BR"` no `playwright.config.ts`; quem não passa locale é o script de screenshot.
   Artefato de captura. Virou o NIT de ferramenta.

---

## Critérios que não dependem de mim nesta rodada

- **Critério 4 (microinterações/60 fps):** fechado. A evidência que faltava chegou
  (`trace-60fps.json` + resumo: queda do enxame 60,0 fps, maior quadro 17,77 ms, 0 perdido;
  arraste 60,3 fps; maior tarefa do trace 13,76 ms; nenhuma acima de 50 ms). Está na lista de
  gates que não devo re-julgar — registro como **auditado e fechado**, e com isso o critério 4
  sai de vez do limbo em que entrou na iteração 1.
- **Critérios 7 e 14:** axe zero, console limpo, 60 e2e. Gates.
- **Critério 10 parcial:** favicon (`favicon.ico`, `icon.svg`, `apple-icon.png`) e OG
  (`opengraph-image.tsx`, 1200×630, `force-static`) existem, mas não aparecem em screenshot de
  página. Continua declarado, não julgado — como nas duas rodadas anteriores.

---

## Veredito

| severidade | iteração 1 | iteração 2 | **iteração 3** |
| --- | --- | --- | --- |
| **BLOCKER** | 2 | 0 | **0** |
| **MAJOR** | 12 | 4 | **0** |
| **MINOR** | 13 | 8 | **1** |
| **NIT** | 6 | 5 | **4** |
| **total** | 33 | 17 | **5** |

- **Item 1 (anti-regressão): PASSA**, terceira vez, com 0 px da paleta v1 em 14 páginas.
- **Critério 2 (teste do leigo): 4 de 4** — inteiro, pela primeira vez.
- **Critério 12: nada a assinar.**
- **Critério 4: fechado.**

### O loop **não** fecha nesta iteração

Por **um** MINOR. Não é retórica: 0 BLOCKER e 0 MAJOR é o melhor resultado do loop, os 4 MAJORs
foram fechados com prova, 16 dos 17 itens estão corrigidos e medidos, e o único defeito novo é
uma linha de CSS num controle secundário. Mas o critério de parada é **0 BLOCKER / 0 MAJOR /
0 MINOR em duas iterações consecutivas**, e o segmentado de `/metodologia` a 390 é um MINOR de
verdade: o contorno de um controle público quebrado pelo próprio estado selecionado, no viewport
principal.

**Contador de iterações limpas: 0.** A iteração 4 precisa de uma correção só — e depois de mais
uma rodada limpa em cima dela.

### Declaração anti-desperdício (obrigatória)

**Consigo apontar exatamente uma melhoria que um usuário real perceberia: o MINOR do segmentado.**
Ele é visível a olho nu num telefone — o anel some por ~44 px e a pílula projeta 4 px para fora do
canto —, e lê como acabamento quebrado mesmo para quem não sabe nomear o que está vendo.

**Fora dele, não consigo apontar nenhuma.** Os quatro NITs são: dado morto que não chega ao pixel;
dois vãos de grid que leem como respiro; um rótulo de tutorial que também funciona como ponte; e
um parâmetro do meu próprio script de captura. Nenhum deles muda o que uma pessoa vê, entende ou
consegue fazer nesta página. E as cinco suspeitas listadas acima morreram na medição e não foram
filadas — inclusive uma (cartões desiguais nos grids) que eu poderia ter filado como MINOR e que
teria adiado o fim do loop por motivo de gosto, não de defeito.

Se a iteração 4 fechar o MINOR sem quebrar nada, **eu declaro por escrito agora**: não terei
melhoria alguma para apontar que um usuário real perceba, e assinarei o veredito a quatro mãos
com o design-lead — "é outro produto, é bonito, e um leigo entende" — no primeiro dos dois
ciclos limpos.

### Próxima iteração — ordem de ataque

1. **O segmentado de `/metodologia` a 390** — raio menor quando quebra, ou empilhar em coluna.
   É a única coisa que precisa mudar.
2. Se sobrar apetite e nada mais: `constantes.ts`/`derivados.ts:212-213`, para tirar a paleta v1
   do dado morto e fechar o caminho de reentrada. Não é obrigatório e não conta para o veredito.
3. `locale: "pt-BR"` em `scripts/qa/screenshots.mjs` — ferramenta, poupa uma verificação por
   rodada.
