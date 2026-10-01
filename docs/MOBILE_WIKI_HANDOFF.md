# Mobile controls draft - 2026-10-01

Ready for final source reconciliation, not publication. The original refresh commit
`f054bde0ce679ea1c9c3fc42e94f0580f1309b69` is preserved as the parent. No game,
shared game build, hub, or save file was edited.

## Exact review basis

The mobile owner supplied local game commit
`7665a30ecbf3c2dd63596aed64b2fd0b48963638`, based on
`f4703d738f6dc208fdf4fffeb1665a313ecf5b42`. The final game commit can change and
has not been accepted as the wiki's publication pin.

The control specification is `docs/MOBILE_GAMEPLAY.md` at that local commit,
blob `089f0d553edf3d0a766e98c3dd84a022b5f57a92`. The read-only supplied checkout
is `C:/Users/jmore/Documents/Codex/2026-09-30/task-11/osrs-clone`. Gesture timing,
action exclusivity, drawers, cancellation, Stop, and save-before-Home were also
checked against immutable source at that commit:

- `src/game/input/touch.ts`
- `src/game/input/mobile-hud.ts`
- `src/game/input/stop-action.ts`
- `src/js/input-render.js`, `src/js/core.js`, and `src/js/world.js`
- `src/js/world/map-hud-runtime.js`
- `src/js/inventory.js` and `src/js/context-menu-runtime.js`
- `src/js/core-player-entry-runtime.js` and `index.html`

The change list does not alter canonical content, item/quest catalogs, skill
definitions, enemy definitions, or the exporter. Quantity choices were verified
in the existing inventory runtime, rather than inferred from gesture support.

## Prepared content

The existing player guide now pairs touch and desktop controls: tap movement and
primary actions, half-second hold menus, one-finger camera rotation, pinch zoom,
Bag/Chat drawers, item combinations, equipment and combat settings, minimap and
world map, quantity prompts, Stop, and Home/Exit. Bank quantities are 1/5/10/All/X;
shop quantities are 1/5/10/50/X. Cancel leaves the amount prompt.

The settings section records save-before-Home, failed-save retry, background
Stop/save, gesture cancellation, character creation/recovery exits, and current
test limits. Inventory/bank drag reordering remains desktop-only; no touch drag
reordering claim is made. Physical devices, Safari, real soft keyboards, and OS
gesture interruptions were not tested by the mobile owner. The wiki does not
claim a game playtest of its own.

`pendingSourceReview` records this local basis separately from the existing
`sourceCommit`. The rendered guide visibly labels the mobile controls and save/
exit behavior as an unpublished draft. Entity export and workflow pins remain
`f4703d738f6dc208fdf4fffeb1665a313ecf5b42`; no new game commit was pinned. Existing
source links are explicitly labelled as baseline references while the draft is
pending. A new baseline inventory link supports equipment and transfer facts.

## Finalization after the published game commit arrives

1. Verify the final published game commit and compare it with the reviewed local
   mobile commit. Reconcile any changed controls, preservation behavior, or limits.
2. In the guide, replace draft/publication-pending wording with the verified final
   behavior, remove `pendingSourceReview`, and update `sourceCommit` and `reviewedAt`.
3. Update the workflow's game checkout `ref` to the same final commit. Add pinned
   source links for `src/game/input/touch.ts`, `mobile-hud.ts`, `stop-action.ts`, and
   `docs/MOBILE_GAMEPLAY.md` as appropriate. The current source path validator
   supports runtime paths; a documentation source link would require a narrow
   addition allowing `docs/` with the same traversal checks, or keep its evidence
   in this handoff instead.
4. Regenerate through `sync:data` / `check` / `build` with a clean checkout at the
   final commit; run the static link check and a short guide browser check. Confirm
   the displayed source and export manifest agree and draft notices are gone.
5. Await the separately authorized wiki publication. The exact hub target remains
   `https://pazneria.github.io/osrs-clone-codex/wiki/`; link it only after it is live.

## Narrow security and validation scope

This follow-up reads public authored source and control notes. It adds no frontend
dependency, resource, iframe, message listener, save access, account, or network
configuration. Pending source fields are validated and rendered as escaped text,
without a link to an unpublished commit or a local filesystem path. Existing
fixed play and pinned baseline source links are retained. Wiki content escaping,
unsafe-link rejection, source traversal rejection, and draft metadata validation
are checked separately from functional rendering. Passing these checks is not a
security certification or a game/browser compatibility audit.

The previously delivered desktop/mobile screenshots describe `f054bde`; they are
not evidence of this later controls draft. No duplicate Library upload is needed.

Performed checks: `npm.cmd run check`, `npm.cmd run build`, and
`node scripts/check-site.js` passed against the unchanged baseline source pin.
The structural check covered 289 pages, 11,517 local targets, and 19 distinct
outbound URLs. A short headless Edge check passed at 1280x900, 390x844, and 844x390:
14 control rows fit without page overflow, stacked touch cells retain their
labels, the skip link works, draft status and both source bases are visible, and
query/hash payloads produce no executable links. Seven malformed metadata/URL
fixtures were rejected; injected new table/metadata fields stayed escaped.
There were no page or failed-resource errors. The owned browser and loopback
server closed in `finally`; no new screenshots were recorded or uploaded.
Detailed results are in the delegated task's `evidence/mobile-guide-check.json`,
outside the repository. The final source/export and remote deployment remain
pending and were not tested by these checks.
