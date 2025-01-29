import { Flamework } from "@flamework/core";
import { flameworkIgnited } from "shared/constants";

import { MessageEmitter } from "shared/structs/messages/emitter";

MessageEmitter.initialize();
// Flamework.addPaths("src/client/hooks");
Flamework.addPaths("src/client/controllers");
Flamework.ignite();
flameworkIgnited.Fire();