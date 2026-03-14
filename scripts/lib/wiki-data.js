const fs = require("fs");
const path = require("path");

const {
  DEFAULT_WIKI_BASE_PATH,
  buildWikiEntityPath,
  getWikiRouteTemplates
} = require("./wiki-link-contract");

const DEFAULT_FILENAMES = Object.freeze({
  manifest: "manifest.json",
  items: "items.json",
  skills: "skills.json",
  worlds: "worlds.json"
});

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function getDefaultDataDir(projectRoot) {
  return path.join(projectRoot, "content", "generated", "wiki-export");
}

function readJson(absPath) {
  return JSON.parse(fs.readFileSync(absPath, "utf8"));
}

function createEntityIndex(rows, keyField) {
  return rows.map((row) => ({
    id: row[keyField],
    title: row.title,
    slug: row.slug,
    path: row.path
  }));
}

function loadWikiBundle(projectRoot, dataDir = getDefaultDataDir(projectRoot)) {
  const manifestPath = path.join(dataDir, DEFAULT_FILENAMES.manifest);
  assert(fs.existsSync(manifestPath), `Missing wiki bundle manifest at ${manifestPath}`);
  const manifest = readJson(manifestPath);
  const filenames = Object.assign({}, DEFAULT_FILENAMES, manifest.files || {});
  const itemsPath = path.join(dataDir, filenames.items);
  const skillsPath = path.join(dataDir, filenames.skills);
  const worldsPath = path.join(dataDir, filenames.worlds);

  assert(fs.existsSync(itemsPath), `Missing wiki bundle items at ${itemsPath}`);
  assert(fs.existsSync(skillsPath), `Missing wiki bundle skills at ${skillsPath}`);
  assert(fs.existsSync(worldsPath), `Missing wiki bundle worlds at ${worldsPath}`);

  return {
    manifest,
    items: readJson(itemsPath),
    skills: readJson(skillsPath),
    worlds: readJson(worldsPath),
    dataDir
  };
}

function validateEntityCollection(rows, idField, entityLabel, entityType) {
  const ids = new Set();
  const slugs = new Set();
  const paths = new Set();

  rows.forEach((row, index) => {
    const id = String(row[idField] || "").trim();
    assert(id, `${entityLabel} at index ${index} is missing ${idField}`);
    assert(!ids.has(id), `Duplicate ${entityLabel} id ${id}`);
    ids.add(id);

    const slug = String(row.slug || "").trim();
    assert(slug, `${entityLabel} ${id} is missing slug`);
    assert(!slugs.has(slug), `Duplicate ${entityLabel} slug ${slug}`);
    slugs.add(slug);

    const expectedPath = buildWikiEntityPath(entityType, id, { basePath: DEFAULT_WIKI_BASE_PATH });
    assert(row.path === expectedPath, `${entityLabel} ${id} path mismatch`);
    assert(!paths.has(row.path), `Duplicate ${entityLabel} path ${row.path}`);
    paths.add(row.path);
  });
}

function validateWikiBundle(bundle) {
  assert(bundle && typeof bundle === "object", "wiki bundle is required");
  const { manifest } = bundle;
  assert(manifest && typeof manifest === "object", "wiki manifest is required");
  assert(typeof manifest.schemaVersion === "number", "wiki manifest schemaVersion is required");
  assert(typeof manifest.generatedAt === "string" && manifest.generatedAt, "wiki manifest missing generatedAt");
  assert(typeof manifest.sourceCommit === "string" && manifest.sourceCommit, "wiki manifest missing sourceCommit");
  assert(manifest.basePath === DEFAULT_WIKI_BASE_PATH, "wiki manifest basePath mismatch");

  const expectedRoutes = getWikiRouteTemplates(DEFAULT_WIKI_BASE_PATH);
  assert(JSON.stringify(manifest.routes || {}) === JSON.stringify(expectedRoutes), "wiki route templates mismatch");

  const items = Array.isArray(bundle.items) ? bundle.items : [];
  const skills = Array.isArray(bundle.skills) ? bundle.skills : [];
  const worlds = Array.isArray(bundle.worlds) ? bundle.worlds : [];

  validateEntityCollection(items, "itemId", "item", "item");
  validateEntityCollection(skills, "skillId", "skill", "skill");
  validateEntityCollection(worlds, "worldId", "world", "world");

  const itemIds = new Set(items.map((entry) => entry.itemId));
  const skillIds = new Set(skills.map((entry) => entry.skillId));
  const worldIds = new Set(worlds.map((entry) => entry.worldId));

  items.forEach((item) => {
    (Array.isArray(item.relatedSkillIds) ? item.relatedSkillIds : []).forEach((skillId) => {
      assert(skillIds.has(skillId), `item ${item.itemId} links to unknown skill ${skillId}`);
    });
    (Array.isArray(item.relatedWorldIds) ? item.relatedWorldIds : []).forEach((worldId) => {
      assert(worldIds.has(worldId), `item ${item.itemId} links to unknown world ${worldId}`);
    });
  });

  skills.forEach((skill) => {
    (Array.isArray(skill.relatedItemIds) ? skill.relatedItemIds : []).forEach((itemId) => {
      assert(itemIds.has(itemId), `skill ${skill.skillId} links to unknown item ${itemId}`);
    });
    (Array.isArray(skill.relatedWorldIds) ? skill.relatedWorldIds : []).forEach((worldId) => {
      assert(worldIds.has(worldId), `skill ${skill.skillId} links to unknown world ${worldId}`);
    });
  });

  worlds.forEach((world) => {
    (Array.isArray(world.relatedSkillIds) ? world.relatedSkillIds : []).forEach((skillId) => {
      assert(skillIds.has(skillId), `world ${world.worldId} links to unknown skill ${skillId}`);
    });
    (Array.isArray(world.travelLinks) ? world.travelLinks : []).forEach((link) => {
      const targetWorldId = String(link && link.targetWorldId ? link.targetWorldId : "").trim();
      assert(worldIds.has(targetWorldId), `world ${world.worldId} links to unknown world ${targetWorldId}`);
    });
  });

  assert(manifest.counts && manifest.counts.items === items.length, "wiki item count mismatch");
  assert(manifest.counts && manifest.counts.skills === skills.length, "wiki skill count mismatch");
  assert(manifest.counts && manifest.counts.worlds === worlds.length, "wiki world count mismatch");

  const indexes = manifest.indexes || {};
  assert(JSON.stringify(indexes.items || []) === JSON.stringify(createEntityIndex(items, "itemId")), "wiki item index mismatch");
  assert(JSON.stringify(indexes.skills || []) === JSON.stringify(createEntityIndex(skills, "skillId")), "wiki skill index mismatch");
  assert(JSON.stringify(indexes.worlds || []) === JSON.stringify(createEntityIndex(worlds, "worldId")), "wiki world index mismatch");

  return bundle;
}

module.exports = {
  DEFAULT_FILENAMES,
  getDefaultDataDir,
  loadWikiBundle,
  validateWikiBundle
};
