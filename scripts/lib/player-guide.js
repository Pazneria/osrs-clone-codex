const fs = require("fs");
const path = require("path");

function loadPlayerGuide(projectRoot, bundle) {
  const guide = JSON.parse(fs.readFileSync(path.join(projectRoot, "content/editorial/player-guide.json"), "utf8"));
  if (guide.schemaVersion !== 1 || !/^[a-f0-9]{40}$/.test(guide.sourceCommit) || guide.sourceCommit !== bundle.manifest.sourceCommit) {
    throw new Error("Player guide needs review against the exported game commit; update its sourceCommit after auditing runtime facts.");
  }
  if (!Array.isArray(guide.sections) || !guide.sections.length || !Array.isArray(guide.sources) || !guide.sources.length) {
    throw new Error("Player guide requires sections and source references.");
  }
  const ids = new Set();
  for (const section of guide.sections) {
    if (!/^[a-z][a-z0-9-]*$/.test(section.id) || ids.has(section.id) || !section.title || !section.paragraphs?.length) {
      throw new Error(`Invalid player guide section ${section.id}`);
    }
    ids.add(section.id);
    for (const link of section.links || []) {
      const url = new URL(link.href, "https://pazneria.github.io");
      if (url.origin !== "https://pazneria.github.io" || !url.pathname.startsWith("/osrs-clone-codex/") || url.username || url.password) {
        throw new Error(`Unsafe player guide link in ${section.id}`);
      }
    }
  }
  for (const source of guide.sources) {
    if (!/^(src|content|tools)\/[a-zA-Z0-9_./-]+$/.test(source.path) || source.path.split("/").includes("..")) {
      throw new Error("Invalid player guide source path");
    }
  }
  return guide;
}

module.exports = { loadPlayerGuide };
