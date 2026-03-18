const fs = require("fs");
const path = require("path");

const { buildCodexHomePath } = require("./lib/codex-link-contract");
const { loadCodexBundle, validateCodexBundle } = require("./lib/codex-data");
const { loadItemEditorial, writeItemAuthoringArtifacts } = require("./lib/item-editorial");
const { loadManualContent } = require("./lib/manual-content");
const { syncCodexData } = require("./sync-data");
const { renderHomePage } = require("./render/home");
const { renderItemIndexPage, renderItemPage } = require("./render/items");
const { renderJourneyIndexPage, renderJourneyPage } = require("./render/journeys");
const { renderSkillIndexPage, renderSkillPage } = require("./render/skills");
const { renderWorldIndexPage, renderWorldPage } = require("./render/worlds");
const {
  buildSectionPath,
  getItemIconAssetId,
  routePathToOutputFile
} = require("./render/shared");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function readJson(absPath) {
  return JSON.parse(fs.readFileSync(absPath, "utf8"));
}

function writeText(absPath, contents) {
  fs.mkdirSync(path.dirname(absPath), { recursive: true });
  fs.writeFileSync(absPath, contents);
}

function copyFile(absSource, absTarget) {
  fs.mkdirSync(path.dirname(absTarget), { recursive: true });
  fs.copyFileSync(absSource, absTarget);
}

function removeDir(absPath) {
  if (fs.existsSync(absPath)) fs.rmSync(absPath, { recursive: true, force: true });
}

function writeRoutePage(siteRoot, page) {
  writeText(routePathToOutputFile(siteRoot, page.routePath), page.html);
}

function copyBundleFiles(bundle, siteRoot) {
  const filenames = Object.assign({
    manifest: "manifest.json",
    items: "items.json",
    skills: "skills.json",
    worlds: "worlds.json"
  }, bundle.manifest.files || {});

  const targets = [
    { source: path.join(bundle.dataDir, "manifest.json"), target: path.join(siteRoot, "data", "manifest.json") },
    { source: path.join(bundle.dataDir, filenames.items), target: path.join(siteRoot, "data", "items.json") },
    { source: path.join(bundle.dataDir, filenames.skills), target: path.join(siteRoot, "data", "skills.json") },
    { source: path.join(bundle.dataDir, filenames.worlds), target: path.join(siteRoot, "data", "worlds.json") }
  ];

  targets.forEach((entry) => copyFile(entry.source, entry.target));
}

function copyIconAssets(bundle, siteRoot, sourceRoot) {
  const assetIds = new Set();
  bundle.items.forEach((item) => {
    const assetId = getItemIconAssetId(item);
    if (assetId) assetIds.add(assetId);
  });

  const copiedIds = new Set();
  assetIds.forEach((assetId) => {
    const sourcePath = path.join(sourceRoot, "assets", "pixel", `${assetId}.png`);
    if (!fs.existsSync(sourcePath)) return;
    copyFile(sourcePath, path.join(siteRoot, "assets", "pixel", `${assetId}.png`));
    copiedIds.add(assetId);
  });

  return {
    iconAssetIds: copiedIds
  };
}

function validateGeneratedPages(siteRoot, routePaths) {
  routePaths.forEach((routePath) => {
    const outputFile = routePathToOutputFile(siteRoot, routePath);
    assert(fs.existsSync(outputFile), `Missing generated page for ${routePath}`);
  });
}

function run() {
  const projectRoot = path.resolve(__dirname, "..");
  const siteEditorial = readJson(path.join(projectRoot, "content", "editorial", "site.json"));
  const { sourceRoot, outDir } = syncCodexData();
  const bundle = loadCodexBundle(projectRoot, outDir);
  validateCodexBundle(bundle);
  writeItemAuthoringArtifacts(projectRoot, bundle);
  const itemEditorial = loadItemEditorial(projectRoot, bundle);
  const manualContent = loadManualContent(projectRoot, bundle);

  const siteRoot = path.join(projectRoot, "dist", "osrs-clone-codex");
  removeDir(siteRoot);
  fs.mkdirSync(siteRoot, { recursive: true });

  copyFile(path.join(projectRoot, "src", "styles.css"), path.join(siteRoot, "styles.css"));
  copyFile(path.join(projectRoot, "src", "site.js"), path.join(siteRoot, "site.js"));
  copyBundleFiles(bundle, siteRoot);
  const siteAssets = copyIconAssets(bundle, siteRoot, sourceRoot);

  const routePaths = [
    buildCodexHomePath(),
    buildSectionPath("journeys"),
    buildSectionPath("items"),
    buildSectionPath("skills"),
    buildSectionPath("world"),
    ...manualContent.journeys.journeys.map((entry) => entry.path),
    ...bundle.manifest.indexes.items.map((entry) => entry.path),
    ...bundle.manifest.indexes.skills.map((entry) => entry.path),
    ...bundle.manifest.indexes.worlds.map((entry) => entry.path)
  ];

  const staticPages = [
    { routePath: buildCodexHomePath(), html: renderHomePage(bundle, siteEditorial, manualContent, siteAssets) },
    renderJourneyIndexPage(bundle, siteEditorial, manualContent, siteAssets),
    renderItemIndexPage(bundle, siteEditorial, manualContent, siteAssets),
    renderSkillIndexPage(bundle, siteEditorial, manualContent, siteAssets),
    renderWorldIndexPage(bundle, siteEditorial, manualContent, siteAssets)
  ];

  staticPages.forEach((page) => writeRoutePage(siteRoot, page));
  manualContent.journeys.journeys.forEach((journey) => writeRoutePage(siteRoot, renderJourneyPage(bundle, siteEditorial, manualContent, journey, siteAssets)));
  bundle.items.forEach((item) => writeRoutePage(siteRoot, renderItemPage(bundle, siteEditorial, itemEditorial, manualContent, item, siteAssets)));
  bundle.skills.forEach((skill) => writeRoutePage(siteRoot, renderSkillPage(bundle, siteEditorial, manualContent, skill, siteAssets)));
  bundle.worlds.forEach((world) => writeRoutePage(siteRoot, renderWorldPage(bundle, siteEditorial, manualContent, world, siteAssets)));

  validateGeneratedPages(siteRoot, routePaths);
  console.log(`Built codex site at ${siteRoot}.`);
}

try {
  run();
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
