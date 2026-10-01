# Mobile controls source handoff - 2026-10-01

Final source reconciliation is complete. The original wiki refresh `f054bde`
and mobile draft `2c7fd24` are preserved in history. Publication was authorized
through this wiki repository's existing GitHub Pages workflow. No game, Arcade
hub, user save, account, or network configuration file was edited.

## Exact source basis

Guide, canonical export, and workflow game checkout now use
`ed2efee3f9bee9ec84a7447773a2dad1a19b9bd7`.

- [Merged mobile game PR #10](https://github.com/Pazneria/osrs-clone/pull/10).
- [Successful game Pages run 36795133351](https://github.com/Pazneria/osrs-clone/actions/runs/36795133351); its head SHA matches the pinned commit.
- [Canonical mobile control notes](https://github.com/Pazneria/osrs-clone/blob/ed2efee3f9bee9ec84a7447773a2dad1a19b9bd7/docs/MOBILE_GAMEPLAY.md), blob `71b9bad2e631bad4588b4c017f8b9b4ad93c5fc5`.

Compared with reviewed local mobile commit
`7665a30ecbf3c2dd63596aed64b2fd0b48963638`, the final revision changes only the
bank guard, live-Home playtest support, and related documentation. Gesture/input
implementation is unchanged. A source diff against original game `f4703d7`
confirms no changes to canonical content, content tools, item/quest catalogs,
skill definitions, or combat definitions. The export remains 254 items, nine
gathering/production skill pages, two worlds, and ten enemy definitions.

Runtime review used the touch, mobile HUD, Stop, input-render, core, world/map,
inventory, context-menu, character-entry, and markup files identified in the
guide and prior review. The guide has 21 source links pinned to the final commit,
including the canonical mobile notes. Their paths exist in the reviewed source.
The narrow source-path validator now permits `docs/` with the same traversal
rejection as runtime paths.

## Resulting guide

Touch and desktop controls are paired: tap movement and primary actions,
half-second hold menus, camera drag/pinch, Bag/Chat drawers, item combinations,
equipment/combat, minimap/world map, quantities, Stop, and saved Home/Exit. Bank
quantities are 1/5/10/All/X; shop quantities are 1/5/10/50/X. Cancel leaves the
amount prompt. Requirements, prices, attack ticks, cooldowns, and progression
continue to use the game runtime.

Local-draft notices and `pendingSourceReview` were removed. Settings describe
failed-save retry, background Stop/save, gesture cancellation, and creation/
WebGL recovery exits. The known limits remain explicit:

- Inventory/bank drag reordering retains the existing desktop implementation;
  touch uses tap/hold actions and transfer choices.
- Physical phones/tablets, Safari, real soft keyboards, and OS gesture
  interruption remain untested. Emulation does not establish those results.
- The touch layout uses `(pointer: coarse)` in `mobile-hud.ts`. On a hybrid device
  reporting a fine primary pointer, gestures may work while Bag/Chat/Stop/Home
  remain hidden. This source limitation was verified in the HUD and styles;
  no physical hybrid-device test was performed.

## Validation and security scope

The exporter guard and skill validation passed. Wiki `check`, `build`, and
`scripts/check-site.js` passed: 289 pages, 11,516 local targets, and 23 distinct
outbound URLs. The workflow now runs the existing rendered-link/active-content
check before uploading the Pages artifact.

Short headless Edge checks passed for seven representative routes at local
preview. The guide passed at 1280x900, 390x844, and 844x390 without page overflow;
14 control rows retain touch labels, skip-link focus works, final source IDs
agree, all 21 pinned source links appear, and draft notices are absent. There
were no page or failed-resource errors. Owned browser/server processes close in
`finally`. This wiki check does not duplicate the mobile owner's game playtest.

Ten unsafe-link, source-traversal, and malformed/mismatched-commit fixtures were
rejected. Title/paragraph/table/source-label payloads stayed escaped. Query/hash
payload navigation produced no executable links. The owned change handles only
public authored documentation and local filter input; it adds no save access,
import parsing, external resource, frontend dependency, iframe, or postMessage
surface. No secrets or private game data are included. This is focused checking,
not a security certification or whole-repository audit.

Detailed final local/live results and publication evidence are kept in the
delegated task's `evidence/` directory and returned in the publication handoff.
The original Library screenshots describe `f054bde`, not this final controls
revision; no new screenshot was recorded or duplicate upload made.

## Publication and hub integration

Publish through a normal branch/PR merge into the current remote main, preserving
existing history. Verify the Pages build and deploy jobs, then the live manifest
and guide source pin, controls, and representative desktop/mobile layouts before
reporting success. The exact wiki deployment commit/run are reported after that
verification; the successful game run above is not wiki deployment evidence.

Canonical relative route: `wiki/`.

Exact hub target: `https://pazneria.github.io/osrs-clone-codex/wiki/`.

The hub can link this URL after successful live verification. This wiki remains
in its own Pages repository; no game `/osrs-clone/wiki/` route or hub edit is part
of this task.
