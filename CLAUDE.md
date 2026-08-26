# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run start:dev        # run with watch mode (primary dev loop) — prints Swagger doc links to the terminal on boot
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

Read-heavy slices define a `<entity>.cache.ts` exporting cache-key constants/builders (e.g. `AUTHORS_LIST_CACHE_KEY`, `authorByIdCacheKey(id)`) used with `cache-manager` in query handlers; write handlers for the same entity must invalidate those same keys. This isn't limited to a fixed list — check for a `.cache.ts` file alongside any slice you're touching (currently: `author`, `book`, `category`, `difficulty`, `languages` under `library`; `category`, `lesson`, `section` under `common`; `player`, `game`, `game-of-day`, `news`, `banner` under `home`).

### Domain modules

- `features/auth` — `User`/`Role` entities plus the `UserRole` join table. `login.handler.ts` signs a short-lived (`15m`) access JWT with `{ id, roles: Role[] }`, plus an opaque `RefreshToken` (sha256-hashed, 30-day expiry, stored in `entities/refresh-token.entity.ts`). `POST /auth/refresh` (`@Public()`) validates and rotates the refresh token (revokes the old row, issues a new one) and signs a fresh access token; `logout.handler.ts` revokes all of the caller's active `RefreshToken` rows (the access token itself is left to expire naturally). The `profile` slice (change email/password, verify email, resend/confirm codes) uses its `profile.cache.ts` for a different purpose than the read-cache slices below: it stores short-TTL pending-verification state (`changeEmailCacheKey`, `verifyEmailCacheKey`, plus separate `*CooldownCacheKey` keys) in `cache-manager` instead of caching a read, and delivers codes through `mailTransporter` (`src/core/configs/mail`).
- `features/library` — the book catalog domain: `author`, `book`, `cart`, `category`, `coupon`, `delivery-setting`, `difficulty`, `favourite`, `languages`, `order`, `rating` slices, with entities under `entities/<name>/<name>.entity.ts`. `Book` belongs to one `Category`/`Difficulty`/`Language` and has many `BookAuthor` (join entity for the author m:n); `Rating`/`Favourite`/`CartItem` are unique `(bookId, userId)`-style rows cascading on delete from both `Book` and `User`. `POST /orders/checkout` turns the caller's cart into an `Order` (with `OrderItem` rows, `OrderStatus` enum defaulting to `Processing`), pricing it via `core/utils/cart-pricing/cart-pricing.util.ts`'s `resolveCoupon()` (looks up an active, non-expired `Coupon` by code, computes a `Percent`- or fixed-amount discount) plus the singleton `DeliverySetting` row's flat `fee`; `PATCH /orders/:id/status` is `@Roles(Role.Admin)`-gated. `coupon` and `delivery-setting` are otherwise plain admin-managed CRUD slices consumed only through that pricing util, not imported directly by other slices.
- `features/common` — the course domain: `category`, `certificate`, `courses`, `favourite`, `lesson`, `progress`, `purchase`, `rating`, `section` slices, entities under `entities/<name>/<name>.entity.ts`. `Course` belongs to one `CoursesCategory`/`Difficulty`/`Language` (the latter two reused from `features/library/entities`), has many `CourseAuthor` and `CourseSection` (ordered, cascades to many ordered `CourseLesson`, which carries `video`/`thumbnail` R2 URLs, `duration`, `isFree`). `CoursePurchase`, `LessonProgress`, and `Certificate` are all unique `(courseId|lessonId, userId)` rows cascading on delete from both the course/lesson and `User`. `certificate` splits public vs. authenticated concerns into two sibling controllers in one module — `certificate.controller.ts` (authenticated) and `certificate-verify.controller.ts` (`@Public() GET certificates/:code/verify`); `core/utils/certificate-pdf/certificate-pdf.generator.ts` rasterizes `assets/certificate/template.svg` with `sharp`, masks out the template's baked-in example name/date/QR regions, and draws the real name/course/date plus a generated QR (`qrcode`) on top using `pdf-lib`.
- `features/home` — the public landing-page domain: `player`, `game`, `game-of-day`, `news`, `banner` slices, entities under `entities/<name>/<name>.entity.ts`. `Player` carries three independent ratings (`classicalRating`/`rapidRating`/`blitzRating`, each with an optional `*RatingChange`) plus `rankChange`; `GET players/ranking` sorts by whichever rating `RankingSortBy` picks, paginates in-memory, and injects a computed `rank` per row (not a stored column). `Game` and `GameOfDay` both reference two `Player`s via `whitePlayerId`/`blackPlayerId` (cascade-delete); only `GameOfDay` has `isActive`, and `create`/`update` handlers enforce single-active by unsetting any other row's `isActive` before saving — `GET game-of-day/active` reads that one row. Unlike every other read in this domain (all `@Public()`), the three `game-of-day` GET routes require authentication but no specific role — they live on a sibling `GameOfDayViewController` (no `@Roles`, no `@Public()`) alongside the `@Roles(Role.Admin)`-gated `GameOfDayController` that owns create/update/delete, mirroring the `certificate.controller.ts`/`certificate-verify.controller.ts` public-vs-authenticated split in `features/common`. `core/utils/game-age/game-age.util.ts`'s `calculateAge()` derives player age from `birthDate` on the fly for `GET games/filters` (distinct countries/ages across all players referenced by games), rather than storing age; `core/utils/game-rating/game-rating.util.ts`'s `ratingForGameType()` picks the rating matching a game's `gameType` (rapid/blitz), falling back to `classicalRating` for bullet (no dedicated bullet rating column exists). `news` and `banner` are plain admin-managed CRUD slices with no cross-slice relations.
- Both domains independently define `Category`, `Rating`, and `Favourite` slices/modules for their own entity (book vs. course) with the same class names — importers alias them (`import { CategoryModule as BookCategoryModule } ...` / `... as CourseCategoryModule`) to avoid collisions. Follow this convention when wiring a new cross-domain import.

### Request pipeline / guards

Two global `APP_GUARD`s run in this order (registration order in `app.module.ts` is execution order): `AuthGuard` → `RoleGuard`. `RoleGuard` relies on `AuthGuard` having populated `req.user` (`{ id, roles: Role[] }`, see `src/core/types/jwt-user.ts`).

Decorators: `@Public()` marks a route to skip enforcement, `@Roles(Role.Admin, ...)` (checked by `RoleGuard`). There is no fine-grained per-permission layer — access control is role-only.

File uploads go through `multerStorageOptions()` (`src/core/configs/multer/multer.config.ts`), which streams the file directly to **Cloudflare R2** (not local disk) via a custom `StorageEngine` and returns a public R2 URL as `file.path`; there's no static file serving in `main.ts`. `FileCleanupInterceptor` (`src/core/interceptors/file-cleanup.interceptor.ts`) deletes any files already uploaded to R2 if the route handler throws afterward. `LessonFilesInterceptor` (`src/core/interceptors/lesson-files.interceptor.ts`) is a preconfigured `FileFieldsInterceptor` for lesson `video`+`thumbnail` uploads specifically. New interceptors belong in `src/core/interceptors/`.

Standalone helper functions used by handlers (e.g. `resolveCoupon()`, `calculateAge()`, `ratingForGameType()`, `generateCertificatePdf()`) live under `src/core/utils/<name>/<name>.util.ts` (own subdirectory per helper, matching the `entities/<name>/<name>.entity.ts` convention), not colocated with the feature that happens to call them — they're plain exported functions (no `@Injectable()` wrapping, matching the Active Record pattern's avoidance of unnecessary DI), each with a colocated `*.spec.ts` in the same subdirectory. Filename suffix follows the helper's shape (`.util.ts` for computed values, `.generator.ts` for artifact-producing ones like the PDF generator) — new standalone helpers belong in their own `src/core/utils/<name>/` subdirectory regardless of suffix. Shared enums (`src/core/enums/<name>/<name>.enum.ts`, e.g. `Role`, `GameType`, `CouponType`) follow the same one-subdirectory-per-file shape, unlike the flat `core/exceptions/`/`core/guards/`/`core/interceptors/` folders.

Swagger is split into four independently-mounted docs, defined in `src/core/configs/swagger/swagger-doc-groups.ts` and built by `swagger-document.builder.ts` (one `SwaggerModule.setup()` call per group, each filtered via `include: [...]`): `/swagger/books`, `/swagger/courses`, `/swagger/account`, `/swagger/home`. When adding a new module, add it to the relevant group's `include` array (or ask the user which group it belongs to if unclear) — there is no single shared `/swagger` mount. All groups use bearer auth.

Path alias `@/*` maps to `src/*` (see `tsconfig.json`); imports in this codebase inconsistently mix `@/...` and relative paths — prefer `@/...` for new code to match the majority.
