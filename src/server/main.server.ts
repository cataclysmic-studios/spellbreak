import { Flamework, Modding } from "@flamework/core";
import { createBinarySerializer, Serializer, SerializerMetadata } from "@rbxts/flamework-binary-serializer";

import { flameworkIgnited } from "shared/constants";

Flamework.addPaths("src/server/hooks");
Flamework.addPaths("src/server/services");
Flamework.ignite();
flameworkIgnited.Fire();