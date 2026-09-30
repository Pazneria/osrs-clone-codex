const { buildCodexHomePath, buildCodexEntityPath } = require("../lib/codex-link-contract");
const { escapeHtml, renderTable } = require("./shared");
const { renderLayout } = require("./layout");

function renderPlayerGuide(bundle, editorial, guide) {
  const routePath = `${buildCodexHomePath()}wiki/`;
  const body = `
    <nav class="section-card guide-contents" aria-label="On this page">
      ${guide.sections.map(section => `<a href="#${section.id}">${escapeHtml(section.title)}</a>`).join("")}
      <a href="#version">Version and coverage</a>
    </nav>
    ${guide.sections.map(section => `
      <section class="section-card player-guide-section" id="${section.id}" aria-labelledby="heading-${section.id}">
        <h3 id="heading-${section.id}">${escapeHtml(section.title)}</h3>
        <div class="prose">${section.paragraphs.map(p => `<p>${escapeHtml(p)}</p>`).join("")}</div>
        ${section.rows ? renderTable({ columns: section.columns.map(column => ({ ...column, render: row => escapeHtml(row[column.key]) })), rows: section.rows }) : ""}
        ${section.links ? `<div class="guide-contents">${section.links.map(link => `<a href="${escapeHtml(link.href)}">${escapeHtml(link.label)}</a>`).join("")}</div>` : ""}
      </section>`).join("")}
    <section class="section-card" id="version" aria-labelledby="heading-version">
      <h3 id="heading-version">Version and coverage</h3>
      <div class="prose">
        <p>Reviewed on ${escapeHtml(guide.reviewedAt)} against game commit <a href="https://github.com/Pazneria/osrs-clone/commit/${guide.sourceCommit}">${guide.sourceCommit}</a>. This guide describes that source revision. The hosted game may have a newer deployment.</p>
        <p>The reference export contains ${bundle.items.length} items, ${bundle.skills.length} gathering and production skills, ${bundle.worlds.length} worlds, and ${bundle.enemies.length} enemy definitions. Combat XP, tutorial steps, controls, quests, and saves are documented from runtime source; they are outside the export's skill-page coverage.</p>
        <p>Current worlds: ${bundle.worlds.map(world => `<a href="${buildCodexEntityPath("world", world.worldId)}">${escapeHtml(world.title)}</a>`).join(", ")}. Starter Town is an area within Main Overworld. The old separate North Road Camp region is absent from the current world manifest.</p>
        <p>Future mobile controls, additional worlds, accounts, multiplayer, and a larger quest catalogue are outside this reviewed guide. Only implemented behavior at the linked revision is described here.</p>
      </div>
      <details class="details-card"><summary>Source references used for this guide</summary>
        <ul>${guide.sources.map(source => `<li><a href="https://github.com/Pazneria/osrs-clone/blob/${guide.sourceCommit}/${escapeHtml(source.path)}">${escapeHtml(source.label)}</a></li>`).join("")}</ul>
      </details>
    </section>`;
  return { routePath, html: renderLayout({ editorial, manifest: bundle.manifest, currentPath: routePath,
    pageTitle: "How to play", eyebrow: "Player guide", heroTitle: "Your first adventure",
    heroBody: "<p>Create a character, follow Tutorial Island's instructors, then build your skills and supplies in Main Overworld.</p><p><a class=\"text-link\" href=\"https://pazneria.github.io/osrs-clone/\">Play OSRS Clone</a></p>",
    heroBadges: ["Controls", "Progression", "Combat", "Local saves"],
    heroStats: [{ label: "Start", value: "Tutorial Island" }, { label: "Continue", value: "Main Overworld" }], body }) };
}

module.exports = { renderPlayerGuide };
