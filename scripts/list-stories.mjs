#!/usr/bin/env node
// Lists every Hoarcekat story under src/shared/ui/stories and the component
// file(s) it imports, so you can find which story previews a given component
// (or see what's previewable at all) without grepping by hand.
// Usage: node scripts/list-stories.mjs

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = join(import.meta.dirname, "..");
const STORIES_DIR = join(ROOT, "src", "shared", "ui", "stories");

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) walk(full, out);
    else if (/\.story\.tsx?$/.test(entry)) out.push(full);
  }
  return out;
}

const IMPORT_RE = /import\s+.*?from\s+["']([^"']+)["']/g;

for (const file of walk(STORIES_DIR).sort()) {
  const src = readFileSync(file, "utf8");
  const imports = [];
  let m;
  IMPORT_RE.lastIndex = 0;
  while ((m = IMPORT_RE.exec(src))) {
    if (m[1].includes("components") || m[1].includes("views")) imports.push(m[1]);
  }
  console.log(relative(ROOT, file).replace(/\\/g, "/"));
  for (const imp of imports) console.log(`  -> ${imp}`);
}
