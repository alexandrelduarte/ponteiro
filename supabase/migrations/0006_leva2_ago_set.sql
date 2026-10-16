-- 0006: LEVA 2 — pesquisas nacionais com campo encerrado de 03/08 a 03/10/2026.
--
-- Fecha o buraco da série entre a última pesquisa publicada (02/08) e o 1º turno:
-- 68 rodadas com 1º turno (estimulado, votos TOTAIS, com os demais candidatos em
-- `bruto.outros1`) e 2º turno Lula × Flávio, cada uma conferida em imprensa ou no PDF do
-- instituto, com registro no TSE e link https. As da última semana (27/09–03/10) são as
-- que medem o erro do 1º turno de 2026 (src/lib/erro-1t.ts, DECISOES.md).
-- Excluída de propósito: American Analytics 15–20/09 (registro TSE impresso fora do
-- padrão, "BR-032587/26" — não conferível).
-- Mesmo desenho da 0005: upsert de institutos, pesquisas publicadas com audit_log.

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
  ('ideia', 'Ideia', array['Ideia Big Data', 'Instituto Ideia']::text[]),
  ('verita', 'Veritá', array['Verita', 'Instituto Veritá']::text[])
on conflict (id) do update set aliases = excluded.aliases;

with carga as (
  insert into public.pesquisas (
    instituto_id, contratante, campo_inicio, campo_fim, amostra, moe, tse,
    t1_lula, t1_flavio, t1_bnns, t2_lula, t2_flavio, t2_bnns, fonte_url,
    status, origem, bruto, publicado_em, publicado_por
  ) values
  -- ideia-2026-08-03
  ('ideia', 'Meio', '2026-07-31', '2026-08-03', 1500, 2.5, 'BR-04579/2026',
   43, 35, 6, 48.5, 43.0, 8.5, 'https://www.gazetadopovo.com.br/eleicoes/2026/pesquisa-eleitoral-2026/meio-ideia-presidente-agosto-2026/',
   'publicada', 'admin', '{"carga": "leva 2 — 03/08 a 03/10 (verificada em 16/10/2026)", "outros1": {"Ronaldo Caiado": 5.7, "Renan Santos": 4.7, "Romeu Zema": 2.6, "Augusto Cury": 1.7, "Cabo Daciolo": 0.6, "Samara Martins": 0.3, "Edmilson Costa": 0.2, "Hertz Dias": 0.1, "Rui Costa Pimenta": 0.1}}'::jsonb, now(), 'carga-verificada'),
  -- quaest-2026-08-03
  ('quaest', 'Banco Genial', '2026-07-31', '2026-08-03', 2004, 2.0, 'BR-06591/2026',
   39, 30, 18, 44, 39, 17, 'https://www.gazetadopovo.com.br/eleicoes/2026/pesquisa-eleitoral-2026/genial-quaest-presidente-agosto-2026/',
   'publicada', 'admin', '{"carga": "leva 2 — 03/08 a 03/10 (verificada em 16/10/2026)", "outros1": {"Renan Santos": 4, "Ronaldo Caiado": 4, "Romeu Zema": 2, "Cabo Daciolo": 1, "Augusto Cury": 1, "Samara Martins": 1}}'::jsonb, now(), 'carga-verificada'),
  -- futura-2026-08-07
  ('futura', 'Próprio instituto (Futura / Apex Partners)', '2026-08-03', '2026-08-07', 2000, 2.2, 'BR-08109/2026',
   38.8, 34.1, 11, 46.5, 44.0, 9.5, 'https://www.gazetadopovo.com.br/eleicoes/2026/pesquisa-eleitoral-2026/futura-inteligencia-presidente-agosto-2026/',
   'publicada', 'admin', '{"carga": "leva 2 — 03/08 a 03/10 (verificada em 16/10/2026)", "outros1": {"Ronaldo Caiado": 5.9, "Renan Santos": 3.6, "Romeu Zema": 3.6, "Augusto Cury": 1.2, "Rui Costa Pimenta": 0.8, "Samara Martins": 0.7, "Cabo Daciolo": 0.4, "Edmilson Costa": 0.1}}'::jsonb, now(), 'carga-verificada'),
  -- palver-2026-08-07
  ('palver', 'Próprio instituto', '2026-08-03', '2026-08-07', 5000, 3.0, 'BR-06596/2026',
   44, 40, 1, 46, 46, 8, 'https://www.cartacapital.com.br/politica/as-intencoes-de-voto-de-lula-e-flavio-bolsonaro-em-pesquisa-de-estreia-da-palver/',
   'publicada', 'admin', '{"carga": "leva 2 — 03/08 a 03/10 (verificada em 16/10/2026)", "outros1": {"Renan Santos": 10, "Ronaldo Caiado": 2, "Romeu Zema": 1, "Samara Martins": 1}}'::jsonb, now(), 'carga-verificada'),
  -- mda-2026-08-09
  ('mda', 'CNT', '2026-08-05', '2026-08-09', 2002, 2.2, 'BR-06935/2026',
   42.4, 28.7, 14, 48.0, 39.1, 12.9, 'https://www.gazetadopovo.com.br/eleicoes/2026/pesquisa-eleitoral-2026/cnt-mda-presidente-agosto-2026/',
   'publicada', 'admin', '{"carga": "leva 2 — 03/08 a 03/10 (verificada em 16/10/2026)", "outros1": {"Ronaldo Caiado": 4.0, "Romeu Zema": 3.3, "Renan Santos": 2.8, "Samara Martins": 1.6, "Augusto Cury": 1.2, "Rui Costa Pimenta": 0.9, "Outros": 0.9}}'::jsonb, now(), 'carga-verificada'),
  -- gerp-2026-08-10
  ('gerp', 'não informado na fonte', '2026-08-06', '2026-08-10', 2400, 2.0, 'BR-08045/2026',
   38, 38, 11, 43, 45, 12, 'https://www.gazetadopovo.com.br/eleicoes/2026/pesquisa-eleitoral-2026/gerp-presidente-agosto-2026/',
   'publicada', 'admin', '{"carga": "leva 2 — 03/08 a 03/10 (verificada em 16/10/2026)", "outros1": {"Renan Santos": 5, "Ronaldo Caiado": 4, "Romeu Zema": 2, "Cabo Daciolo": 1, "Augusto Cury": 1}}'::jsonb, now(), 'carga-verificada'),
  -- nexus-2026-08-09
  ('nexus', 'Banco BTG Pactual', '2026-08-07', '2026-08-09', 2001, 2.0, 'BR-08428/2026',
   40, 35, 8, 47, 44, 9, 'https://www.gazetadopovo.com.br/eleicoes/2026/pesquisa-eleitoral-2026/nexus-btg-pactual-presidente-agosto-2026-2/',
   'publicada', 'admin', '{"carga": "leva 2 — 03/08 a 03/10 (verificada em 16/10/2026)", "outros1": {"Ronaldo Caiado": 5, "Renan Santos": 4, "Romeu Zema": 3, "Samara Martins": 2, "Augusto Cury": 1, "Cabo Daciolo": 1}}'::jsonb, now(), 'carga-verificada'),
  -- poderdata-2026-08-12
  ('poderdata', 'Próprio instituto', '2026-08-09', '2026-08-12', 2400, 2.0, 'BR-06868/2026',
   41, 35, 6, 46, 45, 9, 'https://www.gazetadopovo.com.br/eleicoes/2026/pesquisa-eleitoral-2026/poderdata-presidente-pesquisa-agosto-2026/',
   'publicada', 'admin', '{"carga": "leva 2 — 03/08 a 03/10 (verificada em 16/10/2026)", "outros1": {"Ronaldo Caiado": 4, "Renan Santos": 4, "Romeu Zema": 3, "Augusto Cury": 3, "Leonardo Avalanche": 1, "Clariana Barão": 1, "Rui Costa Pimenta": 1}}'::jsonb, now(), 'carga-verificada'),
  -- quaest-2026-08-13
  ('quaest', 'Grupo Globo', '2026-08-10', '2026-08-13', 2004, 2.0, 'BR-06773/2026',
   38, 31, 18, 43, 40, 17, 'https://www.gazetadopovo.com.br/eleicoes/2026/pesquisa-eleitoral-2026/quaest-pesquisa-presidente-agosto-2026/',
   'publicada', 'admin', '{"carga": "leva 2 — 03/08 a 03/10 (verificada em 16/10/2026)", "outros1": {"Renan Santos": 4, "Ronaldo Caiado": 4, "Romeu Zema": 2, "Augusto Cury": 2, "Samara Martins": 1}}'::jsonb, now(), 'carga-verificada'),
  -- nexus-2026-08-16
  ('nexus', 'Banco BTG Pactual', '2026-08-14', '2026-08-16', 2003, 2.0, 'BR-03317/2026',
   41, 36, 7, 47, 44, 9, 'https://www.gazetadopovo.com.br/eleicoes/2026/pesquisa-eleitoral-2026/nexus-btg-pactual-presidente-agosto-2026-3/',
   'publicada', 'admin', '{"carga": "leva 2 — 03/08 a 03/10 (verificada em 16/10/2026)", "outros1": {"Ronaldo Caiado": 4, "Renan Santos": 4, "Romeu Zema": 4, "Augusto Cury": 1, "Samara Martins": 1}}'::jsonb, now(), 'carga-verificada'),
  -- verita-2026-08-20
  ('verita', 'Próprio instituto', '2026-08-16', '2026-08-20', 3840, 2.0, 'BR-04006/2026',
   39.3, 39.1, 4.2, 42.0, 47.3, 10.7, 'https://www.cnnbrasil.com.br/eleicoes/verita-lula-perde-para-flavio-no-2o-turno-com-marcal-no-pleito-ha-empate/',
   'publicada', 'admin', '{"carga": "leva 2 — 03/08 a 03/10 (verificada em 16/10/2026)", "outros1": {"Pablo Marçal": 5.2, "Renan Santos": 3.8, "Ronaldo Caiado": 3.3, "Augusto Cury": 2.2, "Romeu Zema": 1.3, "Clariana Barão": 0.8, "Samara Martins": 0.4, "Hertz Dias": 0.4, "Edmilson Costa": 0.1, "Rui Costa Pimenta": 0.1}}'::jsonb, now(), 'carga-verificada'),
  -- datafolha-2026-08-20
  ('datafolha', 'Folha de S.Paulo e Grupo Globo', '2026-08-18', '2026-08-20', 2058, 2.0, 'BR-04496/2026',
   39, 33, 10, 47, 43, 11, 'https://www.gazetadopovo.com.br/eleicoes/2026/pesquisa-eleitoral-2026/datafolha-presidente-agosto-2026/',
   'publicada', 'admin', '{"carga": "leva 2 — 03/08 a 03/10 (verificada em 16/10/2026)", "outros1": {"Ronaldo Caiado": 5, "Renan Santos": 4, "Romeu Zema": 3, "Augusto Cury": 2, "Samara Martins": 1, "Rui Costa Pimenta": 1, "Wilson Grassi": 1, "Edmilson Costa": 1}}'::jsonb, now(), 'carga-verificada'),
  -- indexa-2026-08-23
  ('indexa', 'Agência Estado', '2026-08-20', '2026-08-23', 2000, 2.2, 'BR-06366/2026',
   39, 34, 16, 46, 41, 13, 'https://www.gazetadopovo.com.br/eleicoes/2026/pesquisa-eleitoral-2026/indexa-broadcast-presidente-agosto-2026/',
   'publicada', 'admin', '{"carga": "leva 2 — 03/08 a 03/10 (verificada em 16/10/2026)", "outros1": {"Ronaldo Caiado": 5, "Renan Santos": 4, "Romeu Zema": 1, "Augusto Cury": 1}}'::jsonb, now(), 'carga-verificada'),
  -- nexus-2026-08-23
  ('nexus', 'Banco BTG Pactual', '2026-08-21', '2026-08-23', 2006, 2.0, 'BR-09028/2026',
   41, 37, 8, 46, 45, 9, 'https://www.gazetadopovo.com.br/eleicoes/2026/pesquisa-eleitoral-2026/nexus-btg-pactual-presidente-agosto-2026-4/',
   'publicada', 'admin', '{"carga": "leva 2 — 03/08 a 03/10 (verificada em 16/10/2026)", "outros1": {"Ronaldo Caiado": 5, "Renan Santos": 3, "Romeu Zema": 3, "Augusto Cury": 2, "Samara Martins": 1}}'::jsonb, now(), 'carga-verificada'),
  -- gerp-2026-08-25
  ('gerp', 'Aesp', '2026-08-21', '2026-08-25', 2400, 2.0, 'BR-03547/2026',
   37, 38, 12, 42, 47, 11, 'https://www.gazetadopovo.com.br/eleicoes/2026/pesquisa-eleitoral-2026/gerp-presidente-agosto-2026-2/',
   'publicada', 'admin', '{"carga": "leva 2 — 03/08 a 03/10 (verificada em 16/10/2026)", "outros1": {"Pablo Marçal": 4, "Renan Santos": 3, "Ronaldo Caiado": 3, "Augusto Cury": 1, "Romeu Zema": 1}}'::jsonb, now(), 'carga-verificada'),
  -- poderdata-2026-08-26
  ('poderdata', 'Próprio instituto', '2026-08-23', '2026-08-26', 2400, 2.0, 'BR-04974/2026',
   38, 35, 7, 45, 44, 11, 'https://www.gazetadopovo.com.br/eleicoes/2026/pesquisa-eleitoral-2026/poderdata-presidente-agosto-2026/',
   'publicada', 'admin', '{"carga": "leva 2 — 03/08 a 03/10 (verificada em 16/10/2026)", "outros1": {"Ronaldo Caiado": 4, "Renan Santos": 4, "Augusto Cury": 4, "Pablo Marçal": 3, "Romeu Zema": 2, "Hertz Dias": 2, "Edmilson Costa": 1, "Samara Martins": 1}}'::jsonb, now(), 'carga-verificada'),
  -- voxbrasil-2026-08-27
  ('voxbrasil', 'Próprio instituto', '2026-08-25', '2026-08-27', 2100, 2.15, 'BR-05519/2026',
   37.1, 34.8, 10.3, 44.5, 45.1, 10.4, 'https://agorarn.com.br/politica/flavio-lula-empate-segundo-turno-vox-brasil/',
   'publicada', 'admin', '{"carga": "leva 2 — 03/08 a 03/10 (verificada em 16/10/2026)", "outros1": {"Ronaldo Caiado": 5.0, "Renan Santos": 3.3, "Romeu Zema": 2.8, "Augusto Cury": 2.6, "Pablo Marçal": 2.0, "Clariana Barão": 0.8, "Edmilson Costa": 0.5, "Wilson Grassi": 0.4, "Rui Costa Pimenta": 0.2, "Hertz Dias": 0.1, "Samara Martins": 0.1}}'::jsonb, now(), 'carga-verificada'),
  -- atlasintel-2026-08-30
  ('atlasintel', 'Próprio instituto / Bloomberg', '2026-08-25', '2026-08-30', 5014, 1.0, 'BR-07972/2026',
   43.4, 33.7, 0.3, 47.1, 42.6, 10.3, 'https://www.gazetadopovo.com.br/eleicoes/2026/pesquisa-eleitoral-2026/atlasintel-presidente-agosto-2026/',
   'publicada', 'admin', '{"carga": "leva 2 — 03/08 a 03/10 (verificada em 16/10/2026)", "outros1": {"Augusto Cury": 7.8, "Renan Santos": 7.6, "Ronaldo Caiado": 3.3, "Pablo Marçal": 1.9, "Romeu Zema": 1.0, "Samara Martins": 0.9, "Rui Costa Pimenta": 0.1, "Wilson Grassi": 0.1}}'::jsonb, now(), 'carga-verificada'),
  -- nexus-2026-08-30
  ('nexus', 'Banco BTG Pactual', '2026-08-28', '2026-08-30', 2005, 2.0, 'BR-08900/2026',
   39, 33, 6, 46, 45, 9, 'https://www.gazetadopovo.com.br/eleicoes/2026/pesquisa-eleitoral-2026/nexus-btg-pactual-presidente-agosto-2026-5/',
   'publicada', 'admin', '{"carga": "leva 2 — 03/08 a 03/10 (verificada em 16/10/2026)", "outros1": {"Augusto Cury": 11, "Ronaldo Caiado": 5, "Renan Santos": 3, "Romeu Zema": 1, "Samara Martins": 1}}'::jsonb, now(), 'carga-verificada'),
  -- rtbd-2026-08-31
  ('rtbd', 'não informado na fonte', '2026-08-27', '2026-08-31', 2000, 2.0, 'BR-03490/2026',
   38, 30, 6, 44, 44, 12, 'https://www.gazetadopovo.com.br/eleicoes/2026/pesquisa-eleitoral-2026/real-time-big-data-presidente-setembro-2026/',
   'publicada', 'admin', '{"carga": "leva 2 — 03/08 a 03/10 (verificada em 16/10/2026)", "outros1": {"Augusto Cury": 11, "Renan Santos": 7, "Ronaldo Caiado": 4, "Romeu Zema": 2, "Outros": 2}}'::jsonb, now(), 'carga-verificada'),
  -- quaest-2026-10-03
  ('quaest', 'Grupo Globo', '2026-10-02', '2026-10-03', 3702, 2, 'BR-02197/2026',
   40, 38, 13, 42, 44, 14, 'https://static.poder360.com.br/uploads/2026/10/Pesquisa-Quaest_-Lula-tem-46-e-Flavio-Bolsonaro-45-_-G1.pdf',
   'publicada', 'admin', '{"carga": "leva 2 — 03/08 a 03/10 (verificada em 16/10/2026)", "outros1": {"Augusto Cury": 3, "Ronaldo Caiado": 3, "Renan Santos": 3, "Romeu Zema": 0}}'::jsonb, now(), 'carga-verificada'),
  -- palver-2026-10-03
  ('palver', 'não informado na fonte', '2026-09-30', '2026-10-03', 5000, 2.4, 'BR-00198/2026',
   43, 47, null, 44, 49, 7, 'https://terrabrasilnoticias.com/?p=496089',
   'publicada', 'admin', '{"carga": "leva 2 — 03/08 a 03/10 (verificada em 16/10/2026)", "outros1": {"Renan Santos": 7, "Augusto Cury": 1, "Ronaldo Caiado": 1, "Romeu Zema": 0}}'::jsonb, now(), 'carga-verificada'),
  -- futura-2026-10-03
  ('futura', 'Próprio instituto (100% Cidades)', '2026-10-02', '2026-10-03', 2000, 2.2, 'BR-02431/2026',
   40.5, 42.5, null, 45.1, 48, 6.9, 'https://www.moneytimes.com.br/pesquisa-futura-flavio-bolsonaro-tem-425-e-lula-405-no-primeiro-turno-gaep/',
   'publicada', 'admin', '{"carga": "leva 2 — 03/08 a 03/10 (verificada em 16/10/2026)", "outros1": {"Augusto Cury": 3.9, "Ronaldo Caiado": 3.7, "Renan Santos": 2.6, "Romeu Zema": 0.8}}'::jsonb, now(), 'carga-verificada'),
  -- datafolha-2026-10-03
  ('datafolha', 'Folha de S.Paulo e Grupo Globo', '2026-10-03', '2026-10-03', 4006, 2, 'BR-01708/2026',
   42, 40, 7, 47, 46, 8, 'https://static.poder360.com.br/uploads/2026/10/datafolha-presidente-outubro-2.pdf',
   'publicada', 'admin', '{"carga": "leva 2 — 03/08 a 03/10 (verificada em 16/10/2026)", "outros1": {"Ronaldo Caiado": 4, "Renan Santos": 3, "Augusto Cury": 3, "Romeu Zema": 0, "Samara Martins": 0, "Rui Costa Pimenta": 0, "Edmilson Costa": 0, "Wilson Grassi": 0, "Clariana Barão": 0, "Hertz Dias": 0}}'::jsonb, now(), 'carga-verificada'),
  -- poderdata-2026-10-02
  ('poderdata', 'Próprio instituto', '2026-09-30', '2026-10-02', 4000, 1.5, 'BR-03519/2026',
   42, 41, 6, 46, 46, 8, 'https://static.poder360.com.br/uploads/2026/10/Relatorio-PoderData-Eleitoral-3out26-1.pdf',
   'publicada', 'admin', '{"carga": "leva 2 — 03/08 a 03/10 (verificada em 16/10/2026)", "outros1": {"Augusto Cury": 3, "Renan Santos": 3, "Ronaldo Caiado": 2, "Rui Costa Pimenta": 1, "Romeu Zema": 1, "Samara Martins": 0, "Hertz Dias": 0, "Clariana Barão": 0, "Leonardo Avalanche": 0, "Wilson Grassi": 0, "Edmilson Costa": 0}}'::jsonb, now(), 'carga-verificada'),
  -- mda-2026-10-02
  ('mda', 'CNT', '2026-09-30', '2026-10-02', 2002, 2.2, 'BR-04756/2026',
   43.1, 38.1, 9.7, 47.3, 43.1, 9.5, 'https://tvtnews.com.br/pesquisa-cnt-mda-na-vespera-da-eleicao-1-turno/',
   'publicada', 'admin', '{"carga": "leva 2 — 03/08 a 03/10 (verificada em 16/10/2026)", "outros1": {"Augusto Cury": 3.2, "Ronaldo Caiado": 3.0, "Renan Santos": 1.5, "Romeu Zema": 0.8, "Outros (somados)": 0.5}}'::jsonb, now(), 'carga-verificada'),
  -- gerp-2026-10-02
  ('gerp', 'Próprio instituto', '2026-09-30', '2026-10-02', 2400, 2, 'BR-00509/2026',
   41, 43, 5, 44, 49, 7, 'https://static.poder360.com.br/uploads/2026/10/presidente-gerp-nacional-outubro-1.pdf',
   'publicada', 'admin', '{"carga": "leva 2 — 03/08 a 03/10 (verificada em 16/10/2026)", "outros1": {"Augusto Cury": 4, "Ronaldo Caiado": 3, "Renan Santos": 2, "Samara Martins": 1, "Edmilson Costa": 0, "Rui Costa Pimenta": 0, "Romeu Zema": 0, "Leonardo Avalanche": 0, "Hertz Dias": 0, "Wilson Grassi": 0, "Clariana Barão": 0}}'::jsonb, now(), 'carga-verificada'),
  -- atlasintel-2026-10-02
  ('atlasintel', 'Bloomberg', '2026-09-27', '2026-10-02', 4945, 1, 'BR-00999/2026',
   46.7, 43.8, 0.6, 47.6, 47.4, null, 'https://www.diariodepernambuco.com.br/politica/2026/10/11725710-atlasintel-lula-tem-47-e-flavio-bolsonaro-441-de-votos-validos-no-primeiro-turno.html',
   'publicada', 'admin', '{"carga": "leva 2 — 03/08 a 03/10 (verificada em 16/10/2026)", "outros1": {"Renan Santos": 4.6, "Augusto Cury": 2.1, "Ronaldo Caiado": 1.4, "Outros (somados)": 0.9}}'::jsonb, now(), 'carga-verificada'),
  -- voxbrasil-2026-10-01
  ('voxbrasil', 'Próprio instituto', '2026-09-29', '2026-10-01', 2100, 2.15, 'BR-00148/2026',
   40.4, 41.2, 10.2, 45.2, 48.2, 6.6, 'https://static.poder360.com.br/uploads/2026/10/RELATORIO-VOX-BRASIL-NACIONAL-8-02-10-2026-1-1.pdf',
   'publicada', 'admin', '{"carga": "leva 2 — 03/08 a 03/10 (verificada em 16/10/2026)", "outros1": {"Ronaldo Caiado": 3.3, "Renan Santos": 2.2, "Romeu Zema": 1.3, "Augusto Cury": 1.2, "Edmilson Costa": 0.2, "Wilson Grassi": 0, "Leonardo Avalanche": 0, "Clariana Barão": 0, "Rui Costa Pimenta": 0, "Hertz Dias": 0, "Samara Martins": 0}}'::jsonb, now(), 'carga-verificada'),
  -- datafolha-2026-10-01
  ('datafolha', 'Folha de S.Paulo e Grupo Globo', '2026-09-29', '2026-10-01', 2506, 2, 'BR-08039/2026',
   42, 38, 7, 48, 45, 7, 'https://tribunadejundiai.com.br/politica/eleicoes-2026/datafolha-lula-tem-42-e-flavio-bolsonaro-38-a-tres-dias-do-primeiro-turno/',
   'publicada', 'admin', '{"carga": "leva 2 — 03/08 a 03/10 (verificada em 16/10/2026)", "outros1": {"Augusto Cury": 4, "Ronaldo Caiado": 3, "Renan Santos": 3, "Romeu Zema": 1, "Samara Martins": 1, "Wilson Grassi": 1}}'::jsonb, now(), 'carga-verificada'),
  -- rtbd-2026-09-30
  ('rtbd', 'Próprio instituto', '2026-09-26', '2026-09-30', 2000, 2, 'BR-09503/2026',
   43, 39, 6, 45, 46, 9, 'https://static.poder360.com.br/uploads/2026/10/Presidencial-BR-09503-2026-Out26.pdf',
   'publicada', 'admin', '{"carga": "leva 2 — 03/08 a 03/10 (verificada em 16/10/2026)", "outros1": {"Renan Santos": 4, "Augusto Cury": 3, "Ronaldo Caiado": 3, "Romeu Zema": 1, "Outros (somados)": 1}}'::jsonb, now(), 'carga-verificada'),
  -- indexa-2026-09-29
  ('indexa', 'Agência Estado', '2026-09-27', '2026-09-29', 2000, 2.2, 'BR-00698/2026',
   39, 34, 15, 43, 42, 15, 'https://www.tribunapr.com.br/noticias/brasil/indexa-lula-lidera-1o-turno-empata-com-flavio-2o-turno/',
   'publicada', 'admin', '{"carga": "leva 2 — 03/08 a 03/10 (verificada em 16/10/2026)", "outros1": {"Ronaldo Caiado": 4, "Augusto Cury": 4, "Renan Santos": 3, "Romeu Zema": 1, "Edmilson Costa": 0, "Hertz Dias": 0, "Rui Costa Pimenta": 0, "Clariana Barão": 0, "Samara Martins": 0, "Wilson Grassi": 0, "Leonardo Avalanche": 0}}'::jsonb, now(), 'carga-verificada'),
  -- futura-2026-09-29
  ('futura', 'Apex', '2026-09-25', '2026-09-29', 2000, 2.2, 'BR-01122/2026',
   39.4, 42.2, 5, 43.5, 49.0, 7.5, 'https://static.poder360.com.br/uploads/2026/09/futuracidadeparticipacoesBR-30set2026.pdf',
   'publicada', 'admin', '{"carga": "leva 2 — 03/08 a 03/10 (verificada em 16/10/2026)", "outros1": {"Ronaldo Caiado": 4.0, "Augusto Cury": 3.8, "Renan Santos": 3.2, "Romeu Zema": 1.6, "Edmilson Costa": 0.2, "Samara Martins": 0.2, "Leonardo Avalanche": 0.1, "Rui Costa Pimenta": 0.1, "Wilson Grassi": 0.1, "Hertz Dias": 0.1}}'::jsonb, now(), 'carga-verificada'),
  -- voxbrasil-2026-09-28
  ('voxbrasil', 'Próprio instituto', '2026-09-26', '2026-09-28', 2100, 2.15, 'BR-00895/2026',
   41.1, 37.8, 10.3, 44.7, 45.2, null, 'https://exame.com/brasil/pesquisa-vox-brasil-lula-tem-411-e-flavio-bolsonaro-378-no-1o-turno/',
   'publicada', 'admin', '{"carga": "leva 2 — 03/08 a 03/10 (verificada em 16/10/2026)", "outros1": {"Ronaldo Caiado": 3.8, "Renan Santos": 2.7, "Augusto Cury": 2.2, "Romeu Zema": 1.8, "Edmilson Costa + Wilson Grassi (somados)": 0.3}}'::jsonb, now(), 'carga-verificada'),
  -- ideia-2026-09-28
  ('ideia', 'Meio', '2026-09-25', '2026-09-28', 2000, 2.2, 'BR-08706/2026',
   39.4, 38.4, 2.2, 48.5, 48.0, 3.6, 'https://static.poder360.com.br/uploads/2026/09/Pesquisa-Meio_Ideia-Setembro2_Imprensa.pdf',
   'publicada', 'admin', '{"carga": "leva 2 — 03/08 a 03/10 (verificada em 16/10/2026)", "outros1": {"Augusto Cury": 6.7, "Renan Santos": 4.5, "Ronaldo Caiado": 4.4, "Romeu Zema": 3.5, "Samara Martins": 0.4, "Clariana Barão": 0.3, "Hertz Dias": 0.3, "Wilson Grassi": 0.1, "Leonardo Avalanche": 0.1, "Rui Costa Pimenta": 0.1, "Edmilson Costa": 0.1}}'::jsonb, now(), 'carga-verificada'),
  -- gerp-2026-09-28
  ('gerp', 'Próprio instituto', '2026-09-24', '2026-09-28', 2400, 2, 'BR-03929/2026',
   40, 42, null, 43, 50, 6, 'https://www.tribunapr.com.br/eleicoes/2026/flavio-supera-lula-em-novas-simulacoes-de-1o-e-2-turnos/',
   'publicada', 'admin', '{"carga": "leva 2 — 03/08 a 03/10 (verificada em 16/10/2026)", "outros1": {"Augusto Cury": 5, "Ronaldo Caiado": 3, "Renan Santos": 3, "Romeu Zema": 1}}'::jsonb, now(), 'carga-verificada'),
  -- quaest-2026-09-27
  ('quaest', 'Grupo Globo', '2026-09-24', '2026-09-27', 2004, 2, 'BR-06520/2026',
   39, 34, 15, 42, 42, 16, 'https://portaldeprefeitura.com.br/bastidores-da-politica/pesquisa-quaest-lula-tem-39-e-flavio-bolsonaro-34-no-1o-turno/632993/',
   'publicada', 'admin', '{"carga": "leva 2 — 03/08 a 03/10 (verificada em 16/10/2026)", "outros1": {"Augusto Cury": 4, "Ronaldo Caiado": 4, "Renan Santos": 3, "Romeu Zema": 1, "Samara Martins": 0, "Clariana Barão": 0, "Edmilson Costa": 0, "Hertz Dias": 0, "Rui Costa Pimenta": 0, "Wilson Grassi": 0, "Leonardo Avalanche": 0}}'::jsonb, now(), 'carga-verificada'),
  -- palver-2026-09-27
  ('palver', 'não informado na fonte', '2026-09-24', '2026-09-27', 5000, 2.4, 'BR-02990/2026',
   44, 44, 2, 45, 47, 8, 'https://static.poder360.com.br/uploads/2026/09/pesquisa-presidencial-palver-setembro.pdf',
   'publicada', 'admin', '{"carga": "leva 2 — 03/08 a 03/10 (verificada em 16/10/2026)", "outros1": {"Renan Santos": 8, "Augusto Cury": 1, "Ronaldo Caiado": 1, "Romeu Zema": 1, "Outros (somados)": 0}}'::jsonb, now(), 'carga-verificada'),
  -- nexus-2026-09-27
  ('nexus', 'Banco BTG Pactual', '2026-09-25', '2026-09-27', 2000, 2, 'BR-07557/2026',
   42, 37, 5, 46, 44, 9, 'https://static.poder360.com.br/uploads/2026/09/Pesquisa-presidencial-BTG-Nexus-28-set-2026.pdf',
   'publicada', 'admin', '{"carga": "leva 2 — 03/08 a 03/10 (verificada em 16/10/2026)", "outros1": {"Augusto Cury": 5, "Ronaldo Caiado": 5, "Renan Santos": 4, "Romeu Zema": 1, "Samara Martins": 1, "Rui Costa Pimenta": 0, "Hertz Dias": 0, "Edmilson Costa": 0, "Wilson Grassi": 0, "Clariana Barão": 0, "Leonardo Avalanche": 0}}'::jsonb, now(), 'carga-verificada'),
  -- rtbd-2026-09-23
  ('rtbd', 'Próprio instituto', '2026-09-19', '2026-09-23', 2000, 2, 'BR-04202/2026',
   41, 37, 6, 44, 45, 11, 'https://www.cnnbrasil.com.br/eleicoes/real-time-big-data-lula-tem-41-no-1o-turno-flavio-37/',
   'publicada', 'admin', '{"carga": "leva 2 — 03/08 a 03/10 (verificada em 16/10/2026)", "outros1": {"Augusto Cury": 6, "Renan Santos": 6, "Ronaldo Caiado": 2, "Romeu Zema": 1, "Outros": 1}}'::jsonb, now(), 'carga-verificada'),
  -- poderdata-2026-09-23
  ('poderdata', 'Próprio instituto', '2026-09-20', '2026-09-23', 3000, 1.8, 'BR-01739/2026',
   41, 39, 6, 45, 46, 9, 'https://static.poder360.com.br/uploads/2026/09/Relatorio-PoderData-Eleitoral-23set26-final.pdf',
   'publicada', 'admin', '{"carga": "leva 2 — 03/08 a 03/10 (verificada em 16/10/2026)", "outros1": {"Augusto Cury": 6, "Renan Santos": 3, "Ronaldo Caiado": 2, "Romeu Zema": 1, "Samara Martins": 1, "Rui Costa Pimenta": 1, "Clariana Barão": 1}}'::jsonb, now(), 'carga-verificada'),
  -- palver-2026-09-23
  ('palver', 'Próprio instituto', '2026-09-20', '2026-09-23', 5000, 2.5, 'BR-09587/2026',
   43, 43, 2, 45, 48, 7, 'https://trademap.com.br/noticias/news-8341927',
   'publicada', 'admin', '{"carga": "leva 2 — 03/08 a 03/10 (verificada em 16/10/2026)", "outros1": {"Renan Santos": 8, "Augusto Cury": 2, "Ronaldo Caiado": 1, "Romeu Zema": 1, "Outros": 1}}'::jsonb, now(), 'carga-verificada'),
  -- futura-2026-09-23
  ('futura', '100% Cidades', '2026-09-19', '2026-09-23', 2000, 2.2, 'BR-05268/2026',
   38.4, 40.4, 5.3, 43.7, 49.4, 6.9, 'https://trademap.com.br/noticias/news-8341751',
   'publicada', 'admin', '{"carga": "leva 2 — 03/08 a 03/10 (verificada em 16/10/2026)", "outros1": {"Ronaldo Caiado": 5.7, "Augusto Cury": 5.6, "Renan Santos": 2.4, "Romeu Zema": 0.9, "Samara Martins": 0.5, "Rui Costa Pimenta": 0.3, "Leonardo Avalanche": 0.2, "Edmilson Costa": 0.1, "Hertz Dias": 0.1}}'::jsonb, now(), 'carga-verificada'),
  -- datafolha-2026-09-23
  ('datafolha', 'Folha de S.Paulo e Grupo Globo', '2026-09-22', '2026-09-23', 2002, 2, 'BR-00304/2026',
   40, 36, 7, 47, 45, 8, 'https://www.tribunapr.com.br/noticias/brasil/quatro-pontos-separam-lula-flavio-em-pesquisa-presidente/',
   'publicada', 'admin', '{"carga": "leva 2 — 03/08 a 03/10 (verificada em 16/10/2026)", "outros1": {"Augusto Cury": 5, "Ronaldo Caiado": 4, "Renan Santos": 3, "Romeu Zema": 1, "Samara Martins": 1}}'::jsonb, now(), 'carga-verificada'),
  -- atlasintel-2026-09-22
  ('atlasintel', 'Próprio instituto / Bloomberg', '2026-09-17', '2026-09-22', 5015, 1, 'BR-04739/2026',
   45.8, 43.4, 1.2, 47.7, 47.4, 4.9, 'https://tvtnews.com.br/atlas-nova-pesquisa-para-presidente-23-09/',
   'publicada', 'admin', '{"carga": "leva 2 — 03/08 a 03/10 (verificada em 16/10/2026)", "outros1": {"Renan Santos": 4.5, "Augusto Cury": 2.1, "Ronaldo Caiado": 1.3, "Romeu Zema": 0.9, "Outros": 0.8}}'::jsonb, now(), 'carga-verificada'),
  -- quaest-2026-09-20
  ('quaest', 'Grupo Globo', '2026-09-17', '2026-09-20', 2004, 2, 'BR-06004/2026',
   37, 33, 15, 41, 42, 17, 'https://www.gazetadopovo.com.br/eleicoes/2026/pesquisa-eleitoral-2026/quaest-presidente-setembro-2026-4/',
   'publicada', 'admin', '{"carga": "leva 2 — 03/08 a 03/10 (verificada em 16/10/2026)", "outros1": {"Augusto Cury": 6, "Ronaldo Caiado": 4, "Renan Santos": 3, "Romeu Zema": 1, "Samara Martins": 1}}'::jsonb, now(), 'carga-verificada'),
  -- nexus-2026-09-20
  ('nexus', 'Banco BTG Pactual', '2026-09-18', '2026-09-20', 2006, 2, 'BR-00485/2026',
   40, 37, 6, 46, 45, 8, 'https://www.moneytimes.com.br/pesquisa-btg-pactual-nexus-21-de-setembro-gaep/',
   'publicada', 'admin', '{"carga": "leva 2 — 03/08 a 03/10 (verificada em 16/10/2026)", "outros1": {"Augusto Cury": 6, "Ronaldo Caiado": 5, "Renan Santos": 3, "Romeu Zema": 1, "Samara Martins": 1}}'::jsonb, now(), 'carga-verificada'),
  -- palver-2026-09-18
  ('palver', 'Próprio instituto', '2026-09-15', '2026-09-18', 5000, 2.8, 'BR-00860/2026',
   41, 42, 2, 43, 47, 10, 'https://www.gazetadopovo.com.br/eleicoes/2026/pesquisa-eleitoral-2026/palver-presidente-setembro-2026/',
   'publicada', 'admin', '{"carga": "leva 2 — 03/08 a 03/10 (verificada em 16/10/2026)", "outros1": {"Renan Santos": 11, "Augusto Cury": 2, "Ronaldo Caiado": 1, "Outros": 1}}'::jsonb, now(), 'carga-verificada'),
  -- poderdata-2026-09-16
  ('poderdata', 'Próprio instituto', '2026-09-13', '2026-09-16', 3000, 1.8, 'BR-00360/2026',
   37, 36, 6, 44, 46, 10, 'https://static.poder360.com.br/uploads/2026/09/Relatorio-PoderData-Eleitoral-16set26.pdf',
   'publicada', 'admin', '{"carga": "leva 2 — 03/08 a 03/10 (verificada em 16/10/2026)", "outros1": {"Augusto Cury": 8, "Renan Santos": 3, "Ronaldo Caiado": 3, "Hertz Dias": 2, "Romeu Zema": 1, "Rui Costa Pimenta": 1, "Samara Martins": 1, "Clariana Barão": 1, "Pablo Marçal": 1}}'::jsonb, now(), 'carga-verificada'),
  -- gerp-2026-09-16
  ('gerp', 'Próprio instituto', '2026-09-14', '2026-09-16', 2400, 2, 'BR-00535/2026',
   37, 40, 8, 43, 50, 7, 'https://www.tribunapr.com.br/noticias/brasil/flavio-bolsonaro-tem-50-contra-43-de-lula-2-turno-pesquisa/',
   'publicada', 'admin', '{"carga": "leva 2 — 03/08 a 03/10 (verificada em 16/10/2026)", "outros1": {"Augusto Cury": 7, "Ronaldo Caiado": 3, "Renan Santos": 2, "Romeu Zema": 1, "Pablo Marçal": 1}}'::jsonb, now(), 'carga-verificada'),
  -- datafolha-2026-09-16
  ('datafolha', 'Folha de S.Paulo e Grupo Globo', '2026-09-15', '2026-09-16', 2002, 2, 'BR-04029/2026',
   39, 36, 9, 46, 44, 9, 'https://mais.opovo.com.br/jornal/politica/2026/09/18/datafolha-lula-tem-39-contra-36-de-flavio-bolsonaro-no-1-turno.html',
   'publicada', 'admin', '{"carga": "leva 2 — 03/08 a 03/10 (verificada em 16/10/2026)", "outros1": {"Augusto Cury": 6, "Ronaldo Caiado": 4, "Renan Santos": 3, "Romeu Zema": 2, "Samara Martins": 1, "Rui Costa Pimenta": 1}}'::jsonb, now(), 'carga-verificada'),
  -- atlasintel-2026-09-16
  ('atlasintel', 'Próprio instituto / Bloomberg', '2026-09-11', '2026-09-16', 5018, 1, 'BR-06221/2026',
   44.1, 41.7, 2.1, 46.8, 47.2, 6, 'https://www.moneytimes.com.br/pesquisa-atlasintel-bloomberg-17-de-setembro-gaep/',
   'publicada', 'admin', '{"carga": "leva 2 — 03/08 a 03/10 (verificada em 16/10/2026)", "outros1": {"Renan Santos": 5.1, "Augusto Cury": 3.5, "Ronaldo Caiado": 1.7, "Romeu Zema": 1.1, "Samara Martins": 0.7}}'::jsonb, now(), 'carga-verificada'),
  -- futura-2026-09-15
  ('futura', 'Próprio instituto (100% Cidades)', '2026-09-11', '2026-09-15', 2000, 2.2, 'BR-00749/2026',
   38.3, 37.7, 6.1, 43.7, 48.1, 8.2, 'https://www.cnnbrasil.com.br/eleicoes/futura-lula-tem-383-no-1o-turno-flavio-377/',
   'publicada', 'admin', '{"carga": "leva 2 — 03/08 a 03/10 (verificada em 16/10/2026)", "outros1": {"Augusto Cury": 6.5, "Ronaldo Caiado": 4.5, "Renan Santos": 3.4, "Pablo Marçal": 1.9, "Romeu Zema": 1, "Samara Martins": 0.2, "Clariana Barão": 0.1, "Edmilson Costa": 0.1, "Wilson Grassi": 0.1}}'::jsonb, now(), 'carga-verificada'),
  -- quaest-2026-09-13
  ('quaest', 'Grupo Globo', '2026-09-10', '2026-09-13', 2004, 2, 'BR-03607/2026',
   36, 31, 17, 40, 42, 18, 'https://www.gazetadopovo.com.br/eleicoes/2026/pesquisa-eleitoral-2026/quaest-presidente-setembro-2026-3/',
   'publicada', 'admin', '{"carga": "leva 2 — 03/08 a 03/10 (verificada em 16/10/2026)", "outros1": {"Augusto Cury": 7, "Renan Santos": 4, "Ronaldo Caiado": 4, "Romeu Zema": 1}}'::jsonb, now(), 'carga-verificada'),
  -- nexus-2026-09-13
  ('nexus', 'Banco BTG Pactual', '2026-09-11', '2026-09-13', 2003, 2, 'BR-04076/2026',
   42, 37, 6, 47, 46, 7, 'https://www.folhape.com.br/politica/no-1o-turno-lula-sobe-para-42-e-flavio-bolsonaro-cai-a-37-mostra/512346/',
   'publicada', 'admin', '{"carga": "leva 2 — 03/08 a 03/10 (verificada em 16/10/2026)", "outros1": {"Augusto Cury": 6, "Ronaldo Caiado": 5, "Renan Santos": 2, "Romeu Zema": 1, "Outros": 1}}'::jsonb, now(), 'carga-verificada'),
  -- mda-2026-09-13
  ('mda', 'CNT', '2026-09-09', '2026-09-13', 2002, 2.2, 'BR-06902/2026',
   40.5, 30.4, 13.5, 47.3, 40, 12.7, 'https://www.gazetadopovo.com.br/eleicoes/2026/pesquisa-eleitoral-2026/cnt-mda-presidente-setembro-2026/',
   'publicada', 'admin', '{"carga": "leva 2 — 03/08 a 03/10 (verificada em 16/10/2026)", "outros1": {"Augusto Cury": 6, "Ronaldo Caiado": 3, "Renan Santos": 2.7, "Pablo Marçal": 1.8, "Romeu Zema": 1, "Outros": 1.1}}'::jsonb, now(), 'carga-verificada'),
  -- indexa-2026-09-13
  ('indexa', 'Agência Estado', '2026-09-10', '2026-09-13', 2000, 2.2, 'BR-03482/2026',
   38, 34, 14, 43, 42, 15, 'https://www.gazetadopovo.com.br/eleicoes/2026/pesquisa-eleitoral-2026/indexa-broadcast-presidente-setembro-2026/',
   'publicada', 'admin', '{"carga": "leva 2 — 03/08 a 03/10 (verificada em 16/10/2026)", "outros1": {"Augusto Cury": 6, "Ronaldo Caiado": 4, "Renan Santos": 3, "Romeu Zema": 1}}'::jsonb, now(), 'carga-verificada'),
  -- datafolha-2026-09-10
  ('datafolha', 'Folha de S.Paulo e Grupo Globo', '2026-09-08', '2026-09-10', 2002, 2, 'BR-01833/2026',
   39, 35, 10, 46, 44, 9, 'https://www.gazetadopovo.com.br/eleicoes/2026/pesquisa-eleitoral-2026/datafolha-presidente-setembro-2026-2/',
   'publicada', 'admin', '{"carga": "leva 2 — 03/08 a 03/10 (verificada em 16/10/2026)", "outros1": {"Augusto Cury": 6, "Ronaldo Caiado": 4, "Renan Santos": 3, "Romeu Zema": 2, "Samara Martins": 1, "Rui Costa Pimenta": 1, "Edmilson Costa": 1, "Clariana Barão": 1, "Hertz Dias": 0, "Veterinário Wilson Grassi": 0}}'::jsonb, now(), 'carga-verificada'),
  -- poderdata-2026-09-09
  ('poderdata', 'Próprio instituto', '2026-09-06', '2026-09-09', 3000, 1.8, 'BR-04914/2026',
   38, 36, 4, 45, 47, 8, 'https://static.poder360.com.br/uploads/2026/09/Relatorio-PoderData-Eleitoral-9set26-1.pdf',
   'publicada', 'admin', '{"carga": "leva 2 — 03/08 a 03/10 (verificada em 16/10/2026)", "outros1": {"Augusto Cury": 10, "Renan Santos": 3, "Ronaldo Caiado": 2, "Pablo Marçal": 2, "Hertz Dias": 1, "Romeu Zema": 1, "Rui Costa Pimenta": 1, "Edmilson Costa": 1, "Clariana Barão": 0, "Samara Martins": 0, "Veterinário Wilson Grassi": 0}}'::jsonb, now(), 'carga-verificada'),
  -- atlasintel-2026-09-09
  ('atlasintel', 'Próprio instituto / Bloomberg', '2026-09-04', '2026-09-09', 5000, 1, 'BR-01452/2026',
   43, 37.4, 1, 46.2, 46.4, 7.4, 'https://www.gazetadopovo.com.br/eleicoes/2026/pesquisa-eleitoral-2026/atlasintel-presidente-setembro-2026/',
   'publicada', 'admin', '{"carga": "leva 2 — 03/08 a 03/10 (verificada em 16/10/2026)", "outros1": {"Augusto Cury": 6.6, "Renan Santos": 6.5, "Romeu Zema": 2.1, "Ronaldo Caiado": 1.1, "Samara Martins": 1.0, "Pablo Marçal": 1.0, "Clariana Barão": 0.3, "Rui Costa Pimenta": 0.0, "Veterinário Wilson Grassi": 0.0}}'::jsonb, now(), 'carga-verificada'),
  -- gerp-2026-09-08
  ('gerp', 'Próprio instituto', '2026-09-03', '2026-09-08', 2400, 2, 'BR-00251/2026',
   34, 37, 12, 40, 47, 14, 'https://www.gazetadopovo.com.br/eleicoes/2026/pesquisa-eleitoral-2026/gerp-presidente-setembro-2026/',
   'publicada', 'admin', '{"carga": "leva 2 — 03/08 a 03/10 (verificada em 16/10/2026)", "outros1": {"Augusto Cury": 6, "Ronaldo Caiado": 5, "Renan Santos": 4, "Pablo Marçal": 2, "Romeu Zema": 1, "Samara Martins": 0, "Rui Costa Pimenta": 0, "Hertz Dias": 0, "Clariana Barão": 0}}'::jsonb, now(), 'carga-verificada'),
  -- palver-2026-09-07
  ('palver', 'Próprio instituto', '2026-09-04', '2026-09-07', 5000, 2.6, 'BR-06100/2026',
   41, 40, 2, 44, 47, 9, 'https://static.poder360.com.br/uploads/2026/09/pesquisa-Palver-presidente-24set2026_compressed.pdf',
   'publicada', 'admin', '{"carga": "leva 2 — 03/08 a 03/10 (verificada em 16/10/2026)", "outros1": {"Renan Santos": 9, "Augusto Cury": 5, "Outros": 2}}'::jsonb, now(), 'carga-verificada'),
  -- nexus-2026-09-07
  ('nexus', 'Banco BTG Pactual', '2026-09-04', '2026-09-07', 2002, 2, 'BR-06790/2026',
   39, 35, 5, 45, 46, 9, 'https://www.gazetadopovo.com.br/eleicoes/2026/pesquisa-eleitoral-2026/nexus-btg-pactual-presidente-setembro-2026/',
   'publicada', 'admin', '{"carga": "leva 2 — 03/08 a 03/10 (verificada em 16/10/2026)", "outros1": {"Augusto Cury": 9, "Ronaldo Caiado": 4, "Renan Santos": 4, "Romeu Zema": 1, "Samara Martins": 1, "Rui Costa Pimenta": 1}}'::jsonb, now(), 'carga-verificada'),
  -- ideia-2026-09-07
  ('ideia', 'Meio', '2026-09-04', '2026-09-07', 1500, 2.5, 'BR-07935/2026',
   38.4, 37.3, 5.3, 46, 46, 8, 'https://static.poder360.com.br/uploads/2026/09/Pesquisa-Meio_Ideia-Setembro-IMPRENSA.pdf',
   'publicada', 'admin', '{"carga": "leva 2 — 03/08 a 03/10 (verificada em 16/10/2026)", "outros1": {"Augusto Cury": 6.6, "Renan Santos": 4.0, "Ronaldo Caiado": 4.0, "Romeu Zema": 1.5, "Pablo Marçal": 1.5, "Samara Martins": 0.7, "Rui Costa Pimenta": 0.4, "Veterinário Wilson Grassi": 0.2, "Hertz Dias": 0.1, "Clariana Barão": 0.1, "Edmilson Costa": 0.1}}'::jsonb, now(), 'carga-verificada'),
  -- poderdata-2026-09-02
  ('poderdata', 'Próprio instituto', '2026-08-30', '2026-09-02', 3000, 1.8, 'BR-07561/2026',
   37, 34, 7, 44, 45, 11, 'https://static.poder360.com.br/uploads/2026/09/Relatorio-PoderData-Eleitoral-2set26.pdf',
   'publicada', 'admin', '{"carga": "leva 2 — 03/08 a 03/10 (verificada em 16/10/2026)", "outros1": {"Augusto Cury": 10, "Renan Santos": 3, "Ronaldo Caiado": 2, "Pablo Marçal": 2, "Hertz Dias": 2, "Romeu Zema": 1, "Edmilson Costa": 1, "Samara Martins": 1, "Clariana Barão": 1, "Rui Costa Pimenta": 1, "Veterinário Wilson Grassi": 0}}'::jsonb, now(), 'carga-verificada'),
  -- datafolha-2026-09-02
  ('datafolha', 'Folha de S.Paulo e Grupo Globo', '2026-09-01', '2026-09-02', 2002, 2, 'BR-03669/2026',
   38, 33, 9, 46, 44, 11, 'https://www.gazetadopovo.com.br/eleicoes/2026/pesquisa-eleitoral-2026/datafolha-presidente-setembro-2026/',
   'publicada', 'admin', '{"carga": "leva 2 — 03/08 a 03/10 (verificada em 16/10/2026)", "outros1": {"Augusto Cury": 8, "Ronaldo Caiado": 4, "Renan Santos": 3, "Romeu Zema": 2, "Samara Martins": 1, "Edmilson Costa": 1, "Rui Costa Pimenta": 1, "Veterinário Wilson Grassi": 0, "Clariana Barão": 0, "Hertz Dias": 0}}'::jsonb, now(), 'carga-verificada'),
  -- quaest-2026-09-01
  ('quaest', 'Grupo Globo', '2026-08-30', '2026-09-01', 2004, 2, 'BR-07065/2026',
   37, 29, 18, 42, 41, 17, 'https://www.gazetadopovo.com.br/eleicoes/2026/pesquisa-eleitoral-2026/quaest-presidente-setembro-2026/',
   'publicada', 'admin', '{"carga": "leva 2 — 03/08 a 03/10 (verificada em 16/10/2026)", "outros1": {"Augusto Cury": 10, "Renan Santos": 3, "Ronaldo Caiado": 1, "Romeu Zema": 1, "Samara Martins": 1}}'::jsonb, now(), 'carga-verificada'),
  -- futura-2026-09-01
  ('futura', 'Apex', '2026-08-27', '2026-09-01', 2000, 2.2, 'BR-02793/2026',
   38.7, 33.6, 6.1, 45.6, 45.2, 9.2, 'https://static.poder360.com.br/uploads/2026/09/pesquisaFutura-nacional-presidente-3set2026.pdf',
   'publicada', 'admin', '{"carga": "leva 2 — 03/08 a 03/10 (verificada em 16/10/2026)", "outros1": {"Augusto Cury": 9.9, "Ronaldo Caiado": 3.5, "Renan Santos": 2.8, "Pablo Marçal": 2.7, "Romeu Zema": 1.6, "Samara Martins": 0.4, "Rui Costa Pimenta": 0.3, "Veterinário Wilson Grassi": 0.3, "Hertz Dias": 0.1}}'::jsonb, now(), 'carga-verificada')
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
  'carga-verificada (migração 0006)', 'inclusao_manual', 'pesquisa', c.id::text,
  jsonb_build_object(
    'instituto_id', c.instituto_id, 'contratante', c.contratante,
    'campo_inicio', c.campo_inicio, 'campo_fim', c.campo_fim,
    'amostra', c.amostra, 'moe', c.moe, 'tse', c.tse,
    't1_lula', c.t1_lula, 't1_flavio', c.t1_flavio, 't1_bnns', c.t1_bnns,
    't2_lula', c.t2_lula, 't2_flavio', c.t2_flavio, 't2_bnns', c.t2_bnns,
    'fonte', c.fonte_url, 'origem', c.origem
  )
from carga c;
