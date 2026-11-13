# Atas+

Aplicativo para as alas planejarem os cinco domingos do mês, manterem a lista de membros e
gerarem a ata de cada reunião pronta para impressão em uma folha A4.

**Stack:** Next.js 16 (App Router), React 19, TypeScript, Neon (Postgres + Neon Auth),
Tailwind CSS v4 + CSS Modules, Vitest + Testing Library.

Desenvolvido por [Solid Solutions](https://solidsolutionsdigital.com.br).

## Como rodar

```bash
npm install
Copy-Item .env.example .env.local   # ajuste as variáveis
npm run dev                          # http://localhost:3000
```

| Comando                | O que faz                                       |
| ---------------------- | ----------------------------------------------- |
| `npm run dev`          | Servidor de desenvolvimento                     |
| `npm run build`        | Gera a versão de produção                       |
| `npm run start`        | Roda a versão de produção localmente            |
| `npm run lint`         | Verifica o código com ESLint                    |
| `npm run typecheck`    | Gera os tipos das rotas e verifica o TypeScript |
| `npm test`             | Roda os testes automatizados (Vitest)           |
| `npm run test:watch`   | Testes em modo observação                       |
| `npm run format`       | Formata o projeto com Prettier                  |
| `npm run format:check` | Confere se a formatação está em dia             |

## Variáveis de ambiente

| Variável                  | Para que serve                                        |
| ------------------------- | ----------------------------------------------------- |
| `DATABASE_URL`            | Conexão Postgres do branch Neon                       |
| `NEON_AUTH_BASE_URL`      | URL do Neon Auth do mesmo branch                      |
| `NEON_AUTH_COOKIE_SECRET` | Segredo local para os cookies (32 caracteres ou mais) |

Nunca versione valores reais; use somente o `.env.local`.

## Banco de dados

Ative o Neon Auth no projeto com `neon.ts` e aplique as migrações em ordem:

1. [`db/migrations/001_initial.sql`](./db/migrations/001_initial.sql) — alas, vínculos, convites e
   planejamentos.
2. [`db/migrations/002_ward_people.sql`](./db/migrations/002_ward_people.sql) — membros
   reutilizáveis de cada ala.
3. [`db/migrations/003_invitation_membership_link.sql`](./db/migrations/003_invitation_membership_link.sql)
   — associa o vínculo ao convite aceito, permitindo desvincular o acesso.

## Estrutura de pastas

```
src/
  app/                 Rotas do App Router (as páginas só montam as features)
    (app)/             Telas internas: exigem login e ala, compartilham cabeçalho e rodapé
      page.tsx         Planejamento mensal (/)
      ala/             Membros e administradores da ala (/ala)
      admin/wards/     Resumo das alas cadastradas (/admin/wards)
    auth/              Entrar e criar conta
    onboarding/        Primeiro acesso: criar a ala ou aceitar convite
    api/               Rotas da API: validam, chamam o repositório e respondem
    icon.svg           Símbolo do Atas+ (aba do navegador)
  features/            Fluxos de negócio, cada um com components/ e hooks/
    planning/          Planejamento: mês, domingos, campos com autocomplete, salvar
    minutes/           Ata: folha A4, ajuste da fonte e impressão
    people/            Membros reutilizáveis: cadastrar, buscar, renomear, excluir
    ward/              Ala: moldura das telas, conta, convites, primeiro acesso
    auth/              Formulários de login e cadastro
  components/          Peças visuais compartilhadas, sem regra de negócio
    brand/             Logo
    layout/            Cabeçalho, rodapé, título de página, telas de acesso
    ui/                Botão, campo, cartão, alerta, diálogo de confirmação, ícones...
  lib/                 Regras e acesso a dados, por domínio
    meeting/           Datas, domingos, validação do planejamento, seções da ata
    people/            Extração e validação de nomes
    ward/              Papéis, convites, sessão/vínculo (membership.ts)
    text/              Busca sem acentos e sugestões de autocomplete
    api/               Respostas padrão da API e cliente fetch do navegador
    database/          Cliente SQL do Neon
    auth/              Neon Auth (servidor e cliente)
  content/site.ts      Textos institucionais: marca, navegação, crédito do estúdio
  data/                Dados estáticos: funções fixas de cada domingo e hinário
  styles/              tokens.css (cores, tipografia, espaços) e base.css (reset e impressão)
  types/               Tipos compartilhados do domínio
  tests/               setup.ts, unit/ (regras) e components/ (telas)
```

### Convenções

- **Uma responsabilidade por arquivo.** Páginas coordenam; regras ficam em `lib/` ou nos hooks da
  feature; componentes só apresentam.
- **Servidor x navegador.** Os `index.ts` de `lib/` exportam apenas código seguro para o navegador.
  Arquivos `*-repository.ts` e `lib/ward/membership.ts` acessam o banco e só podem ser importados em
  rotas da API.
- **Toda rota da API passa por um guard** (`requireUser`, `requireMembership` ou `requireLeader`) e
  toda query filtra pela ala do usuário.
- **Visual centralizado.** Cores, fontes, espaçamentos e bordas ficam em `src/styles/tokens.css`.
  Estilos de componente ficam em CSS Modules ao lado do componente; Tailwind só para utilitários
  simples.
- **Textos em português do Brasil**, com mensagens de erro claras e dados preservados na tela quando
  algo falha.
- **Funções do domingo** (rótulo, seção, tipo de campo e se cadastram membros) são definidas em um
  único lugar: `src/data/meeting-roles.ts`.

## Fluxo do produto

**Acesso.** O primeiro cadastro cria a ala e atribui o papel de líder. Em "Ala e membros", o líder
convida administradores pelo e-mail e envia o link de cadastro exibido na tela; a pessoa cria a
própria senha com o e-mail convidado e aceita o convite no primeiro acesso. O líder pode desvincular
administradores (o histórico é preservado), excluir registros desvinculados e excluir a ala
digitando o nome exato. Administradores podem sair da ala pelo menu da conta.

**Planejamento.** A tela abre no próximo domingo do calendário. Cada domingo mostra quantos campos
estão preenchidos; o painel lateral indica se há alterações não salvas e concentra as ações de
salvar, ver a ata e limpar o domingo. Trocar de mês com alterações pendentes pede confirmação.

**Membros reutilizáveis.** Cada ala tem a própria lista, usada no autocomplete das designações.
Além do cadastro manual, ao salvar o planejamento os nomes digitados em Presidida, Dirigida,
Reconhecimentos, Regente, Organista, orações e oradores entram automaticamente na lista, sem
duplicar nomes (maiúsculas e minúsculas são ignoradas). O texto entre parênteses é descartado e
várias pessoas no mesmo campo podem ser separadas por `&`, `/`, `;` ou quebra de linha. Trechos com
números ou longos demais para um nome não são cadastrados. Renomear ou excluir um membro não altera
planejamentos e atas já salvos.

**Ata.** Mostra o nome da ala, a data e somente os campos preenchidos, em uma única folha A4 cuja
fonte é ajustada automaticamente para ocupar a página sem criar uma segunda folha.
