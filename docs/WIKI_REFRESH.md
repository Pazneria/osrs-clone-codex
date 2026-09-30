# Wiki refresh audit — 2026-09-30

Prepared for review. No push, PR, merge, deployment, or hub edit was performed.

## Source and freshness

- Game source: `Pazneria/osrs-clone`, clean main commit `f4703d738f6dc208fdf4fffeb1665a313ecf5b42` (2026-06-25). The public API's main revision matched the supplied checkout. All game reads and exporter checks used a separate checkout at that revision.
- Wiki base: `Pazneria/osrs-clone-codex`, main `946c240d14129035048cd475d6d7061ce274f4d8`. The supplied clean checkout and public main matched.
- Published `data/manifest.json` still names game `601b0c6f911c2a0fd3e03c29430a130c5259a68c`, generated `2026-03-18T23:52:11.491Z`, with 233 items, nine skills, and two worlds. It lacks the current enemy export.
- The [latest wiki workflow](https://github.com/Pazneria/osrs-clone-codex/actions/runs/23280580582) failed its build job; deployment was skipped. The [previous successful run](https://github.com/Pazneria/osrs-clone-codex/actions/runs/23272822636) used wiki `edfcb0056a094605c66ca8aaf3500813d18abda1` and matches the published manifest's generation time.
- Historical run/job logs return HTTP 410. Retained annotations only report exit code 1 and an actions runtime deprecation warning. The exact historical error is not recoverable from those records.

## Reproduced current-source build failures

1. A fresh game checkout without dependency installation makes `npm run check` fail with `Cannot find module 'typescript'`. The wiki workflow previously checked out the game but never installed its dependencies. Add locked `npm ci --ignore-scripts --no-audit --no-fund` in the game checkout; use Node 22 for the locked dependency engine requirements.
2. With dependencies available, the old editorial fails item coverage validation. The existing scaffolder added 12 missing borrowed-jewelry, imprinted-mould, cooked-meat, and burnt-meat entries.
3. Existing manual references and rendered assertions use retired `starter_town` / `north_road_camp` world IDs and omit `tutorial_island`. Migrate current references to `main_overworld`, add the tutorial manual, and retain explicit legacy bookmark notices.

These reproduce failures against current game source. They are not presented as the unavailable historical job log.

## Changes and sources of truth

The game exporter is unchanged. It still reads the authored item catalog, skill JSON validated against the runtime shards, world manifest/regions, and typed combat content. `sync:data`, `check`, and `build` regenerate the ignored bundle through that exporter; no generated JSON was edited by hand.

The refreshed export has 254 items, nine gathering/production skill pages, two worlds (`main_overworld` and `tutorial_island`), and ten enemy definitions. The nine skill pages are not a complete list of implemented combat skills.

Existing editorial and journeys were retained and corrected for changed mechanics: meat cooking, clay/mould crafting, loaned jewelry, Tanner's objectives and rewards, current world locations, rune progression, and magic staff equipment. Drop acquisition text now uses exported enemy/world links. Item combat references show ranged/magic level requirements, offensive bonuses, and ammunition use. New prose is bound to the exact game commit; a mismatched export fails validation until the guide is reviewed.

The new guide covers character entry, tutorial order and practical checks, controls, objectives, skill progression, gathering/production, inventory/banking/trade, melee/ranged/magic, combat XP, eating delays, defeat, six quests, settings, local saves, and current limits. Its 16 pinned source links identify the runtime files used for facts not included in the entity export. It describes no pending mobile implementation.

The wiki keeps its existing parchment styling and static GitHub Pages architecture. Improvements include a skip link, visible focus, current-page navigation, native keyboard filter behavior, live filter counts, corrected chip matching, mobile layout containment, scrollable reference tables, and stacked how-to tables on small screens. No game runtime, save, package, exporter, or Arcade hub file changed.

## Validation evidence

- Game checkout: `node tools/tests/codex-export-guard.js` passed; `node tools/content/validate-skills.js` passed without warnings.
- Wiki: `npm.cmd run check`, `npm.cmd run build`, and `node scripts/check-site.js` passed. The structural check covers 289 pages, 11,516 local links/assets/anchors, and 18 distinct outbound URLs; all local targets resolve.
- Short headless Edge checks: home, guide, both current worlds, raw chicken, boar, and Tanner journey loaded; search/reset and Enter/Space filter toggles passed; skip-link focus passed; guide/items/world layouts fit 390px. No page errors or failed resource requests. Owned browser and loopback server closed in `finally`.
- Screenshots and detailed browser/security results are stored in the delegated task's `evidence/` directory, outside the repository.
- No deployment was run. Local verification used Windows Node 24 and Edge; the amended GitHub-hosted Ubuntu/Node 22 workflow has not been exercised remotely. No game play session or assistive-technology audit was performed.

## Narrow security review

The wiki handles public repository content and local search/filter text. It does not read game names, saves, imported data, account information, or private services. Search input uses text matching and `textContent`, with no HTML execution. The guide ignores URL query/return values and hashes as content; adversarial query/hash browser navigation did not introduce executable links.

Guide titles, paragraphs, table cells, source labels, and layout strings are HTML escaped. Rendering fixtures containing image/script/event-handler payloads stayed escaped. Validation rejects javascript/data URLs, foreign origins and deceptive hostnames, credentials in URLs, traversal source paths, and malformed/mismatched commit IDs. Static output checks allow only public game and pinned GitHub links and local assets; they reject unexpected remote scripts, iframes, or inline event handlers. All 16 source references exist at the reviewed game revision.

No frontend dependency or external resource was added. Game exporter dependencies use its existing lockfile with install scripts disabled. Playwright 1.58.2 was installed only in an isolated QA folder and used the existing Edge executable; it is not part of the website or repository. New output contains authored public game documentation, not user save data or credentials. No credential, account, game security setting, or network configuration was changed. There are no new iframe or postMessage surfaces.

This is a focused source/render/link review and adversarial fixture check, not a security certification or whole-repository audit. Remote link destination content, full game runtime security, supply-chain provenance, all browsers, and assistive technologies remain outside the performed checks.

## Integration and publication handoff

Canonical relative route in the wiki site: `wiki/`.

Planned full URL: `https://pazneria.github.io/osrs-clone-codex/wiki/`.

The hub owner should add this exact URL only after an approved wiki publication succeeds. Do not assume `https://pazneria.github.io/osrs-clone/wiki/`; this remains a separate Pages repository.

The isolated wiki branch is `docs/current-source-wiki`, based on `946c240`. Its commit can be fetched from the delegated checkout and cherry-picked into the wiki owner's clean checkout. A patch is supplied outside the repository. Review and approve publication separately; no publication command was run here.

If the mobile owner's game changes merge before wiki publication, audit that final source commit, update the controls/limits accordingly, bump the guide's sourceCommit and workflow checkout ref together, and regenerate/check again. Do not silently label the present guide as based on that future revision.
