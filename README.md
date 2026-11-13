# Cohort Dashboard

The Paul-Elite DesignTales cohort dashboard: a macOS-style window with sessions, resources, to-dos and the live session.

Built with Vite + React, set in Geist.

## Edit content

Everything the site shows lives in Supabase (project `cohort-dashboard`) and is edited at **/admin**:
settings (names, Meet link, live session), sessions and their long-form pages, resources, tools,
starter to-dos and the admin list. Sign in with a magic link; only emails on the admin list can write
(row level security enforces it). `src/data.js` is just the in-memory store the app reads from.

## Run locally

```bash
npm install
npm run dev
```

## Deploy

Pushes to `main` deploy to Vercel automatically once the repo is linked.
