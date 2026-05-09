# AGENTS.md — AI coding assistant guide

> This file is for AI assistants (Claude, Copilot, Cursor, etc.) working in this repo.
> Read it fully before writing any code or running any commands.

---

## ⚠️ This is NOT a standard Next.js project

This project uses **Next.js 16.2.6** — a version with breaking changes relative to the Next.js 13–15 range in most training data. Before writing any Next.js-specific code, read the relevant guide in:

```
node_modules/next/dist/docs/
```

Pay attention to deprecation notices. APIs you expect may not exist, or may behave differently.

Key differences to be aware of:
- App Router only — no `pages/` directory
- `output: 'export'` is set — this is a **fully static site**, no server-side runtime
- React 19 — some patterns from older React versions are deprecated
- Tailwind CSS v4 — uses `@import "tailwindcss"` in CSS, not `@tailwind base/components/utilities`

---

## Architecture overview

```
src/
├── app/page.tsx          ← async Server Component; all build-time data fetching happens here
├── config/links.ts       ← SINGLE SOURCE OF TRUTH for all user data (profile, links, theme)
├── components/           ← React components, all presentational
└── lib/tiktok.ts         ← build-time HTTP fetch utility (TikTok oEmbed only)

tests/                    ← Vitest + RTL tests, mirrors src/ structure
public/                   ← static assets (avatar, etc.)
```

This is a **static site** (`output: 'export'`). There is no API layer, no database, no auth. All dynamic data (TikTok thumbnails) is fetched at **build time** inside the async Server Component in `app/page.tsx` and baked into the HTML.

---

## The config file is the product

`src/config/links.ts` is the only file end-users should need to edit. It is the entire customization surface. When adding features, prefer extending the config types over hard-coding values in components.

The three link types are:
- `ButtonLink` — a simple pill button
- `CardLink` — a card with stacked phone thumbnails (supports `videos?: string[]` for TikTok oEmbed)
- `SocialPillLink` — a pill with optional avatar and platform icon

All types are exported from `src/config/links.ts` and imported throughout the app. Do not create parallel type definitions.

---

## How thumbnails work

`src/lib/tiktok.ts` exports `fetchTikTokThumbnails(urls: string[]): Promise<string[]>`.

- Calls `https://www.tiktok.com/oembed?url=<encoded>` for each TikTok URL
- Non-TikTok URLs are fast-rejected without a network call
- Returns `""` (empty string) on any failure — never throws
- Called only from `app/page.tsx` at build time; never from client components

When writing tests for this function, mock `fetch` with `vi.stubGlobal` and store the spy **before** calling `stubGlobal` (it returns `globalThis`, not the spy):

```ts
// CORRECT
const spy = vi.fn().mockResolvedValue(...);
vi.stubGlobal("fetch", spy);

// WRONG — spy will be globalThis, not a vi.fn()
const spy = vi.stubGlobal("fetch", vi.fn().mockResolvedValue(...));
```

---

## Component conventions

- **Client components** (`"use client"`) only when browser APIs are needed (event handlers, `navigator.share`, `window`, etc.)
- **Server components** by default — `app/page.tsx` is async and fetches at build time
- **No `next/image`** for externally-fetched URLs (TikTok thumbnails) — use plain `<img>` tags. The Vitest config mocks `next/image` anyway.
- **No inline styles** for theming — pass theme values as inline `style` props (e.g., `style={{ color: theme.textColor }}`). Tailwind classes are for layout/spacing only.
- **Three-dot indicator** on interactive link items uses an SVG with 3 circles, not a text character or chevron.

---

## TypeScript rules

- `strict: true` — no implicit `any`, no non-null assertions without justification
- Path alias `@/*` resolves to `src/*` — always use `@/` imports, never relative `../../`
- `tests/` and `vitest.config.mts` are excluded from the main `tsconfig.json`; they use `tsconfig.test.json`

---

## Testing

Tests live in `tests/`, mirroring `src/`:

```
tests/
├── components/    ← React Testing Library component tests
├── config/        ← config shape/completeness validation
├── lib/           ← tiktok.ts unit tests (fetch mocking)
├── __mocks__/     ← next/image stub (renders plain <img>)
└── setup.ts       ← imports @testing-library/jest-dom
```

Runner: `npm run test:run` (CI) or `npm run test` (watch).

Vitest is configured in `vitest.config.mts`:
- Environment: jsdom
- Globals: enabled (no need to import `describe`/`it`/`expect`)
- `@/*` alias: resolved via explicit `resolve.alias` in vitest config (not via `vite-tsconfig-paths`, which doesn't traverse `exclude`d dirs)
- `next/image` is aliased to `tests/__mocks__/next-image.tsx`

**Always run `npm run test:run` after any change.** CI will fail on any failing test.

---

## Commands

```bash
npm run dev            # dev server (requires correct SWC binary for your platform)
npm run build          # static export → ./out  (fetches TikTok thumbs at build time)
npm run test:run       # run all tests once (safe on any platform — no SWC needed)
npm run test           # watch mode
npm run lint           # ESLint
npm run test:coverage  # coverage report
```

### SWC platform note

`npm run dev` and `npm run build` require the SWC binary for your OS/arch. The installed binary is `@next/swc-darwin-arm64` (Apple Silicon). On Linux (including CI), `@next/swc-linux-arm64-gnu` is downloaded automatically when `npm ci` runs in GitHub Actions. Do not try to run `next dev` or `next build` in an environment without the correct binary.

Vitest (`npm run test:run`) does **not** use SWC and works on any platform.

---

## CI / deployment

`.github/workflows/deploy.yml`:
- Triggers: push to `main`, daily cron `0 6 * * *`, `workflow_dispatch`
- Steps: `npm ci` → `npm run test:run` → `npm run build` → deploy to GitHub Pages
- Deploy step is guarded with `if: ${{ !env.ACT }}` so it's skipped when running locally with `act`

Local CI simulation with [act](https://github.com/nektos/act):

```bash
act                      # simulate push event
act -j build-and-deploy  # target job directly
act workflow_dispatch    # manual trigger
```

`.actrc` configures the runner image and `--reuse` for fast iteration.

---

## Docker

Four services in `docker-compose.yml`:

| Service | Purpose | Port |
|---|---|---|
| `dev` | Next.js dev server with source mount | 3000 |
| `test` | Runs `npm run test:run` and exits | — |
| `build` | Runs `npm run build`, outputs `./out` | — |
| `runner` | nginx serving `./out` | 8080 |

```bash
docker-compose up dev
docker-compose run --rm test
docker-compose run --rm build
docker-compose up runner
```

---

## What NOT to do

- Do not add a `pages/` directory — App Router only
- Do not use `getStaticProps` / `getServerSideProps` — these are Pages Router APIs
- Do not fetch data in client components — all fetching is build-time in `app/page.tsx`
- Do not add server-only packages that break static export
- Do not hard-code colors or profile data in components — extend `src/config/links.ts` instead
- Do not use `next/image` with external TikTok thumbnail URLs — use plain `<img>`
- Do not delete `next.config.ts` — it is the real config file for this project
- Do not commit `next.config.js` back if it was removed — it conflicts with `next.config.ts`
