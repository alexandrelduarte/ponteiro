-- 0004: pontos retroativos do gráfico de chance no tempo (/historico).
--
-- 1) `model_runs.gatilho` ganha 'retroativo': snapshot recalculado DEPOIS,
--    para uma data passada, usando só as pesquisas com campo encerrado até
--    ela (rodarModelo é puro/determinístico — DECISOES.md, missão da série
--    retroativa). Nunca se apresenta como registro ao vivo: o gráfico o
--    desenha tracejado e a copy o declara.
-- 2) `audit_log.acao` ganha 'reconstituicao': o ato de apagar e regravar o
--    conjunto retroativo é auditado (intervalo + nº de pontos).
-- 3) Índice único parcial: a idempotência do backfill é delete+insert, e o
--    índice é o guarda contra execução CONCORRENTE duplicar o mesmo dia
--    (vira erro 23505 visível, não duplicata silenciosa).
--
-- RLS intocada: `runs_publicos` (select using true) já cobre a leitura dos
-- retroativos, e continua NÃO existindo policy de escrita (R2).

alter table public.model_runs
  drop constraint model_runs_gatilho_check;
alter table public.model_runs
  add constraint model_runs_gatilho_check
  check (gatilho in ('cron','aprovacao','manual','deploy','retroativo'));

alter table public.audit_log
  drop constraint audit_log_acao_check;
alter table public.audit_log
  add constraint audit_log_acao_check
  check (acao in ('auto_insercao','aprovacao','rejeicao','inclusao_manual',
                  'edicao','remocao','reconstituicao'));

create unique index model_runs_retroativo_unico
  on public.model_runs (executado_em)
  where gatilho = 'retroativo';
