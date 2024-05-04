import { Networking } from "@flamework/networking";
import type { DataValue } from "./data-models/generic";
import type { GitHubInfo } from "./structs/github";
import type BattleCameraState from "./structs/battle-camera-state";

interface ServerEvents {
  battle: {

  };
  data: {
    initialize(): void;
    set(directory: string, value: DataValue): void;
    increment(directory: string, amount?: number): void;
  };
}

interface ClientEvents {
  general: {
    addTag(instancePath: string, tag: string): void;
  };
  battle: {
    toggleUI(on: boolean): void;
    setCameraState(battleCircleID: string, state: BattleCameraState): void;
  };
  data: {
    updated(directory: string, value: DataValue): void;
  };
}

interface ServerFunctions {
  data: {
    get(directory: string): DataValue;
  };
  github: {
    getInfo(): GitHubInfo;
  };
}

interface ClientFunctions {}

export const GlobalEvents = Networking.createEvent<ServerEvents, ClientEvents>();
export const GlobalFunctions = Networking.createFunction<ServerFunctions, ClientFunctions>();
