create extension if not exists pgcrypto;

create type poll_status as enum ('pendente','publicada','rejeitada');
create type poll_origem as enum ('seed','auto','admin');

create table public.institutos (
  id text primary key,                       -- slug: 'atlasintel'
  nome text not null,                        -- 'AtlasIntel'
  aliases text[] not null default '{}'
);

create table public.pesquisas (
  id uuid primary key default gen_random_uuid(),
  instituto_id text not null references public.institutos(id),
  contratante text,
  campo_inicio date not null,
  campo_fim date not null,
  amostra int check (amostra between 300 and 50000),
  moe numeric(4,2) check (moe between 0.3 and 6),
  tse text,
  t1_lula numeric(4,1) check (t1_lula is null or t1_lula between 0 and 100),
  t1_flavio numeric(4,1) check (t1_flavio is null or t1_flavio between 0 and 100),
  t1_bnns numeric(4,1),
  t2_lula numeric(4,1) not null check (t2_lula between 20 and 70),
  t2_flavio numeric(4,1) not null check (t2_flavio between 20 and 70),
  t2_bnns numeric(4,1),
  fonte_url text check (fonte_url is null or fonte_url like 'https://%'),
  status poll_status not null default 'pendente',
  origem poll_origem not null,
  bruto jsonb,                               -- resposta crua da IA (forense)
  criado_em timestamptz not null default now(),
  publicado_em timestamptz,
  publicado_por text,
  constraint pesquisa_unica unique (instituto_id, campo_fim)
);
create index pesquisas_status_fim on public.pesquisas (status, campo_fim desc);

create table public.model_runs (
  id uuid primary key default gen_random_uuid(),
  executado_em timestamptz not null default now(),
  gatilho text not null check (gatilho in ('cron','aprovacao','manual','deploy')),
  params jsonb not null,
  n_pesquisas int not null,
  resultado jsonb not null                   -- saída completa de rodarModelo (serializável)
);
create index model_runs_tempo on public.model_runs (executado_em desc);

create table public.audit_log (
  id bigint generated always as identity primary key,
  em timestamptz not null default now(),
  ator text not null,                        -- 'cron' ou e-mail do admin
  acao text not null check (acao in
    ('auto_insercao','aprovacao','rejeicao','inclusao_manual','edicao','remocao')),
  entidade text not null,
  entidade_id text,
  detalhes jsonb                             -- nos eventos públicos, apenas campos publicáveis
);

alter table public.institutos enable row level security;
alter table public.pesquisas  enable row level security;
alter table public.model_runs enable row level security;
alter table public.audit_log  enable row level security;

-- Leitura pública do que é público. NENHUMA policy de escrita em tabela alguma:
-- toda escrita passa pelo service role no servidor (após checagem de admin + audit).
create policy institutos_leitura on public.institutos for select using (true);
create policy pesquisas_publicas on public.pesquisas  for select using (status = 'publicada');
create policy runs_publicos      on public.model_runs for select using (true);
create policy audit_transparencia on public.audit_log for select
  using (acao in ('aprovacao','inclusao_manual','remocao'));
