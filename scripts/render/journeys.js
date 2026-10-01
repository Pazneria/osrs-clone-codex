const { buildCodexJourneyPath } = require("../lib/codex-link-contract");
const { renderLayout } = require("./layout");
const {
  buildSectionPath,
  escapeHtml,
  renderInlineLinkedText,
  renderChipList,
  renderEntityIcon,
  renderSearchHeader,
  renderStatGrid
} = require("./shared");
const {
  buildEntityLinkRows,
  renderGuideBlockSection,
  renderJourneyCard,
  renderRichText
} = require("./manual");

function renderJourneyStep(step, bundle, options = {}) {
  const linkedRows = buildEntityLinkRows(bundle, {
    itemIds: step.itemIds,
    skillIds: step.skillIds,
    worldIds: step.worldIds
  });

  return `
    <article class="section-card section-card--nested manual-step">
      <div class="section-heading">
        <div>
          <p class="eyebrow">${escapeHtml(step.stepId)}</p>
          <h3>${escapeHtml(step.title)}</h3>
        </div>
      </div>
      ${renderRichText(step.body, options)}
      ${linkedRows.length
        ? `<p class="card-note">${renderInlineLinkedText(
          `References: ${linkedRows.map((row) => row.label).join(", ")}.`,
          options
        )}</p>`
        : ""}
    </article>
  `;
}

function renderJourneyPage(bundle, editorial, manualContent, journey, siteAssets) {
  const nextJourneys = journey.nextJourneyIds
    .map((journeyId) => manualContent.journeys.journeysById[journeyId])
    .filter(Boolean);
  const linkedRows = buildEntityLinkRows(bundle, {
    itemIds: journey.relatedItemIds,
    skillIds: journey.relatedSkillIds,
    worldIds: journey.relatedWorldIds
  });

  const heroAside = `
    <div class="hero-panel">
      ${renderStatGrid([
        { label: "Audience", value: journey.audience, detail: "Who this path serves best" },
        { label: "Difficulty", value: journey.difficulty, detail: "Expected starting point" },
        { label: "Steps", value: journey.steps.length, detail: "Actions" }
      ], {
        className: "hero-stat-grid",
        itemClassName: "hero-stat-card"
      })}
    </div>
  `;

  const body = `
    <section class="section-card">
      <div class="section-heading">
        <div>
          <h2>Steps</h2>
        </div>
      </div>
      <div class="page-stack page-stack--tight">
        ${journey.steps.map((step) => renderJourneyStep(step, bundle, {
          linkRegistry: siteAssets.linkRegistry,
          excludeHrefs: [journey.path]
        })).join("")}
      </div>
    </section>
    ${nextJourneys.length ? `
      <section class="section-card">
        <div class="section-heading">
          <div>
            <h2>What to do next</h2>
          </div>
        </div>
        <div class="entity-grid">
          ${nextJourneys.map((entry) => renderJourneyCard(entry, {
            monogram: "NX",
            linkRegistry: siteAssets.linkRegistry,
            excludeHrefs: [entry.path]
          })).join("")}
        </div>
      </section>
    ` : ""}
  `;

  return {
    routePath: journey.path,
    html: renderLayout({
      editorial,
      manifest: bundle.manifest,
      currentPath: journey.path,
      pageTitle: journey.title,
      eyebrow: "Journey Manual",
      heroTitle: journey.title,
      heroBody: renderRichText(journey.summary, {
        linkRegistry: siteAssets.linkRegistry,
        excludeHrefs: [journey.path]
      }),
      heroBadges: [journey.audience, journey.difficulty, `${journey.steps.length} steps`],
      heroAside,
      body
    })
  };
}

function renderJourneyIndexPage(bundle, editorial, manualContent, siteAssets) {
  const journeys = manualContent.journeys.journeys;
  const journeyCards = journeys.map((journey) => renderJourneyCard(journey, {
    monogram: "JR",
    linkRegistry: siteAssets.linkRegistry,
    excludeHrefs: [journey.path]
  })).join("");

  const heroAside = `
    <div class="hero-panel">
      ${renderStatGrid([
        { label: "Journeys", value: journeys.length, detail: "Walkthroughs" },
        { label: "Skills", value: bundle.skills.length, detail: "Systems covered by the manual" },
        { label: "Worlds", value: bundle.worlds.length, detail: "Regions touched by the routes" }
      ], {
        className: "hero-stat-grid",
        itemClassName: "hero-stat-card"
      })}
    </div>
  `;

  const body = `
    <section class="section-card">
      <div class="section-heading">
        <div>
          <h2>Choose a goal</h2>
        </div>
        ${renderSearchHeader("journeys", "Search journeys by title, system, region, or goal", journeys.length)}
      </div>
      <div class="prose">
        <p>Each walkthrough explains the tools, materials, places, and actions needed for a goal.</p>
      </div>
    </section>
    <section class="entity-grid" data-filter-group="journeys">
      ${journeyCards}
    </section>
  `;

  return {
    routePath: buildSectionPath("journeys"),
    html: renderLayout({
      editorial,
      manifest: bundle.manifest,
      currentPath: buildSectionPath("journeys"),
      pageTitle: "Journeys",
      eyebrow: "Living Manual",
      heroTitle: "Journeys",
      heroBody: "<p>Follow a walkthrough to make equipment, prepare food, craft runes, or complete a quest.</p>",
      heroBadges: [],
      heroAside,
      body
    })
  };
}

module.exports = {
  renderJourneyIndexPage,
  renderJourneyPage
};
