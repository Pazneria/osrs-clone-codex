const fs = require("fs");
const http = require("http");
const path = require("path");
const { spawn } = require("child_process");

const { DEFAULT_SOURCE_ROOT, SOURCE_ROOT_ENV_VAR } = require("./sync-data");

const ROOT_DIR = path.resolve(__dirname, "..");
const DIST_DIR = path.join(ROOT_DIR, "dist");
const SITE_BASE_PATH = "/osrs-clone-codex/";
const HOST = process.env.HOST || "127.0.0.1";
const DEFAULT_PORT = Number(process.env.PORT || 5520);
const LIVE_RELOAD_PATH = "/__codex_live_reload";
const MAX_PORT_ATTEMPTS = 20;

const WATCH_IGNORE_PARTS = new Set([".git", "node_modules", "dist", "content/generated"]);
const CODEX_RELEVANT_PREFIXES = ["src/", "scripts/", "content/editorial/"];
const GAME_RELEVANT_PREFIXES = ["content/", "tools/", "src/js/content/"];

const MIME_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".mjs": "application/javascript; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".webp": "image/webp"
};

function normalizeRelativePath(value) {
  return String(value || "").replace(/\\/g, "/").replace(/^\.\/+/, "");
}

function shouldIgnoreRelativePath(relPath) {
  const parts = normalizeRelativePath(relPath).split("/").filter(Boolean);
  return parts.some((part) => WATCH_IGNORE_PARTS.has(part));
}

function isRelevantPath(relPath, prefixes) {
  const normalized = normalizeRelativePath(relPath);
  return prefixes.some((prefix) => normalized === prefix.slice(0, -1) || normalized.startsWith(prefix));
}

function openBrowser(url) {
  spawn("cmd", ["/c", "start", "", url], {
    detached: true,
    stdio: "ignore"
  }).unref();
}

function createLiveReloadSnippet() {
  return `
<script>
(() => {
  if (window.__codexLiveReloadBound) return;
  window.__codexLiveReloadBound = true;
  const source = new EventSource("${LIVE_RELOAD_PATH}");
  source.addEventListener("reload", () => {
    window.location.reload();
  });
  source.addEventListener("error", () => {
    source.close();
    setTimeout(() => window.location.reload(), 900);
  });
})();
</script>`;
}

function injectLiveReload(html) {
  const snippet = createLiveReloadSnippet();
  if (html.includes("</body>")) {
    return html.replace("</body>", `${snippet}\n</body>`);
  }
  return `${html}\n${snippet}`;
}

function normalizeUrlPath(urlPath) {
  if (!urlPath || urlPath === "/") return SITE_BASE_PATH;
  const cleanPath = decodeURIComponent(String(urlPath).split("?")[0]);
  if (cleanPath === SITE_BASE_PATH.slice(0, -1)) return SITE_BASE_PATH;
  return cleanPath;
}

function getAbsoluteRequestPath(urlPath) {
  const normalized = normalizeUrlPath(urlPath);
  if (normalized === SITE_BASE_PATH) {
    return path.join(DIST_DIR, "osrs-clone-codex", "index.html");
  }

  const candidate = path.resolve(DIST_DIR, `.${normalized}`);
  if (!candidate.startsWith(DIST_DIR)) return null;
  if (fs.existsSync(candidate) && fs.statSync(candidate).isDirectory()) {
    return path.join(candidate, "index.html");
  }
  return candidate;
}

function getMimeType(absPath) {
  return MIME_TYPES[path.extname(absPath).toLowerCase()] || "application/octet-stream";
}

function createWatchers(targets, onChange) {
  const watchers = targets
    .filter((target) => fs.existsSync(target.root))
    .map((target) => {
      const watcher = fs.watch(target.root, { recursive: true }, (eventType, filename) => {
        if (!filename) return;
        const relative = normalizeRelativePath(filename);
        if (shouldIgnoreRelativePath(relative)) return;
        if (!isRelevantPath(relative, target.prefixes)) return;
        onChange({
          eventType,
          rootLabel: target.label,
          relativePath: relative
        });
      });

      watcher.on("error", (error) => {
        console.error(`${target.label} watcher error:`, error.message);
      });

      return watcher;
    });

  return () => {
    watchers.forEach((watcher) => watcher.close());
  };
}

function listenWithFallback(server, { host, startingPort, onReady }) {
  const triedPorts = [];

  const attemptListen = (port) => {
    const handleError = (error) => {
      server.removeListener("listening", handleListening);

      const shouldTryNextPort =
        error &&
        (error.code === "EADDRINUSE" || error.code === "EACCES") &&
        triedPorts.length < MAX_PORT_ATTEMPTS;

      if (shouldTryNextPort) {
        const nextPort = port + 1;
        triedPorts.push(port);
        console.warn(`Port ${port} is busy, trying ${nextPort}...`);
        attemptListen(nextPort);
        return;
      }

      throw error;
    };

    const handleListening = () => {
      server.removeListener("error", handleError);
      onReady(port, triedPorts);
    };

    server.once("error", handleError);
    server.once("listening", handleListening);
    server.listen(port, host);
  };

  attemptListen(startingPort);
}

function runBuild(onComplete) {
  const child = spawn(process.execPath, [path.join(ROOT_DIR, "scripts", "build.js")], {
    cwd: ROOT_DIR,
    env: process.env,
    stdio: "inherit"
  });

  child.on("exit", (code) => {
    onComplete(code || 0);
  });
}

function startServer(options = {}) {
  const shouldOpen = Boolean(options.open);
  const shouldWatch = !options.once;
  const sourceRoot = path.resolve(process.env[SOURCE_ROOT_ENV_VAR] || DEFAULT_SOURCE_ROOT);

  const clients = new Set();
  let buildRunning = false;
  let pendingBuildReason = null;
  let debounceTimer = null;
  let currentUrl = null;
  let closeWatchers = () => {};

  const server = http.createServer((request, response) => {
    const urlPath = request.url || "/";

    if (urlPath === LIVE_RELOAD_PATH) {
      response.writeHead(200, {
        "Cache-Control": "no-cache, no-transform",
        "Connection": "keep-alive",
        "Content-Type": "text/event-stream",
        "X-Accel-Buffering": "no"
      });
      response.write("\n");
      clients.add(response);
      request.on("close", () => {
        clients.delete(response);
      });
      return;
    }

    if (urlPath === "/" || urlPath === "/index.html") {
      response.writeHead(302, { Location: SITE_BASE_PATH });
      response.end();
      return;
    }

    const absPath = getAbsoluteRequestPath(urlPath);
    if (!absPath || !fs.existsSync(absPath) || fs.statSync(absPath).isDirectory()) {
      response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Not found");
      return;
    }

    const mimeType = getMimeType(absPath);
    if (mimeType.startsWith("text/html")) {
      const html = fs.readFileSync(absPath, "utf8");
      response.writeHead(200, { "Content-Type": mimeType, "Cache-Control": "no-store" });
      response.end(injectLiveReload(html));
      return;
    }

    response.writeHead(200, { "Content-Type": mimeType, "Cache-Control": "no-store" });
    fs.createReadStream(absPath).pipe(response);
  });

  function broadcastReload(payload) {
    const message = `event: reload\ndata: ${JSON.stringify(payload)}\n\n`;
    for (const response of clients) {
      response.write(message);
    }
  }

  function startQueuedBuild(reason) {
    if (buildRunning) {
      pendingBuildReason = reason;
      return;
    }

    buildRunning = true;
    console.log(`[dev] rebuilding (${reason})...`);
    runBuild((exitCode) => {
      buildRunning = false;

      if (exitCode === 0) {
        console.log("[dev] build complete.");
        broadcastReload({
          reason,
          at: Date.now()
        });
      } else {
        console.error(`[dev] build failed with exit code ${exitCode}.`);
      }

      if (pendingBuildReason) {
        const nextReason = pendingBuildReason;
        pendingBuildReason = null;
        startQueuedBuild(nextReason);
      }
    });
  }

  function queueBuild(reason) {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      debounceTimer = null;
      startQueuedBuild(reason);
    }, 120);
  }

  function shutdown() {
    if (debounceTimer) clearTimeout(debounceTimer);
    closeWatchers();
    server.close();
    for (const response of clients) {
      response.end();
    }
    clients.clear();
  }

  process.on("SIGINT", () => {
    shutdown();
    process.exit(0);
  });
  process.on("SIGTERM", () => {
    shutdown();
    process.exit(0);
  });

  console.log("[dev] running initial build...");
  runBuild((exitCode) => {
    if (exitCode !== 0) {
      process.exit(exitCode);
      return;
    }

    listenWithFallback(server, {
      host: HOST,
      startingPort: DEFAULT_PORT,
      onReady: (port, triedPorts) => {
        currentUrl = `http://localhost:${port}${SITE_BASE_PATH}`;
        console.log(`Codex dev server running at ${currentUrl}`);
        if (triedPorts.length > 0) {
          console.log(`Preferred port ${DEFAULT_PORT} was unavailable.`);
        }
        if (shouldWatch) {
          closeWatchers = createWatchers([
            { label: "codex", root: ROOT_DIR, prefixes: CODEX_RELEVANT_PREFIXES },
            { label: "game", root: sourceRoot, prefixes: GAME_RELEVANT_PREFIXES }
          ], (change) => {
            queueBuild(`${change.rootLabel}: ${change.relativePath}`);
          });
          console.log("[dev] watching codex and game source for rebuilds.");
          console.log("[dev] live reload is enabled.");
        } else {
          console.log("[dev] watch mode disabled (--once).");
        }
        if (shouldOpen) openBrowser(currentUrl);
      }
    });
  });
}

const shouldOpen = process.argv.includes("--open");
const shouldRunOnce = process.argv.includes("--once");
startServer({
  open: shouldOpen,
  once: shouldRunOnce
});
