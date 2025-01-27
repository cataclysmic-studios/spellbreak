import type { DataType } from "@rbxts/flamework-binary-serializer";

import type { MessageKind } from "./kind";

interface TestMessageData {
  readonly foo: string;
  readonly x: DataType.u8;
}

export interface MessageData {
  [MessageKind.TEST]: TestMessageData;
}