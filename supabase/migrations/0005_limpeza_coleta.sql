-- 0005: limpeza da coleta automática antes das cargas verificadas (0006, 0007).
--
-- Diagnóstico de 16/10/2026 (DECISOES.md, "fluxo de coleta"): o robô criou o MESMO
-- instituto com nomes diferentes (BTG/Nexus × Nexus, PoderData/Aya × PoderData,
-- CNT/MDA × MDA, três grafias de Futura…), o que duplicou rodadas na série publicada;
-- gravou votos VÁLIDOS no lugar dos totais em duas rodadas (AtlasIntel 02/10, Futura
-- 10/10); e registrou três rodadas com a data de divulgação no lugar do fim do campo.
--
-- Numa transação: (1) garante os institutos canônicos com os apelidos que o robô usou;
-- (2) apaga as 48 linhas `auto` cobertas pela carga verificada (que as reinsere
-- completas: 1º turno, branco/nulo, contratante) e as duplicatas — cada remoção vira
-- uma linha `remocao` no audit_log com o registro publicável e o motivo (R2, feed
-- público); (3) move o que sobrar dos apelidos para o id canônico e apaga os
-- institutos-apelido. Ficam: AtlasIntel 23–28/09 e Alfa Inteligência 23/09 (publicadas
-- pelo admin, fora da carga verificada) e a Veritá 04/09 já rejeitada.

begin;

insert into public.institutos (id, nome, aliases) values
  ('atlasintel', 'AtlasIntel', array['Atlas Intel', 'Atlas', 'AtlasIntel/Bloomberg', 'Atlas/Bloomberg']::text[]),
  ('poderdata', 'PoderData', array['Poder Data', 'Poder360/PoderData', 'PoderData/Aya']::text[]),
  ('nexus', 'Nexus', array['Nexus/BTG', 'Nexus BTG Pactual', 'BTG/Nexus']::text[]),
  ('datafolha', 'Datafolha', array['Data Folha', 'Instituto Datafolha', 'Datafolha/Folha']::text[]),
  ('gerp', 'Gerp', array['GERP']::text[]),
  ('indexa', 'Indexa', array['Indexa Pesquisas', 'Indexa/Broadcast']::text[]),
  ('quaest', 'Genial/Quaest', array['Quaest', 'Genial Quaest', 'Quaest/Genial', 'Genial', 'Quaest/Globo', 'Genial/Quaest/Globo']::text[]),
  ('ipec', 'Ipec', array['IPEC', 'Ipec Inteligência']::text[]),
  ('rtbd', 'Real Time Big Data', array['RTBD', 'RealTime Big Data', 'Real Time/Record']::text[]),
  ('parana', 'Paraná Pesquisas', array['Parana Pesquisas', 'Paraná']::text[]),
  ('futura', 'Futura', array['Futura Inteligência', 'Instituto Futura', 'Futura/100% Cidades', 'Futura Inteligência/100% Cidades', 'Futura 100% Cidades']::text[]),
  ('mda', 'MDA', array['CNT/MDA', 'MDA Pesquisa']::text[]),
  ('palver', 'Palver', array['Instituto Palver']::text[]),
  ('datatrends', 'DataTrends', array['Data Trends']::text[]),
  ('ipespe', 'Ipespe', array['IPESPE', 'Ipespe/Abrapel']::text[]),
  ('vox-brasil', 'Vox Brasil', array['Vox', 'Instituto Vox Brasil', 'Vox Brasil Opinião e Pesquisas']::text[]),
  ('ideia', 'Ideia', array['Ideia Big Data', 'Instituto Ideia', 'Meio/Ideia']::text[]),
  ('verita', 'Veritá', array['Verita', 'Instituto Veritá']::text[]),
  ('alfa-inteligencia', 'Alfa Inteligência', array['Alfa Inteligência/TMC', 'Alfa']::text[])
on conflict (id) do update set aliases = excluded.aliases;

with alvo(instituto_id, campo_fim, motivo) as (
  values
    ('datafolha', '2026-10-14', 'substituída pela versão conferida (carga verificada de 16/10/2026)'),
    ('quaest', '2026-10-13', 'substituída pela versão conferida (carga verificada de 16/10/2026)'),
    ('btg-nexus', '2026-10-12', 'substituída pela versão conferida (carga verificada de 16/10/2026)'),
    ('poderdata-aya', '2026-10-12', 'substituída pela versão conferida (carga verificada de 16/10/2026)'),
    ('nexus', '2026-10-12', 'substituída pela versão conferida (carga verificada de 16/10/2026)'),
    ('gerp', '2026-10-12', 'substituída pela versão conferida (carga verificada de 16/10/2026)'),
    ('futura-100-cidades', '2026-10-10', 'votos válidos gravados no lugar dos totais — substituída pela versão conferida'),
    ('futura-inteligencia', '2026-10-10', 'substituída pela versão conferida (carga verificada de 16/10/2026)'),
    ('datatrends', '2026-10-09', 'substituída pela versão conferida (carga verificada de 16/10/2026)'),
    ('atlasintel', '2026-10-08', 'substituída pela versão conferida (carga verificada de 16/10/2026)'),
    ('ipespe-abrapel', '2026-10-08', 'substituída pela versão conferida (carga verificada de 16/10/2026)'),
    ('vox-brasil', '2026-10-07', 'substituída pela versão conferida (carga verificada de 16/10/2026)'),
    ('datafolha', '2026-10-07', 'substituída pela versão conferida (carga verificada de 16/10/2026)'),
    ('poderdata-aya', '2026-10-07', 'substituída pela versão conferida (carga verificada de 16/10/2026)'),
    ('datafolha', '2026-10-03', 'substituída pela versão conferida (carga verificada de 16/10/2026)'),
    ('futura-100-cidades', '2026-10-03', 'substituída pela versão conferida (carga verificada de 16/10/2026)'),
    ('quaest', '2026-10-03', 'substituída pela versão conferida (carga verificada de 16/10/2026)'),
    ('palver', '2026-10-03', 'substituída pela versão conferida (carga verificada de 16/10/2026)'),
    ('cnt-mda', '2026-10-02', 'substituída pela versão conferida (carga verificada de 16/10/2026)'),
    ('gerp', '2026-10-02', 'substituída pela versão conferida (carga verificada de 16/10/2026)'),
    ('poderdata-aya', '2026-10-02', 'substituída pela versão conferida (carga verificada de 16/10/2026)'),
    ('mda', '2026-10-02', 'substituída pela versão conferida (carga verificada de 16/10/2026)'),
    ('poderdata', '2026-10-02', 'substituída pela versão conferida (carga verificada de 16/10/2026)'),
    ('atlasintel', '2026-10-02', 'votos válidos gravados no lugar dos totais — substituída pela versão conferida'),
    ('datafolha', '2026-10-01', 'substituída pela versão conferida (carga verificada de 16/10/2026)'),
    ('rtbd', '2026-09-30', 'substituída pela versão conferida (carga verificada de 16/10/2026)'),
    ('indexa-broadcast', '2026-09-29', 'substituída pela versão conferida (carga verificada de 16/10/2026)'),
    ('futura-100-cidades', '2026-09-29', 'substituída pela versão conferida (carga verificada de 16/10/2026)'),
    ('gerp', '2026-09-28', 'substituída pela versão conferida (carga verificada de 16/10/2026)'),
    ('vox-brasil', '2026-09-28', 'substituída pela versão conferida (carga verificada de 16/10/2026)'),
    ('meio-ideia', '2026-09-28', 'substituída pela versão conferida (carga verificada de 16/10/2026)'),
    ('palver', '2026-09-27', 'substituída pela versão conferida (carga verificada de 16/10/2026)'),
    ('nexus', '2026-09-27', 'substituída pela versão conferida (carga verificada de 16/10/2026)'),
    ('quaest', '2026-09-27', 'substituída pela versão conferida (carga verificada de 16/10/2026)'),
    ('btg-nexus', '2026-09-27', 'substituída pela versão conferida (carga verificada de 16/10/2026)'),
    ('datafolha', '2026-09-24', 'mesma rodada do Datafolha de 22–23/09 (24/09 foi a data de divulgação)'),
    ('palver', '2026-09-23', 'substituída pela versão conferida (carga verificada de 16/10/2026)'),
    ('poderdata-aya', '2026-09-23', 'substituída pela versão conferida (carga verificada de 16/10/2026)'),
    ('rtbd', '2026-09-23', 'substituída pela versão conferida (carga verificada de 16/10/2026)'),
    ('alfa-inteligencia-tmc', '2026-09-23', 'duplicata da Alfa Inteligência de 23/09 (mesmo instituto, outro nome)'),
    ('futura-inteligencia-100-cidades', '2026-09-23', 'substituída pela versão conferida (carga verificada de 16/10/2026)'),
    ('atlasintel', '2026-09-22', 'substituída pela versão conferida (carga verificada de 16/10/2026)'),
    ('nexus', '2026-09-20', 'substituída pela versão conferida (carga verificada de 16/10/2026)'),
    ('quaest', '2026-09-20', 'substituída pela versão conferida (carga verificada de 16/10/2026)'),
    ('palver', '2026-09-20', 'mesma onda da Palver encerrada em 18/09'),
    ('datafolha', '2026-09-17', 'mesma rodada do Datafolha de 15–16/09 (17/09 foi a data de divulgação)'),
    ('gerp', '2026-09-16', 'substituída pela versão conferida (carga verificada de 16/10/2026)'),
    ('poderdata-aya', '2026-09-16', 'substituída pela versão conferida (carga verificada de 16/10/2026)')
),
apagadas as (
  delete from public.pesquisas p
  using alvo a
  where p.origem = 'auto'
    and p.instituto_id = a.instituto_id
    and p.campo_fim = a.campo_fim::date
  returning p.*, a.motivo
)
insert into public.audit_log (ator, acao, entidade, entidade_id, detalhes)
select
  'limpeza da coleta (migração 0005)', 'remocao', 'pesquisa', x.id::text,
  jsonb_build_object(
    'instituto_id', x.instituto_id, 'contratante', x.contratante,
    'campo_inicio', x.campo_inicio, 'campo_fim', x.campo_fim,
    'amostra', x.amostra, 'moe', x.moe, 'tse', x.tse,
    't1_lula', x.t1_lula, 't1_flavio', x.t1_flavio, 't1_bnns', x.t1_bnns,
    't2_lula', x.t2_lula, 't2_flavio', x.t2_flavio, 't2_bnns', x.t2_bnns,
    'fonte', x.fonte_url, 'origem', x.origem, 'status_anterior', x.status,
    'motivo', x.motivo
  )
from apagadas x;

with mapa(apelido, canonico) as (
  values
    ('btg-nexus', 'nexus'),
    ('poderdata-aya', 'poderdata'),
    ('cnt-mda', 'mda'),
    ('futura-100-cidades', 'futura'),
    ('futura-inteligencia', 'futura'),
    ('futura-inteligencia-100-cidades', 'futura'),
    ('indexa-broadcast', 'indexa'),
    ('meio-ideia', 'ideia'),
    ('ipespe-abrapel', 'ipespe'),
    ('alfa-inteligencia-tmc', 'alfa-inteligencia')
)
update public.pesquisas p
set instituto_id = m.canonico
from mapa m
where p.instituto_id = m.apelido;

delete from public.institutos i
where i.id in ('btg-nexus', 'poderdata-aya', 'cnt-mda', 'futura-100-cidades', 'futura-inteligencia', 'futura-inteligencia-100-cidades', 'indexa-broadcast', 'meio-ideia', 'ipespe-abrapel', 'alfa-inteligencia-tmc')
  and not exists (select 1 from public.pesquisas p where p.instituto_id = i.id);

commit;
