# DECISÕES

Registro de decisões ambíguas (R6): contexto → decisão → porquê. Uma linha por decisão.

- Scaffold em diretório não-vazio → `create-next-app` rodou em pasta temporária e o resultado
  foi movido para a raiz (excluindo stubs de README/CLAUDE/AGENTS) → o CLI recusa diretórios com
  arquivos; o protótipo .jsx precisa permanecer na raiz como fonte da verdade.
- R8 cita `src/data/seed.json` → o seed local canônico são os arquivos
  `src/data/pesquisas.seed.json` + `institutos.seed.json` (nomes da Fase 0.2, mais específicos)
  → evita duplicar a mesma informação em dois arquivos; `dados.ts` importa direto deles.
- Protótipo lista "Aécio Neves 2%" em `outros1` da Quaest-jun, mas Aécio não está em
  `CANDIDATOS` → preservado exatamente como está (o ranking "todos os candidatos" só consulta
  nomes de CANDIDATOS, como no protótipo) → fidelidade ao comportamento original; não é bug do
  modelo, é dado bruto além do ranking.
- `server-only` instalado como dependência de runtime (não dev) → o pacote é importado por
  módulos bundlados em produção; em devDependencies quebraria `pnpm install --prod`.
- Prototipo usa `.jsx` com fontes via Google CSS import → produção usa `next/font` self-host
  (exigência da Fase 1; sem request a terceiros em runtime).
