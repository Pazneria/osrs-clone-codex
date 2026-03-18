const path = require("path");

const { loadCodexBundle, validateCodexBundle } = require("./lib/codex-data");
const { scaffoldItemEditorial } = require("./lib/item-editorial");
const { syncCodexData } = require("./sync-data");

function run() {
  const projectRoot = path.resolve(__dirname, "..");
  const { outDir } = syncCodexData();
  const bundle = loadCodexBundle(projectRoot, outDir);
  validateCodexBundle(bundle);
  const summary = scaffoldItemEditorial(projectRoot, bundle);
  const createdCount = summary.reduce((total, batch) => total + batch.created, 0);
  console.log(`Scaffolded item editorial batches (${createdCount} new entries across ${summary.length} files).`);
}

try {
  run();
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
