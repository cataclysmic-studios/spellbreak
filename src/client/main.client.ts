import { Flamework } from "@flamework/core";

import { Message, messaging } from "shared/messaging";
import "./lori";
import "./konsole";

// Flamework.addPaths("src/client/hooks");
Flamework.addPaths("src/client/controllers");
Flamework.ignite();

// Tells the server every OnClientMessage listener is registered, so it knows it's safe to
// (re)send any per-player state a controller missed by loading before this point - see
// DatabaseService.onClientReady for the paired half of this handshake.
messaging.server.emit(Message.Client_Ready);