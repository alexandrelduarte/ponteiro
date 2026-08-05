# Crítica — ITERAÇÃO 1 do loop v2

**Autor:** qa-critic · **Base:** os 36 PNGs de `.qa/iter-v2-1/` contra `.qa/antes/` (v1),
`docs/DESIGN-V2.md`, `docs/VOZ.md`, `docs/COPY-DECK.md`, `docs/MARCA.md`.
**Gates automáticos** (139 unit + golden · 36 e2e com console limpo · axe zero · SSR sem JS ·
teclado · build 15 páginas): verdes, **não re-julgados aqui**.

Formato: `[SEVERIDADE] print — critério(nº) — descrição acionável com posição`.
Coordenadas são em pixels do PNG citado (origem no topo esquerdo).

---

## Item 1 — ANTI-REGRESSÃO: **PASSA**

Medido, não estimado. Amostragem de cor de `home-390-full.png` (1 px a cada 3×7):

| cor | % da página | token v2 |
| --- | --- | --- |
| `#ffffff` | 44,8 % | `--color-placa` |
| `#f6f3f7` | 27,0 % | `--color-nicho` |
| `#efecf1` | 11,8 % | `--color-bruma` |
| `#e2d8e8` | 2,2 % | `--color-faixa` |
| `#f8ecda` | 1,3 % | `--color-atencao-fundo` |
| `#5c5566` · `#211c26` · `#e4dbe9` · `#5a3a66` · `#be1745` · `#f7dce4` · `#26418b` · `#8f5407` | resto | tokens v2 |

**Zero pixel** de `#E8E8DF`, `#0E241A`, `#A7EFBB` ou parentes. Comparação direta com
`antes/home-390-urna.png` e `antes/home-1440-full.png`: sumiram o campo verde-escuro, o cursor `▊`,
o par Archivo + IBM Plex Mono, os rótulos em caixa-alta espacejada
("APURAÇÃO DE PESQUISAS · REGISTRO OBRIGATÓRIO NO TSE"), o `<h1>` "PRESIDENTE 2026" e — o mais
importante — **a barra dividida 83/17**, substituída pelo enxame de 100 bolinhas. Sombra em bloco
parado: nenhuma (transição `#ffffff` → `#efecf1` sem degradê, verificada em `home-1440-full.png`
y 1087→1088). Bolinha a 390: **8–9 px medidos em 100 blobs**, folga ~2,5 px — §2.2 cumprido.

Não parece o mesmo produto. **Nenhum BLOCKER automático por este item.**
Ressalva registrada abaixo (B1): sete cores de candidato **sobreviveram intactas do protótipo v1**.

---

## Itens

### BLOCKER

**[BLOCKER] `home-390-candidatos.png` (y≈12 000–12 400) · `home-768-candidatos.png` (y≈7 400–7 800) · `home-1440-candidatos.png` (y 7 518–7 974) — critérios 13, 7, 11, 1 —**
As sete cores dos candidatos 3º–9º são **hex crus do Tailwind default, herdados do protótipo v1**
(`src/data/constantes.ts:62-68`), fora de `tokens.css` e fora da tabela §10 do DESIGN-V2. Medidos no
próprio print:

| candidato | hex | vs placa `#fff` | vs nicho `#f6f3f7` |
| --- | --- | --- | --- |
| Renan Santos | `#7c3aed` (violet-600) | 5,70 | 5,18 |
| Ronaldo Caiado | `#0e7c86` | 4,95 | 4,49 |
| **Romeu Zema** | **`#e8791d`** | **2,92** ✗ | **2,66** ✗ |
| Augusto Cury | `#a16207` (yellow-700) | 4,92 | 4,47 |
| Samara Martins | `#b4236b` | 6,19 | 5,62 |
| Joaquim Barbosa | `#4b5563` (gray-600) | 7,56 | 6,87 |
| Cabo Daciolo | `#0f766e` (teal-700) | 5,47 | 4,97 |

Quatro defeitos duros, todos calculados:
1. **Zema falha o piso 3:1 de objeto gráfico (SC 1.4.11)** — 2,92:1 na placa e 2,66:1 no nicho.
   O axe não testa contraste de objeto gráfico, então o gate verde não cobre isso.
2. **Caiado × Daciolo = 1,11:1** — dois candidatos com a mesma cor, um em cima do outro na lista.
3. **Renan `#7c3aed` × `--color-ameixa-clara` = 1,00:1** — um candidato vestindo a cor da marca.
   `MARCA.md` §6.6.1 e `DESIGN-V2.md` §8.3 proíbem explicitamente: "a marca não empresta cor a dado
   nenhum".
4. **Cury `#a16207` × `--color-atencao` `#8f5407` = 1,24:1** — um candidato vestindo a cor de
   atenção do sistema. E `#0f766e` reintroduz **verde** num produto que baniu semântica verde
   (DECISOES #5) e cuja v1 era verde-fósforo.

Barbosa `#4b5563` é cinza neutro fora da matiz ameixa e lê como "desabilitado".
**Ação:** derivar uma escala categórica de 7 degraus em OKLCH (ΔL ≥ 0,08 entre vizinhos de lista,
matizes separadas ≥ 40°), todos ≥ 3:1 contra placa **e** nicho, publicar na §10 do DESIGN-V2 com o
número calculado ao lado, e trocar `constantes.ts` por tokens. Enquanto isso, `CLAUDE.md` está
literalmente violado: "Reaproveitar aparência da v1 'porque já existe' é falha."

**[BLOCKER] `home-390-full.png` (y 15 680–15 850) · `home-1440-full.png` (y 9 800–9 960) · `home-{390,768,1440}-simulacao.png` — critérios 12, 9, 2 —**
O cartão do mini-enxame diz **"Nesta simulação, Lula é eleito em 83 de cada 100 cenários"** com
**todas as quatro réguas no padrão** (o print mostra "21 dias", "4,0 pontos", "cerca de 3,2 pontos
para cada lado", "nenhuma puxada" — nenhum slider foi tocado). Dois vetos quebrados de uma vez:

- **H7 / R5 invertidos.** A palavra "simulação" existe para marcar o que *não* é oficial. Aqui ela
  marca o estado oficial — e o parágrafo três blocos acima diz o contrário na mesma tela:
  "Se você mexer em alguma régua, o painel inteiro passa a mostrar 'simulação'". O leitor que rolar
  até aqui conclui que o 83 da manchete é uma simulação.
- **H3 quebrado.** Contagem de blobs no próprio PNG: o desenho tem **82 vermelhas e 18 azuis**
  (idêntico ao do hero), mas a frase acima dele diz **83**. No hero essa diferença é reconciliada por
  uma micro-legenda explícita; **aqui não há nenhuma** — escrito e desenhado discordam sem aviso.

**Ação:** (a) o rótulo padrão é "Com as réguas no padrão…" e só vira "Nesta simulação…" quando
algum slider sair do default; (b) o número da frase tem de ser o `pL2dia` que o desenho mostra (82),
ou a frase ganha a mesma micro-legenda de reconciliação do hero. **Precisa da assinatura do
data-scientist antes de fechar.**

### MAJOR

**[MAJOR] `home-390-hero.png` (dobra inteira, 0–844) — critérios 2, 5, 12 —**
Na primeira dobra a 390 **não existe uma única palavra de dúvida**. Estão lá: wordmark, tagline,
"faltam 82 dias", a manchete serif "Lula é eleito em 83 e Flávio em 17", a linha "o mesmo que dizer
83% de (chance ?)…", o enxame e o começo da micro-legenda. "Isto não é previsão" cai em **y≈1 055**
(211 px abaixo da dobra) e "ainda pode mudar" em **y≈1 185**. `DESIGN-V2` §5.1 manda os seis
elementos — incluindo o parágrafo de procedência — no **primeiro scroll de 390 px, sem exceção**, e
H4 diz que "não é previsão" não é responsivo-opcional. A causa é medível: a micro-legenda do enxame
ocupa **11 linhas / ~330 px** (110 palavras contra o teto de 55 do `traduzindo`, VOZ §7).
**Ação:** cortar a micro-legenda para 2–3 frases (a reconciliação 83/82 pode virar uma linha só) e
subir o parágrafo de procedência para dentro dos 844 px.

**[MAJOR] `home-390-hero.png` (y 415–545) · `home-768-hero.png` · `home-1440-hero.png` — critérios 2, 3 —**
O enxame não traz **nenhum número junto ao desenho**. O único texto no gráfico é "empate" e as duas
pontas ("← Flávio na frente" / "Lula na frente →"). O "82" e o "18" só aparecem na prosa abaixo — que
a 390 está cortada pela dobra. P1 promete "frequência contável", mas contar 100 bolinhas de 8 px num
Android é ficção. **Ação:** ancorar "82" e "18" nas duas metades do desenho, no mesmo peso das
legendas de ponta.

**[MAJOR] `home-768-pesquisas.png` (tabela, y 840–1024) e `home-768-erro2022.png` (tabela, y 770–1024) — critérios 8, 9 —**
**Duas tabelas com rolagem horizontal a 768 px.** Na de pesquisas o cabeçalho da última coluna sai
como **"Registr / TSE"** e a célula como **"BR- / 07845/"** — o registro no TSE, que R4 e H12
chamam de sempre alcançável, está **cortado no meio da string**, com o degradê de scroll visível em
x≈707–742. Na de erros históricos a coluna "De quanto foi o erro" é cortada em x≈712. O critério 8
proíbe scroll horizontal acidental e §6.3 manda cartões abaixo de `md` — 768 **é** `md`, e é
exatamente onde a tabela não cabe. **Ação:** subir o breakpoint da tabela para `lg` (1140) ou reduzir
a tabela de 768 a 5 colunas, com o resto no bottom sheet "ver o registro completo".

**[MAJOR] `home-390-candidatos.png` (matriz, y≈12 470–12 900) e `home-768-candidatos.png` — critério 8 —**
A matriz candidato × instituto é uma **tabela de 10 colunas com rolagem horizontal a 390 px** — o
padrão que §6.3 bane com todas as letras ("nunca tabela com rolagem horizontal"). O 4º cabeçalho sai
cortado em "Data…" e a coluna "Média" fica fora da tela. Nota de craft junto: a abreviação intencional
foi aplicada só em "PoderD."; "Atlas" e "Data" são corte cego, o que §6.3 chama de defeito.
**Ação:** a 390 a matriz vira uma lista de cartões por candidato (nome + média + "ver por instituto"),
ou some — ela não é conteúdo de primeira linha.

**[MAJOR] `home-1440-candidatos.png` (y 7 518–7 974) · idem 768 e 390 — critérios 12, 11 —**
As nove barras estão **normalizadas pelo líder, não por 100**. Medido: trilho de 936 px (x 251→1187);
a barra de Lula (41,4 %) ocupa **936 px = 100 % do trilho**; a de Flávio (33,4 %) ocupa 756 px =
80,8 % — exatamente 33,4/41,4. Ou seja: **o líder sempre recebe uma barra cheia**, e um leitor de
baixa numeracia lê "41,4 %" como "tudo". É a mesma falha perceptual da barra 83/17 da v1, só que
disfarçada. E fere H9/R4: a régua muda conforme quem lidera. **Ação:** escala fixa 0–50 % (ou 0–100 %)
com marca de 50 %, igual para os nove.

**[MAJOR] `home-{390,768,1440}-erro2022.png` e a lista de fontes em `metodologia-390-full.png` (y≈5 100–5 400) — critério 9 —**
A tabela "Histórico de erros" e a lista de fontes são **cópia verbatim da v1, não traduzidas**, numa
superfície pública. Ocorrências contadas nos prints: **"p.p." ×8** ("direita subestimada em ~10 p.p.",
"acerto (erro ≈ 0–1 p.p.)", "margem inflada ~9 p.p. pró-esquerda", "erros de 0,4 a 6,2 p.p.",
"(4,7 e 8,7 p.p. na margem)", "Lula +5,2 p.p.", "Lula +1,8 p.p.", "Lula +14 p.p."), **"1ºT/2ºT" ×6**
("1ºT: empate triplo", "2ºT: Nunes", "erros de 13 a 23,5 pts no 1ºT/2022", "0,4 a 6,2 no 2ºT",
"2ºT/2022 e o 2ºT/2018", "2ºT-SP/2024"), **"Futura cravou"**, **"pró-esquerda"**, **"pts"**.
VOZ §5.1 bane "p.p." sem explicação, §5.2 bane "cravado (nos dois sentidos)", §8 proíbe "1T/2T" na
superfície pública e §4 proíbe enquadramento de torcida. Está encostado em blocos que fizeram o
trabalho certo ("4,7 pontos — cerca de 5 pessoas a mais em cada 100"), então o contraste é gritante.
**Ação:** rodar o checklist de VOZ §9 sobre `COPY-DECK` nas chaves de `erro2022` e `fontes`.

**[MAJOR] rodapé de `home-390-full.png` (y≈27 200–27 800), `historico-390-full.png` (y≈3 100–3 400) e `metodologia-390-full.png` (y≈7 300–7 600) — critério 9 —**
O bloco "Aviso:" é idêntico nas **três** páginas públicas e carrega cinco palavras banidas:
"**probabilidade**" (em negrito), "**premissas**", "**parâmetros**", "**rodadas**" e "**sliders**"
(esta última em inglês) — "Simulações feitas na página (adicionar ou remover pesquisas, mover os
sliders)". VOZ §5.1 dá as substitutas prontas ("régua", "o que você supõe", "as pesquisas").
Critério 9 diz "TODA superfície pública"; o rodapé é a superfície com 100 % de alcance.
**Ação:** traduzir o aviso uma vez e reaproveitar; a versão técnica já vive em `/metodologia`.

**[MAJOR] `home-1440-hero.png`, `home-1440-evolucao.png`, `home-1440-erro2022.png` e slices equivalentes — critérios 6, 3 —**
A 1440 o produto alterna, **dentro de cartões de 1000 px idênticos**, entre uma coluna de prosa de
~520 px e grades de largura cheia. Medida da faixa morta à direita (pixels de tinta, x 240–1200):

| bloco | tinta até | morto à direita |
| --- | --- | --- |
| hero (enxame + micro-legenda) | x 762 | **438 px = 46 %** |
| "E se as pesquisas errarem como em 2022?" | x 758 | **442 px = 46 %** |
| "Como a diferença mudou" (prosa) | x 764 | **436 px = 45 %** — e o gráfico logo abaixo vai até x 1165 |
| "Isso ainda pode virar?" | x 971 | 229 px = 24 % |
| "Lula está na frente" | x 1155 | 45 px = 5 % |

O resultado é uma página em L: metade dos blocos com um vazio de quase meia largura, metade cheios.
Não é "medida de leitura" — a medida de leitura seria uma decisão de layout consistente, e aqui o
mesmo cartão troca de medida entre o parágrafo e o gráfico. **Ação:** decidir uma coisa só — ou o
cartão encolhe para a medida de texto, ou o vazio recebe conteúdo (o enxame maior, a legenda,
o "o que olhar aqui").

**[MAJOR] `home-1440-simulacao.png` (mini-enxame, y 9 800–9 960 do full) — critérios 3, 13 —**
O mini-enxame **não escala em md+**: medido, 100 blobs de **8 px** a 1440, contra **20 px** do enxame
do hero na mesma página — 2,5× de diferença entre duas instâncias do elemento-assinatura, e ele ocupa
340 px dentro de um nicho de 936 px. §2.2 item 5 manda a bolinha crescer junto com o passo "sem teto"
e §4.2 existe justamente para "comparar maçã com maçã". A 390 os dois têm 8 px (correto); o defeito é
só de desktop. **Ação:** aplicar a mesma função de passo do hero ao mini-enxame.

**[MAJOR] `home-390-full.png` (y 20 450–20 900) e `home-1440-full.png` (y≈13 100–13 500) — critério 3 —**
A curva de sensibilidade é o único gráfico do produto com **colisões de rótulo**:
- a 390, as três anotações ("As pesquisas estão certas", "Igual a 2022", "Teste-limite: 6,3") ficam
  **empilhadas e centralizadas acima do gráfico**, desconectadas das três verticais que nomeiam —
  e duas dessas verticais são tracejados claros indistinguíveis da grade;
- "metade a metade" é atravessado pela vertical ameixa de x=0;
- "ponto de virada: perto de +4,7" **cruza por cima das duas curvas e de duas verticais tracejadas**
  (a palavra "virada" fica riscada por um tracejado);
- "onde você está" fica em cima da linha azul;
- o eixo x é `-2 0 2 4 6 8 10` **mudo** — P5 e §5.3 mandam nomear a referência em palavras, e o "0"
  significativo ("sem puxada") só é nomeado no amontoado de cima.

**Ação:** rótulo ancorado a cada vertical (no topo, alinhado ao x da linha, com filete de chamada) e
as duas anotações internas fora da área de plotagem.

**[MAJOR] `home-390-full.png` (27 841 px) contra `antes/home-390-full.png` (15 333 px) — critérios 9, 5 —**
A home a 390 tem hoje **27 841 px = 33 telas**, **+82 % sobre a v1**. Não é o preço da tradução: é
repetição verbatim. Amostras medidas nos prints:
- "Em 8 de cada 10 cenários, a diferença **medida nas pesquisas** fica entre −1,9 e +11,3 pontos"
  aparece **3×** (blocos "Quem está na frente?", "Isso ainda pode virar?" e "Divisão de votos mais
  provável");
- "Três coisas mudariam este quadro. Pesquisas novas trazendo a diferença para baixo de 2 pontos.
  Três institutos seguidos com Flávio na frente, fora da folga…" aparece **2×** quase idêntico
  ("Três coisas derrubariam este caminho…");
- "eleito em 69 de cada 100 cenários, por pouco" **3×** dentro do mesmo bloco de 2022;
- "Isto não é previsão" **4×** (hero, "Como este caminho foi escolhido", "Antes de sair", rodapé);
- "Eleições: 1º turno 04/10/2026 · 2º turno 25/10/2026" **2×** no mesmo rodapé.

VOZ §4 bane "explicar o óbvio duas vezes na mesma tela" e §7.2 do DESIGN diz que a página existe para
ser lida em 20 segundos. **Ação:** um passe de deduplicação com meta explícita (≤ 20 000 px a 390).

**[MAJOR] `home-390-full.png` (y 7 100–10 800) e a coluna de barra da tabela em `home-1440-candidatos.png` — critérios 3, 2 —**
A barra da folga (§4.3), que é a única razão pela qual "empate técnico" deixaria de ser badge de
texto, chega ilegível:
- **a 390** a barra mede **86–96 px** e vive espremida à direita do cartão (x 136→326), sem rótulo,
  sem eixo e sem a palavra "empate" ao lado da régua (medida: régua de tinta constante em x=194–195,
  2 px). O cartão continua carregando o badge de texto "empate técnico" — ou seja, a promessa do §4.3
  não foi cumprida: o empate continua sendo **lido**, não **visto**;
- **na tabela** (768 e 1440) a mesma barra vira uma coluna de ~35 px **sem cabeçalho**.

**Ação:** a 390, a barra ocupa a largura do cartão com a régua rotulada "empate" uma vez no topo da
lista; na tabela, cabeçalho próprio ("onde a folga cai") e largura mínima de 120 px.

### MINOR

**[MINOR] `home-390-full.png` (y≈8 900, 9 500, 10 100) — critério 9 —** três cartões de pesquisa
mostram **"1º turno –"**: um travessão mudo no lugar de "sem dado do 1º turno". Idem na tabela a
1440 (coluna "1º turno · Lula × Flávio", 4 linhas).

**[MINOR] `home-390-full.png` (y 7 200, 7 500…) e tabela a 1440 — critérios 13, 3 —** os selos de
estado usam **campo cheio**: "empate técnico" em `--color-atencao-fundo` e "Lula na frente" em
`--color-lula-fundo`. §3.1 diz que o âmbar-queimado é **tinta, nunca campo cheio**, e o chip de
glossário do mesmo termo ("empate técnico ?") é contorno + campo bruma. Dois tratamentos visuais
para a mesma palavra na mesma página.

**[MINOR] `home-390-evolucao.png` / `home-1440-evolucao.png` — critérios 3, 9 —** o gráfico de
evolução não marca **"hoje"**: a linha da média termina em corte seco (x≈755 a 390) e a borda da
faixa vira tracejada, mas não há rótulo nem tick de "hoje" — o eixo x a 390 traz só `10/01 · 09/06 ·
25/10`. Junto: os ticks do eixo y (`13 · 10 · 6 · 2 · −2`) têm passo irregular (3, 4, 4, 4) e
**nenhuma unidade** ("pontos").

**[MINOR] `home-390-evolucao.png` (legenda, y≈6 100) — critério 9 —** "Vermelho: Lula. Azul: Flávio.
Pontos: cada pesquisa. Linha: a média do painel." descreve **duas séries que o gráfico não tem** — o
gráfico é de diferença, com uma linha ameixa; vermelho e azul só codificam **quem está na frente
naquele ponto**. Um leigo procura a linha vermelha e não acha.

**[MINOR] `metodologia-{390,768,1440}-full.png` — critérios 6, 13 —** §5.7 manda `/metodologia` ser
prosa em coluna, "**zero cartão decorativo**". A página entregue é uma pilha de blocos-placa brancos
sobre bruma, igual à home. Junto: §5.7 exige "uma frase + um exemplo numérico concreto" por termo do
glossário — só **"ponto"** e **"chance"** têm exemplo; "empate técnico", "viés", "projeção",
"tendência", "peso da pesquisa" e "votos válidos" não têm.

**[MINOR] `home-390-full.png` (y≈15 100) → `metodologia-390-full.png` (topo) — critério 9 —**
"Ver a fórmula exata na metodologia" leva a uma página cuja aba padrão é **"Explicação simples"**,
onde não há fórmula nenhuma. O rótulo do link promete um destino que o destino não mostra sem um
segundo toque (VOZ §5.3: "rótulo tem de dizer o destino").

**[MINOR] `home-390-full.png` (y 30 e y≈26 250), `historico-390-full.png`, `metodologia-390-full.png` — critério 10 —**
O símbolo PONTEIRO aparece **duas vezes por tela**: no cabeçalho e como ornamento antes do `<h2>`
"Antes de sair, três coisas". `MARCA.md` §6.6.10: "Nunca como ornamento… O símbolo aparece uma vez
por tela."

**[MINOR] `home-390-full.png` (y≈17 300, 18 900, 22 900) — critérios 3, 7 —** três controles de
revelação ("De onde vieram os números de erro", "Como este caminho foi escolhido", "De onde saem
esses números") são texto ameixa em negrito **sem sublinhado, sem chevron, sem nada** — enquanto os
links reais da mesma página ("Ver a fonte deste número", "Ler a metodologia completa") são
sublinhados. Um controle que não parece controle.

**[MINOR] `home-390-full.png` (cartões de pesquisa) e `home-1440-candidatos.png` (tabela) — critérios 3, 7 —**
O "×" de remover pesquisa fica **~10 px abaixo da linha de base do nome do instituto** em todos os 13
cartões (medido em `PoderData` a 390: título centrado em y≈7 043, × em y≈7 053) e, na tabela, ocupa
uma coluna **sem cabeçalho**, com glifo de ~8 px. Alinhar ao título e dar rótulo acessível explícito
("remover PoderData da minha simulação").

**[MINOR] `home-1440-candidatos.png` (linha Datafolha 03/03) e `metodologia-390-full.png` (y≈5 000) — critério 9 —**
"registrada (**nº n/d** na fonte)" — "n/d" é abreviação de planilha. Substituir por "o número do
registro não está na publicação".

**[MINOR] rodapé de `home-390-full.png` (y≈27 100 e y≈27 800) — critério 9 —**
"Eleições: 1º turno 04/10/2026 · 2º turno 25/10/2026" aparece **duas vezes com 700 px de distância**,
uma fora e uma dentro do bloco "Aviso:".

**[MINOR] `home-390-full.png` (topo) e `historico`/`metodologia` — critério 3 —** o cabeçalho tem só
wordmark + tagline: **nenhuma navegação**. A 390 o leitor precisa rolar 27 841 px para achar
"Metodologia" e "O que já mudou". Existem links inline, mas não há saída visível da primeira dobra.

**[MINOR] `home-390-full.png` (y≈18 100) e `home-1440-full.png` (y≈14 700) — critérios 3, 12 —**
"De quanto pode ser a diferença no fim": quatro **pílulas separadas por folga** que deveriam somar
100 — a folga entre elas quebra a leitura de proporção. A régua do empate aparece ali **sem rótulo**,
e o segundo pedaço (o modal) recebe campo ameixa cheio enquanto o de Flávio fica lilás pálido: a
ênfase visual não é simétrica entre os desfechos.

### NIT

**[NIT] `home-{390,768,1440}-hero.png` — critério 13 —** a régua do empate mede **~2,5 px** em todos
os viewports (spec §4.1: 3 px) e **não engrossa em md+**: contra bolinhas de 20 px a 1440 ela vira
fio de cabelo, enquanto contra bolinhas de 8 px a 390 tem o peso certo.

**[NIT] `home-390-full.png` (y≈19 700 e y≈20 950) — critério 9 —** glifos decorativos "⚠" e "▶"
("▶ As pesquisas estão certas", "▶ aplicado ao painel"). VOZ §1.7 pede zero enfeite; o "▶" ainda lê
como botão de play.

**[NIT] `home-390-candidatos.png` (y≈12 250) — critério 3 —** na lista de candidatos o par
"`2,8%` · 7 pesquisas" quebra na **mesma linha do nome** para Romeu Zema e em linha própria para os
outros oito. Quebra irregular.

**[NIT] `home-390-full.png` (y≈11 500) — critério 6 —** o grupo de abas "Lula × Flávio" /
"Candidatos testados nas pesquisas (9)" fica desequilibrado a 390: a primeira pílula é curta e
alinhada à esquerda, a segunda quebra em duas linhas e domina o contêiner.

**[NIT] `home-390-evolucao.png` — critério 3 —** eixo x com só três datas, e a do meio é `09/06` —
uma data sem significado editorial. `26/03 · 09/06 · 23/08` aparecem a 768/1440; a 390 sobrou o
tick do meio.

**[NIT] `home-390-full.png` (y≈9 900, 11 800, 14 300) — critério 10 —** aspas angulares «…» herdadas
do protótipo («É o único em que votaria», «deriva», «correção») convivendo com as curvas “…” usadas
no resto da página.

### Não auditável nesta iteração

**Critério 4 (microinterações, 60 fps, entrada orquestrada) — declarado, não julgado.** Screenshots
estáticos não mostram stagger por coluna, duração, easing, interrupção nem `prefers-reduced-motion`.
Os prints só confirmam o estado assentado (correto). Para a iteração 2, capturar: (a) GIF/vídeo do
enxame entrando a 390, (b) um print com `prefers-reduced-motion: reduce` forçado (as 100 bolinhas
devem nascer assentadas), (c) trace de performance do arraste de slider. Sem isso o item 4 não pode
entrar em nenhum veredito de fechamento.

---

## Teste do leigo

**Persona:** homem de 47 anos, ensino fundamental incompleto, Android de entrada, dados contados.
**Material:** exclusivamente `home-390-hero.png` (os 844 px da primeira dobra). Nada de rolar.

### "Quem está na frente?"

> "O Lula. Tá escrito grandão ali em cima: *Lula é eleito em 83 e Flávio em 17*. E o desenho embaixo
> confirma — o monte de bolinha vermelha tá tudo do lado que diz **Lula na frente →**, e as azulzinha
> do Flávio são pouquinhas, lá no cantinho da esquerda."

**Respondida, em ~2 segundos, por dois canais independentes** (a frase serifada e a posição da massa
de bolinhas em relação à régua do "empate"). Onde achei: manchete em y≈185–300 e o enxame em
y 415–545, com as legendas de ponta em y≈547. **Item 2, pergunta 1: PASSA.**

### "É certeza?"

> "Pelo que tá escrito aqui, parece que sim. Diz *é eleito em 83*. Oitenta e três é quase tudo, né?
> Eu ia falar pra minha mulher que o Lula ganhou. Só se eu ficar olhando bem o desenho é que eu vejo
> que tem umas bolinha azul do outro lado — mas não tem nada escrito dizendo o que elas querem dizer."

**Não respondida pela tela.** Procurei e **não achei**: as palavras "não é certeza", "não é
garantia", "ainda pode mudar" e "não é previsão" **não existem nos 844 px**. "Isto não é previsão"
está em y≈1 055 e "Lula está na frente — provável, mas **ainda pode mudar**" em y≈1 185 — as duas
**fora da dobra**. O único indício visual é a existência das 18 bolinhas azuis, e a frase que as
explica ("82 caem do lado de Lula e 18 do lado de Flávio") está cortada no meio pelo fim da tela.
**Item 2, pergunta 2: FALHA — MAJOR** (ver o primeiro MAJOR da lista).

### "Isso pode mudar até a eleição?"

> "Aqui não fala nada de mudar. Fala *faltam 82 dias*, mas isso pra mim é só a data. Eu não sei se
> esse 83 é de hoje ou se é de outubro. Não tem nada explicando."

**Não respondida.** Procurei em "2º turno · 25 de outubro · faltam 82 dias" (y≈108): é um carimbo de
data, não uma cláusula de mudança — não diz que o número pode andar. A explicação existe
("o quanto a corrida ainda pode andar até outubro") mas está em y≈1 060+, e o próprio esclarecimento
de que o enxame mostra "**só a decisão de 25 de outubro**" começa em y≈635 e **termina depois da
dobra**. **Item 2, pergunta 3: FALHA — MAJOR.**

### "O que é margem de erro?"

> "Margem de erro? Não vi isso escrito em lugar nenhum. Tem uma bolinha amarela escrito *chance* com
> uma interrogação, e eu apertaria pra ver o que é. Mas margem de erro, folga, essas coisa — não tem."

**Não respondida, e nem sequer mencionada.** Confirmado no print: o **único** chip de glossário na
dobra é "chance ?" (y≈335). "folga da medida ?" aparece pela primeira vez em y≈6 500 (oitava tela) e
"empate técnico ?" em y≈6 200. A palavra "empate" está no desenho (y≈425), mas nomeando a régua, não
a folga — e nada na dobra diz que a **largura** do enxame é a dúvida. VOZ §5.4 lista "margem de erro"
como termo obrigatório de glossário; ele simplesmente não alcança o leitor que só vê a primeira tela.
**Item 2, pergunta 4: FALHA — MAJOR.**

### Conclusão do teste do leigo

**1 de 4 respondida.** A dobra a 390 acerta em cheio o que o produto queria evitar: entrega o
placar com clareza exemplar e **não entrega a dúvida**. O desenho carrega a incerteza (a pilha
inteira É a incerteza, como o conceito prometia), mas **nenhuma palavra na tela ensina o leitor a
ler a pilha assim** — e é precisamente o leitor de baixa numeracia que não faz essa leitura sozinho.
A correção é barata e cabe em duas linhas dentro dos 844 px: os números 82/18 no desenho, e uma frase
curta de dúvida ("ainda pode mudar até 25 de outubro") entre a manchete e o enxame.

---

## Item 12 — honestidade estatística visual (para o data-scientist assinar)

**O que passou (verificado no pixel):**
- A forma vem antes da linha: o elemento-assinatura é a distribuição, não uma barra de placar.
  A barra 83/17 da v1 não existe mais em nenhum print.
- Faixa de incerteza **com borda obrigatória**: `--color-faixa-borda` `#756580` presente e medido no
  gráfico de evolução (419 px da cor no recorte y 5 900–6 160 de `home-390-full.png`) — §4.3/§10.3
  cumpridos, "faixa sem borda é defeito" não ocorreu.
- Régua do empate em tinta pura `#211c26`, **constante e no vão entre colunas**, nos três enxames e
  nos 13 cartões de pesquisa (x=194–195 fixo a 390, inclusive nos cartões cuja barra não a cruza).
- O escrito bate com o desenhado no hero (82/18 desenhado, 83/17 escrito **com reconciliação
  explícita na mesma tela**) e no bloco "Isso ainda pode virar?" (18 escrito, 18 azuis desenhadas).
- Aritmética exposta e conferível: 75 + 8 = 83; 92 + 8 = 100; "as duas dúvidas não se somam".
- Nenhum eixo truncado, nenhuma escala que exagere diferença nos gráficos principais, nenhum
  count-up de número, nenhuma agulha animada, nenhuma sombra sugerindo profundidade falsa.
- "Empate técnico" com o **fator DOIS** por extenso em todas as ocorrências vistas (home e glossário).

**Violações a assinar:**
1. **BLOCKER (H3 + H7)** — "Nesta simulação, Lula é eleito em **83**" sobre um desenho de **82**, com
   as réguas no padrão. Escrito ≠ desenhado, e o estado oficial rotulado como simulação.
2. **MAJOR (percepção)** — barras dos 9 candidatos normalizadas pelo líder: 41,4 % desenhado como
   100 % do trilho. É a barra 83/17 da v1 voltando por outra porta.
3. **MAJOR (H2 + H4)** — a primeira dobra a 390 publica o favoritismo **sem nenhuma ressalva na
   mesma tela**. H4 é explícito: "a dúvida mora na mesma tela do número".
4. **MINOR** — a barra de faixas de diferença dá campo ameixa cheio ao desfecho modal e lilás pálido
   ao desfecho de Flávio: ênfase assimétrica entre resultados.
5. **MINOR** — os ticks do eixo y do gráfico de evolução são números nus, sem unidade; o leitor não
   sabe que "10" são pontos.

---

## Veredito

| severidade | quantidade |
| --- | --- |
| **BLOCKER** | **2** |
| **MAJOR** | **12** |
| **MINOR** | **13** |
| **NIT** | **6** |
| **total** | **33** |

**Item 1 (anti-regressão): PASSA.** Paleta, tipografia e motivo visual da v1 estão fora; o produto
não parece o mesmo produto. Nenhum BLOCKER automático por este item. A única sobrevivência da v1 é
o vetor de cores de candidato de `constantes.ts`, tratada como B1.

**O loop NÃO pode fechar nesta iteração.** Motivos, em ordem:

1. Há **2 BLOCKERs** — um de acessibilidade medida (2,92:1) somado a cores fora do sistema, outro de
   honestidade estatística (escrito ≠ desenhado, "simulação" no estado oficial).
2. O **teste do leigo respondeu 1 de 4 perguntas**. O critério 2 é o critério que decide se este
   produto existe para o público a que se destina, e ele está reprovado na primeira dobra.
3. O **critério 4 não é auditável** com o material desta iteração; entra como pendência de captura.
4. A regra de parada exige **duas iterações consecutivas limpas** mais o veredito a quatro mãos com o
   design-lead ("é outro produto, é bonito, e um leigo entende"). Esta é a iteração 1 e não é limpa:
   o contador de iterações limpas continua em **0**.

**Declaração anti-desperdício (obrigatória).** Nenhum item acima é melhoria fictícia. Cada um foi
verificado no pixel do print citado ou tem número medido junto (contraste calculado pela fórmula do
WCAG 2, diâmetro por rotulagem de blobs, contagem de bolinhas por componente conexo, largura de faixa
morta por varredura de tinta, contagem de ocorrências de termo banido). Os itens que eu **não**
consegui verificar estão declarados como não auditáveis, não inventados. Se a iteração 2 fechar os 2
BLOCKERs e os 12 MAJORs, é provável que a lista restante (MINOR/NIT) já não contenha nada que um
usuário real perceba — e nesse caso eu direi isso por escrito, que é o que o critério de parada pede.

**Próxima iteração — ordem sugerida de ataque:**
1. B2 e o primeiro MAJOR (dobra a 390) — são a mesma família e mudam o veredito do critério 2.
2. B1 (escala de 7 cores em OKLCH, publicada na §10).
3. Os dois MAJORs de tabela/scroll a 768 e 390 (R4 está em jogo).
4. Barras dos candidatos em escala fixa.
5. Passe de VOZ §9 sobre `erro2022`, `fontes` e o rodapé (os dois MAJORs de linguagem).
6. Layout a 1440 e o mini-enxame que não escala.
7. Deduplicação de texto com meta de altura.
8. Capturar o material de motion para o critério 4.
