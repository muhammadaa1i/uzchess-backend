# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run start:dev        # run with watch mode (primary dev loop) — auto-opens the Swagger tabs in the browser once on boot
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
npm run migrate           # nest build && typeorm migration:run
npm run revert            # typeorm migration:revert
```

Unit coverage is colocated `*.spec.ts` files next to the handler/controller/util they test (e.g. `create-book.handler.spec.ts` beside `create-book.handler.ts`), mocking the Active Record statics rather than hitting a real DB — not every handler has one, so check before assuming coverage exists for a given slice.

Migration commands operate on the **built** output (`dist/src/data-source.js`), so `nest build` must succeed first — the npm scripts already do this for you.

## Environment

Config comes from `.env` (gitignored) via `process.loadEnvFile()` in `src/env.ts`. There is no `.env.example` checked in. Required vars, inferred from usage:

- `DATABASE_URL` — Postgres connection string (`src/core/configs/typeorm/typeorm.config.ts`)
- `JWT_SECRET` — signs/verifies auth tokens (`app.module.ts` `JwtModule.register`)
- `PORT` — optional, defaults to `8000` (`src/main.ts`)
- `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `R2_PUBLIC_URL` — Cloudflare R2 object storage (`src/core/configs/r2/r2.config.ts`)
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` — outbound email for the profile email-verification/change flows (`src/core/configs/mail/mail.config.ts`, nodemailer)

`src/env.ts` must stay the *first* import in `src/main.ts` and `src/data-source.ts`. `src/core/configs/typeorm/typeorm.config.ts` reads `process.env.DATABASE_URL` at module-evaluation time (not inside a factory), so if anything imports the TypeORM config before `env.ts` has run, `DATABASE_URL` will be `undefined`.

## Architecture

NestJS 11, CQRS (`@nestjs/cqrs`), TypeORM using the **Active Record** pattern (entities extend `BaseModel` in `src/core/base.model.ts` and call static methods directly, e.g. `Author.create(...)`, `Author.save(...)`, `User.findOne(...)` — there are no repository/service classes).

### Feature-slice layout

Each CRUD operation is its own vertical slice, not grouped by technical layer:

```
features/<domain>/<entity>/
  <entity>.controller.ts
  <entity>.module.ts
  <entity>.cache.ts               # cache key constants for this slice (optional, read-heavy slices only)
  commands/<action>-<entity>/
    <action>-<entity>.command.ts   # plain constructor-arg data
    <action>-<entity>.handler.ts   # @CommandHandler, does the work
    <action>-<entity>.request.ts   # HTTP DTO, class-validator decorators
    <action>-<entity>.response.ts  # output DTO, class-transformer @Expose()
  queries/<query-name>/            # same shape, @QueryHandler
```

Controllers only depend on `CommandBus`/`QueryBus` — they build a Command/Query from the Request DTO and dispatch it. Handlers construct the Response DTO via `plainToInstance(ResponseCls, entity, { excludeExtraneousValues: true })`, so **every field that should appear in a response must be explicitly `@Expose()`d** on the Response DTO or it will be silently dropped.

Guard-clause exceptions live in `src/core/exceptions/`: `DoesNotExistException.ThrowIfNull/ThrowIf` (404) and `AlreadyExistException.ThrowIf` (409), used inline in handlers instead of manual `if/throw`.

Read-heavy slices (`author`, `book`, `category`, `difficulty`, `languages` under `library`) define a `<entity>.cache.ts` exporting cache-key constants/builders (e.g. `AUTHORS_LIST_CACHE_KEY`, `authorByIdCacheKey(id)`) used with `cache-manager` in query handlers; write handlers for the same entity must invalidate those same keys.

### Domain modules

- `features/auth` — `User`/`Role`/`Permission` entities plus join tables `UserRole`, `RolePermission`, `UserPermission` (the last two allow both role-derived permissions and direct per-user allow/deny overrides). `login.handler.ts` signs a short-lived (`15m`) access JWT with `{ id, roles: Role[] }`, plus an opaque `RefreshToken` (sha256-hashed, 30-day expiry, stored in `entities/refresh-token.entity.ts`). `POST /auth/refresh` (`@Public()`) validates and rotates the refresh token (revokes the old row, issues a new one) and signs a fresh access token; `logout.handler.ts` revokes all of the caller's active `RefreshToken` rows (the access token itself is left to expire naturally). The `profile` slice (change email/password, verify email, resend/confirm codes) uses its `profile.cache.ts` for a different purpose than the read-cache slices below: it stores short-TTL pending-verification state (`changeEmailCacheKey`, `verifyEmailCacheKey`, plus separate `*CooldownCacheKey` keys) in `cache-manager` instead of caching a read, and delivers codes through `mailTransporter` (`src/core/configs/mail`).
- `features/library` — the book catalog domain: `author`, `book`, `cart`, `category`, `coupon`, `delivery-setting`, `difficulty`, `favourite`, `languages`, `order`, `rating` slices, with entities under `entities/<name>/<name>.entity.ts`. `Book` belongs to one `Category`/`Difficulty`/`Language` and has many `BookAuthor` (join entity for the author m:n); `Rating`/`Favourite`/`CartItem` are unique `(bookId, userId)`-style rows cascading on delete from both `Book` and `User`. `POST /orders/checkout` turns the caller's cart into an `Order` (with `OrderItem` rows, `OrderStatus` enum defaulting to `Processing`), pricing it via `cart/cart-pricing.util.ts`'s `resolveCoupon()` (looks up an active, non-expired `Coupon` by code, computes a `Percent`- or fixed-amount discount) plus the singleton `DeliverySetting` row's flat `fee`; `PATCH /orders/:id/status` is `@Roles(Role.Admin)`-gated. `coupon` and `delivery-setting` are otherwise plain admin-managed CRUD slices consumed only through that pricing util, not imported directly by other slices.
- `features/common` — the course domain: `category`, `certificate`, `courses`, `favourite`, `lesson`, `progress`, `purchase`, `rating`, `section` slices, entities under `entities/<name>/<name>.entity.ts`. `Course` belongs to one `CoursesCategory`/`Difficulty`/`Language` (the latter two reused from `features/library/entities`), has many `CourseAuthor` and `CourseSection` (ordered, cascades to many ordered `CourseLesson`, which carries `video`/`thumbnail` R2 URLs, `duration`, `isFree`). `CoursePurchase`, `LessonProgress`, and `Certificate` are all unique `(courseId|lessonId, userId)` rows cascading on delete from both the course/lesson and `User`. `certificate` splits public vs. authenticated concerns into two sibling controllers in one module — `certificate.controller.ts` (authenticated) and `certificate-verify.controller.ts` (`@Public() GET certificates/:code/verify`); `certificate-pdf.generator.ts` rasterizes `assets/certificate/template.svg` with `sharp`, masks out the template's baked-in example name/date/QR regions, and draws the real name/course/date plus a generated QR (`qrcode`) on top using `pdf-lib`.
- Both domains independently define `Category`, `Rating`, and `Favourite` slices/modules for their own entity (book vs. course) with the same class names — importers alias them (`import { CategoryModule as BookCategoryModule } ...` / `... as CourseCategoryModule`) to avoid collisions. Follow this convention when wiring a new cross-domain import.

### Request pipeline / guards

Three global `APP_GUARD`s run in this order (registration order in `app.module.ts` is execution order): `AuthGuard` → `RoleGuard` → `PermissionGuard`. `RoleGuard` and `PermissionGuard` both rely on `AuthGuard` having populated `req.user` (`{ id, roles: Role[] }`, see `src/core/types/jwt-user.ts`).

Decorators: `@Public()` marks a route to skip enforcement, `@Roles(Role.Admin, ...)` (checked by `RoleGuard`), `@PermissionDecorator('resource:action')` (checked by `PermissionGuard`, which caches the resolved permission set per user in `cache-manager` under key `permission:<userId>`).

File uploads go through `multerStorageOptions()` (`src/core/configs/multer/multer.config.ts`), which streams the file directly to **Cloudflare R2** (not local disk) via a custom `StorageEngine` and returns a public R2 URL as `file.path`; there's no static file serving in `main.ts`. `FileCleanupInterceptor` (`src/core/interceptors/file-cleanup.interceptor.ts`) deletes any files already uploaded to R2 if the route handler throws afterward. `LessonFilesInterceptor` (`src/core/interceptors/lesson-files.interceptor.ts`) is a preconfigured `FileFieldsInterceptor` for lesson `video`+`thumbnail` uploads specifically. New interceptors belong in `src/core/interceptors/`.

Swagger is split into three independently-mounted docs, defined in `src/core/configs/swagger/swagger-doc-groups.ts` and built by `swagger-document.builder.ts` (one `SwaggerModule.setup()` call per group, each filtered via `include: [...]`): `/swagger/books`, `/swagger/courses`, `/swagger/account`. When adding a new module, add it to the relevant group's `include` array (or ask the user which group it belongs to if unclear) — there is no single shared `/swagger` mount. All groups use bearer auth.

Path alias `@/*` maps to `src/*` (see `tsconfig.json`); imports in this codebase inconsistently mix `@/...` and relative paths — prefer `@/...` for new code to match the majority.
