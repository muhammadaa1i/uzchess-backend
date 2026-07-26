# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run start:dev        # run with watch mode (primary dev loop)
npm run start:debug      # watch mode + --inspect-brk
npm run build             # nest build (swc)
npm run lint              # eslint --fix over src,apps,libs,test

npm run test              # jest, all *.spec.ts under src
npm run test:watch
npm run test:cov
npx jest path/to/file.spec.ts          # run a single test file
npx jest -t "test name"                # run tests matching a name
npm run test:e2e         # jest --config ./test/jest-e2e.json

npm run generate         # nest build && typeorm migration:generate (writes to src/migrations)
npm run migrate          # nest build && typeorm migration:run
npm run revert           # typeorm migration:revert
```

There are currently no `*.spec.ts` files in the repo despite Jest being fully configured — don't assume test coverage exists for a feature just because the tooling is present.

Migration commands operate on the **built** output (`dist/src/data-source.js`), so `nest build` must succeed first — the npm scripts already do this for you.

## Environment

Config comes from `.env` (gitignored) via `process.loadEnvFile()` in `src/env.ts`. Required vars: `DATABASE_URL`, `JWT_SECRET` (see `.env.example`).

`src/env.ts` must stay the *first* import in both `src/main.ts` and `src/data-source.ts`. `src/core/configs/typeorm.config.ts` reads `process.env.DATABASE_URL` at module-evaluation time (not inside a factory), so if anything imports the TypeORM config before `env.ts` has run, `DATABASE_URL` will be `undefined`.

## Architecture

NestJS 11, CQRS (`@nestjs/cqrs`), TypeORM using the **Active Record** pattern (entities extend `BaseModel` in `src/core/base.model.ts` and call static methods directly, e.g. `Author.create(...)`, `Author.save(...)`, `User.findOne(...)` — there are no repository/service classes).

### Feature-slice layout

Each CRUD operation is its own vertical slice, not grouped by technical layer:

```
features/<domain>/<entity>/
  <entity>.controller.ts
  <entity>.module.ts
  commands/<action>-<entity>/
    <action>-<entity>.command.ts   # plain constructor-arg data
    <action>-<entity>.handler.ts   # @CommandHandler, does the work
    <action>-<entity>.request.ts   # HTTP DTO, class-validator decorators
    <action>-<entity>.response.ts  # output DTO, class-transformer @Expose()
  queries/<query-name>/            # same shape, @QueryHandler
```

Controllers only depend on `CommandBus`/`QueryBus` — they build a Command/Query from the Request DTO and dispatch it. Handlers construct the Response DTO via `plainToInstance(ResponseCls, entity, { excludeExtraneousValues: true })`, so **every field that should appear in a response must be explicitly `@Expose()`d** on the Response DTO or it will be silently dropped.

Guard-clause exceptions live in `src/core/exceptions/`: `DoesNotExistException.ThrowIfNull/ThrowIf` (404) and `AlreadyExistException.ThrowIf` (409), used inline in handlers instead of manual `if/throw`.

### Domain modules

- `features/auth` — `User`/`Role`/`Permission` entities plus join tables `UserRole`, `RolePermission`, `UserPermission` (the last two allow both role-derived permissions and direct per-user allow/deny overrides). `login.handler.ts` signs a JWT with `{ id, roles: Role[] }`.
- `features/library` — the catalog domain: `author`, `category`, `difficulty`, `book`, `languages`, `rating` slices, with entities under `entities/<name>/<name>.entity.ts`. `Book` belongs to one `Category`/`Difficulty`/`Language` and has many `BookAuthor` (join entity for the author m:n); `Rating` is a unique `(bookId, userId)` score row cascading on delete from both `Book` and `User`. This whole domain was `features/book` until the most recent commit, which renamed it to `library` and filled in the `book`/`languages`/`rating` slices — don't trust stale mental models of this path from before that commit.
- `features/common` — currently just the `CoursesCategory` entity (`features/common/entity/courses-category.entity.ts`) and an empty `course.module.ts`/`CommonModule` scaffold with no controllers or handlers yet. (Despite the name, `Language` lives under `features/library/entities/languages`, not here.)

### Request pipeline / guards

Three global `APP_GUARD`s run in this order (registration order in `app.module.ts` is execution order): `AuthGuard` → `RoleGuard` → `PermissionGuard`. `RoleGuard` and `PermissionGuard` both rely on `AuthGuard` having populated `req.user` (`{ id, roles: Role[] }`, see `src/core/types/jwt-user.ts`).

Decorators: `@Public()` marks a route to skip enforcement, `@Roles(Role.Admin, ...)` (checked by `RoleGuard`), `@PermissionDecorator('resource:action')` (checked by `PermissionGuard`, which caches the resolved permission set per user in `cache-manager` under key `permission:<userId>`).

File uploads go through `multerStorageOptions()` (`src/core/configs/multer.config.ts`), which writes into `uploads/<destination>/` with a randomized filename and an extension allowlist; `main.ts` serves that directory statically at `/uploads/`.

Swagger UI is mounted at `/swagger` (`src/core/configs/swagger.config.ts`), using bearer auth.

Path alias `@/*` maps to `src/*` (see `tsconfig.json`); imports in this codebase inconsistently mix `@/...` and relative paths — prefer `@/...` for new code to match the majority.
