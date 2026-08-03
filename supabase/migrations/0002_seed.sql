-- Seed da Fase 0: 10 institutos + as 13 pesquisas oficiais do protótipo.
-- Gerado a partir de src/data/institutos.seed.json e src/data/pesquisas.seed.json.
-- Números idênticos ao JSON (sem arredondamento). Reexecutável (on conflict do nothing).

insert into public.institutos (id, nome, aliases) values
  ('atlasintel', 'AtlasIntel', array['Atlas Intel', 'Atlas', 'AtlasIntel/Bloomberg']::text[]),
  ('poderdata', 'PoderData', array['Poder Data', 'Poder360/PoderData']::text[]),
  ('nexus', 'Nexus', array['Nexus/BTG', 'Nexus BTG Pactual']::text[]),
  ('datafolha', 'Datafolha', array['Data Folha', 'Instituto Datafolha']::text[]),
  ('gerp', 'Gerp', array['GERP']::text[]),
  ('indexa', 'Indexa', array['Indexa Pesquisas']::text[]),
  ('quaest', 'Genial/Quaest', array['Quaest', 'Genial Quaest', 'Quaest/Genial', 'Genial']::text[]),
  ('ipec', 'Ipec', array['IPEC', 'Ipec Inteligência']::text[]),
  ('rtbd', 'Real Time Big Data', array['RTBD', 'RealTime Big Data', 'Real Time/Record']::text[]),
  ('parana', 'Paraná Pesquisas', array['Parana Pesquisas', 'Paraná']::text[])
on conflict (id) do nothing;

insert into public.pesquisas (
  instituto_id, contratante, campo_inicio, campo_fim, amostra, moe, tse,
  t1_lula, t1_flavio, t1_bnns, t2_lula, t2_flavio, t2_bnns, fonte_url,
  status, origem, bruto, publicado_em, publicado_por
) values
  -- atlas-jul
  ('atlasintel', 'Próprio instituto / Bloomberg', '2026-07-22', '2026-07-27', 5021, 1, 'BR-08602/2026',
   44.9, 35.8, 1.6, 49.2, 42.9, 7.9, 'https://www.gazetadopovo.com.br/eleicoes/2026/pesquisa-eleitoral-2026/atlasintel-presidente-julho-2026-2/',
   'publicada', 'seed', '{"id_prototipo":"atlas-jul","outros1":{"Renan Santos":7.8,"Ronaldo Caiado":3.1,"Romeu Zema":2.8,"Samara Martins":2.1,"Augusto Cury":1.6,"Cabo Daciolo":0.1}}'::jsonb, now(), 'seed'),
  -- poder-jul
  ('poderdata', 'Próprio instituto', '2026-07-26', '2026-07-28', 2400, 2, 'BR-07845/2026',
   41, 35, 9, 46, 43, 11, 'https://www.gazetadopovo.com.br/eleicoes/2026/pesquisa-eleitoral-2026/poderdata-presidente-pesquisa-julho-2026/',
   'publicada', 'seed', '{"id_prototipo":"poder-jul","outros1":{"Ronaldo Caiado":5,"Renan Santos":4,"Romeu Zema":3,"Augusto Cury":3}}'::jsonb, now(), 'seed'),
  -- nexus-jul
  ('nexus', 'Banco BTG Pactual', '2026-07-24', '2026-07-26', 2004, 2, 'BR-01489/2026',
   42, 33, 8, 47, 43, 10, 'https://www.gazetadopovo.com.br/eleicoes/2026/pesquisa-eleitoral-2026/nexus-btg-pactual-presidente-julho-2026-2/',
   'publicada', 'seed', '{"id_prototipo":"nexus-jul","outros1":{"Ronaldo Caiado":6,"Renan Santos":5,"Romeu Zema":3,"Augusto Cury":2,"Cabo Daciolo":1}}'::jsonb, now(), 'seed'),
  -- dataf-jul
  ('datafolha', 'Grupo Folha', '2026-07-22', '2026-07-24', 2004, 2, 'BR-01166/2026',
   40, 32, null, 48, 43, 9, 'https://www.gazetadopovo.com.br/eleicoes/2026/datafolha-presidente-julho-2026/',
   'publicada', 'seed', '{"id_prototipo":"dataf-jul"}'::jsonb, now(), 'seed'),
  -- gerp-jul
  ('gerp', 'Próprio instituto', '2026-07-15', '2026-07-17', 2000, 2.19, 'BR-05026/2026',
   38, 38, 12, 45, 46, 9, 'https://www.gazetadopovo.com.br/eleicoes/2026/pesquisa-eleitoral-2026/gerp-presidente-julho-2026-2/',
   'publicada', 'seed', '{"id_prototipo":"gerp-jul","outros1":{"Romeu Zema":3,"Renan Santos":3,"Ronaldo Caiado":3,"Samara Martins":1,"Cabo Daciolo":1,"Joaquim Barbosa":1,"Augusto Cury":1}}'::jsonb, now(), 'seed'),
  -- indexa-jul
  ('indexa', 'Próprio instituto', '2026-07-16', '2026-07-19', 2000, 2.2, 'BR-02094/2026',
   41, 30, 15, 46, 39, 15, 'https://www.gazetadopovo.com.br/eleicoes/2026/pesquisa-eleitoral-2026/indexa-pesquisas-presidente-julho-2026/',
   'publicada', 'seed', '{"id_prototipo":"indexa-jul","outros1":{"Ronaldo Caiado":6,"Romeu Zema":3,"Renan Santos":3,"Joaquim Barbosa":1,"Augusto Cury":1}}'::jsonb, now(), 'seed'),
  -- quaest-jul
  ('quaest', 'Banco Genial', '2026-07-10', '2026-07-13', 2004, 2, 'BR-07181/2026',
   40, 28, 19, 45, 37, 18, 'https://www.gazetadopovo.com.br/eleicoes/2026/pesquisa-eleitoral-2026/genial-quaest-presidente-julho-2026/',
   'publicada', 'seed', '{"id_prototipo":"quaest-jul","outros1":{"Ronaldo Caiado":4,"Renan Santos":3,"Romeu Zema":2,"Cabo Daciolo":1,"Augusto Cury":1,"Joaquim Barbosa":1,"Samara Martins":1}}'::jsonb, now(), 'seed'),
  -- atlas-jun
  ('atlasintel', 'Próprio instituto / Bloomberg', '2026-06-26', '2026-06-30', 4999, 1, 'BR-04582/2026',
   null, null, null, 48.8, 42.3, 8.9, 'https://exame.com/brasil/atlasintel-lula-tem-488-e-flavio-bolsonaro-423-no-2o-turno/',
   'publicada', 'seed', '{"id_prototipo":"atlas-jun"}'::jsonb, now(), 'seed'),
  -- poder-jun
  ('poderdata', 'Próprio instituto', '2026-06-21', '2026-06-24', 2400, 2, 'BR-05722/2026',
   null, null, null, 46, 43, 11, 'https://www.cnnbrasil.com.br/eleicoes/poderdata-lula-empata-com-flavio-zema-e-caiado-no-2o-turno/',
   'publicada', 'seed', '{"id_prototipo":"poder-jun"}'::jsonb, now(), 'seed'),
  -- dataf-jun
  ('datafolha', 'Grupo Folha', '2026-06-17', '2026-06-18', 2004, 2, 'BR-09956/2026',
   null, null, null, 47, 43, 10, 'https://www.cnnbrasil.com.br/eleicoes/no-2o-turno-lula-tem-47-contra-43-de-flavio-bolsonaro-diz-datafolha/',
   'publicada', 'seed', '{"id_prototipo":"dataf-jun"}'::jsonb, now(), 'seed'),
  -- quaest-jun
  ('quaest', 'Banco Genial', '2026-06-05', '2026-06-08', 2004, 2, 'BR-07661/2026',
   39, 29, 19, 44, 38, 18, 'https://www.gazetadopovo.com.br/eleicoes/2026/pesquisa-eleitoral-2026/genial-quaest-presidente-junho-2026/',
   'publicada', 'seed', '{"id_prototipo":"quaest-jun","outros1":{"Renan Santos":3,"Ronaldo Caiado":3,"Aécio Neves":2,"Romeu Zema":2,"Augusto Cury":1,"Joaquim Barbosa":1,"Samara Martins":1}}'::jsonb, now(), 'seed'),
  -- dataf-mar
  ('datafolha', 'Grupo Folha', '2026-03-03', '2026-03-05', 2004, 2, 'registrada (nº n/d na fonte)',
   null, null, null, 46, 43, 11, 'https://www.yahoo.com/news/articles/flavio-bolsonaro-draws-even-lula-161733328.html',
   'publicada', 'seed', '{"id_prototipo":"dataf-mar"}'::jsonb, now(), 'seed'),
  -- quaest-jan
  ('quaest', 'Banco Genial', '2026-01-08', '2026-01-11', 2004, 2, 'BR-00835/2026',
   36, 23, null, 45, 38, 17, 'https://www.aol.com/articles/brazils-lula-leads-wing-rivals-133832563.html',
   'publicada', 'seed', '{"id_prototipo":"quaest-jan"}'::jsonb, now(), 'seed')
on conflict on constraint pesquisa_unica do nothing;
