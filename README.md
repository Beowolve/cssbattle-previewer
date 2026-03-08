# CSSBattle Previewer v3.0

Modern React + Vite + TypeScript application for previewing CSSBattle solutions against battle and daily targets.

## What's New In v3.0

- Major architecture refactor into domain-focused modules under `src/packages/*`
- Reworked application layout with editor, preview, compare, and utility panels
- Improved target workflow with Battle/Daily modes, fast selection, and local caching
- Supabase-backed target source for `battle_targets` and `daily_targets`
- Theme support with `system`, `light`, and `dark` modes
- Expanded utility tooling (color palette, spaces table, Unicode helper)

## Requirements

- Node.js 20+
- `pnpm` (recommended) or npm

## Setup (Windows / PowerShell)

```powershell
Copy-Item .env.example .env
# set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY

# Recommended toolchain
corepack enable
corepack prepare pnpm@latest --activate
pnpm install
pnpm dev
```

If you prefer npm:

```powershell
npm install
npm run dev
```

## Scripts

```powershell
pnpm dev
pnpm build
pnpm preview
pnpm lint
pnpm typecheck
pnpm check
```

## Supabase Notes

The app expects these tables:

- `battle_targets(id, name, image_url, battle_number, colors)`
- `daily_targets(key, name, image_url, date, colors)`

Optional performance indexes are provided in `supabase/targets_indexes.sql`.

## Changelog

See [CHANGELOG.md](./CHANGELOG.md) for release notes.

## Subfolder Deployment

This project is configured with `base: "./"` in `vite.config.ts`.

- Production build assets resolve relative to the deployed `index.html`.
- Hosting from a subdirectory works without hardcoded root paths.
- Local development with `pnpm dev` / `npm run dev` continues to work.
