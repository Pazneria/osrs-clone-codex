const fs = require("fs");
const path = require("path");
const { DEFAULT_CODEX_BASE_PATH } = require("./lib/codex-link-contract");
const root = path.resolve(__dirname, "../dist/osrs-clone-codex");
function files(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => entry.isDirectory()
    ? files(path.join(dir, entry.name)) : [path.join(dir, entry.name)]);
}
const pages = files(root).filter(file => file.endsWith(".html"));
const failures = [];
const external = new Set();
let checkedLinks = 0;
for (const file of pages) {
  const html = fs.readFileSync(file, "utf8");
  const rel = path.relative(root, file).replaceAll("\\", "/");
  const route = DEFAULT_CODEX_BASE_PATH + rel.replace(/index\.html$/, "");
  if (!html.includes('<html lang="en">') || !html.includes('name="viewport"')
    || !html.includes('id="main-content"') || !html.includes('class="skip-link"')) failures.push(`${rel}: missing page accessibility structure`);
  for (const match of html.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
    const raw = match[1].replaceAll("&amp;", "&").replaceAll("&quot;", '"').replaceAll("&#39;", "'");
    const url = new URL(raw, `https://pazneria.github.io${route}`);
    if (url.protocol !== "https:" || url.username || url.password) {
      failures.push(`${rel}: unsafe URL ${raw}`); continue;
    }
    if (url.origin !== "https://pazneria.github.io" || !url.pathname.startsWith(DEFAULT_CODEX_BASE_PATH)) {
      if (url.hostname !== "github.com" && url.href !== "https://pazneria.github.io/osrs-clone/") failures.push(`${rel}: unexpected outbound link ${raw}`);
      external.add(url.href); continue;
    }
    checkedLinks++;
    const relativeTarget = decodeURIComponent(url.pathname.slice(DEFAULT_CODEX_BASE_PATH.length));
    let target = path.resolve(root, relativeTarget);
    if (target !== root && !target.startsWith(root + path.sep)) { failures.push(`${rel}: link escapes site root`); continue; }
    if (fs.existsSync(target) && fs.statSync(target).isDirectory()) target = path.join(target, "index.html");
    if (!fs.existsSync(target)) { failures.push(`${rel}: missing target ${raw}`); continue; }
    if (url.hash && target.endsWith(".html")) {
      const content = target === file ? html : fs.readFileSync(target, "utf8");
      if (!content.includes(`id="${decodeURIComponent(url.hash.slice(1))}"`)) failures.push(`${rel}: missing anchor ${raw}`);
    }
  }
  if (/<iframe\b|\son[a-z]+\s*=|javascript:|<script[^>]*src="https?:/i.test(html)) failures.push(`${rel}: unexpected active content`);
}
if (failures.length) { console.error(failures.join("\n")); process.exit(1); }
console.log(`Checked ${pages.length} pages, ${checkedLinks} local links/assets/anchors, and ${external.size} distinct outbound URLs. No broken targets or unexpected active content.`);
