import { getInstanceAtPath } from "@rbxts/flamework-meta-utils";

import { loadDescriptors } from "./data-registry";
import type { DialogID, DialogDescriptor } from "shared/structs/npc/dialog";
import Log from "shared/log";

const dialogFolder = getInstanceAtPath("src/shared/game-data/dialog") as Folder;
const allDialogs = loadDescriptors<DialogID, DialogDescriptor>(dialogFolder, "dialog");

export function getDialogByID(id: DialogID): DialogDescriptor {
  Log.assert(allDialogs.has(id), "dialog with ID " + id + " not found");
  return allDialogs.get(id)!;
}
