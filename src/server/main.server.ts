import { Flamework } from "@flamework/core";
import { flameworkIgnited } from "shared/constants";

import { MessageEmitter } from "shared/structs/messages/emitter";

MessageEmitter.initialize();
Flamework.addPaths("src/server/hooks");
Flamework.addPaths("src/server/services");
Flamework.ignite();
flameworkIgnited.Fire();