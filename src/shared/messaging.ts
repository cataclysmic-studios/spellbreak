import type { DataType } from "@rbxts/flamework-binary-serializer";
import type { BaseID } from "@rbxts/id";
import { MessageEmitter } from "@rbxts/tether";
import { SpellReference } from "./structs/data/reference/spell";

export const messaging = MessageEmitter.create<MessageData>();

export const enum Message {
  // Server -> Client
  ToggleMovement,
  SetCameraPose,
  TransitionCameraPose,
  DuelInitializeClient,
  DuelPhaseChanged,
  DuelCombatantAdded,
  DuelCombatantRemoved,
  DuelUpdateTimer,

  // Client -> Server
  DuelSubmitChoice,
  DuelRevokeChoice
}

type WithDuelID = BaseID<DataType.u8>;

export interface MessageData {
  [Message.ToggleMovement]: boolean;
  [Message.SetCameraPose]: DataType.u8; // pose kind
  [Message.TransitionCameraPose]: {
    readonly poseKind: DataType.u8;
    readonly duration: DataType.f32;
  }

  // dueling
  [Message.DuelInitializeClient]: WithDuelID & {
    readonly onOpposingTeam: boolean;
    readonly teamCount: DataType.u8;
    readonly opponentCount: DataType.u8;
  };
  [Message.DuelPhaseChanged]: DataType.u8; // new duel phase
  [Message.DuelCombatantAdded]: boolean; // whether combatant is on opposing team
  [Message.DuelCombatantRemoved]: boolean;
  [Message.DuelUpdateTimer]: DataType.u8; // new time left
  [Message.DuelSubmitChoice]: WithDuelID & {
    readonly choice?: {
      readonly spellReference: SpellReference;
      readonly target?: DataType.u8; // duel circle position
      readonly targetIsOpponent?: boolean;
    };
  };
  [Message.DuelRevokeChoice]: WithDuelID;
}