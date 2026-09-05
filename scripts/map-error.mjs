#!/usr/bin/env node
// roblox-ts/Luau has no real source-map format — Roblox Studio stack traces
// always report positions in the compiled dist/**/*.luau file, and rbxtsc
// emits no line-mapping metadata back to src/**/*.ts(x). What IS mechanical
// is the *path* translation: default.project.json syncs each dist realm
// folder wholesale, so a Studio Instance path is a dotted, extension-less
// mirror of the dist filesystem path, which in turn mirrors src/ 1:1 (a
// folder with an index.ts compiles to init.luau, everything else compiles
// <name>.ts(x) -> <name>.luau). This script does that path translation and
// then prints both files windowed around the given line so the (approximate,
// since statement expansion can shift line numbers) TS line is fast to spot
// by eye instead of re-deriving the realm/folder mapping by hand each time.
//
// Usage:
//   node scripts/map-error.mjs "ServerScriptService.TS.services.quest:42"
//   node scripts/map-error.mjs "PlayerScripts.TS.controllers.ui:10"   (client, runtime alias)
//   node scripts/map-error.mjs "dist/shared/structs/data/init.luau:5"
//   node scripts/map-error.mjs src/server/services/quest.ts           (no line: just resolve the dist path)

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..");
const REALM_TO_DIST = { server: "dist/server", shared: "dist/shared", client: "dist/client" };
const REALM_TO_SRC = { server: "src/server", shared: "src/shared", client: "src/client" };

const arg = process.argv[2];
if (!arg) {
  console.error('Usage: node scripts/map-error.mjs "<InstancePath>:<line>" | "<dist/path.luau>:<line>" | "<src/path.ts>"');
  process.exit(1);
}

const lineMatch = arg.match(/:(\d+)$/);
const line = lineMatch ? Number(lineMatch[1]) : undefined;
const path = lineMatch ? arg.slice(0, lineMatch.index) : arg;

function resolveFromInstancePath(p) {
  const segments = p.split(".");
  const tsIndex = segments.indexOf("TS");
  if (tsIndex === -1) return undefined;

  const before = segments.slice(0, tsIndex);
  let realm;
  if (before.includes("ServerScriptService")) realm = "server";
  else if (before.includes("ReplicatedStorage")) realm = "shared";
  else if (before.includes("StarterPlayerScripts") || before.includes("PlayerScripts")) realm = "client";
  else return undefined;

  const rest = segments.slice(tsIndex + 1);
  return { realm, restParts: rest };
}

function resolveFromFsPath(p) {
  const norm = p.replace(/\\/g, "/").replace(/^\.?\//, "");
  for (const [realm, distPrefix] of Object.entries(REALM_TO_DIST)) {
    if (norm.startsWith(distPrefix + "/")) {
      const rest = norm.slice(distPrefix.length + 1).replace(/\.luau?$/, "").replace(/\/init$/, "");
      return { realm, restParts: rest.split("/") };
    }
  }
  for (const [realm, srcPrefix] of Object.entries(REALM_TO_SRC)) {
    if (norm.startsWith(srcPrefix + "/")) {
      const rest = norm.slice(srcPrefix.length + 1).replace(/\.tsx?$/, "").replace(/\/index$/, "");
      return { realm, restParts: rest.split("/") };
    }
  }
  return undefined;
}

const resolved = resolveFromInstancePath(path) ?? resolveFromFsPath(path);
if (!resolved) {
  console.error(`Couldn't recognize "${path}" as a Studio Instance path or a dist/src file path.`);
  process.exit(1);
}

const { realm, restParts } = resolved;
const restPath = restParts.join("/");

function firstExisting(candidates) {
  return candidates.find(c => existsSync(join(ROOT, c)));
}

const distFile = firstExisting([
  `${REALM_TO_DIST[realm]}/${restPath}.luau`,
  `${REALM_TO_DIST[realm]}/${restPath}/init.luau`
]);
const srcFile = firstExisting([
  `${REALM_TO_SRC[realm]}/${restPath}.ts`,
  `${REALM_TO_SRC[realm]}/${restPath}.tsx`,
  `${REALM_TO_SRC[realm]}/${restPath}/index.ts`,
  `${REALM_TO_SRC[realm]}/${restPath}/index.tsx`
]);

if (!srcFile) {
  console.error(`Resolved realm/path but found no matching src file under ${REALM_TO_SRC[realm]}/${restPath}(.ts|.tsx|/index.ts(x)).`);
  if (distFile) console.error(`(dist file exists at ${distFile} — src may have been renamed since last build.)`);
  process.exit(1);
}

console.log(`src:  ${srcFile}`);
console.log(`dist: ${distFile ?? "(not built — run npm run build)"}`);

function printWindow(label, filePath, centerLine) {
  const lines = readFileSync(join(ROOT, filePath), "utf8").split("\n");
  const from = Math.max(0, centerLine - 6);
  const to = Math.min(lines.length, centerLine + 5);
  console.log(`\n--- ${label} (around line ${centerLine}) ---`);
  for (let i = from; i < to; i++) {
    const marker = i + 1 === centerLine ? ">" : " ";
    console.log(`${marker} ${String(i + 1).padStart(4)} | ${lines[i]}`);
  }
}

if (line !== undefined) {
  if (distFile) printWindow("dist", distFile, line);
  console.log("\n(No reliable dist<->src line mapping exists — the src window below is a guess based on the dist line's position in the file; scan nearby if it's off.)");
  printWindow("src", srcFile, line);
}
