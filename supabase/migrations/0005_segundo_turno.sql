-- 0005: 2º turno — institutos novos, CHECK de auditoria da coleta e a LEVA 1 de pesquisas.
--
-- Contexto (DECISOES.md, "2º turno"): a série pública parou em 02/08. Esta carga traz as
-- 17 pesquisas NACIONAIS de 2º turno (Lula × Flávio) com campo encerrado a partir de
-- 04/10/2026, cada uma conferida em fonte de imprensa ou PDF do instituto: votos TOTAIS
-- (nunca válidos), registro no TSE e link https. Os mesmos registros estão em
-- src/data/pesquisas.seed.json (fallback R8).
--
-- Escrita auditada (R2): cada pesquisa inserida/publicada gera uma linha `inclusao_manual`
-- no audit_log, com os campos publicáveis — a mesma forma do /admin.
-- Reexecutável: institutos fazem upsert dos aliases; pesquisas que já estiverem
-- PUBLICADAS não são tocadas; uma pendente/rejeitada com a mesma chave
-- (instituto, fim do campo) — p.ex. achada pelo robô — é substituída pelos números
-- verificados e publicada.

-- 1) audit_log aceita o registro de cada execução da coleta automática (Marco 4).
alter table public.audit_log
  drop constraint audit_log_acao_check;
alter table public.audit_log
  add constraint audit_log_acao_check
  check (acao in ('auto_insercao','aprovacao','rejeicao','inclusao_manual',
                  'edicao','remocao','reconstituicao','coleta'));

-- 1b) Selo de frescor honesto: a leitura pública vê SÓ quando a coleta rodou e se deu
--     certo (nada de motivos, erros ou ator). Mesmo desenho da audit_publico (0003):
--     view com os direitos do dono, projetando apenas colunas publicáveis.
create or replace view public.coleta_publica as
select id, em, coalesce((detalhes->>'ok')::boolean, false) as ok
from public.audit_log
where acao = 'coleta';

grant select on public.coleta_publica to anon, authenticated;

-- 2) Institutos: os novos do 2º turno + aliases novos dos antigos.
insert into public.institutos (id, nome, aliases) values
  ('atlasintel', 'AtlasIntel', array['Atlas Intel', 'Atlas', 'AtlasIntel/Bloomberg', 'Atlas/Bloomberg']::text[]),
  ('poderdata', 'PoderData', array['Poder Data', 'Poder360/PoderData', 'PoderData/Aya']::text[]),
  ('nexus', 'Nexus', array['Nexus/BTG', 'Nexus BTG Pactual']::text[]),
  ('datafolha', 'Datafolha', array['Data Folha', 'Instituto Datafolha', 'Datafolha/Folha']::text[]),
  ('gerp', 'Gerp', array['GERP']::text[]),
  ('indexa', 'Indexa', array['Indexa Pesquisas', 'Indexa/Broadcast']::text[]),
  ('quaest', 'Genial/Quaest', array['Quaest', 'Genial Quaest', 'Quaest/Genial', 'Genial', 'Quaest/Globo', 'Genial/Quaest/Globo']::text[]),
  ('ipec', 'Ipec', array['IPEC', 'Ipec Inteligência']::text[]),
  ('rtbd', 'Real Time Big Data', array['RTBD', 'RealTime Big Data', 'Real Time/Record']::text[]),
  ('parana', 'Paraná Pesquisas', array['Parana Pesquisas', 'Paraná']::text[]),
  ('futura', 'Futura', array['Futura Inteligência', 'Instituto Futura', 'Futura/100% Cidades']::text[]),
  ('mda', 'MDA', array['CNT/MDA', 'MDA Pesquisa']::text[]),
  ('palver', 'Palver', array['Instituto Palver']::text[]),
  ('datatrends', 'DataTrends', array['Data Trends']::text[]),
  ('ipespe', 'Ipespe', array['IPESPE', 'Ipespe/Abrapel']::text[]),
  ('voxbrasil', 'Vox Brasil', array['Vox', 'Instituto Vox Brasil']::text[]),
  ('ideia', 'Ideia', array['Ideia Big Data', 'Instituto Ideia']::text[])
on conflict (id) do update set aliases = excluded.aliases;

-- 3) Leva 1 — 2º turno, campo encerrado entre 04/10 e 15/10/2026.
with carga as (
  insert into public.pesquisas (
    instituto_id, contratante, campo_inicio, campo_fim, amostra, moe, tse,
    t1_lula, t1_flavio, t1_bnns, t2_lula, t2_flavio, t2_bnns, fonte_url,
    status, origem, bruto, publicado_em, publicado_por
  ) values
  -- futura-2026-10-15
  ('futura', 'Próprio instituto (100% Cidades, segundo o Poder360)', '2026-10-14', '2026-10-15', 2000, 2.2, 'BR-03764/2026',
   null, null, null, 47.5, 49.0, 3.6, 'https://www.correiobraziliense.com.br/politica/2026/10/7522095-lula-reduz-vantagem-de-flavio-bolsonaro-e-se-aproxima-de-empate-no-2-turno.html',
   'publicada', 'admin', '{"carga": "leva 1 — 2º turno pós-04/10 (verificada em 16/10/2026)"}'::jsonb, now(), 'carga-verificada'),
  -- mda-2026-10-15
  ('mda', 'CNT', '2026-10-13', '2026-10-15', 2014, 2.2, 'BR-00652/2026',
   null, null, null, 45.9, 46.8, 7.3, 'https://www.gazetadopovo.com.br/eleicoes/2026/pesquisa-eleitoral-2026/cnt-mda-presidente-outubro-2026-segundo-turno/',
   'publicada', 'admin', '{"carga": "leva 1 — 2º turno pós-04/10 (verificada em 16/10/2026)"}'::jsonb, now(), 'carga-verificada'),
  -- poderdata-2026-10-15
  ('poderdata', 'Próprio instituto', '2026-10-13', '2026-10-15', 3000, 1.8, 'BR-04258/2026',
   null, null, null, 47, 47, 6, 'https://jovempan.com.br/politica/pesquisa-poder-data-aya-flavio-bolsonaro-lula/',
   'publicada', 'admin', '{"carga": "leva 1 — 2º turno pós-04/10 (verificada em 16/10/2026)"}'::jsonb, now(), 'carga-verificada'),
  -- datafolha-2026-10-14
  ('datafolha', 'Folha de S.Paulo', '2026-10-13', '2026-10-14', 2520, 2, 'BR-00466/2026',
   null, null, null, 45, 47, 8, 'https://www.poder360.com.br/poder-eleicoes-2026/datafolha-confirma-poderdata-aya-e-da-flavio-com-51-e-lula-com-49/',
   'publicada', 'admin', '{"carga": "leva 1 — 2º turno pós-04/10 (verificada em 16/10/2026)"}'::jsonb, now(), 'carga-verificada'),
  -- indexa-2026-10-14
  ('indexa', 'Agência Estado', '2026-10-13', '2026-10-14', 2000, 2.2, 'BR-04629/2026',
   null, null, null, 42, 44, 14, 'https://www.gazetadopovo.com.br/eleicoes/2026/pesquisa-eleitoral-2026/indexa-broadcast-presidente-outubro-2026-segundo-turno/',
   'publicada', 'admin', '{"carga": "leva 1 — 2º turno pós-04/10 (verificada em 16/10/2026)"}'::jsonb, now(), 'carga-verificada'),
  -- palver-2026-10-13
  ('palver', 'Próprio instituto', '2026-10-10', '2026-10-13', 5000, 2.3, 'BR-08028/2026',
   null, null, null, 49, 50, 1, 'https://www.poder360.com.br/poder-pesquisas/flavio-tem-50-e-lula-tem-49-a-10-dias-do-2o-turno-diz-palver/',
   'publicada', 'admin', '{"carga": "leva 1 — 2º turno pós-04/10 (verificada em 16/10/2026)"}'::jsonb, now(), 'carga-verificada'),
  -- quaest-2026-10-13
  ('quaest', 'Grupo Globo', '2026-10-10', '2026-10-13', 2154, 2, 'BR-08729/2026',
   null, null, null, 44, 46, 10, 'https://www.poder360.com.br/poder-eleicoes-2026/flavio-tem-46-e-lula-tem-44-no-2o-turno-diz-quaest/',
   'publicada', 'admin', '{"carga": "leva 1 — 2º turno pós-04/10 (verificada em 16/10/2026)"}'::jsonb, now(), 'carga-verificada'),
  -- poderdata-2026-10-12
  ('poderdata', 'Próprio instituto', '2026-10-10', '2026-10-12', 3000, 1.8, 'BR-01209/2026',
   null, null, null, 46, 48, 7, 'https://jovempan.com.br/politica/poderdata-aya-flavio-chega-a-48-no-2o-turno-lula-alcanca-46/',
   'publicada', 'admin', '{"carga": "leva 1 — 2º turno pós-04/10 (verificada em 16/10/2026)"}'::jsonb, now(), 'carga-verificada'),
  -- nexus-2026-10-12
  ('nexus', 'Banco BTG Pactual', '2026-10-10', '2026-10-12', 2002, 2, 'BR-07997/2026',
   null, null, null, 45, 48, 7, 'https://www.gazetadopovo.com.br/eleicoes/2026/pesquisa-eleitoral-2026/nexus-btg-pactual-presidente-outubro-2026-segundo-turno/',
   'publicada', 'admin', '{"carga": "leva 1 — 2º turno pós-04/10 (verificada em 16/10/2026)"}'::jsonb, now(), 'carga-verificada'),
  -- gerp-2026-10-12
  ('gerp', 'Próprio instituto', '2026-10-08', '2026-10-12', 2400, 2, 'BR-07877/2026',
   null, null, null, 44, 53, 4, 'https://www.gazetadopovo.com.br/eleicoes/2026/pesquisa-eleitoral-2026/gerp-presidente-outubro-2026-segundo-turno/',
   'publicada', 'admin', '{"carga": "leva 1 — 2º turno pós-04/10 (verificada em 16/10/2026)"}'::jsonb, now(), 'carga-verificada'),
  -- datatrends-2026-10-09
  ('datatrends', 'Próprio instituto', '2026-10-07', '2026-10-09', 2000, 2.19, 'BR-03576/2026',
   null, null, null, 44, 50, 7, 'https://static.poder360.com.br/uploads/2026/10/pesquisa-datatrends-nacional-11out2026.pdf',
   'publicada', 'admin', '{"carga": "leva 1 — 2º turno pós-04/10 (verificada em 16/10/2026)"}'::jsonb, now(), 'carga-verificada'),
  -- futura-2026-10-10
  ('futura', '100% Cidades', '2026-10-07', '2026-10-10', 2000, 2.2, 'BR-00650/2026',
   null, null, null, 46.6, 50.0, 3.4, 'https://www.poder360.com.br/poder-eleicoes-2026/flavio-tem-518-contra-482-de-lula-diz-futura/',
   'publicada', 'admin', '{"carga": "leva 1 — 2º turno pós-04/10 (verificada em 16/10/2026)"}'::jsonb, now(), 'carga-verificada'),
  -- ipespe-2026-10-08
  ('ipespe', 'Próprio instituto (Abrapel)', '2026-10-06', '2026-10-08', 1500, 2.6, 'BR-00933/2026',
   null, null, null, 44, 49, 8, 'https://exame.com/brasil/pesquisa-presidente-2o-turno-flavio-bolsonaro-tem-49-e-lula-44-diz-ipespe/',
   'publicada', 'admin', '{"carga": "leva 1 — 2º turno pós-04/10 (verificada em 16/10/2026)"}'::jsonb, now(), 'carga-verificada'),
  -- atlasintel-2026-10-08
  ('atlasintel', 'Próprio instituto / Bloomberg', '2026-10-03', '2026-10-08', 5026, 1, 'BR-03663/2026',
   null, null, null, 45.7, 51.1, 3.2, 'https://www.gazetadopovo.com.br/eleicoes/2026/pesquisa-eleitoral-2026/atlasintel-presidente-outubro-2026-segundo-turno/',
   'publicada', 'admin', '{"carga": "leva 1 — 2º turno pós-04/10 (verificada em 16/10/2026)"}'::jsonb, now(), 'carga-verificada'),
  -- datafolha-2026-10-07
  ('datafolha', 'Folha de S.Paulo e Grupo Globo', '2026-10-06', '2026-10-07', 2520, 2, 'BR-02949/2026',
   null, null, null, 45, 49, 6, 'https://www.gazetadopovo.com.br/eleicoes/2026/pesquisa-eleitoral-2026/datafolha-presidente-outubro-2026-segundo-turno/',
   'publicada', 'admin', '{"carga": "leva 1 — 2º turno pós-04/10 (verificada em 16/10/2026)"}'::jsonb, now(), 'carga-verificada'),
  -- poderdata-2026-10-07
  ('poderdata', 'Próprio instituto', '2026-10-05', '2026-10-07', 3000, 1.8, 'BR-08134/2026',
   null, null, null, 44, 49, 7, 'https://jovempan.com.br/politica/poderdata-aya-flavio-bolsonaro-tem-49-contra-44-de-lula-no-2o-turno/',
   'publicada', 'admin', '{"carga": "leva 1 — 2º turno pós-04/10 (verificada em 16/10/2026)"}'::jsonb, now(), 'carga-verificada'),
  -- voxbrasil-2026-10-07
  ('voxbrasil', 'Próprio instituto', '2026-10-05', '2026-10-07', 2100, 2.15, 'BR-09623/2026',
   null, null, null, 44.2, 42.7, 13.1, 'https://exame.com/brasil/pesquisa-vox-brasil-lula-tem-442-e-flavio-bolsonaro-427-no-2o-turno/',
   'publicada', 'admin', '{"carga": "leva 1 — 2º turno pós-04/10 (verificada em 16/10/2026)"}'::jsonb, now(), 'carga-verificada')
  on conflict (instituto_id, campo_fim) do update set
    contratante = excluded.contratante,
    campo_inicio = excluded.campo_inicio,
    amostra = excluded.amostra,
    moe = excluded.moe,
    tse = excluded.tse,
    t1_lula = excluded.t1_lula,
    t1_flavio = excluded.t1_flavio,
    t1_bnns = excluded.t1_bnns,
    t2_lula = excluded.t2_lula,
    t2_flavio = excluded.t2_flavio,
    t2_bnns = excluded.t2_bnns,
    fonte_url = excluded.fonte_url,
    status = 'publicada',
    origem = 'admin',
    bruto = excluded.bruto,
    publicado_em = now(),
    publicado_por = excluded.publicado_por
  where public.pesquisas.status <> 'publicada'
  returning *
)
insert into public.audit_log (ator, acao, entidade, entidade_id, detalhes)
select
  'carga-verificada (migração 0005)', 'inclusao_manual', 'pesquisa', c.id::text,
  jsonb_build_object(
    'instituto_id', c.instituto_id, 'contratante', c.contratante,
    'campo_inicio', c.campo_inicio, 'campo_fim', c.campo_fim,
    'amostra', c.amostra, 'moe', c.moe, 'tse', c.tse,
    't1_lula', c.t1_lula, 't1_flavio', c.t1_flavio, 't1_bnns', c.t1_bnns,
    't2_lula', c.t2_lula, 't2_flavio', c.t2_flavio, 't2_bnns', c.t2_bnns,
    'fonte', c.fonte_url, 'origem', c.origem
  )
from carga c;
