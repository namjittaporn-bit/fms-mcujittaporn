<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Guidelines for AI Coding Assistants (Vibe Coding)

This codebase is a Modular Monolith built with **Next.js 16 (App Router), React 19, Prisma 6 (PostgreSQL), and Tailwind CSS 4 (Liyon Design System)**.
Follow these architectural guidelines when building new features or modifying code:

## 1. Modular Monolith & Feature Boundaries
- Business features are located under `src/features/<feature-name>/`.
- **Reference Example:** See `src/features/sample/` for a clean, canonical example of a complete CRUD feature.
- **Public API:** Only expose functions/types through:
  - `src/features/<feature-name>/index.ts` (Client-safe helpers & types)
  - `src/features/<feature-name>/server.ts` (Server functions & data queries for Server Components)
  - `src/features/<feature-name>/actions.ts` (Server Actions for mutations)
- **Internal encapsulation:** All internal services, pure business logic, repositories, and private schemas belong in `src/features/<feature-name>/_internal/`.
- **Cross-feature imports:** NEVER import from another feature's `_internal/` folder. This is enforced by `dependency-cruiser` (`npm run deps:check`).

## 2. Server Actions & Validations
- Server Actions must validate input payloads using Zod schemas with localized errors:
  ```ts
  const data = schema.parse(input, { errorMap: zodErrorMap(locale) });
  ```
- Wrap Server Actions with `runAction(...)` from `src/shared/lib/actions.ts` to return standard `ActionResult<T>`.
- Multi-Tenancy: All business entities must have `tenant_id`. Always obtain `tenantId` from authenticated session (`ctx.tenantId`), never accept `tenantId` directly from client payloads.
- Sensitive mutations must write audit records into `audit_logs` using `writeAudit(entry, tx)` within the same database transaction.

## 3. Internationalization (i18n)
- **No hardcoded UI strings:** Every user-facing string must use `t("key")`.
- Maintain dictionary entries in `src/features/<feature-name>/messages.ts` with both `th` and `en` translations:
  ```ts
  export const messages = {
    "myfeature.title": { th: "ชื่อฟีเจอร์", en: "Feature Title" },
  } as const;
  ```
- Register the feature's messages in `src/i18n/index.ts`.
- Format dates using `formatDate(date, locale)` to show Buddhist Era (พ.ศ.) for Thai and CE (ค.ศ.) for English.

## 4. Permissions & RBAC
- Declare new permissions in `src/features/<feature-name>/permissions.ts`.
- Register declared permissions into `src/permissions.ts` so `prisma/seed.ts` will seed them.
- Check user authorization using `requirePermission(session, "<module>:<action>")` before executing restricted actions.

## 5. UI & Styling (Liyon System)
- Use UI components from `@/shared/components/liyon` (Button, Input, Dialog, Table, etc.).
- Admin routes live in `src/app/(admin)/<feature-name>/`.
- Auth routes live in `src/app/(auth)/`.
- DO NOT manually edit files in `src/shared/styles/liyon/` as they are synced from the upstream theme.

## 6. Component Modularity & Clean UI
- Keep Client Components concise and maintainable (< 400 lines).
- Avoid monolithic components: Decouple large pages into focused subcomponents placed under `_components/` (e.g., `<feature>-stats-bar.tsx`, `<feature>-grid.tsx`, `<feature>-detail-dialog.tsx`, `<feature>-booking-dialog.tsx`).
- Modals and forms must be extracted into dedicated dialog components with clean prop contracts (`open`, `onOpenChange`, `onSuccess`).
- Liyon Dialog convention: `LiyonDialogCloseButton` must be a sibling of `LiyonDialogHeader`, not placed inside it.
- In JSX text, always use `&ldquo;` and `&rdquo;` or string literals for quotes to avoid ESLint unescaped-entity warnings.

## 7. Public Portal & Edge Proxy Routing
- Edge proxy routing is governed by `src/proxy.ts`.
- Public portal routes (`/`, `/news`, `/personnel`, `/curriculum`) must be maintained in `PUBLIC_PREFIXES` or `PUBLIC_EXACT` in `src/proxy.ts` so anonymous visitors can view them without forced redirect to `/login`.
- All dynamic portal routes (`[slug]`, `[id]`) must have:
  - `loading.tsx`: Skeleton loader matching the page layout.
  - `not-found.tsx`: Graceful bilingual (TH/EN) 404 page for missing entities.
- Keep the global root fallback `src/app/not-found.tsx` active.

## 8. Domain Unit Testing & Zero-Warnings Policy
- Maintain strict **Zero-Warnings Policy** (`npm run lint` must pass with 0 errors and 0 warnings). Remove all unused imports and variables.
- Every business domain must have unit tests covering Zod schemas and edge cases in `src/features/<feature>/_internal/*.test.ts`:
  - Interval / schedule conflict detection (reservation overlaps, edge touching, enclosing periods).
  - Validation schemas (required fields, enum bounds, URL formats, budget numeric constraints).
- Test execution: `npm run test` must pass 100%.

## 9. Verification & Quality Gates
Before completing any task:
1. Run type checks: `npm run type-check` (Must pass with 0 errors)
2. Run linters & boundary checks: `npm run lint && npm run deps:check` (0 errors, 0 warnings, 0 boundary violations)
3. Run tests: `npm run test` (100% tests passing)
4. Full verification suite: `npm run check` (Note: integration tests run against `ums_dev` and truncate tables, so run `npm run db:seed` after running integration tests if testing locally).
