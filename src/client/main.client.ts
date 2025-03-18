import { Flamework } from "@flamework/core";

import { flameworkIgnited } from "shared/constants";

// Flamework.addPaths("src/client/hooks");
Flamework.addPaths("src/client/controllers");
Flamework.ignite();
flameworkIgnited.Fire();