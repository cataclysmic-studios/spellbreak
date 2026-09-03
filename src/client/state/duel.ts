import { source } from "@rbxts/vide";

import type { ClientDuelInfo } from "shared/structs/duel";

/**
 * The local player's current duel, if any. Lives outside Flamework DI (rather
 * than on a controller) so it can be read directly from camera poses, which
 * are plain classes constructed by `CameraController` and would otherwise
 * need it threaded through every pose's constructor.
 */
export const currentDuel = source<Maybe<ClientDuelInfo>>(undefined);
