# Crítica — ITERAÇÃO 2 do loop v2

**Autor:** qa-critic · **Base:** os 36 PNGs de `.qa/iter-v2-2/` + as 14 evidências de
`.qa/motion-evidencias/`, contra `.qa/iter-v2-1/critica.md`, `.qa/antes/`, `docs/DESIGN-V2.md`,
`docs/VOZ.md`, `docs/MARCA.md`.
**Gates automáticos** (139 unit + golden · 48 e2e com console limpo · axe zero · Lighthouse
96/100/100/100 · CLS 0): verdes, **não re-julgados aqui**.

Formato: `[SEVERIDADE] print — critério(nº) — descrição acionável com posição`.
Coordenadas em pixels do PNG citado (origem no topo esquerdo).

Regra que segui: **não aceitei nenhuma correção declarada sem medir**. Onde a medição do print
não bastava (alvo de toque, conteúdo dentro de disclosure fechado), fui ao código e digo isso
explicitamente. Onde suspeitei de defeito e a medição me desmentiu, **não filei o item** — três
suspeitas morreram assim e estão listadas no fim.

---

## Item 1 — ANTI-REGRESSÃO: **PASSA** (segunda vez, agora sem ressalva de pixel)

Varredura de paleta v1 nos 12 prints de página inteira, tolerância ≤6 na soma dos canais:

| cor da v1 | pixels encontrados |
| --- | --- |
| `#E8E8DF` papel · `#0E241A` tela · `#A7EFBB` fósforo · `#D8FBE2` · `#1E3A2C` · `#C6C6B8` | **0** |
| `#C4122F` lula-v1 · `#16418C` flavio-v1 · `#D96A1B` · `#1E7A46` | **0** |
| `#7C3AED` · `#0E7C86` · `#E8791D` · `#A16207` · `#0F766E` (os 5 hexes de candidato do B1) | **0** |

O único "acerto" é `#F6F6F0` com 94–1 256 px por página — pixels de antialiasing do `#f6f3f7`
(nicho) sobre branco, 0,005 % da área. Não é sobrevivência de paleta.

**A ressalva B1 da iteração 1 caiu no pixel.** Continua no dado morto (ver NIT 4).

---

## Itens

### BLOCKER

**Nenhum.**

### MAJOR

**[MAJOR] `home-{390,768,1440}-full.png`, bloco "Por que a disputa está assim?" (a 390, y 9 700–11 300) — critério 9 —**
Seis cartões cuja nota em corpo micro é **cópia crua do protótipo**. O arquivo assume:
`src/data/contexto.ts`, linha 2 — *"extraído do protótipo, textos preservados"*. Os **títulos**
foram traduzidos ("Rejeição e teto de voto" virou "Quanta gente diz que não votaria de jeito
nenhum"); as **notas** não. Termos lidos nos prints:

- "o 1º **saldo positivo** de Lula desde dez/2024 — consistente com a leve melhora do presidente
  na **série de intenção de voto**"; "historicamente indica **incumbente competitivo**, não dominante";
- "Rejeição mútua altíssima **comprime os tetos**"; "**Pelo dado de potencial**, o **teto** de Flávio…
  é o **nº** que a campanha do PL precisa mover" (`nº` abreviado);
- "tende a **oscilar** pouco — por isso a **série** de 2026 se move em **décimos**, não em saltos";
- "É o **fundamento matemático** da 'deriva' do modelo";
- "Dois **choques exógenos** com efeito eleitoral ainda incerto"; "o tarifaço virou **disputa de
  narrativa** econômica e nacional".

É **o mesmo defeito** que a iteração 1 apontou em `erro2022`/`fontes` — lá foi corrigido com
`copia-erros.ts`, aqui passou intacto, e agora é o único bolsão de jargão da home. Agrava: o campo
`dado` do primeiro cartão sai como **"48%×47% (Quaest) · 46%×50% (RTBD) · 47,6%×51,2% (Atlas) ·
42%×51% (PoderData)"** sob o título "Quanta gente aprova o governo" — aqui o `×` quer dizer
*aprova × desaprova*, mas em **toda** a página `×` quer dizer *Lula × Flávio*; e "RTBD" é sigla
que não é explicada em lugar nenhum.
**Ação:** rodar o checklist de VOZ §9 sobre `contexto.ts` e escrever o primeiro `dado` por extenso
("48 em cada 100 aprovam e 47 desaprovam, na Quaest").

**[MAJOR] rodapé de `home-390-full.png` (y 22 750–23 732), `historico-390-full.png` (y 1 947–3 446) e `metodologia-390-full.png` (y 6 320–7 870) — critério 9 —**
"Antes de sair, três coisas" e o bloco "Aviso:" **dizem a mesma coisa duas vezes, na mesma tela,
nas três páginas públicas**. Três dos quatro parágrafos são quase palavra por palavra:

| "Antes de sair" | "Aviso:", ~350–550 px abaixo |
| --- | --- |
| "…em quantas eleições parecidas com esta cada candidato termina eleito. **Chance alta não é garantia, e chance baixa não é impossibilidade — um resultado de 20 em 100 acontece uma vez a cada cinco disputas parecidas.**" | "…em quantas eleições parecidas com esta cada candidato termina eleito, dadas as suposições… **Chance alta não é garantia, e chance baixa não é impossibilidade — um resultado de 20 em 100 acontece uma vez a cada cinco disputas parecidas.**" |
| "Os números não são nossos. Cada pesquisa é de um instituto, tem registro na Justiça Eleitoral e link para a publicação original." | "Os números pertencem aos respectivos institutos e estão registrados no TSE…; os links levam sempre à publicação original." |
| "A lista só cresce com gente conferindo. Pesquisa encontrada automaticamente fica esperando aprovação de uma pessoa…" | "A lista só cresce por decisão humana: as pesquisas encontradas automaticamente entram como pendentes e uma pessoa precisa aprová-las…" |

40 palavras verbatim no primeiro par. Em `/historico` esse rodapé compartilhado ocupa
**1 499 px de 3 446 = 43,5 % da página**. VOZ §4 bane explicar o óbvio duas vezes na mesma tela.
Isto é o que sobrou do MAJOR de altura: a home a 390 caiu de **27 841 → 23 732 px** (−14,8 %,
28 telas), mas a meta declarada de ≤ 20 000 ficou **3 732 px** atrás, e este bloco é o maior naco
de repetição restante, multiplicado por três páginas.
**Ação:** o "Aviso:" fica com o que é jurídico (vínculo, propriedade dos números, escopo da
simulação) e o "Antes de sair" com o editorial — sem sobreposição.

**[MAJOR] `metodologia-1440-full.png` (página inteira) — critérios 6, 3 —**
O passe de layout de 1440 tratou a home e **não tocou nesta página**. Varredura de tinta por bloco
(colunas 220–1225, cartão de 1 005 px):

| bloco | altura | tinta até x | morto à direita |
| --- | --- | --- | --- |
| "De onde vêm os números desta página?" | 235 | 768 | **457 px = 45 %** |
| "Como você quer ler esta página?" | 126 | 723 | **502 px = 50 %** |
| "Média, pesos e as duas chances" | 204 | 759 | **466 px = 46 %** |
| "Como a tendência é calculada" | 204 | 758 | **467 px = 46 %** |
| "Classificação dos cenários" | 201 | 758 | **467 px = 46 %** |
| "Limitações que você deve conhecer" | 142 | 755 | **470 px = 47 %** |
| **glossário + lista das 13** | **2 390** | 760 | **465 px = 46 %** |
| "As 13 pesquisas que alimentam o painel" | 738 | 864 | 361 px = 36 % |

Dez de treze blocos com quase metade do cartão vazia, incluindo um de 2 390 px. E §5.7 é
explícito: `/metodologia` é **prosa em coluna, "zero cartão decorativo"** — a página entregue
continua sendo pilha de placas brancas sobre bruma, exatamente como a home. Os dois defeitos são
o mesmo defeito: a placa de 1 000 px não tem função aqui, e é ela que fabrica os 46 %.
**Ação:** tirar a placa em `/metodologia` (prosa direto sobre a bruma, medida de leitura fixa) —
resolve o §5.7 e a faixa morta de uma vez.

**[MAJOR] `home-390-hero.png` (dobra inteira, 0–844) — critério 2, pergunta 4 —**
"O que é margem de erro?" **continua sem resposta na dobra** — e, diferente da iteração 1, agora
é a *única* das quatro que falha. Conferido no pixel: o único chip de glossário nos 844 px é
**"chance ?"** (y 370–400). As palavras "margem de erro", "folga", "folga da medida" **não
existem** na dobra. Pior: elas quase não existem na home inteira — o chip da home é rotulado
**"folga da medida"** (primeira ocorrência y ≈ 6 540, oitava tela), e a expressão "margem de erro"
só aparece (a) dentro do painel fechado "Como ler esta página" e (b) no glossário de
`/metodologia`. Um leitor que chega com "margem de erro" na cabeça — que é como a TV fala — não
tem onde encostar o termo.
E há um buraco conceitual junto: a micro-legenda explica **o que é cada bolinha** ("um resultado
possível"), mas **nunca diz que a largura da pilha é a dúvida**. O desenho carrega a incerteza; o
texto ensina a contar os lados, não a ler a forma.
**Ação:** uma cláusula na micro-legenda, dentro do orçamento de 55 palavras — "quanto mais
espalhadas, menos se sabe (é a margem de erro)". Custa ~9 palavras e fecha o critério 2.

### MINOR

**[MINOR] `home-390-hero.png` (y 839–844) e `home-390-full.png` — critérios 5, 2 —**
O parágrafo de procedência **começa em y = 839 e a dobra corta em 844**: sobram 5 px de
ascendentes de "Isto não é previsão. É o que as 13". Varredura de tinta: micro-legenda termina em
y 791, branco de 792 a 838, primeira linha do parágrafo em 839–853. §5.1 lista os seis elementos
"no primeiro scroll… **sem exceção**" e H4 diz que "NÃO É PREVISÃO" **nunca é responsivo-opcional**.
Faltam 15 px de folga vertical — em telefone real, com a barra do Chrome, faltam ~110.
**Ação:** apertar o respiro entre o cartão do enxame e o parágrafo, ou subir o parágrafo para
dentro do cartão.

**[MINOR] `home-1440-candidatos.png` (y 6 833–6 842) e `home-390-candidatos.png` (y 9 057) — critérios 3, 12 —**
Na régua nova de 0–50 %, **o rótulo "25 %" não fica sobre a marca que nomeia**. Medido a 1440:
trilho x 253→1 188 (935 px), marca do meio desenhada em **x 719–720**, rótulo "25%" em
x 663–688, **centro 675,5 — 44 px à esquerda**, ou seja sobre ~22,4 % da escala. A 390: trilho
36→354, marca em 195, rótulo centrado em **153 — 42 px à esquerda**, sobre ~18,5 %. A causa é
óbvia no desenho: os três rótulos são um `space-between` de três itens ("0", "25%", "50% dos
votos"), então o do meio se centra no vão entre os outros dois, não no tique. As pontas estão
certas (o "0" começa em 253/36, o "50% dos votos" termina em 1 186/354). É o único número mentiroso
da régua que acabou de ser criada para não mentir.
**Ação:** posicionar o rótulo por `left: 50%` + `translateX(-50%)`, igual à marca.

**[MINOR] `home-390-full.png` (y 16 890–17 180), `home-768-full.png` (y 12 530–12 850) e `home-1440-full.png` (y 11 250–11 580) — critério 3 —**
A curva de sensibilidade fechou quatro dos cinco defeitos da iteração 1 (rótulos ancorados com
filete a cada vertical, verticais tracejadas escuras distintas da grade pontilhada, "metade a
metade" fora da área de tinta a 768/1440, eixo x nomeado em palavras). **Sobram duas colisões:**
1. **nos três viewports**, a vertical ameixa de x = 0 **atravessa o rótulo "As pesquisas | estão
   certas"**, passando exatamente entre as duas palavras. São dois rótulos para a mesma abscissa
   ("onde você está" e "As pesquisas estão certas") empilhados, e a linha é desenhada por cima do
   de baixo;
2. **só a 390**, "metade a metade" continua **por cima da curva azul** — a linha atravessa as
   letras "de" e "me" entre x ≈ 250 e 275.

**Ação:** empilhar os dois rótulos acima do topo da área de plotagem (a linha só sobe até o
primeiro), e a 390 jogar "metade a metade" para fora da plotagem.

**[MINOR] `home-1440-full.png` (enxames em y 455–616, 3 261–3 460 e 9 127–9 268) e `home-768-full.png` — critérios 6, 3, 13 —**
O mini-enxame subiu de 8 px para **14 px** a 1440 e 768 (≥12, cumprido). Mas a correção criou uma
inversão de hierarquia: rotulagem de blobs na mesma página a 1440 dá **hero = 16 px**,
**"Isso ainda pode virar?" = 20 px**, **mini da simulação = 14 px**. O elemento-assinatura é
**25 % menor no hero** do que numa seção do meio da página — e §5.1/critério 6 querem que o hero
domine. Junto: o hero a **768 tem bolinha de 18 px** e a **1440 tem 16 px** — a bolinha **encolhe
quando o viewport cresce**, porque a 1440 o hero virou duas colunas e o enxame perdeu largura,
enquanto §2.2 item 5 manda o passo crescer "sem teto".
**Ação:** dar ao enxame do hero a largura cheia do cartão a 1440 (a micro-legenda pode ir abaixo,
como a 768) ou aplicar um piso: nenhuma instância maior que a do hero.

**[MINOR] `home-768-pesquisas.png` (y ~852–872 contra y 995–1 024) — critérios 3, 13 —**
A régua rotulada da lista de pesquisas — o elemento criado nesta iteração para cumprir §4.3 —
**aponta para o vão entre as colunas a 768**. Medido: os cartões estão em `md:grid-cols-2` e as
réguas de tinta dos cartões caem em **x 216–217** (coluna 1) e **x 550–551** (coluna 2); a palavra
"empate" da legenda está centrada em **x 383,5** — 167 px de cada uma, em cima de nada. A 390
(uma coluna) está perfeita: régua em 194–195, "empate" em 194,5. O próprio componente documenta o
invariante que quebra aqui (`barra-pesquisa.tsx`: *"o 'empate' do rótulo cai no mesmo x da régua
de tinta de todas as linhas"*) — verdadeiro em uma coluna, falso em duas.
**Ação:** uma régua por coluna do grid, ou manter a régua só no layout de coluna única.

**[MINOR] `home-{390,768,1440}-pesquisas` — ilustração `explicando-empate.svg` — critérios 3, 12, 13 —**
As quatro cápsulas que ilustram "quando a barra cruza a régua do empate" **não têm legenda de que
são exemplo** e ficam encostadas no texto que descreve pesquisas reais. Três problemas somados:
1. a frase imediatamente acima é *"3 das 7 pesquisas dos últimos 35 dias estão em empate técnico;
   nas outras **4**, Lula aparece na frente"* — e logo abaixo aparecem **exatamente 4 cápsulas**,
   das quais **uma está inteiramente do lado de Flávio**. O acoplamento é falso e visível;
2. o painel tem **13** pesquisas e **1** com Flávio à frente (Gerp); a ilustração sugere 1 em 4;
3. as cápsulas da ilustração têm contorno `#756580` (`faixa-borda`) — as barras reais dos cartões
   são `bg-faixa` **sem contorno** (o componente diz "raio pleno, sem contorno"). O desenho que
   ensina a ler a barra não usa a linguagem da barra.

**Ação:** uma linha de legenda ("exemplo: quatro pesquisas imaginárias") e tirar o contorno das
cápsulas.

**[MINOR] `home-768-cenario-base.png` e `home-768-full.png` (y 13 600–14 450) — critérios 3, 6 —**
No bloco "E se o erro de 2022 se repetisse do mesmo tamanho?" a grade de três colunas fica
severamente desequilibrada a 768: as colunas 1 e 2 terminam em y ≈ 245 e 145 do bloco, a coluna 3
em y ≈ 620 — **~450 px de branco** sob duas das três colunas. E o botão primário da seção,
**"Aplicar esta hipótese ao painel (puxada de 3,1)"**, espremido numa coluna de ~180 px, **quebra
em quatro linhas** e vira uma pílula de ~110 px de altura. A 390 (uma coluna) e a 1440 o mesmo
botão cabe em duas linhas.
**Ação:** a 768 empilhar os três cartões em uma coluna, ou passar o botão para fora da grade.

**[MINOR] `home-1440-full.png` (y 1 280–1 442 e y 9 415–9 864) — critério 6 —**
Resíduo do MAJOR de faixa morta: a home a 1440 melhorou muito (hero, evolução e erro-2022 viraram
duas colunas de verdade; a maioria dos blocos hoje fica abaixo de 7 % de vazio à direita), mas
**dois cartões de largura cheia ainda carregam a coluna de prosa em metade da placa**:
"Chance não é resultado…" (tinta até x 750 de 1 225 = **47 % morto**) e "As contas, em uma linha
cada" (tinta até x 901 = **32 % morto**). São placas brancas de 1 000 px com metade branca dentro.
**Ação:** ou o cartão encolhe para a medida de texto, ou o vazio recebe o conteúdo que já existe
por perto.

**[MINOR] `metodologia-{390,768,1440}-full.png`, verbete "quantas pessoas foram ouvidas" — critério 9 —**
§5.7 exige "uma frase + um exemplo numérico concreto" por termo do glossário. Onze dos doze
verbetes ganharam "Exemplo:" com número nesta iteração (conferido um a um nos prints: margem de
erro, 2º turno, votos válidos, tendência, viés, empate técnico, projeção, peso da pesquisa, ponto,
chance, registro no TSE). **"quantas pessoas foram ouvidas" ficou sem** — só "Quanto mais gente
ouvida, menor a folga da medida — mas ouvir mais gente não conserta erro de método."
**Ação:** "Exemplo: 2 000 pessoas dão folga de ~2 pontos; 5 000 dão ~1,4."

### NIT

**[NIT] `home-390-full.png` (y 13 264–13 400) — critério 3 —** os rótulos de ponta do mini-enxame
quebram e deixam órfãos: "← Flávio na frente ·" numa linha e **"18"** sozinho na seguinte;
"82 · Lula na frente" numa e **"→"** sozinho na seguinte. O número que a iteração 1 pediu para
ancorar no desenho fica pendurado embaixo do meio do rótulo, e a seta perde o referente. No hero
(cartão mais largo) cabe em uma linha.

**[NIT] `home-{390,768,1440}` enxames — critério 13 —** a régua do empate passou a engrossar com o
viewport (medido: **2 px a 390 · 3 px a 768 · 4 px a 1440**), o que resolve o NIT anterior. Resta
que a 390 ela é **2 px contra os 3 px da spec §4.1**.

**[NIT] `home-390-candidatos.png` (y 9 060–9 400) — critério 6 —** a quebra irregular do par
nome/partido mudou de linha, não de natureza: **sete dos nove** empurram o partido para a segunda
linha ("(Missão)", "(PSD)", "(Avante)", "(UP)", "(DC)", "(Mobiliza)", "(PL)") e **dois mantêm
inline** ("Lula (PT)", "Romeu Zema (Novo)"). O ritmo da lista continua irregular.

**[NIT] `src/data/constantes.ts` e `src/lib/modelo/derivados.ts` — critérios 13, 1 —** a paleta v1
inteira continua no dado (`#E8E8DF`, `#0E241A`, `#A7EFBB`, `#C4122F`, `#16418C` e os cinco hexes
de candidato do B1), e `derivados.ts:210-213` ainda escreve `cor: CORES.flavio`, `CORES.lula`,
`"#D96A7A"`, `"#E8A4AE"` nas bandas do cenário-base. **Nada disso chega ao pixel** — medido: zero
ocorrências nos 12 prints, e `cenario-base.tsx` ignora o campo `cor` (barra monocromática no lilás).
Registro só como risco de reentrada: o campo morto é o caminho por onde a v1 volta.

**[NIT] `home-390-full.png` (y 9 780) — critério 9 —** "Potencial de voto (Quaest **jul**)" e
"(PoderData, **jul**)" — abreviação de mês numa superfície pública. Junto do MAJOR de
`contexto.ts`.

### Critério 4 (microinterações) — **AGORA AUDITADO**

Com `.qa/motion-evidencias/` o item 4 saiu da lista de não-auditáveis. O que verifiquei:

- **Entrada orquestrada com stagger por coluna: confirmado.** Os 8 quadros (2 → 492 ms da
  animação) mostram as colunas assentando da esquerda para a direita, com a frente de queda em
  opacidade parcial acima das já assentadas. Diferença de pixels entre quadros consecutivos:
  478 → 1 657 → 3 766 → 8 500 → 8 326 → 4 574 → 528. **A curva tem forma** (acelera, satura,
  desacelera) e o quadro 8 ainda difere do 6 em 4 581 px — ou seja, não é uma sequência
  encenada com o estado final repetido. Blobs carmim sólidos por quadro: 40 → 40 → 40 → 40 → 585
  → 2 115 → 4 247 → 4 496.
- **`prefers-reduced-motion`: confirmado por dois caminhos.** As medições declaradas
  (`animation-name: none`, `opacity: 1`, `transform: none`, `--dur-entrada: 0s`,
  `--desloc-entrada: 0rem`, `--stagger-passo: 0s`, 100 bolinhas) batem com o print: diferença de
  **456 px em 329 160** contra `home-390-hero.png`, toda ela dentro das linhas 498–574 (jitter
  subpixel dos discos). As bolinhas nascem assentadas.
- **Arraste do deslizador: confirmado, e ele prova o B2.** Quadro 1 (padrão): "**Com as réguas no
  padrão, este é o número oficial do painel:** Lula é eleito em 83… e Flávio em 17". Quadro 2
  (botão ainda pressionado): "**Nesta simulação**, Lula é eleito em **48**… e Flávio em **52**.
  **No painel oficial são 83 e 17**" — número, enxame e rótulo recalculam durante o arraste.
  Quadro 3 (depois de soltar): o estado de simulação persiste.
- **Celebração: pulso medido, e ele não é o único canal.** Largura do título "Igual a 2022":
  119,98 → 123,49 → 123,6 px = **fator 1,030**, batendo com o `scale(1.03)` declarado. E os
  quadros mostram que o pulso vem acompanhado de **mudança de fundo (nicho → lilás) e do rótulo
  "aplicado ao painel"** — ou seja, o feedback não depende de movimento, que é o comportamento
  certo sob reduced-motion.
- **Propósito, sem gratuidade: passa.** Não há count-up de número, agulha animada, parallax nem
  transição decorativa em nenhum quadro.

**O que NÃO consigo auditar e continua declarado, não julgado:** **60 fps**. O pedido da iteração 1
era "trace de performance do arraste"; o que veio foram três quadros estáticos. Quadros não medem
taxa de quadros nem long tasks. Para fechar o critério 4 falta um trace (ou um `requestAnimationFrame`
log) do arraste com as 100 bolinhas recalculando.

**Duas observações de motion que NÃO viram item** (nenhuma é perceptível como defeito): os rótulos
"18"/"82" e a régua "empate" aparecem em opacidade cheia no quadro 1, sobre a área vazia — é o
andaime SSR, e é o que garante CLS 0; e a ordem de revelação é sempre esquerda→direita, o que
entrega a massa do líder por último — editorialmente neutro.

### Não auditável nesta iteração (declarado, não julgado)

- **Conteúdo dentro dos disclosures fechados.** Os prints capturam a página com todos os
  `<Detalhe>` fechados. Li o conteúdo **no código** (`cenario-base.tsx`, `erro-2022.tsx`,
  `replay-2022.tsx`) e ele está traduzido e correto — mas isso é leitura de fonte, não de pixel.
  Para a iteração 3: uma segunda leva de prints com todos os disclosures abertos.
- **Critério 10 parcial:** favicon e OG não aparecem em screenshot de página.
- **Deep-link "Ver a fórmula exata na explicação técnica da metodologia":** o rótulo agora nomeia
  o destino (a correção pedida), mas se o link abre a aba técnica não dá para ver num print da
  página em estado padrão.

---

## Teste do leigo — refeito por inteiro

**Persona:** homem de 47 anos, ensino fundamental incompleto, Android de entrada, dados contados.
**Material:** exclusivamente `home-390-hero.png` — os 844 px da primeira dobra. Nada de rolar.

**O que está nos 844 px, medido:** wordmark + tagline (y 20–72) · navegação "O que já mudou ·
Metodologia" (y 98–112) · "2º turno · 25 de outubro · faltam 82 dias" (y 150–162) · "Presidente
2026 · Lula (PT) × Flávio Bolsonaro (PL)" (y 175–212) · manchete serif (y 232–345) · "o mesmo que
dizer 83% de `chance ?`…" (y 370–418) · enxame com "empate" e as pontas "← Flávio na frente · **18**"
/ "**82** · Lula na frente →" (y 468–600) · micro-legenda de **55 palavras** (y 620–791) · e os
5 px de ascendentes do parágrafo de procedência (y 839–844).

### "Quem está na frente?"

> "O Lula. Tá escrito lá em cima, grandão: *Em 100 eleições parecidas com esta, Lula é eleito em
> **83** e Flávio em **17***. E embaixo, no desenho, o montão de bolinha vermelha tá do lado que
> diz **82 · Lula na frente →**, e as azulzinha do Flávio são **18**, ali no cantinho."

**Respondida em ~2 s por três canais**: a frase, a posição da massa em relação à régua do
"empate", e agora **o número escrito ao lado do desenho**. Os "82" e "18" ancorados nas pontas
(y ≈ 590) são a correção da iteração 1 e funcionam. **PASSA.**

### "É certeza?"

> "Não, não é. Ele fala *em 100 eleições parecidas* — quer dizer que tem 100 jeito da coisa
> acabar, e em **17** deles quem ganha é o outro. E aqui embaixo tá escrito com letra grossa:
> *nenhuma é o resultado — **até outubro isso ainda pode mudar***. Então é o mais provável, não é
> o certo."

**Respondida.** Foi o que mudou de verdade: o enquadramento "Em 100 eleições parecidas com esta"
transforma o 83 em frequência em vez de placar, o 17 tem o mesmo peso tipográfico do 83, e a
negação está em **negrito dentro da dobra**. **PASSA — era FALHA/MAJOR na iteração 1.**

### "Isso pode mudar até a eleição?"

> "Pode. Tá escrito com letra preta forte: ***até outubro isso ainda pode mudar***. E fala também
> que esse desenho aqui é *só a decisão de 25 de outubro*."

**Respondida.** A frase "até outubro isso ainda pode mudar" está em **y 649–690** — 154 px acima
do corte da dobra, em negrito, e é a única coisa em negrito dentro do cartão do enxame, então o
olho vai nela. **PASSA — era FALHA/MAJOR na iteração 1.**

### "O que é margem de erro?"

> "Margem de erro… não vi isso escrito não. Tem uma bolinha amarela escrito *chance* com
> interrogação, e eu apertaria. Mas margem de erro, folga, essas coisa que falam na televisão —
> não tem nessa tela. Eu entendi que tem 17 chance do outro ganhar, mas não sei se isso é a tal da
> margem de erro."

**Não respondida.** Confirmado no print: único chip da dobra é "chance ?" (y 370–400); "folga da
medida ?" só aparece em y ≈ 6 540 (oitava tela), e a expressão **"margem de erro" não é impressa
em nenhum lugar visível da home** — o chip foi rebatizado "folga da medida" e o termo original
mora no glossário de `/metodologia` e dentro do painel fechado "Como ler esta página". Some-se a
isso que a micro-legenda explica **o que é uma bolinha** mas nunca diz que **a largura da pilha é
a dúvida**. **FALHA — MAJOR** (o quarto MAJOR da lista).

### Conclusão do teste do leigo

**3 de 4 respondidas** (era **1 de 4**). A dobra deixou de entregar o placar sem a dúvida: a
dúvida agora chega junto, com a palavra certa, em negrito, acima do corte. O que falta é
vocabulário — uma cláusula de nove palavras dizendo que o espalhamento é a margem de erro fecha o
critério 2 inteiro.

---

## Item 12 — honestidade estatística visual (para o data-scientist assinar)

**Verificado no pixel, com número:**

- **Escrito = desenhado em todas as instâncias.** Contagem por componente conexo nos sete
  enxames dos três viewports: **82 carmim + 18 naval = 100**, sem exceção (390 hero/virar/mini,
  768 hero/mini, 1440 hero/virar/mini). E os dois lugares onde 83/17 convive com 82/18 têm a
  reconciliação escrita **na mesma tela**: no hero ("Em 8 de cada 100 cenários não há 2º turno;
  esses entram na frase de cima, que dá 83 e 17") e no cartão da simulação ("A frase acima soma
  também quem ganha já em 4 de outubro — por isso dá outro número").
- **O B2 está fechado dos dois lados.** O rótulo padrão é "Com as réguas no padrão, este é o
  número oficial do painel"; o `slider-trace.png` mostra ele virar "Nesta simulação… No painel
  oficial são 83 e 17" durante e depois do arraste. R5 e H7 desinvertidos.
- **Régua fixa nas nove barras.** Medido: trilho de 931 px, Lula 771 px (41,4/50 ✔), Flávio
  623 px (33,4/50 ✔), Renan 86 px (4,7/50 ✔). O líder **não** recebe mais barra cheia, e a legenda
  diz a régua em palavras. A falha perceptual da barra 83/17 da v1 não voltou por esta porta.
- **Faixas de diferença proporcionais e simétricas.** Medido no PNG: 55 / 108 / 103 / 48 px de um
  trilho de 318 px, contra 18 / 34 / 33 / 15 declarados — erro máximo de 2 px. Separadores de 1 px
  (a folga que quebrava a leitura de proporção sumiu), todos os pedaços no mesmo lilás, e o modal
  marcado só com contorno em vez de campo ameixa cheio: **a ênfase assimétrica entre desfechos
  acabou**.
- **Faixa de incerteza com borda, eixo com unidade, "hoje" nomeado.** O gráfico de evolução ganhou
  a vertical "hoje", o tracejado depois dela com a explicação do que é projeção, o eixo y com passo
  regular de 2 (12·10·8·6·4·2·0·−2) e a unidade escrita ("a altura é a diferença, em pontos").
- Nenhum eixo truncado, nenhum count-up, nenhuma sombra de profundidade falsa, nenhum "empate
  técnico" sem o fator DOIS por extenso.

**A assinar (nada bloqueante):**

1. **MINOR** — o rótulo "25 %" da régua nova cai 42–44 px à esquerda da marca de 25 %.
2. **MINOR** — a ilustração de quatro barras, sem legenda de exemplo, sugere 1 em 4 pesquisas com
   Flávio à frente onde o painel tem 1 em 13, e cola numa frase que fala em "outras 4".
3. **MAJOR (crit. 2)** — a dobra ensina a contar os lados da pilha, não a ler a largura dela como
   dúvida.

---

## Veredito

| severidade | iteração 1 | **iteração 2** |
| --- | --- | --- |
| **BLOCKER** | 2 | **0** |
| **MAJOR** | 12 | **4** |
| **MINOR** | 13 | **8** |
| **NIT** | 6 | **5** |
| **total** | 33 | **17** |

**Item 1 (anti-regressão): PASSA**, agora sem ressalva de pixel.
**Critério 2 (teste do leigo): 3 de 4** (era 1 de 4).
**Critério 4: auditado pela primeira vez** — passa em stagger, reduced-motion, propósito e
amplitude; **60 fps continua sem evidência**.

### Estado dos 33 itens da iteração 1

**Corrigidos e verificados no pixel: 27.** **Parcialmente corrigidos / mal corrigidos: 5.**
**Regrediram: 0.** **Não corrigidos: 1.**

| # | item da iteração 1 | estado |
| --- | --- | --- |
| B1 | 7 cores de candidato cruas, Zema 2,92:1, verde, roxo da marca | **corrigido** — tokens `--color-cand-1..7`; medidos `#413225 #434244 #584b5d #6b5b4d #6e6c6e #84768a #998779`; pior contraste contra o fundo real (nicho) **3,13:1** ✔; nenhuma matiz em 120–200°; croma ≤0,034 contra 0,078 da ameixa; zero px dos hexes antigos |
| B2 | "Nesta simulação" no oficial + 83 sobre 82 sem reconciliação | **corrigido**, com prova em `slider-trace.png` |
| M1 | dobra 390 sem palavra de dúvida | **corrigido no essencial** (55 palavras, "ainda pode mudar" em y 649–690) · **mal corrigido na letra**: procedência cortada por 5 px → novo MINOR |
| M2 | enxame sem números no desenho | **corrigido** ("18"/"82" nas pontas, 3 viewports) |
| M3 | duas tabelas com rolagem horizontal a 768 | **corrigido** — viraram cartões; varredura: **zero px de tinta além de x 755** em toda a home a 768 |
| M4 | matriz candidato×instituto com rolagem a 390 | **corrigido** — lista de cartões; a matriz só existe de 1440 pra cima e cabe |
| M5 | barras dos 9 normalizadas pelo líder | **corrigido** — régua fixa 0–50 %, medida |
| M6 | "p.p." ×8, "1ºT/2ºT" ×6, "cravou", "pró-esquerda" | **corrigido** — `copia-erros.ts`; "p.p." só sobra em `/design-lab` (não público) e no `unitText` do JSON-LD |
| M7 | rodapé com probabilidade/premissas/parâmetros/rodadas/sliders | **corrigido** — "chance", "suposições", "réguas" nos três rodapés |
| M8 | faixa morta à direita a 1440 (5 blocos a 45–46 %) | **corrigido na home** (restam 2 cartões a 32 % e 47 % → MINOR) · **não corrigido em `/metodologia`** (45–50 % em 10 de 13 blocos) → MAJOR |
| M9 | mini-enxame de 8 px a 1440 | **corrigido** (14 px) · **efeito colateral**: hero 16 px < virar 20 px na mesma página → MINOR |
| M10 | curva de sensibilidade com 5 colisões | **corrigido em 3 de 5** · restam a vertical sobre "As pesquisas estão certas" (3 viewports) e "metade a metade" sobre a curva azul (390) → MINOR |
| M11 | altura da home 27 841 px | **parcial** — 23 732 px (−14,8 %, 28 telas), meta ≤20 000 **não atingida** por 3 732 px; repetições verbatim caíram (faixa −1,9/+11,3 de 3× → 1×; "Isto não é previsão" 4× → 2×; linha de datas 2× → 1×) → o resíduo virou o MAJOR do rodapé |
| M12 | barra da folga ilegível a 390, coluna sem cabeçalho | **corrigido** (régua rotulada no topo da lista; coluna "Onde a folga cai" com cabeçalho e valor em texto) · **dois defeitos novos do próprio elemento** → 2 MINORs |
| m1 | "1º turno –" travessão mudo | **corrigido** ("não divulgado" + nota explicando o "–") |
| m2 | selos com campo cheio | **corrigido** — medido `#8f5407` sobre `#f6f3f7`, sem `#f8ecda` |
| m3 | evolução sem "hoje", ticks irregulares, sem unidade | **corrigido** (os três) |
| m4 | legenda descrevendo 2 séries inexistentes | **corrigido** |
| m5 | `/metodologia` com cartões e glossário sem exemplos | **metade** — 11 de 12 verbetes ganharam exemplo numérico; os cartões decorativos **continuam** (e a 1440 produzem o MAJOR) |
| m6 | link "Ver a fórmula exata na metodologia" | **corrigido no rótulo**; deep-link não auditável em print |
| m7 | símbolo PONTEIRO 2× por tela | **corrigido** — o ornamento antes do `<h2>` sumiu |
| m8 | controles de revelação sem afordância | **corrigido** — sublinhado + chevron |
| m9 | "×" desalinhado e sem rótulo | **corrigido** — centrado (título y 6 820–6 835, × y 6 825–6 831), `aria-label="Tirar {instituto} da minha simulação"`, alvo 44×44 |
| m10 | "nº n/d" | **corrigido** ("o número do registro não está na publicação") |
| m11 | linha de datas 2× no rodapé | **corrigido** (1×) |
| m12 | cabeçalho sem navegação | **corrigido** — "O que já mudou · Metodologia" nas 3 páginas, dentro da dobra |
| m13 | pílulas com folga + ênfase assimétrica + régua sem rótulo | **corrigido** (os três, medidos) |
| n1 | régua do empate 2,5 px sem engrossar | **corrigido** (2/3/4 px) · resta 2 px a 390 contra os 3 da spec → NIT |
| n2 | glifos "⚠" e "▶" | **corrigido** |
| n3 | quebra irregular nome/partido | **mal corrigido** — mudou de linha, não de natureza (7 de 9 quebram, 2 não) → NIT |
| n4 | abas desequilibradas a 390 | **corrigido** (segmentado 50/50) |
| n5 | eixo x com "09/06" mudo | **corrigido** (10/01 · 04/08 · 25/10, com o do meio marcado "hoje") |
| n6 | aspas angulares «…» | **corrigido** (`aspasCurvas`; conferido em "É o único em que votaria" e "deriva") |

### O loop não fecha nesta iteração

Não porque a lista seja grave — não é. Porque **sobram 4 MAJORs**, e um deles é o critério 2:
a quarta pergunta do leigo continua sem resposta na tela. A regra de parada exige **duas iterações
consecutivas limpas**; o contador continua em **0**.

Dito isso, o salto é real e mensurável: 2 BLOCKERs fechados com prova, 27 de 33 itens corrigidos e
verificados no pixel, **zero regressões**, o teste do leigo de 1/4 para 3/4, e o critério 4 saiu do
limbo. Nenhum dos 4 MAJORs restantes é estrutural: três são passes de texto/layout localizados
(`contexto.ts`, o par rodapé/aviso, a placa de `/metodologia`) e o quarto são nove palavras na
micro-legenda.

### Sobre a disclosure: **é dedup honesto**, com uma ressalva de evidência

Julgado como pedido. É honesto, por quatro razões medidas:
1. **os rótulos dizem o que escondem e quanto** — "Ver as outras **8** pesquisas, **mais
   antigas**", "Por que o erro do 1º turno importa agora, se o do 2º é menor", "De onde saem esses
   números". Nenhum é "leia mais";
2. **nada saiu do produto** — as 13 pesquisas com número de registro no TSE e link continuam
   inteiras em `/metodologia` (conferido no print, `metodologia-390-full.png` y 4 900–5 700) e na
   tabela a partir de 1440. R4 e H12 preservados;
3. **os controles parecem controles** (sublinhado + chevron — foi essa a correção do m8), com
   alvo de 44 px;
4. **o conteúdo escondido é de segunda camada, e está traduzido** — os 4 parágrafos de
   `erro-2022.tsx` respondem uma pergunta específica que o leitor da primeira camada não precisa
   fazer.

**Ressalva:** os prints capturam tudo fechado, então eu li o conteúdo **no código**, não no pixel.
Para a iteração 3, quero a segunda leva de prints com os disclosures abertos — é a única parte
desta iteração que eu não pude auditar do jeito que devo.

### Declaração anti-desperdício (obrigatória)

Nenhum dos 17 itens é melhoria fictícia: cada um traz medição no print citado (contraste pela
fórmula do WCAG 2, OKLCH, diâmetro por rotulagem de blobs, contagem por componente conexo,
largura de faixa morta por varredura de tinta, posição de rótulo em pixel, diferença entre quadros
de animação).

**E o que é mais importante para esta regra: três suspeitas minhas morreram na verificação e eu
não as filei.** (a) O polegar do deslizador desenha **24 px**, metade dos 44 que a rubrica 7 pede —
fui ao CSS: `padding-block: calc((44 − 24) / 2)`, alvo real de 44 px. Não é defeito. (b) O "×" de
remover parecia um glifo de 10 px sem afordância — `min-h-toque min-w-toque`, 44×44. Não é defeito.
(c) A rampa de candidatos não é monótona (o 9º é mais escuro que o 8º) — o mapa é *por nome*, de
propósito, "para que a cor de cada nome não dance quando o ranking mudar"; a decisão é melhor que
a alternativa e as barras não dependem de cor (nome e número ao lado). Não é defeito.

Se a iteração 3 fechar os 4 MAJORs, minha expectativa é que a lista restante (8 MINOR + 5 NIT) já
não contenha nada que um usuário real perceba — e nesse caso eu direi isso por escrito, que é o
que o critério de parada pede.

### Próxima iteração — ordem de ataque

1. **Nove palavras na micro-legenda do hero** — fecha o critério 2 e é a correção mais barata da
   lista.
2. **`contexto.ts`** — passe de VOZ §9 nas seis notas + o `dado` do primeiro cartão por extenso.
3. **Rodapé** — separar "Antes de sair" (editorial) do "Aviso:" (jurídico), sem sobreposição.
4. **`/metodologia`** — tirar a placa; resolve §5.7 e os 46 % de vazio a 1440 juntos.
5. Os 8 MINORs, em bloco (são todos localizados: rótulo "25 %", duas colisões da curva, tamanho do
   enxame do hero, régua na calha a 768, legenda da ilustração, grade a 768, dois cartões a 1440,
   um verbete do glossário).
6. **Trace de performance do arraste** — é o que falta para o critério 4 fechar por inteiro.
7. Segunda leva de prints **com os disclosures abertos**.
