# OSRS Clone Codex

This repository hosts the standalone codex site for the OSRS Clone project.

The codex does not duplicate gameplay facts by hand. Instead, it syncs a versioned export bundle from the sibling `OSRS Clone` repo and turns that bundle into static pages.

The player guide at `/osrs-clone-codex/wiki/` supplements the entity export with reviewed runtime facts for controls, tutorial steps, combat, quests, and saves. Its source commit must match the export. The deployment workflow checks out that reviewed game commit and installs its locked exporter dependencies before validation.

GitHub Pages deployment is handled by `.github/workflows/deploy-pages.yml`. The workflow checks out both this repo and `Pazneria/osrs-clone`, builds the static site, and publishes `dist/osrs-clone-codex/` to `https://pazneria.github.io/osrs-clone-codex/`.

## Expected workspace layout

This repo assumes the game repo sits beside it:

- `../OSRS Clone`
- `../osrs-clone-codex`

For another checkout location, set `OSRS_CLONE_SOURCE_ROOT` explicitly:

```powershell
$env:OSRS_CLONE_SOURCE_ROOT = 'C:/path/to/osrs-clone-source'
npm.cmd run check
npm.cmd run build
node scripts/check-site.js
```

Use a clean game checkout at the reviewed revision. When updating, first audit the new source, run `scaffold:item-editorial` for missing item entries, review changed editorial, and update both `content/editorial/player-guide.json`'s `sourceCommit` and the workflow's game checkout `ref`. Generated exports and `dist/` remain build outputs. The [refresh audit](docs/WIKI_REFRESH.md) records the current basis, checks, and publication handoff.

## Scripts

```powershell
npm run sync:data
npm run check
npm run build
npm run dev
npm run serve
```

What they do:

- `sync:data`: runs the exporter in `../OSRS Clone` and copies the bundle into `content/generated/codex-export/`
- `check`: syncs the bundle and validates routes, indexes, and cross-links
- `build`: syncs the bundle and generates the static codex site into `dist/osrs-clone-codex/`
- `dev`: runs an initial build, serves the codex locally at `http://localhost:5520/osrs-clone-codex/`, watches both this repo and the sibling `OSRS Clone` source, and live-reloads after rebuilds
- `serve`: runs a single build and serves the generated codex locally with the browser opened automatically

## Route contract

The codex uses stable ID routes from the export manifest:

- `/osrs-clone-codex/items/:itemId`
- `/osrs-clone-codex/skills/:skillId`
- `/osrs-clone-codex/world/:worldId`
- `/osrs-clone-codex/enemies/:enemyId`
- `/osrs-clone-codex/wiki/` — canonical how-to entry point

Legacy `/world/starter_town` and `/world/north_road_camp` bookmarks receive explanatory pages that link to the current worlds. They are not advertised as current worlds.

Optional query params:

- `from=arcade|game`
- `return=<encoded-url>`
