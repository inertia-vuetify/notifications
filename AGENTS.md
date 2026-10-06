# AGENTS.md

This guide is for coding agents working in this repository.

## 1) Project Mission

`@inertia-vuetify/notifications` is a Vue 3 plugin that converts Inertia flash messages into Vuetify snackbar queue notifications, with support for custom actions.

Primary goals:
- Keep the package API small and stable.
- Preserve strict TypeScript safety.
- Ensure both server-driven (`Inertia::flash`) and client-driven (`router.flash`) notifications work consistently.

## 2) Repository Layout

- `src/`: package source code (authoritative code)
  - `src/plugin.ts`: plugin install logic and Inertia router event wiring
  - `src/composables/useNotifications.ts`: notification context, queue, action registry, parsing
  - `src/components/NotificationProvider.vue`: UI renderer using `VSnackbarQueue`
  - `src/types.ts`: public and internal type contracts + type guards
  - `src/index.ts`: package exports
- `dist/`: generated build artifacts (do not hand-edit)
- `demo-app/`: Laravel + Inertia + Vuetify demo used for real behavior validation
- `README.md`: public documentation (must stay in sync with API behavior)
- `DEVELOPMENT.md`: local development workflow notes
- `.github/workflows/release.yml`: release-please + npm publish automation

## 3) Stack and Compatibility

- Package: TypeScript + Vue 3 + Vite library mode
- Peer deps: `vue`, `vuetify`, `@inertiajs/vue3`
- Current package behavior assumes Inertia flash event support (v2.3.3+)
- Build output: ESM (`dist/index.js`), CJS (`dist/index.cjs`), declarations (`dist/index.d.ts`)

## 4) Core Architecture

### 4.1 Plugin lifecycle

In `src/plugin.ts`:
- `inertiaVuetifyNotifications(options?)` creates and provides a notification context.
- Subscribes to Inertia router events:
  - `before`: resets deduplication state.
  - `flash`: receives flash payloads and queues notifications.
- For flash deduplication semantics, see [README.md usage](README.md#simple-notifications).

### 4.2 Notification context

In `src/composables/useNotifications.ts`:
- Holds `queue` as `Ref<InternalSnackbarItem[]>`.
- Normalizes simple string and structured notifications.
- Merges plugin options with defaults.
- Maintains named action handlers in `Map<string, ActionHandler>`.
- Supports URL actions via Inertia `router.visit`.

### 4.3 Rendering layer

In `src/components/NotificationProvider.vue`:
- Renders queue with Vuetify `VSnackbarQueue`.
- Uses actions slot to display custom action buttons + close button.
- Executes actions through context `executeAction`.

### 4.4 Public API surface

From `src/index.ts`:
- `inertiaVuetifyNotifications`
- `useNotifications`
- `NotificationProvider`
- Type exports from `src/types.ts`

Keep this surface stable unless explicitly changing a major/minor API contract.

## 5) Development Commands

From repository root:
- `npm run dev`: watch build for package
- `npm run typecheck`: type-check package
- `npm run build`: type-check + build package

From `demo-app/`:
- `npm run dev:full`: runs package watch build + demo Vite dev server
- `php artisan serve`: serves Laravel app
- `npm run build`: builds demo frontend

Typical local validation for package changes:
1. `npm run typecheck`
2. `npm run build`
3. Manual demo check in `demo-app` for behavior-sensitive changes

## 6) Coding Standards

- Follow existing style per area (root package and demo app have different formatting conventions).
- Keep TypeScript strict; avoid `any` unless unavoidable for third-party type limitations.
- Do not weaken public types to bypass compile errors; fix root typing issues instead.
- Prefer explicit, readable transformations over clever abstractions.
- Keep plugin logic side-effect free outside expected router event subscriptions.
- Do not hand-edit `dist/*`; regenerate via build.

## 7) Change Rules by File Type

### 7.1 If you change plugin behavior (`src/plugin.ts`)

Also validate:
- Flash deduplication behavior
- `before` reset behavior
- Supported flash keys and option handling

### 7.2 If you change notification model or options (`src/types.ts`, `src/composables/useNotifications.ts`)

Also update:
- `README.md` configuration/API sections
- Example snippets if payload shape changed
- Demo usage if user-visible behavior changed

### 7.3 If you change rendering (`src/components/NotificationProvider.vue`)

Also validate in demo:
- Queue rendering
- Action buttons and close button behavior
- Position/timeout/closable defaults

### 7.4 If you change exports (`src/index.ts`)

Also validate:
- Build output includes expected declarations
- README API section reflects export changes

## 8) QA Checklist (Behavior)

For non-trivial changes, verify:
- Server-side flash keys (`success`, `error`, `warning`, `info`, `notification`) enqueue correctly
- Structured notification payloads map type/color/timeout/closable correctly
- Named actions call registered handlers with payload
- URL actions perform Inertia navigation with method/data
- Duplicate flash payloads do not enqueue twice during same navigation cycle
- Missing named action handler warns but does not crash

## 9) Documentation and API Sync

When behavior or contracts change, update in the same task:
- `README.md` usage/config/API sections
- Relevant demo snippets/pages if needed
- Any developer guidance (`DEVELOPMENT.md`) if workflow changed

Do not leave docs for later when user-visible behavior changes.

## 10) Release and Versioning Notes

- Releases are automated from `main` via release-please.
- Conventional commit style is expected for changelog quality.
- Do not manually publish to npm from local unless explicitly requested.
- Do not manually edit `CHANGELOG.md` or version for standard releases unless explicitly requested.

## 11) Safe Boundaries

- Prefer minimal, focused changes.
- Do not refactor unrelated demo-app code when touching package internals.
- Keep peer dependency expectations intact unless intentionally doing compatibility work.
- Treat this as a reusable library first, demo app second.

## 12) External Documentation Lookup

When you need framework/library API references (Vuetify, Inertia, Vue, Vite, Laravel integration details), use Context7 MCP to verify current behavior before implementing uncertain changes.

## Maintaining this file

Keep this file for knowledge useful to almost every future agent session in this project.
Do not repeat what the codebase already shows; point to the authoritative file or command instead.
Prefer rewriting or pruning existing entries over appending new ones.
When updating this file, preserve this bar for all agents and keep entries concise.
