# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

This is a **deployment repository**, not the source code. It contains the pre-compiled, bundled artifact of the Kit Mandaê internal tools app (TiendaNube/Nuvemshop). There is no build step, no package.json, and no test/lint commands — those live in the source repo.

The entire application ships as a single `index.html` (~2.5 MB), which contains base64-encoded, gzip-compressed JS/CSS bundles unpacked at runtime via the `DecompressionStream` Web API.

## Deploying

Three options (all target Vercel):

**Drag-and-drop** — drag the whole folder to vercel.com/new and click Deploy.

**GitHub auto-deploy** — push to the connected GitHub repo; Vercel redeploys automatically on every push.

**Vercel CLI:**
```bash
npm i -g vercel
vercel --prod
```

To update: replace `index.html` and redeploy using whichever method is active.

## Configuration

`vercel.json` sets `Cache-Control: public, max-age=0, must-revalidate` on `index.html` so browsers never serve a stale version after a redeploy.

## Vercel plan note

The Hobby (free) plan covers 100 GB/month bandwidth and unlimited deploys, but its terms prohibit commercial use. For an internal company tool, the Pro plan ($20/month) keeps the deployment compliant.
