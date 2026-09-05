#!/usr/bin/env node
// Detects duplicate *physical* @rbxts/vide installs under node_modules. Rojo
// syncs each on-disk copy as a separate Luau ModuleScript tree, so a real
// duplicate breaks reactive scopes across hook boundaries (see CLAUDE.md
// "Known gotchas"). `npm ls` isn't reliable here because npm's logical tree
// still lists @rbxts/vide under pretty-vide-utils even when the "overrides"
// entry has deduped it to a single copy on disk — this walks the actual
// filesystem instead. Run after any `npm install`/`npm update`.
// Usage: node scripts/check-vide.mjs

import { existsSync, readFileSync, readdirSync, realpathSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = join(import.meta.dirname, "..");
const NODE_MODULES = join(ROOT, "node_modules");

function findVideDirs(dir, out = []) {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const full = join(dir, entry.name);
    if (entry.name === "@rbxts") {
      const videPath = join(full, "vide");
      if (existsSync(videPath)) out.push(videPath);
    }
    const nested = join(full, "node_modules");
    if (existsSync(nested)) findVideDirs(nested, out);
  }
  return out;
}

const dirs = findVideDirs(NODE_MODULES);
const resolved = dirs.map(d => ({ logical: relative(ROOT, d).replace(/\\/g, "/"), real: realpathSync(d) }));
const uniqueReal = new Set(resolved.map(r => r.real));

if (resolved.length === 0) {
  console.log("No @rbxts/vide installs found on disk (unexpected — is node_modules installed?).");
  process.exitCode = 1;
} else if (uniqueReal.size === 1) {
  console.log(`OK: ${resolved.length} reference(s) to @rbxts/vide, all resolving to a single copy on disk:`);
  console.log(`  ${resolved[0].real}`);
} else {
  console.log(`WARNING: ${uniqueReal.size} distinct @rbxts/vide copies found on disk:`);
  for (const r of resolved) console.log(`  ${r.logical}  ->  ${r.real}`);
  console.log(
    "\nRojo syncs each physical copy as its own ModuleScript tree, so hooks compiled\n" +
    "against one copy can't see reactive scopes pushed by another (\"cannot cleanup\n" +
    "outside a stable or reactive scope\" at runtime). Check package.json's \"overrides\"\n" +
    "entry for @rbxts/vide is present, then reinstall to dedupe."
  );
  process.exitCode = 1;
}

const pkgJson = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8"));
if (!pkgJson.overrides?.["@rbxts/vide"]) {
  console.log("\nNOTE: package.json has no \"overrides\" entry pinning @rbxts/vide — that's the fix that keeps installs single-copy.");
}
