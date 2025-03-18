import { Flamework } from "@flamework/core";

import { flameworkIgnited } from "shared/constants";

Flamework.addPaths("src/server/hooks");
Flamework.addPaths("src/server/services");
Flamework.ignite();
flameworkIgnited.Fire();