# next-links

A static, self-hostable Linktree clone built with Next.js. Customize a single config file, deploy for free to GitHub Pages or Vercel — no backend, no database, no API keys required.

Live demo: *(add your URL here)*

---

## Features

- **Single config file** — all profile info, links, colors, and metadata live in `src/config/links.ts`
- **Three link types** — pill buttons, social pills with avatars, and TikTok-style cards with stacked phone thumbnails
- **Build-time TikTok thumbnails** — fetches real thumbnails via TikTok's public oEmbed API at build time; no credentials needed
- **Fully static** — outputs plain HTML/CSS/JS to `./out/` via `next export`; hosts anywhere
- **Daily CI rebuild** — GitHub Actions cron job keeps TikTok thumbnails fresh automatically
- **Share modal** — native share sheet on mobile, clipboard + social links fallback on desktop
- **Dark grid theme** — configurable via the theme block in `src/config/links.ts`
- **Typed config** — full TypeScript types with JSDoc; wrong config is a compile error
- **52 tests** — Vitest + React Testing Library covering all components, lib, and config
- **Docker support** — dev, test, build, and nginx-served production targets via docker-compose
- **Local CI with `act`** — run the full GitHub Actions workflow locally before pushing

---

## Quick start

```bash
git clone https://github.com/your-username/next-links
cd next-links
rm next.config.js          # remove the JS stub; next.config.ts is the real one
npm install
npm run dev                # http://localhost:3000
```

---

## Customizing your page

Everything lives in **`src/config/links.ts`**. Open it and update:

```ts
export const config: SiteConfig = {
  profile: {
    name: "Your Name",
    bio:  "Your bio here",
    avatar: "/avatar.png",   // drop your photo in public/
    username: "your.handle",
  },

  theme: {
    background:  "#3A2218",  // page background
    gridColor:   "rgba(200, 160, 120, 0.10)",
    buttonBg:    "#7D6452",
    buttonText:  "#FFFFFF",
    textColor:   "#FFFFFF",
    subtextColor:"#C8B09A",
  },

  socials: [
    { platform: "instagram", url: "https://instagram.com/yourhandle" },
    { platform: "tiktok",    url: "https://tiktok.com/@yourhandle" },
    // instagram | tiktok | twitter | youtube | facebook | linkedin | github | website
  ],

  links: [
    // Pill button
    { type: "button", label: "My Website", url: "https://example.com" },

    // TikTok card with real thumbnails fetched at build time
    {
      type: "card",
      platform: "tiktok",
      label: "TikTok",
      subtitle: "Follow for more",
      videos: [
        "https://www.tiktok.com/@yourhandle/video/111",
        "https://www.tiktok.com/@yourhandle/video/222",
        "https://www.tiktok.com/@yourhandle/video/333",
      ],
      url: "https://www.tiktok.com/@yourhandle",
    },

    // Social pill with avatar
    {
      type: "social",
      platform: "youtube",
      label: "YouTube",
      subtitle: "10K subscribers",
      avatar: "/yt-avatar.png",  // optional
      url: "https://youtube.com/@yourhandle",
    },
  ],

  meta: {
    title: "Your Name | Links",
    description: "Your bio",
    url: "https://your-domain.com",
  },
};
```

After editing, run `npm run build` — TikTok thumbnails are baked in at build time.

---

## npm scripts

| Command | What it does |
|---|---|
| `npm run dev` | Dev server at `http://localhost:3000` |
| `npm run build` | Static export to `./out/` |
| `npm run test` | Vitest in watch mode |
| `npm run test:run` | Vitest single run (used in CI) |
| `npm run test:ui` | Vitest browser UI |
| `npm run test:coverage` | Coverage report |
| `npm run lint` | ESLint |
| `npm run preflight` | Lint + type-check (run before pushing) |

---

## Project structure

```
next-links/
├── src/
│   ├── app/
│   │   ├── page.tsx          # async Server Component — fetches TikTok thumbnails at build time
│   │   ├── layout.tsx        # root layout, metadata
│   │   └── globals.css       # dark grid background + Tailwind base
│   ├── components/
│   │   ├── TopBar.tsx        # fixed logo + share button
│   │   ├── ShareModal.tsx    # share modal (clipboard, social links)
│   │   ├── ProfileHeader.tsx # avatar, name, bio, social icons
│   │   ├── LinkButton.tsx    # pill button link
│   │   ├── TikTokCard.tsx    # card with stacked phone thumbnails
│   │   ├── SocialPill.tsx    # pill with optional avatar
│   │   └── SocialIcons.tsx   # SVG icons for 8 platforms
│   ├── config/
│   │   └── links.ts          # ← edit this file to customize your page
│   └── lib/
│       └── tiktok.ts         # build-time TikTok oEmbed fetcher
├── tests/
│   ├── components/           # React Testing Library tests
│   ├── config/               # config validation tests
│   ├── lib/                  # tiktok.ts unit tests
│   ├── __mocks__/            # next/image stub for jsdom
│   └── setup.ts              # @testing-library/jest-dom
├── public/
│   └── avatar.svg            # replace with your photo
├── .github/workflows/
│   └── deploy.yml            # build + test + deploy to GitHub Pages; daily cron
├── .actrc                    # local `act` config for running CI locally
├── Dockerfile                # multi-stage: dev / test / builder / nginx runner
├── docker-compose.yml        # dev, test, build, runner services
├── next.config.js            # output: 'export', images: { unoptimized: true }
├── vitest.config.mts         # Vitest config with jsdom + @/* alias
└── tsconfig.json             # strict TypeScript, @/* → src/*
```

---

## Deploying to GitHub Pages

1. Push to GitHub.
2. In your repo: **Settings → Pages → Source → GitHub Actions**.
3. The workflow in `.github/workflows/deploy.yml` runs on every push to `main` and also on a daily cron at 06:00 UTC to refresh TikTok thumbnails.
4. Update the repo URL in `TopBar.tsx`, `ShareModal.tsx`, and `deploy.yml` to match your repo.

## Deploying to Vercel

```bash
npx vercel
```

Vercel detects the static export automatically. No additional config needed.

---

## Docker

```bash
# Dev server
docker-compose up dev

# Run tests
docker-compose run --rm test

# Build static site → ./out
docker-compose run --rm build

# Serve ./out with nginx on :8080
docker-compose up runner
```

## Local CI with act

Simulate the full GitHub Actions workflow locally (requires [act](https://github.com/nektos/act)):

```bash
act                          # simulate push to main
act -j build-and-deploy      # run only the build-and-deploy job
act workflow_dispatch        # trigger the manual workflow
```

The deploy step is automatically skipped when running locally (guarded by `if: ${{ !env.ACT }}`).

---

## How TikTok thumbnails work

`src/lib/tiktok.ts` calls TikTok's public oEmbed endpoint (`tiktok.com/oembed?url=...`) for each URL in a `card` link's `videos` array. This runs **inside `page.tsx` at `npm run build` time** — no browser fetch, no API key, no runtime server. The thumbnail URLs are baked into the static HTML.

The GitHub Actions daily cron rebuilds the site automatically so thumbnails stay current even after you've deployed.

---

## Tech stack

| | |
|---|---|
| Framework | Next.js 16 (App Router, `output: 'export'`) |
| UI | React 19, Tailwind CSS v4 |
| Language | TypeScript 5 (strict) |
| Tests | Vitest 3 + React Testing Library 16 + jsdom |
| CI/CD | GitHub Actions → GitHub Pages |
| Container | Docker (multi-stage) + nginx |

---

## License

MIT
