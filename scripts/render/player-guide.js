const { buildCodexHomePath, buildCodexEntityPath } = require("../lib/codex-link-contract");
const { escapeHtml, renderTable } = require("./shared");
const { renderLayout } = require("./layout");

function renderPlayerGuide(bundle, editorial, guide) {
  const routePath = `${buildCodexHomePath()}wiki/`;
  const pending = guide.pendingSourceReview;
  const body = `
    ${pending ? `<aside class="section-card prose" aria-label="Draft source status"><p><strong>Unpublished controls draft.</strong> Touch controls and mobile save/exit behavior have been reviewed locally. Final published game source verification and pinning are pending; see <a href="#version">Version and sources</a>.</p></aside>` : ""}
    <nav class="section-card guide-contents" aria-label="On this page">
      ${guide.sections.map(section => `<a href="#${section.id}">${escapeHtml(section.title)}</a>`).join("")}
      <a href="#version">Version and sources</a>
    </nav>
    ${guide.sections.map(section => `
      <section class="section-card player-guide-section" id="${section.id}" aria-labelledby="heading-${section.id}">
        <h2 id="heading-${section.id}">${escapeHtml(section.title)}</h2>
        <div class="prose">${section.paragraphs.map(p => `<p>${escapeHtml(p)}</p>`).join("")}</div>
        ${section.rows ? renderTable({ columns: section.columns.map(column => ({ ...column, render: row => escapeHtml(row[column.key]) })), rows: section.rows }) : ""}
        ${section.links ? `<div class="guide-contents">${section.links.map(link => `<a href="${escapeHtml(link.href)}">${escapeHtml(link.label)}</a>`).join("")}</div>` : ""}
      </section>`).join("")}
    <section class="section-card" id="version" aria-labelledby="heading-version">
      <h2 id="heading-version">Version and sources</h2>
      <details class="details-card"><summary>Game revision and coverage</summary>
      <div class="prose">
        <p>${pending ? "Entity export and baseline mechanics reviewed" : "Reviewed"} on ${escapeHtml(guide.reviewedAt)} against game commit <a href="https://github.com/Pazneria/osrs-clone/commit/${guide.sourceCommit}">${guide.sourceCommit}</a>. ${pending ? "That export pin has not changed." : "This guide describes that source revision. The hosted game may have a newer deployment."}</p>
        ${pending ? `<p>Touch controls and mobile save/exit draft reviewed on ${escapeHtml(pending.reviewedAt)} against local game commit <code>${escapeHtml(pending.localCommit)}</code>, using <code>${escapeHtml(pending.sourceDocument)}</code> and its implementation. This local commit is not the final published source pin. Reconcile the final revision before publication.</p>` : ""}
        <p>The reference covers ${bundle.items.length} items, ${bundle.skills.length} gathering and production skills, ${bundle.worlds.length} worlds, and ${bundle.enemies.length} enemy definitions. Controls, combat, quests, tutorial lessons, and saves are also checked against the linked source.</p>
      </div>
      </details>
      <details class="details-card"><summary>${pending ? "Pinned baseline source references" : "Source references used for this guide"}</summary>
        <ul>${guide.sources.map(source => `<li><a href="https://github.com/Pazneria/osrs-clone/blob/${guide.sourceCommit}/${escapeHtml(source.path)}">${escapeHtml(source.label)}</a></li>`).join("")}</ul>
      </details>
    </section>`;
  return { routePath, html: renderLayout({ editorial, manifest: bundle.manifest, currentPath: routePath,
    pageTitle: "How to play", eyebrow: "Player guide", heroTitle: "How to play",
    heroBody: "<p>Create a character, follow Tutorial Island's instructors, then build your skills and supplies in Main Overworld.</p><p><a class=\"text-link\" href=\"https://pazneria.github.io/osrs-clone/\">Play OSRS Clone</a></p>",
    heroBadges: ["Controls", "Progression", "Combat", "Local saves"],
    heroStats: [{ label: "Start", value: "Tutorial Island" }, { label: "Continue", value: "Main Overworld" }], body }) };
}

module.exports = { renderPlayerGuide };
