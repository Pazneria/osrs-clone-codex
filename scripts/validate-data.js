const path = require("path");

const { loadWikiBundle, validateWikiBundle } = require("./lib/wiki-data");
const { syncWikiData } = require("./sync-data");

function run() {
  const projectRoot = path.resolve(__dirname, "..");
  const { outDir } = syncWikiData();
  const bundle = loadWikiBundle(projectRoot, outDir);
  validateWikiBundle(bundle);
  console.log(
    `Validated wiki bundle `
    + `(${bundle.items.length} items, ${bundle.skills.length} skills, ${bundle.worlds.length} worlds).`
  );
}

try {
  run();
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
