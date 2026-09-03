import { getDescendantsOfType } from "@rbxts/instance-utility";
import type { BaseID } from "@rbxts/id";

import Log from "shared/log";

const log = Log.scoped("game data");

/**
 * Loads every ModuleScript under `folder` as a descriptor satisfying
 * `BaseID<ID>`, and indexes the result by each descriptor's `id`. This is how
 * every `game-data` category (npcs, dialog, quests, enemies, zones) turns its
 * per-file content into a lookup table - see `shared/utility/npc.ts`,
 * `dialog.ts`, `quests.ts`, `enemy.ts`, and `zone.ts`.
 *
 * `folder` must come from a `getInstanceAtPath("literal/path")` call at the
 * call site - that macro needs a string literal, so it can't be forwarded
 * through this helper as a parameter.
 */
export function loadDescriptors<ID extends defined, T extends BaseID<ID>>(folder: Folder, label: string): Map<ID, T> {
  const registry = new Map<ID, T>;
  for (const descriptorModule of getDescendantsOfType(folder, "ModuleScript")) {
    const descriptor = require<T>(descriptorModule);
    registry.set(descriptor.id, descriptor);
  }

  log.debug(`Loaded ${registry.size()} ${label} descriptor(s)`);
  return registry;
}
