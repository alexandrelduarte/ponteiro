# Modelo de ameaças

Este documento não descreve boas intenções: descreve **o que está implementado
hoje**, em qual arquivo, e o que continua sendo responsabilidade de um humano.

O que torna este produto um alvo não é o dado — as pesquisas são públicas e estão
registradas no TSE. É a **narrativa**: um número na tela de um agregador durante
uma eleição presidencial vale mais para um atacante do que qualquer banco de dados.
Por isso as ameaças abaixo estão ordenadas por dano à credibilidade, não por
sofisticação técnica.

**Escopo:** este repositório e o que ele implanta (Next.js na Vercel + Supabase).
Fora de escopo: a segurança da conta Vercel/Supabase/GitHub do operador e os sites
de terceiros linkados como fonte.

---

## Sumário

| #                                  | Ameaça                                        | Estado                                          |
| ---------------------------------- | --------------------------------------------- | ----------------------------------------------- |
| [A1](#a1--envenenamento-da-série)  | Envenenamento da série (dado falso publicado) | mitigado no código                              |
| [A2](#a2--roubo-de-chaves)         | Roubo de chaves (service role, IA, cron)      | mitigado no código + provado no build           |
| [A3](#a3--escrita-direta-no-banco) | Escrita direta no banco pela chave pública    | mitigado no schema + teste                      |
| [A4](#a4--defacement)              | Defacement (alterar o que o leitor vê)        | mitigado no código; **exige branch protection** |
| [A5](#a5--ddos-e-custo)            | DDoS e queima de orçamento                    | mitigado no código + plataforma                 |
| [A6](#a6--xss-via-conteúdo-da-ia)  | XSS / injeção via conteúdo da IA              | mitigado no código                              |
| [A7](#a7--sequestro-do-admin)      | Sequestro da conta de admin                   | mitigado no código; **exige MFA**               |
| [A8](#a8--clickjacking)            | Clickjacking / embed hostil                   | mitigado nos cabeçalhos                         |
| [A9](#a9--supply-chain)            | Supply chain (dependência maliciosa)          | mitigado; **2 avisos abertos, avaliados**       |
| [A10](#a10--descrédito)            | Descrédito ("esse site é chapa branca")       | mitigado por transparência                      |

---

## A1 — Envenenamento da série

**O ataque.** Fazer o agregador publicar uma pesquisa que não existe, ou uma que
existe com os números trocados. Não precisa invadir nada: basta plantar na web uma
página convincente que a busca automática encontre.

**Mitigações.**

- **A IA nunca publica.** Todo item coletado entra com `status='pendente'`
  (`src/lib/updater.ts`, no `insert`). A única transição para `publicada` é
  `aprovarPesquisa()` em `src/lib/admin/acoes.ts`, atrás de `exigirAdmin()`.
  Não existe gatilho público de atualização em lugar nenhum do produto.
- **A resposta da IA é tratada como entrada hostil.** O pipeline em
  `processarRespostaIA()` é: limite de tamanho (`MAX_TEXTO` 200 KB, `MAX_ITENS` 12)
  → extração do array JSON → **Zod estrito** (`esquemaItem`) → sanidade eleitoral →
  sanidade temporal → URL → instituto → dedup. Qualquer etapa que falhe rejeita o
  item **com motivo legível**, que aparece no `/admin`.
- **Sanidade eleitoral e temporal.** 2º turno fora de 20–70 p.p. é rejeitado;
  1º turno cuja soma passa de 100 p.p. é rejeitado; campo que começa depois de
  terminar, campo no futuro, campo anterior à última pesquisa da série, ou início
  anterior a `DATA_MINIMA` (2025-01-01) são rejeitados.
- **Fonte obrigatória e verificável.** `urlSegura()` exige `https:`, host com
  ponto, sem credenciais embutidas, até 500 caracteres. Sem fonte válida, o item
  não entra. O `/admin` mostra o link para o revisor abrir antes de aprovar.
- **Dedup.** Chave `(instituto_id, campo_fim)` em memória durante o processamento
  **e** `constraint pesquisa_unica` no banco (`0001_schema.sql`). Uma corrida entre
  duas execuções vira código 23505, que o updater trata como duplicata, não como erro.
- **O banco duplica os limites.** `CHECK (t2_lula between 20 and 70)`,
  `CHECK (amostra between 300 and 50000)`, `CHECK (fonte_url like 'https://%')`.
  Se a validação da aplicação for contornada, o Postgres recusa.
- **Bruto forense.** O item cru da IA é guardado em `pesquisas.bruto` **apenas
  como registro**. A camada de dados nunca o lê para pesquisas de origem `auto` —
  só para `seed`/`admin`. A IA não escolhe chave de React nem conteúdo de ranking.

**Resíduo aceito.** Um admin distraído pode aprovar um item falso bem construído.
A defesa é processual (conferir a fonte antes de aprovar) e reversível: a remoção
preserva o registro inteiro no `audit_log`, então a série continua auditável
depois da correção.

---

## A2 — Roubo de chaves

**O ataque.** Extrair `SUPABASE_SERVICE_ROLE_KEY` (escreve ignorando RLS),
`ANTHROPIC_API_KEY` (gasta dinheiro) ou `CRON_SECRET` do que o navegador baixa.

**Mitigações.**

- **`import "server-only"`** no topo de `src/lib/supabase/admin.ts`,
  `src/lib/updater.ts`, `src/lib/snapshot.ts` e `src/lib/admin/auth.ts`. Se um
  desses módulos entrar num bundle de cliente, **o build quebra** — não é convenção,
  é uma falha de compilação.
- **Nenhuma env server-only tem prefixo `NEXT_PUBLIC_`.** Só esse prefixo faz o
  Next embutir o valor no bundle do navegador. `.env.example` marca explicitamente
  quais são server-only.
- **Prova no build, não confiança.** Um passo do CI (`.github/workflows/ci.yml`)
  varre `.next/static/` — literalmente o que o navegador baixa — atrás de
  `sk-ant`, `SUPABASE_SERVICE_ROLE_KEY`, `service_role`, `ANTHROPIC_API_KEY`,
  `CRON_SECRET` e `ADMIN_EMAILS`. Qualquer ocorrência reprova o build.
  Verificado localmente com um build adversarial (valores-sentinela plantados nas
  envs): **zero ocorrências**; o bundle do cliente não contém sequer a URL ou a
  anon key do Supabase, porque nenhum componente cliente fala com o banco.
- **Chave nunca logada.** Os `console.error` do updater e das actions registram
  mensagem de erro, nunca configuração.
- **CSP restringe o destino.** `connect-src 'self' <host do Supabase>` —
  derivado de `NEXT_PUBLIC_SUPABASE_URL` no build, não escrito à mão
  (`next.config.ts`). Um script injetado não consegue exfiltrar para outro host.

**Responsabilidade humana.** Girar as chaves periodicamente e ao suspeitar de
vazamento (procedimento no `README.md`). Nunca colar valores reais em issue, PR
ou log.

---

## A3 — Escrita direta no banco

**O ataque.** Pegar a `anon key` (que é pública por desenho, está no HTML) e
escrever direto na API REST do Supabase, contornando o aplicativo inteiro.

**Mitigações.**

- **RLS ligado nas quatro tabelas** e **zero policies de escrita em qualquer
  tabela** (`supabase/migrations/0001_schema.sql`). No Postgres, RLS ligado sem
  policy correspondente é _default-deny_: `INSERT`, `UPDATE` e `DELETE` pela anon
  key não têm por onde passar.
- **Leitura mínima.** `pesquisas` só libera `status = 'publicada'` — pendentes e
  rejeitadas (e o `bruto` delas) são invisíveis para o público.
- **Escrita só pelo service role**, no servidor, depois de `exigirAdmin()` ou do
  segredo do cron, e sempre com linha em `audit_log`.
- **Teste de contrato.** `tests/rls.test.ts` tenta 8 escritas proibidas (INSERT,
  UPDATE e DELETE em cada tabela) e 5 leituras indevidas, e exige que todas
  falhem. Ele é **pulado com aviso** quando não há credenciais no ambiente, para
  não travar máquinas sem Supabase (R8) — por isso rodá-lo contra o projeto real
  antes de publicar é um passo obrigatório do `README.md`, não uma sugestão.

---

## A4 — Defacement

**O ataque.** Mudar o que o leitor vê sem tocar no banco: um commit malicioso, um
deploy a partir de um fork, um PR aparentemente inofensivo que altera um número.

**Mitigações.**

- **CI obrigatório** (`.github/workflows/ci.yml`): typecheck, lint, testes e build
  em Node 20 com `pnpm install --frozen-lockfile`, com `permissions: contents:
read` e **sem nenhum secret**.
- **Os golden tests são o cadeado do modelo.** `tests/modelo.golden.test.ts`
  compara a saída de `rodarModelo` com as funções originais do protótipo
  (`tests/reference/original.mjs`) a **1e-9**. Um PR que "arredonde melhor" ou
  "corrija" a matemática é reprovado automaticamente.
- **CSP fecha as portas clássicas de defacement**: `object-src 'none'`,
  `base-uri 'self'` (bloqueia sequestro de todas as URLs relativas via `<base>`),
  `form-action 'self'` (bloqueia exfiltração por formulário), `frame-src 'none'`,
  e `script-src` sem origem de terceiro — nenhum CDN externo, nenhuma fonte
  remota, nenhum analytics.
- **Zero dependência de rede em runtime.** Fontes self-hospedadas por `next/font`,
  textura de papel em SVG local, imagem de OG gerada no build.

**Responsabilidade humana — não está no código:** ativar **branch protection na
`main`** (PR obrigatório, CI verde obrigatório, force-push e exclusão bloqueados)
e **2FA** na conta e na organização. Sem isso, todo o resto acima é contornável
com um `git push --force`.

---

## A5 — DDoS e custo

**O ataque.** Derrubar o site, ou fazer o dono pagar por tráfego e por chamadas de
IA até desistir.

**Mitigações.**

- **As páginas públicas são estáticas com ISR** (`revalidate` 5 min): `/`,
  `/historico` e `/metodologia` são servidas pelo CDN da Vercel. Uma enxurrada de
  requests bate no cache de borda, não em função nem em banco. _Isto é um controle
  de segurança_, e é a razão pela qual a CSP desta aplicação não usa nonce por
  request (ver "Sobre a CSP", abaixo).
- **Não existe endpoint público que gaste dinheiro.** A rota do cron
  (`src/app/api/cron/atualizar/route.ts`) exige `Authorization: Bearer
$CRON_SECRET`, comparado em **tempo constante** (`sha256` + `timingSafeEqual`,
  o hash iguala o comprimento antes da comparação). Sem `CRON_SECRET` a rota
  responde **503 — fechada, não aberta**. Falha de auth devolve 401 com corpo
  vazio: não distingue "segredo errado" de "segredo ausente".
- **Guarda de reentrância.** `emExecucao` devolve 409 se a mesma instância já está
  processando — o cron às vezes repete o disparo.
- **Cooldown no disparo manual.** 60 s em `dispararAtualizacao()`
  (`src/lib/admin/acoes.ts`), atrás de `exigirAdmin()`.
- **Teto de gasto por execução.** `max_uses: 8` na busca e `max_tokens: 2000` na
  resposta limitam o pior caso de uma rodada (custo estimado no `README.md`).
- **Cooldown no envio de magic link.** 60 s por e-mail em
  `src/lib/admin/login.ts`, para o formulário de login não virar máquina de spam.

**Resíduo aceito.** Os cooldowns são em memória, por instância — barram o clique
repetido, não um atacante distribuído. Como ambos exigem sessão de admin
autenticada, o custo/benefício de um rate limit distribuído não se justifica hoje.

---

## A6 — XSS via conteúdo da IA

**O ataque.** A IA devolve `<script>`, `javascript:`, caracteres bidi ou HTML no
nome de um instituto; o texto atravessa a fila e é renderizado.

**Mitigações.**

- **Tudo é renderizado como texto pelo React**, que escapa por padrão. O produto
  tem **um único** `dangerouslySetInnerHTML`: o JSON-LD em
  `src/components/site/json-ld.tsx`, cujo conteúdo é 100% gerado por nós e onde
  `<` é escapado para `<` — é impossível fechar a tag `</script>` a partir do
  dado.
- **Limpeza na entrada.** `limparTexto()` (`src/lib/updater.ts`) remove **toda a
  categoria Unicode `\p{C}`** — controles e formatadores, o que inclui os
  caracteres bidi usados para disfarçar texto — e colapsa espaços. Nomes são
  limitados a 60 caracteres, contratante a 120, TSE a 60.
- **URLs.** `urlSegura()` só aceita `https:`; `javascript:`, `data:` e `file:` são
  rejeitados antes de chegar ao banco, e o schema tem
  `CHECK (fonte_url like 'https://%')` como segunda barreira.
- **Links externos** usam `rel="noopener noreferrer"` — a página linkada não
  ganha `window.opener`.
- **Byte NUL removido** antes de virar `jsonb`: além do risco de interpretação,
  um NUL derruba o `INSERT` (negação de serviço barata para quem controla a
  resposta da IA).
- **CSP como última linha:** sem origem de script de terceiro, sem `'unsafe-eval'`
  em produção, `object-src 'none'`, `base-uri 'self'`, `form-action 'self'`.
- **`X-Content-Type-Options: nosniff`** impede que uma resposta seja reinterpretada
  como HTML ou JS pelo navegador.

---

## A7 — Sequestro do admin

**O ataque.** Entrar no `/admin` como outra pessoa e publicar o que quiser — ou,
mais barato, apenas **descobrir quem é o admin** para atacá-lo por fora.

**Mitigações.**

- **Sem senha.** O acesso é por magic link do Supabase Auth; não há senha para
  vazar, reusar ou adivinhar.
- **A sessão diz _quem_, não _o que pode_.** A autorização vem de `ADMIN_EMAILS`,
  uma env de servidor, e é **revalidada no corpo de cada Server Action** por
  `exigirAdmin()` (`src/lib/admin/auth.ts`). Isso é deliberado: uma Server Action
  é um endpoint POST público — checar só na página não protege nada. Nenhum claim,
  cookie ou campo vindo do navegador concede privilégio. Sem `ADMIN_EMAILS`
  configurada, **ninguém** é admin (default-deny).
- **O login não é oráculo.** `enviarMagicLink()` responde **exatamente a mesma
  coisa** para e-mail autorizado e não autorizado, e só envia de fato para quem
  está na lista. Não dá para enumerar administradores pelo formulário.
- **O feed público de transparência não expõe o admin.** Este foi um achado real
  da revisão da Fase 2: a policy `audit_transparencia` original liberava a tabela
  `audit_log` inteira — inclusive a coluna `ator`, que guarda o e-mail do admin —
  para qualquer portador da anon key. A migração `0003_audit_publico.sql` **remove
  a policy** e cria a view `audit_publico`, que projeta apenas
  `id, em, acao, entidade, entidade_id, detalhes`. `tests/rls.test.ts` verifica as
  duas metades: que a tabela não é mais legível e que a view não tem `ator`.
- **`bruto` nunca entra na auditoria pública.** `detalhesPublicaveis()` em
  `src/lib/admin/acoes.ts` enumera os campos publicáveis; o texto não verificado
  da IA fica de fora por construção.
- **`Referrer-Policy: strict-origin-when-cross-origin`** impede que a URL do
  `/admin` vaze para sites externos no cabeçalho `Referer`.

**Responsabilidade humana — não está no código:** ativar **MFA na conta do
Supabase**, desativar o **signup público** no projeto (senão qualquer um cria
conta, mesmo sem virar admin) e criar o usuário admin pelo painel.

---

## A8 — Clickjacking

**O ataque.** Embutir o site num iframe invisível sobre outra página, para que o
leitor veja os números num contexto forjado — ou para roubar cliques do `/admin`.

**Mitigações.** Em `next.config.ts`, aplicados a **todas** as rotas:

- `Content-Security-Policy: frame-ancestors 'none'` — ninguém embute o site,
  nem a própria origem.
- `X-Frame-Options: DENY` — espelho legado, para user agents que não implementam
  `frame-ancestors`.
- `frame-src 'none'` — o caminho inverso também está fechado: o site não embute
  nada.
- `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload` —
  o downgrade para HTTP, que permitiria injetar o quadro no caminho, deixa de ser
  possível depois da primeira visita.

**Atenção ao `preload`.** Entrar na lista de preload do Chrome é um **compromisso**:
a partir daí todo subdomínio do domínio precisa falar HTTPS, e sair da lista leva
meses. Se algum dia houver um subdomínio legado em HTTP, remova `preload` antes de
submeter o domínio.

---

## A9 — Supply chain

**O ataque.** Uma dependência (ou uma GitHub Action) é comprometida e passa a
executar código no build ou no servidor.

**Mitigações.**

- **Lockfile congelado.** O CI usa `pnpm install --frozen-lockfile`: nenhuma
  versão é resolvida dentro do CI, e um `pnpm-lock.yaml` fora de sincronia com o
  `package.json` reprova o build.
- **`ignoredBuiltDependencies`** em `pnpm-workspace.yaml` (`sharp`,
  `unrs-resolver`): scripts de build nativos desses pacotes não são executados na
  instalação.
- **Dependabot semanal** (`.github/dependabot.yml`) para npm **e** para
  github-actions — actions de terceiro rodam com o token do repositório e merecem
  o mesmo cuidado que uma dependência de runtime. Os PRs são agrupados por família
  e passam pelo CI, cujos golden tests provam que a matemática não mudou.
- **CI sem privilégio.** `permissions: contents: read`, `persist-credentials:
false` no checkout, zero secrets.
- **Superfície pequena por escolha.** 10 dependências de produção, todas de
  primeira linha (Next, React, Supabase, Recharts, Zod, date-fns, SDK da Anthropic).

**Avisos abertos — avaliados, não ignorados.** `pnpm audit --prod` reporta hoje
5 vulnerabilidades (3 altas, 2 moderadas), **todas transitivas via `next`**:

| Pacote           | Caminho          | Severidade             | Avaliação                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| ---------------- | ---------------- | ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `postcss@8.4.31` | `next > postcss` | 3 altas + 2 moderadas  | **Não alcançável.** As falhas exigem CSS controlado pelo atacante (um comentário `sourceMappingURL` forjado, ou um `</style>` não escapado na saída do stringify). O pipeline de CSS do projeto processa **apenas** `src/app/globals.css` e `tokens.css`, escritos por nós; nenhum CSS de terceiro ou de usuário entra. Além disso, `postcss` é dependência **de build** — não vai para o navegador nem para o runtime do servidor. O `postcss` que de fato transforma o CSS aqui é o `8.5.25` (via `@tailwindcss/postcss`), já corrigido; o `8.4.31` é a cópia interna que o `next` fixa com versão exata. |
| `sharp@0.34.5`   | `next > sharp`   | alta (CVEs do libvips) | **Não alcançável.** É dependência **opcional** do `next`, usada só pela otimização de imagens do `next/image` — e o produto **não usa `next/image` em lugar nenhum** (zero ocorrências em `src/`). Seu build nativo já está desligado por `ignoredBuiltDependencies`, e na Vercel a otimização de imagem roda na plataforma, não com esta cópia. O `next` a declara como `^0.34.5`, faixa que não admite o `0.35.0` corrigido.                                                                                                                                                                              |

**Decisão: não adicionar `pnpm.overrides`.** Forçar `postcss@^8.5.25` dedupilcaria
a cópia interna do Next para uma versão que ele não declara suportar, e forçar
`sharp@0.35` seria um salto de minor fora da faixa declarada — as duas coisas
trocam um risco não alcançável por um risco de quebra real. O caminho correto é
esperar o Next subir os pinos, e o Dependabot é quem vai avisar. **Reavalie esta
tabela se o produto passar a processar CSS de terceiros ou a usar `next/image`** —
qualquer uma das duas mudanças torna o aviso correspondente alcançável.

---

## A10 — Descrédito

**O ataque.** Não é técnico. É a acusação — feita de boa ou de má fé — de que o
agregador está torcendo. Contra um produto assim, isso é mais eficaz do que
qualquer exploit.

**Mitigações.**

- **A metodologia inteira é pública** em `/metodologia`, incluindo as limitações
  que o modelo tem.
- **O leitor pode mexer nos parâmetros** (meia-vida, erro sistemático, deriva,
  viés) e ver o resultado mudar, com o estado serializado na URL — então qualquer
  pessoa pode compartilhar exatamente a configuração que está criticando.
- **Feed público de transparência.** `/historico` lê a view `audit_publico`: cada
  aprovação, inclusão manual e remoção fica visível, **sem o e-mail do admin**
  (ver A7). Quem quiser saber o que mudou na base, e quando, não precisa pedir.
- **Cada número é auditável depois.** Cada rodada do modelo é congelada em
  `model_runs` por `src/lib/snapshot.ts` — params, número de pesquisas e a saída
  completa daquele instante.
- **Remoção não apaga a história.** Remover uma pesquisa publicada preserva o
  registro inteiro no `audit_log`; a série continua auditável depois da correção.
- **Neutralidade mensurável, não declarada.** Simetria visual entre os candidatos,
  nenhuma imagem de pessoa/partido/bandeira, registro TSE e fonte sempre visíveis,
  e o disclaimer "NÃO É PREVISÃO" que não desaparece em tela pequena
  (`docs/DESIGN.md`).
- **Paridade verificável com o protótipo.** Os golden tests a 1e-9 provam que o
  produto publicado calcula exatamente o que o protótipo acadêmico calculava —
  ninguém "ajustou" nada no caminho.

---

## Sobre a CSP

A política completa e o raciocínio linha a linha estão comentados em
`next.config.ts`. O resumo do trade-off que mais chama atenção:

**`script-src` inclui `'unsafe-inline'`, e isso não é descuido.** O Next.js emite
o payload RSC como ~24 blocos `<script>` inline por página. Nas páginas estáticas
com ISR (`/`, `/historico`, `/metodologia`) as duas alternativas estão descartadas
por construção:

- **Nonce** precisa ser único por requisição. Como o mesmo HTML é servido do CDN
  para milhares de leitores por até 5 minutos, um nonce estático seria pior que
  nenhum. Tornar as páginas dinâmicas só para ter nonce derrubaria o cache de
  borda — que é a mitigação de A5.
- **Hash** muda a cada regeneração do ISR, porque o payload inline carrega o
  timestamp do prerender e os números do modelo. Um hash fixo no cabeçalho
  quebraria o site na primeira revalidação. Também não há como calculá-lo em
  `headers()`, que é avaliado antes das páginas existirem.

O que `'unsafe-inline'` **não** afrouxa continua valendo e é a maior parte da
defesa real: nenhum script de outra origem, nenhum `data:`/`blob:` executável,
**nenhum `'unsafe-eval'` em produção**, `object-src 'none'`, `base-uri 'self'`,
`form-action 'self'`, `frame-ancestors 'none'`. E a porta que ele deixa aberta
exige uma injeção de HTML para ser usada — que o produto não tem (A6).

**Violação conhecida e inofensiva.** O Zod 4 sonda a capacidade de `eval` no
cliente (`$ZodObjectJIT` compila validadores com `new Function` e cai no
interpretador quando a CSP nega). A sonda é engolida por um `try/catch`, o painel
funciona por completo — gráficos, hidratação e sliders foram verificados nos três
viewports — e o que sobra é um evento `securitypolicyviolation` por carga de `/`.
Afrouxar a CSP para calar um probe seria trocar defesa real por silêncio. A
correção certa é do lado do produto: `z.config({ jitless: true })` no único
componente cliente que importa Zod.

---

## Como reportar uma vulnerabilidade

**Não abra uma issue pública.** Uma issue com um passo a passo de exploração é um
convite, e as eleições têm data marcada.

Use o canal privado do GitHub: aba **Security → Report a vulnerability** (Private
Vulnerability Reporting). Se ele não estiver habilitado, o mantenedor deve ligá-lo
em _Settings → Code security and analysis_.

No relato, inclua:

- o que é possível fazer (impacto), não só o que está errado;
- passos mínimos para reproduzir;
- a versão/commit em que você testou.

**Compromisso de resposta:** confirmação de recebimento em até 72 h e um plano de
correção em até 7 dias. Achados que afetem a integridade da série publicada (A1,
A3, A4) são tratados como urgentes.

Você será creditado no `DECISOES.md` junto com a correção, salvo pedido em
contrário. Não há programa de recompensa — este é um projeto sem fins lucrativos.
