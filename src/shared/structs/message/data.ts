import type { DataType } from "@rbxts/flamework-binary-serializer";

import type { Message } from ".";

export interface MessageData {
  [Message.TOGGLE_MOVEMENT]: boolean;
}