#!/usr/bin/env node
// Lists every Flamework @Service()/@Controller() with its constructor-injected
// dependencies, without having to open and read each file by hand.
// Usage: node scripts/list-services.mjs [--json]

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = join(import.meta.dirname, "..");
const AS_JSON = process.argv.includes("--json");

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) walk(full, out);
    else if (/\.tsx?$/.test(entry)) out.push(full);
  }
  return out;
}

const DECORATOR_RE = /@(Service|Controller)\(\s*({[^)]*})?\s*\)\s*\n\s*export\s+class\s+(\w+)/g;
const CTOR_RE = /public\s+constructor\s*\(([\s\S]*?)\)\s*(?:\{|:)/;
const PARAM_RE = /(?:private|public|protected)?\s*(?:readonly\s+)?(\w+)\s*:\s*([\w.]+)/g;

const results = [];
for (const file of walk(join(ROOT, "src"))) {
  const src = readFileSync(file, "utf8");
  let m;
  DECORATOR_RE.lastIndex = 0;
  while ((m = DECORATOR_RE.exec(src))) {
    const [, kind, , className] = m;
    const rest = src.slice(m.index);
    const ctorMatch = CTOR_RE.exec(rest);
    const deps = [];
    if (ctorMatch) {
      let pm;
      PARAM_RE.lastIndex = 0;
      while ((pm = PARAM_RE.exec(ctorMatch[1]))) {
        deps.push({ name: pm[1], type: pm[2] });
      }
    }
    results.push({
      kind,
      className,
      file: relative(ROOT, file).replace(/\\/g, "/"),
      deps
    });
  }
}

results.sort((a, b) => a.kind.localeCompare(b.kind) || a.className.localeCompare(b.className));

if (AS_JSON) {
  console.log(JSON.stringify(results, null, 2));
} else {
  let lastKind;
  for (const r of results) {
    if (r.kind !== lastKind) {
      console.log(`\n${r.kind}s:`);
      lastKind = r.kind;
    }
    const deps = r.deps.map(d => `${d.name}: ${d.type}`).join(", ");
    console.log(`  ${r.className}  (${r.file})${deps ? `\n    <- ${deps}` : ""}`);
  }
}
