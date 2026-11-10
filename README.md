# Atas+

Aplicativo para planejar reuniões e gerar atas por ala.

## Desenvolvimento

Instale as dependências e copie as variáveis de ambiente:

```bash
npm install
Copy-Item .env.example .env.local
```

Configure no `.env.local`:

- `DATABASE_URL`: conexão Postgres do branch Neon.
- `NEON_AUTH_BASE_URL`: URL do Neon Auth do mesmo branch.
- `NEON_AUTH_COOKIE_SECRET`: segredo local com pelo menos 32 caracteres.

Ative o Neon Auth no projeto com `neon.ts` e aplique as migrações em ordem:
[`db/migrations/001_initial.sql`](./db/migrations/001_initial.sql) e
[`db/migrations/002_ward_people.sql`](./db/migrations/002_ward_people.sql) e
[`db/migrations/003_invitation_membership_link.sql`](./db/migrations/003_invitation_membership_link.sql).
Essa última migração associa o membro ao convite aceito, permitindo que o líder
desvincule o acesso posteriormente.
Depois, inicie o app:

```bash
npm run dev
```

O primeiro cadastro cria a ala e atribui o papel de líder. O líder pode registrar convites para administradores. Após registrar o convite,
envie à pessoa o link de cadastro exibido na tela. Ela deverá criar a própria
senha usando o e-mail convidado e aceitar o convite na tela inicial. O link
geral do site abre o login e só funciona depois que a conta já foi criada.

No cabeçalho, o nome da ala e o papel atual ficam disponíveis no menu da
conta. Usuários autenticados podem consultar o resumo das alas cadastradas,
sem acessar seus planejamentos. Administradores podem sair da ala. O líder
visualiza os convites e membros da própria ala e pode desvincular
administradores; essa ação revoga o acesso e preserva o histórico. Registros
desvinculados também podem ser excluídos da lista, sem excluir a conta de login.
O líder
também pode excluir a ala confirmando o nome exato; essa exclusão remove os
planejamentos, membros e convites associados.

## Membros reutilizáveis

Cada ala tem a própria lista de membros, usada no autocomplete das
designações. Além do cadastro manual, ao salvar o planejamento os nomes
digitados em Presidida, Dirigida, Reconhecimentos, Regente, Organista,
orações e oradores são adicionados automaticamente à lista, sem duplicar
nomes já existentes (maiúsculas e minúsculas são ignoradas). O texto entre
parênteses é descartado e várias pessoas no mesmo campo podem ser separadas
por `&`, `/`, `;` ou quebra de linha. Trechos com números ou longos demais
para um nome, como frases de reconhecimento, não são cadastrados.

Líder e administradores podem buscar, renomear e excluir membros da lista
da própria ala. Planejamentos e atas já salvos guardam o texto digitado e
não são alterados por essas ações.

## Validação

```bash
npm run lint
npm run build
```
