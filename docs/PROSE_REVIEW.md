# Prose and accuracy review

Reviewed on 2026-10-01 against published game commit `485eb1cf0a4373f2356c58d5fc62cb1255fece37` ([game PR 11](https://github.com/Pazneria/osrs-clone/pull/11), game Pages run 36799651899). Guide, workflow checkout, and regenerated export use that revision. Its content definitions and exporter are unchanged from the prior mobile pin; runtime changes concern hybrid touch and keyboard chat.

The canonical player guide remains `https://pazneria.github.io/osrs-clone-codex/wiki/`. This pass does not edit the game, Arcade, saves, or gameplay settings.

## Writing changes

Reviewed all authored item batches, nine skill guides, both world guides, five journeys, the player guide, indexes, layout, and shared rendering templates. Numeric catalogs, stable routes, source links, and navigation remain intact. Generated HTML uses the existing export/content pipeline.

- “Skills that anchor the manual with concrete loops and outcomes” becomes “Train your skills.” Each page now has one page-specific H1, with topic and task headings below it.
- “Crafting is the main glue skill … understand how the codex links systems together” becomes an explanation that a forged head or blade needs a matching strapped handle before it becomes usable equipment.
- Journey steps describe tools, stations, ingredients, and outcomes. Repeated page tours, draft badges, generic outcomes, and duplicated summaries were removed. Explanatory paragraph arrays render as paragraphs rather than decorative lists.
- Version and build information remains available in expandable details. Testing limits and failed-save instructions remain visible.

## Accuracy corrections and sources

- Enemy pages read nested `stats`, `attackProfile`, and `behavior` fields for Hitpoints, style, aggression, roaming, and chase range. They no longer show `[object Object]` or imply a missing combat level is a real statistic. Coin and no-drop outcomes appear in the weighted loot table. Basis: canonical enemy definitions and `src/js/combat-engagement-runtime.js`.
- Ashes appear when a fire burns out. Basis: `src/js/world/fire-lifecycle-runtime.js`.
- The Fishing Supplier sells Harpoons. From Net to Harpoon rewards a Rune Harpoon; the teacher offers a replacement after completion when the player carries none. Rod fishing needs bait. Basis: `src/js/skills/specs/fishing.js` and `src/js/content/quest-catalog.js`.
- Bow and plain staff pages describe ranged/magic use and ammunition requirements. Trophy drops remain distinct from equippable weapons. Basis: exported item definitions and `src/js/combat.js`.
- Imprinted moulds are unfired clay, borrowed jewelry is retained during imprinting, and fired moulds require the matching jewelry unlock. Needle and Thread are sold but are not required by current Crafting recipes. Bronze armor recipes start at Smithing level 1 and have different bar costs. Basis: `src/js/skills/specs/crafting.js` and `src/js/skills/specs/smithing.js`.
- The toolbar supports secondary touch capability and observed touch, stays available after mouse/keyboard use, and opens Chat for keyboard shortcuts. Basis: pinned `docs/MOBILE_GAMEPLAY.md`, `src/game/input/mobile-hud.ts`, and `src/js/core.js`.

## Reader checks

Realistic questions identified missing instructions and misleading copy. Representative checks using each page alone:

| Page | Three player questions answered |
| --- | --- |
| How to play | How do I move and rotate on touch? What completes the tutorial forge and bank lessons? Where is progress saved, and what happens if Home cannot save? |
| Fishing | What tool and level catch each fish? Where can I buy a Harpoon? How do I earn or replace a Rune Harpoon? |
| Bronze gear | Which ores make a bar? Why can I not equip a forged head or blade? How many bars do the armor pieces need? |
| Hides of the Frontier | Where do I begin? Which drops and quantities must I bring? Are they consumed, and what is the reward? |
| Worlds | Where do I begin? Which services and activities are available? How do I continue, and which enemies or gates need preparation? |
| Items and enemies | What does this item or enemy do? How do I acquire it or find it? Which requirements, risks, or outcomes should I check? |

These are manual reader checks supported by rendered-content assertions, not an independent player study.

## Validation and security scope

Local validation, build, rendered target checks, and short headless Edge browser checks passed. All 289 pages were checked for one H1 and removed scaffold text; escaping was tested with hostile fixtures. Enemy stats and no-drop/coin rows were compared with the export. Fourteen routes passed desktop, portrait, and landscape layout checks; searches, Escape clearing, skip-link focus, 14 control rows, 21 pinned source references, and guide/export source agreement were checked. Counts remain 254 items, 9 skills, 2 worlds, and 10 enemies.

The browser checks found and fixed a Fishing-page overflow: nested entity cards now shrink so wide tables scroll inside their containers. Table rows and mechanics were retained.

The wiki handles public authored text and exported data. It does not read player saves, names, imports, accounts, or private data. URL/hash values do not become HTML. Rendering retains escaping; ten adversarial URL, source-path, and commit fixtures were rejected, and script/event-handler payloads remained escaped. The output checker verifies local targets and permits only existing public game/GitHub links, with no unexpected remote scripts, iframes, or inline handlers. No dependencies or external resources were added.

This narrow review is not a security certification. Game tests used Chromium emulation; physical hardware, Safari, and real soft keyboards remain untested. Owned test browsers and local servers close on completion. Existing screenshot uploads were not duplicated.
