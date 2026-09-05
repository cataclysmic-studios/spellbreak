#!/usr/bin/env node
// Game content (spells, npcs, enemies, dialog, quests, items, zones) lives as
// one small declarative file per entry under src/shared/game-data/**, keyed by
// enum IDs (NpcID.X, QuestID.X, ...). This searches by filename or ID/name
// text and prints the matching file(s) in full, since they're usually small
// enough that dumping beats grepping line-by-line.
// Usage: node scripts/find-content.mjs <query>

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = join(import.meta.dirname, "..");
const GAME_DATA_DIR = join(ROOT, "src", "shared", "game-data");

const query = process.argv.slice(2).join(" ").trim().toLowerCase();
if (!query) {
  console.error("Usage: node scripts/find-content.mjs <query>");
  process.exit(1);
}

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) walk(full, out);
    else if (/\.tsx?$/.test(entry)) out.push(full);
  }
  return out;
}

let hits = 0;
for (const file of walk(GAME_DATA_DIR).sort()) {
  const rel = relative(ROOT, file).replace(/\\/g, "/");
  const content = readFileSync(file, "utf8");
  if (rel.toLowerCase().includes(query) || content.toLowerCase().includes(query)) {
    hits++;
    console.log(`\n=== ${rel} ===`);
    console.log(content.trimEnd());
  }
}

if (hits === 0) console.log(`No game-data files matched "${query}".`);
