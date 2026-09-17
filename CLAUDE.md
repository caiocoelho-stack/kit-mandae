# CLAUDE.md

Guidance for Claude Code when working in this repository.

## What this repo is

Kit Mandaê — internal sales hub (Mandaê / Nuvem Envio), a React + Vite frontend with Vercel serverless functions in `api/`.

## Structure

- `src/App.jsx` — shell (Sidebar, Topbar, QuickLinks) + state-based routing (no URL router; `route` state picks the screen).
- `src/nav.js` — sidebar menu items (`key`, `label`, `icon`, `available`).
- `src/icons.jsx` — inline SVG icon set, imported as `{ I }`.
- `src/components/` — Sidebar, Topbar, QuickLinks, and the home-screen widgets (JiraMonitor, AlertaCard, ColetaWidget, JiraMonitorFull).
- `src/screens/` — one file per tool (HomeScreen, InicioScreen, FollowupScreen, ContratoScreen, SlackScreen, BriefingScreen, ConcorrenteScreen, EventosScreen, JiraScreen).
- `api/*.js` — Vercel serverless functions (Node runtime, no npm dependencies except Node builtins). Each calls Anthropic, Jira Cloud, or reads public Google Sheets — see file header comments for specifics.
- `src/styles/global.css` — the full design-token stylesheet (Nimbus tokens) plus global styles. Treat as one file; there's no CSS module system.

## Working here

- Screens are plain components taking `{ setRoute }` — call `setRoute('home')` etc. to navigate. There's no React Router.
- `npm run build` (`vite build`) must succeed before any deploy; Vercel runs it automatically via `vercel.json`.
- `api/` functions are unaffected by frontend changes — don't add npm dependencies there unless truly needed (they currently need none).
- Fonts (Geist / Geist Mono) are self-hosted under `public/fonts/`, referenced from `global.css`.

## Deploying

Push to a branch → open a PR → merge to `main` → Vercel auto-deploys via the connected GitHub integration (build command `vite build`, output `dist/`).

## Vercel plan note

The Hobby (free) plan covers 100 GB/month bandwidth and unlimited deploys, but its terms prohibit commercial use. For an internal company tool, the Pro plan ($20/month) keeps the deployment compliant.
