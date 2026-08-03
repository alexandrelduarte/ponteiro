-- Correção de segurança (achado da revisão da Fase 2, ameaça A7):
-- a policy `audit_transparencia` expunha a coluna `ator` (e-mail do admin) a qualquer
-- portador da anon key. O feed público de transparência não precisa do e-mail — apenas
-- do evento. A tabela volta a ser ilegível para anon e a leitura pública passa por uma
-- view que projeta somente colunas publicáveis.

drop policy if exists audit_transparencia on public.audit_log;

-- security_invoker = off (padrão do Postgres): a view executa com os direitos do dono
-- (postgres), atravessando o RLS da tabela-base DE PROPÓSITO — é exatamente o recorte
-- de colunas/linhas que queremos público. Nenhuma coluna sensível é projetada.
create view public.audit_publico as
select id, em, acao, entidade, entidade_id, detalhes
from public.audit_log
where acao in ('aprovacao', 'inclusao_manual', 'remocao');

grant select on public.audit_publico to anon, authenticated;
