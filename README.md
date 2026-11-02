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
[`db/migrations/002_ward_people.sql`](./db/migrations/002_ward_people.sql).
Depois, inicie o app:

```bash
npm run dev
```

O primeiro cadastro cria a ala e atribui o papel de líder. O líder pode
registrar convites para administradores. O convidado deve criar a conta usando
o e-mail convidado e aceitar o convite na tela inicial.

No cabeçalho, o nome da ala e o papel atual ficam disponíveis no menu da
conta. Administradores podem sair da ala. O líder pode excluir a ala
confirmando o nome exato; essa exclusão remove os planejamentos, membros e
convites associados.

## Validação

```bash
npm run lint
npm run build
```
