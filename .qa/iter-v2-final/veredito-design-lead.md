# A minha metade do veredito a quatro mãos

*design-lead · pós-loop, sobre `.qa/iter-v2-final/` contra `.qa/antes/`.*
Julgamento independente, com evidência minha. Régua: `docs/DESIGN-V2.md` (ENXAME, Fase 3),
`docs/MARCA.md` (PONTEIRO, Fase 4) e `docs/TENDENCIAS-2026.md` (P1–P12).

---

## "É outro produto" — **SUSTENTO**

1. **O modelo de profundidade foi trocado na raiz, não repintado.** Travessia horizontal da borda
   esquerda de uma placa, a 390: v1 (`antes/home-390-urna.png`, y=230) vai
   `#E6E6DD → #C6C6B8 → #F6F6F0` — um **filete de 1px** carregando a separação, porque o degrau de
   tinta papel→cartão é fraco demais para carregá-la sozinho. v2 (`iter-v2-final/home-390-hero.png`,
   y=500) vai `#EFECF1 → #FFFFFF` em **um pixel, sem filete e sem sombra**: bruma→placa basta.
   Varri para baixo da placa: a primeira linha não-branca é a linha seguinte — **zero pixel de
   sombra**. É `DESIGN-V2 §3.5` na letra, e é a causa do defeito que a v1 tinha: sem degrau de tinta
   utilizável, ela precisou de moldura, e por isso *toda* caixa ganhou a mesma moldura.

2. **A escada tipográfica passou a existir.** Perfis de banda de tinta, medidos. Na dobra da v1 há
   dois degraus e nada entre eles: ~13px (kicker mono caixa-alta **e** o parágrafo do modelo, passo
   de linha 21px) e ~29px (`PRESIDENTE 2026`) — salto de 2,2× sem nível intermediário. Na dobra da
   v2: 15 (etiqueta) → 16 (corpo, passo 25,5px) → 18 (linha da disputa) → ~40px serif em 3 linhas
   (bandas y228-266, y269-305, y310-340, entrelinha 41px ≈ 1,02em). O texto que mais importa saiu
   do menor corpo da página e o corpo subiu 13→16px (+23%).

3. **A assinatura gráfica mudou de espécie.** A da v1 é uma barra 83/17 — afirmação. A da v2 é um
   campo contável: contei os componentes conexos e são **exatamente 100**, **82 carmim / 18 naval**,
   batendo com a legenda impressa. Não é estilo diferente: é outra classe de objeto gráfico.

---

## "É bonito" — **SUSTENTO**

1. **O elemento-assinatura bate com a minha própria aritmética da Fase 3, ao pixel.** `§2.2` era o
   ponto onde o conceito podia morrer. Medido a 390: bolinha **8–9px** (piso duro era 8), passo de
   coluna **11,0–11,5px** (eu havia calculado 11,8), **25 colunas**, folga entre bolinhas ~2,5px
   (mínimo 2 — é ela que sustenta o 3:1 de §10.3), pilha de **88px** (teto 180 — a coluna nunca
   precisou dobrar para 2 p.p.) e coluna mais alta com **8 bolinhas**, exatamente o previsto. A
   régua do empate mede **3px** em `#211C26` = `--color-tinta`, e passa **no vão** entre a última
   coluna azul e a primeira carmim, nunca por cima de bolinha. O eixo saiu em `(142,133,152)` →
   **3,52:1 sobre a placa**, o mesmo número que anotei em §10.2. A tabela de contraste não era
   aspiração; está nos pixels.

2. **Um elemento, três escalas — o mesmo objeto, não um desenho de desktop.** Repeti a contagem a
   1440: **as mesmas 25 colunas, na mesma sequência** `[1,1,1,2,2,3,3,5,6,6,7,7,8,8,7,7,6,5,4,3,3,1,2,1,1]`,
   os mesmos 82/18, bolinha de 26px e passo de 33,5px — a mesma razão bolinha/passo (0,78) de 390.
   É P12 cumprido no sentido forte: o conceito nasceu a 390 e cresceu, não foi redesenhado em cima.

3. **A neutralidade sobrevive à medição — fui procurar violação e não achei.** A 1× o placar de
   `home-768-frente.png` *parece* dar mais corpo a quem lidera. Medi: nicho do 2º turno, "Lula
   46,9%" banda de **28px**, "Flávio 42,2%" **27px**; nicho do 1º turno, **29px** e **27px** — e a
   banda do Flávio ainda inclui o acento de "á", que a do Lula não tem. Mesmo corpo, mesmo peso,
   passo de linha idêntico (39px) nos dois nichos. A ilusão vinha do recuo do "×". `§8.3` (simetria
   mensurável) resiste ao paquímetro.

---

## "Um leigo entende" — **SUSTENTO**

1. **A hierarquia da dobra é decidida por área, e a favor da frase.** A manchete serif ocupa
   y228–340 = **113px, 13,4% da dobra de 844px**, com 330px dos 358px da coluna útil — é a mancha
   mais larga e mais alta da tela, e é uma **frase**, não um numeral. Na v1 o maior elemento da
   dobra é o par `83% ▮▮▮ 17%`; a frase que conclui ("LULA FAVORITO…") aparece **depois** da barra,
   em caixa-alta, e o texto que a explica é o menor corpo da página. A ordem de leitura foi
   invertida: agora a conclusão vem primeiro e no maior corpo.

2. **A incerteza virou forma e ficou contável no aparelho barato.** A 390 a v1 imprime a dúvida
   como parêntese de texto de ~13px. A v2 entrega 100 alvos de 9px, separados por 2,5px de placa,
   com régua rotulada **em palavra** ("empate") e pontas rotuladas em direção ("← Flávio na frente ·
   18" / "82 · Lula na frente →"). Nenhuma informação depende de cor: quem está de que lado é
   **posição contra a régua**, e cada bolinha faz 6,18:1 / 9,50:1 contra a placa por si só. É P1+P4
   sem álibi, no viewport onde o conceito precisava nascer.

3. **O corpo de leitura ganhou tamanho e ar.** Passo de linha do texto explicativo: **21px na v1
   → 25,5px na v2**, corpo 13→16px, medida contida em ~58ch. Para o público que o INAF descreve
   (P3), isso não é conforto: é a diferença entre decodificar e entender.

---

## Onde a v2 fica aquém do meu ideal — sem álibi

Duas coisas, e a primeira é culpa do meu documento, não da execução. **O 1440 não tem composição
própria: é a coluna de 390 esticada.** Medi as bordas direitas da primeira dobra a 1440 e elas
formam uma escada — kickers terminam em x=676, manchete em x=972, placa do enxame em x=1219 — e
dentro dessa placa de 1000px a micro-legenda ocupa 505px, deixando ~460px de branco morto à
direita, o pior quadro da página inteira. O `DESIGN-V2 §5.1` prescreve a ordem da dobra de 390 e
**nunca desenha o desktop**; a Fase 8 entregou exatamente o que eu especifiquei, e o que eu
especifiquei não chega a ser uma composição. A segunda é minha também: o mobiliário do gráfico não
acompanha a marca. A 390 o rótulo "empate" (~11px de tinta) e a bolinha (9px) se equivalem; a 1440
a bolinha vai a 26px e o rótulo fica em 16px — a razão inverte de 1,2:1 para 0,42:1, e o enxame
grande lê ligeiramente desmobiliado. Foi `§6.2` (rótulos fora do SVG, para não encolherem a 390)
resolvendo o piso e esquecendo o teto. Terceira, menor: `§8.3` proíbe ordenar os dois candidatos
por precedência, mas na entrega a régua põe quem lidera à direita e os nichos põem quem lidera em
cima — as duas superfícies ordenam por quem está ganhando. A simetria de corpo, peso e cor que medi
acima segura a neutralidade, e não há alternativa neutra para o sinal de uma diferença; mas a regra
que escrevi não é obedecida ao pé da letra e não vou fingir que é. Nenhuma das três é defeito de
craft da implementação — são o limite do briefing que eu assinei. **O topo do meu ideal para 2026
seria o mesmo sistema com um desktop desenhado e o mobiliário do gráfico tipograficamente escalado;
o que está aqui é o mesmo sistema sem essas duas coisas** — e ainda assim é a melhor peça de
visualização editorial que já saiu deste repositório, por larga margem.

---

## Assinatura

Assino a minha metade do veredito a quatro mãos: as três afirmações — **"é outro produto"**,
**"é bonito"** e **"um leigo entende"** — estão **sustentadas** pela minha régua de direção de
arte, com a evidência acima, toda medida por mim nos PNGs de `.qa/iter-v2-final/` contra
`.qa/antes/`.

Declaro explicitamente, para que ninguém leia mais do que está escrito: **esta é uma verificação
PÓS-LOOP.** O loop da Fase 7 encerrou no limite de 8 iterações **sem leitura limpa**, e o contador
de iterações limpas termina o projeto em **zero**. Assino o **produto** no estado desta pasta —
não o processo, e não uma iteração limpa que não existiu. Ficam registradas, sem cobrança e sem
reabrir nada: a ausência de composição de desktop, a escala do mobiliário do gráfico a 1440 e a
ordenação por precedência descrita acima — as três são dívida do meu briefing, e é assim que devem
entrar no relatório final.

*— design-lead*
