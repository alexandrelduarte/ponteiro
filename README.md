# PONTEIRO

> Para onde apontam as pesquisas.

Agregador de pesquisas eleitorais para a disputa presidencial brasileira de 2026
(Lula × Flávio Bolsonaro). Não é um blog de pesquisas: é um **modelo estatístico**
— média ponderada por recência e tamanho de amostra, erro sistemático, deriva
temporal e viés histórico — que transforma a série de pesquisas registradas no TSE
em duas probabilidades (hoje e no dia da votação), com a incerteza explícita e a
metodologia inteira aberta.

O protótipo `agregador-presidencial-2026.jsx`, na raiz do repositório, é a **fonte
da verdade** do modelo, dos dados e dos textos editoriais. O porte para TypeScript
em `src/lib/modelo/` não é uma reimplementação livre: os _golden tests_ em
`tests/modelo.golden.test.ts` comparam cada saída com as funções originais
(copiadas verbatim para `tests/reference/original.mjs`) com **tolerância 1e-9**.
Se alguém "melhorar" a matemática, o teste quebra. Isso é intencional — o número
que o leitor vê tem que ser o número que o protótipo produzia.

> **Não é previsão.** O produto declara isso na tela. Probabilidade é uma leitura
> da incerteza dos dados de hoje, não um palpite sobre o resultado.

---

## Arquitetura

```
              LEITURA (pública, sem login, sem escrita)
 ┌──────────┐   HTTPS   ┌───────────────────┐   miss    ┌──────────────────────┐
 │ navegador│──────────▶│  Vercel CDN       │──────────▶│  Next.js App Router  │
 │          │◀──────────│  (ISR, 5 min)     │◀──────────│  Server Components   │
 └──────────┘   HTML    └───────────────────┘   HTML    └──────────┬───────────┘
   já com os                cabeçalhos de                          │
   números no HTML          segurança (next.config.ts)             │ src/lib/dados.ts
                                                                   │
                                          ┌────────────────────────┴──────────────┐
                                          │ há envs do Supabase?                  │
                                          ├───────────────┬───────────────────────┤
                                          │ SIM           │ NÃO (ou rede falhou)  │
                                          ▼               ▼                       │
                              ┌───────────────────┐  ┌──────────────────────┐     │
                              │ Supabase (anon)   │  │ seed local           │     │
                              │ RLS: só SELECT do │  │ src/data/*.seed.json │     │
                              │ que é público     │  │ (R8: nunca cai)      │     │
                              └───────────────────┘  └──────────────────────┘     │
                                                                                  │
              ESCRITA (nenhum gatilho público) ──────────────────────────────────┘

 ┌───────────────┐   Authorization: Bearer      ┌──────────────────────────────┐
 │ Vercel Cron   │───────CRON_SECRET───────────▶│ /api/cron/atualizar          │
 │ 12:00 UTC/dia │   (tempo constante, 503      │ (nodejs, force-dynamic)      │
 └───────────────┘    se o segredo faltar)      └──────────┬───────────────────┘
                                                            │
                            ┌───────────────────────────────┴──────────────┐
                            ▼                                              ▼
              ┌──────────────────────────┐                   ┌──────────────────────┐
              │ src/lib/updater.ts       │                   │ src/lib/snapshot.ts  │
              │ OpenAI + web_search      │                   │ roda o modelo e      │
              │ ↓ resposta = HOSTIL      │                   │ grava em model_runs  │
              │ Zod → sanidade → dedup   │                   │ (sempre, mesmo sem   │
              │ ↓                        │                   │  pesquisa nova)      │
              │ INSERT status='pendente' │                   └──────────────────────┘
              └───────────┬──────────────┘
                          │  fila de aprovação
                          ▼
              ┌──────────────────────────────────────────────────────┐
              │ /admin  (magic link + ADMIN_EMAILS, revalidado por   │
              │          Server Action)                              │
              │  humano aprova / rejeita / inclui manualmente        │
              └───────────┬──────────────────────────────────────────┘
                          │ service role (única porta de escrita)
                          ▼
              ┌──────────────────────────────────────────────────────┐
              │ UPDATE status='publicada' + audit_log                │
              │ → gravarSnapshot('aprovacao')                        │
              │ → revalidatePath('/', '/historico', '/admin')        │
              └──────────────────────────────────────────────────────┘
```

Três invariantes valem em todo o desenho:

1. **Público só lê.** RLS com zero policies de escrita; a única escrita é pelo
   service role, no servidor, depois da checagem de admin, com linha no `audit_log`.
2. **A IA nunca publica.** Tudo que o coletor encontra nasce `pendente`. Só um
   humano no `/admin` publica.
3. **O site funciona sem banco.** Sem as envs do Supabase (ou com a rede caída),
   `src/lib/dados.ts` cai para o seed local e a página continua correta.

---

## Setup local

Não é preciso Supabase nem chave da OpenAI para rodar o site: sem elas o
projeto usa o seed local e o `/admin` mostra a tela de "ambiente sem banco".

```bash
pnpm install
cp .env.example .env.local     # pode deixar tudo em branco no começo
pnpm dev                       # http://localhost:3000
```

Requisitos: **Node 20+** e **pnpm 10+**.

Antes de qualquer commit, os gates:

```bash
pnpm typecheck && pnpm lint && pnpm test && pnpm build
```

---

## Setup do Supabase

O Supabase é opcional em desenvolvimento e obrigatório em produção (é o que
guarda a série oficial, a fila de aprovação e a auditoria).

1. **Crie o projeto** em <https://supabase.com/dashboard> (região `sa-east-1`,
   São Paulo, se disponível — o público é brasileiro).

2. **Rode as três migrações, na ordem.** Pelo SQL Editor do painel, colando o
   conteúdo de cada arquivo:

   | Ordem | Arquivo                                      | O que faz                                                                   |
   | ----- | -------------------------------------------- | --------------------------------------------------------------------------- |
   | 1     | `supabase/migrations/0001_schema.sql`        | tabelas, constraints, RLS ligado, policies **só de leitura**                |
   | 2     | `supabase/migrations/0002_seed.sql`          | institutos e as 13 pesquisas do protótipo, como `publicada`                 |
   | 3     | `supabase/migrations/0003_audit_publico.sql` | remove a policy que expunha o e-mail do admin e cria a view `audit_publico` |

   Ou, com a CLI do Supabase: `supabase link --project-ref <ref> && supabase db push`.

3. **Copie as chaves** em _Settings → API_:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` → `SUPABASE_SERVICE_ROLE_KEY` — **server-only, nunca no cliente,
     nunca renomeada para `NEXT_PUBLIC_*`.**

4. **DESATIVE o cadastro público.** _Authentication → Sign In / Providers →
   Email_: desligue **Allow new users to sign up**. Sem isso, qualquer pessoa cria
   conta no projeto. (A autorização de admin não vem da sessão — vem de
   `ADMIN_EMAILS` no servidor — mas conta aberta é superfície de ataque à toa.)

5. **Crie o usuário admin pelo painel**, não pelo site: _Authentication → Users →
   Add user → Send invitation_, com o mesmo e-mail que estará em `ADMIN_EMAILS`.

6. **Ative MFA para a sua conta do Supabase** (_Account → Security_) e, se o plano
   permitir, exija MFA para o projeto. A conta do painel do Supabase é mais
   perigosa que a do `/admin`: ela vê o service role.

7. **Valide o RLS de verdade** antes de publicar — o teste existe justamente para
   isso e é pulado sem credenciais:

   ```bash
   env $(grep -v '^#' .env.local | xargs) pnpm vitest run tests/rls.test.ts
   ```

---

## Deploy na Vercel

1. _Add New → Project → Import Git Repository_. O framework é detectado como
   Next.js; não é preciso mexer em build command nem output directory.

2. **Configure as variáveis de ambiente** (_Settings → Environment Variables_).
   As marcadas **server-only** não podem, em hipótese alguma, ganhar o prefixo
   `NEXT_PUBLIC_` — esse prefixo é o que manda o Next embutir o valor no bundle
   do navegador.

   | Variável                        | Escopo          | Obrigatória   | Para que serve                                                                              |
   | ------------------------------- | --------------- | ------------- | ------------------------------------------------------------------------------------------- |
   | `NEXT_PUBLIC_SITE_URL`          | pública         | sim           | URL canônica em metadata, OG, sitemap e no retorno do magic link                            |
   | `NEXT_PUBLIC_SUPABASE_URL`      | pública         | sim (prod)    | endpoint do projeto; sem ela o site roda no seed                                            |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | pública         | sim (prod)    | leitura sujeita a RLS; é pública por desenho                                                |
   | `SUPABASE_SERVICE_ROLE_KEY`     | **server-only** | sim (prod)    | única chave que escreve; ignora RLS                                                         |
   | `OPENAI_API_KEY`                | **server-only** | sim (coletor) | chamadas ao modelo, só em route handler/cron                                                |
   | `OPENAI_MODEL`                  | servidor        | não           | padrão `gpt-5.6-luna`                                                                       |
   | `CRON_SECRET`                   | **server-only** | **sim**       | sem ela a rota do cron responde 503 e o coletor nunca roda. Gere com `openssl rand -hex 32` |
   | `ADMIN_EMAILS`                  | **server-only** | sim           | lista separada por vírgula; **default-deny**: vazia = ninguém é admin                       |
   | `SENTRY_DSN`                    | servidor        | não           | opcional                                                                                    |

   A Vercel injeta `CRON_SECRET` como `Authorization: Bearer <valor>` nas chamadas
   de cron automaticamente — basta a variável existir no ambiente de produção.

3. **Confirme o cron** em _Settings → Cron Jobs_. Ele vem de `vercel.json`
   (`/api/cron/atualizar`, `0 12 * * *` — 12:00 UTC, 09:00 em Brasília) e **só
   existe em produção**: deploys de preview não agendam nada.

4. **Teste o cron sem esperar um dia:**

   ```bash
   vercel crons run /api/cron/atualizar
   ```

   A resposta esperada é `200` com `{"ok":true,...}`. `401` = segredo errado;
   `503` = falta `CRON_SECRET` ou o Supabase não está configurado; `405` = a rota
   não aceita o verbo HTTP que a Vercel usou (o cron chama por **GET**).

5. **Rode o RLS contra produção** uma vez, com as chaves de produção no ambiente,
   antes de divulgar o link.

---

## Operação diária

O trabalho normal leva poucos minutos e acontece todo no `/admin`.

**Aprovar a fila.** O cron das 09:00 (Brasília) deixa em `pendente` o que a busca
achou. Abra `/admin`, e para cada item: **confira a fonte** (o link abre o registro
ou a matéria), veja se os números batem, e então **Aprovar** ou **Rejeitar** (com
motivo — ele vai para a auditoria). Aprovar publica na série, regrava o snapshot e
revalida `/` e `/historico`. Nada entra sozinho.

**Incluir manualmente.** Quando você achar uma pesquisa que a busca não achou, use
o formulário de inclusão. Ele passa pelo **mesmo funil de sanidade** do coletor
(faixas 20–70 no 2º turno, datas coerentes, `fonte` https obrigatória), mas com uma
folga: o admin pode incluir uma rodada mais antiga que a última da série — a regra
"não pode retroceder" existe para conter a IA, não o humano. A inclusão entra como
`publicada`, origem `admin`, e fica auditada.

**Instituto novo.** Não há tela para isso, e não precisa: ao aprovar (ou incluir)
uma pesquisa de um instituto desconhecido, ele é criado a partir do nome, com um
slug estável. Se um instituto aparecer com duas grafias, ajuste o campo `aliases`
dele direto na tabela `institutos` do Supabase — o coletor usa os aliases para
normalizar e evitar duplicata.

**Disparo manual da busca.** O botão "Atualizar agora" do `/admin` roda o coletor
fora do horário. Tem cooldown de 60 s por instância — cada clique custa dinheiro
de verdade.

**Girar chaves.** Faça isso ao trocar de máquina, ao suspeitar de vazamento e por
higiene a cada ~90 dias:

- _Supabase_: painel → _Settings → API → Rotate_ (service role e anon). Atualize
  na Vercel e faça um **redeploy** — variável nova só vale no próximo build.
- _OpenAI_: platform.openai.com → _API keys_ → crie a nova, troque na Vercel, redeploy,
  **e só então** revogue a antiga.
- _`CRON_SECRET`_: `openssl rand -hex 32`, troque na Vercel, redeploy.
- _Sessões do `/admin`_: retirar um e-mail de `ADMIN_EMAILS` derruba o acesso no
  request seguinte, porque a autorização é revalidada no servidor a cada ação —
  não é preciso invalidar sessão nenhuma.

---

## Quanto custa o cron

Uma execução por dia: uma chamada à OpenAI Responses API com a ferramenta
`web_search` (`max_output_tokens: 8000`; o modelo decide quantas buscas faz).
São três linhas na conta:

| Item                             | Preço                                          |
| -------------------------------- | ---------------------------------------------- |
| Busca                            | US$ 10 / 1.000 buscas (**US$ 0,01 por busca**) |
| Tokens de entrada (gpt-5.6-luna) | US$ 0,20 / milhão                              |
| Tokens de saída (gpt-5.6-luna)   | US$ 1,20 / milhão                              |

Com o modelo barato, quem domina a conta é **a taxa de busca**, não os tokens:
o teste real da migração fez 8 buscas (~US$ 0,08) sobre ~52 mil tokens de
entrada (~US$ 0,01). Ordem de grandeza:

| Cenário               | Buscas | Entrada estimada | Custo/dia | Custo/mês  |
| --------------------- | ------ | ---------------- | --------- | ---------- |
| Dia calmo (nada novo) | ~3     | ~30 mil tokens   | ~US$ 0,04 | **~US$ 1** |
| Dia cheio             | ~8     | ~60 mil tokens   | ~US$ 0,10 | **~US$ 3** |

Ou seja: **poucos dólares por mês** — menos que o domínio. Os dois botões de
ajuste são (a) `OPENAI_MODEL` (env, sem deploy) e (b) `max_output_tokens` em
`src/lib/updater.ts` (ver `DECISOES.md`).

O disparo manual do `/admin` custa o mesmo que uma execução do cron. O cooldown de
60 s existe por isso.

---

## Recomendações no GitHub

Nada aqui é opcional se o repositório for público — a credibilidade do produto é
o ativo (ameaça A10 no `SECURITY.md`).

- **Branch protection na `main`** (_Settings → Branches → Add rule_): exigir pull
  request, exigir que o job `gates` do CI passe, exigir que o branch esteja
  atualizado, e **bloquear force-push e exclusão**. O CI já roda typecheck, lint,
  testes (incluindo os golden do modelo) e build a cada PR.
- **2FA obrigatório** para você e para qualquer colaborador
  (_Settings → Moderation options_, ou nas configurações da organização).
- **Segredos só na Vercel.** O CI deste repositório roda **sem secret nenhum** —
  o projeto builda e testa sem Supabase e sem OpenAI (R8), e um passo do
  workflow prova que `.next/static` não contém nome nem valor de chave server-only.
  Se um dia um passo precisar de credencial, ele está no lugar errado.
- **Dependabot** já está configurado (`.github/dependabot.yml`): npm e
  github-actions, semanais, agrupados. Deixe o CI decidir — os golden tests
  reprovam qualquer PR que mexa no resultado do modelo.

---

## Comandos

```bash
pnpm dev          # servidor de desenvolvimento (Turbopack)
pnpm build        # build de produção
pnpm start        # sobe o build (é o que o e2e testa)
pnpm typecheck    # tsc --noEmit
pnpm lint         # eslint
pnpm test         # vitest: golden tests do modelo, updater, propriedades, RLS
pnpm e2e          # playwright: 21 testes contra `build && start`, console limpo
pnpm format       # prettier --write
```

Ferramentas do loop de qualidade (Fase 6), rodadas direto pelo node e sempre
**depois de um `pnpm build`**:

```bash
node scripts/qa/axe.mjs            # axe-core em 4 páginas × 2 viewports (falha em serious/critical)
node scripts/qa/lighthouse.mjs 5   # Lighthouse mobile; pisos 90/95/95/95 → .qa/iter-5/
node scripts/qa/screenshots.mjs 5  # prints de todas as seções em 390/768/1440 → .qa/iter-5/
```

---

## Onde as coisas estão

| Caminho                           | O que é                                                          |
| --------------------------------- | ---------------------------------------------------------------- |
| `agregador-presidencial-2026.jsx` | protótipo — fonte da verdade do modelo, dos dados e dos textos   |
| `src/data/`                       | seeds e constantes extraídos do protótipo (paridade byte a byte) |
| `src/lib/modelo/`                 | porte TS puro do modelo — **intocável numericamente**            |
| `src/lib/dados.ts`                | Supabase quando há envs, seed local quando não (R8)              |
| `src/lib/updater.ts`              | coletor server-only; trata a resposta da IA como entrada hostil  |
| `src/lib/admin/`                  | autorização e Server Actions do `/admin`                         |
| `src/app/`                        | App Router: `/`, `/historico`, `/metodologia`, `/admin`          |
| `supabase/migrations/`            | schema versionado, RLS default-deny                              |
| `tests/`                          | golden tests (1e-9), propriedades, updater, RLS, e2e             |
| `next.config.ts`                  | cabeçalhos de segurança e CSP, com o porquê de cada escolha      |
| `SECURITY.md`                     | modelo de ameaças A1–A10 e o estado real de cada mitigação       |
| `DECISOES.md`                     | toda decisão ambígua: contexto → decisão → porquê                |
| `docs/INVENTARIO.md`              | checklist de paridade com o protótipo                            |
| `docs/DESIGN.md`                  | sistema de design ("boletim de urna")                            |

## Licença, marca e transparência

- **Código**: [AGPL-3.0](LICENSE). Quem rodar versão modificada como serviço é obrigado a
  publicar o fonte modificado (§13) — a adulteração silenciosa do modelo é impossível de
  esconder por construção.
- **Marca**: o nome PONTEIRO, o logo e o domínio NÃO são licenciados — ver
  [TRADEMARKS.md](TRADEMARKS.md).
- **Conformidade eleitoral**: o site só republica pesquisas REGISTRADAS no TSE (Lei
  9.504/1997, art. 33; Res.-TSE 23.600/2019 com Res. 23.747/2026), sempre com número de
  registro, instituto, contratante, período de campo, amostra e margem — e o modelo
  probabilístico é rotulado em toda superfície como cálculo próprio, **não pesquisa, não
  previsão**. Não há dever legal de registro para quem REPUBLICA pesquisa registrada (a
  obrigação do art. 33 é de quem REALIZA).
