# Marca e identidade — o que a licença NÃO cobre

O código deste repositório é licenciado sob a **AGPL-3.0** (ver `LICENSE`). A licença
cobre o CÓDIGO — e deliberadamente **não concede** nenhum direito sobre:

- o nome **PONTEIRO**;
- o logotipo (o "P" com a agulha) e qualquer peça de `public/brand/`;
- o domínio **oponteiro.com.br** e a identidade visual do site.

Amparo: cláusula 7(e) da AGPL-3.0, que permite recusar a concessão de direitos de
publicidade/marca.

## O que isso significa para um fork

Você PODE: usar, estudar, modificar e rodar este código, inclusive como serviço —
**publicando o código-fonte modificado**, como a AGPL §13 exige.

Você NÃO PODE: manter o nome PONTEIRO, o logotipo ou qualquer elemento que sugira
afiliação ou endosso dos autores. Fork = nome novo + marca nova. Em especial: um fork
que altere o modelo estatístico e mantenha a aparência deste site induz o público a
erro sobre a origem dos números — remova a marca por inteiro.

## Por que isso importa aqui

Este é um agregador de pesquisas ELEITORAIS. A confiança do leitor está ancorada no
nome e na auditabilidade da versão canônica (`main` deste repositório, com testes
numéricos de tolerância 1e-9 em `tests/modelo.golden.test.ts`). Quem quiser verificar
se um site é "o PONTEIRO de verdade" compara com este repositório.
