import { Flamework } from "@flamework/core";

import { MessageEmitter } from "shared/structs/messages/emitter";

MessageEmitter.initialize();
// Flamework.addPaths("src/client/hooks");
Flamework.addPaths("src/client/controllers");
Flamework.ignite();