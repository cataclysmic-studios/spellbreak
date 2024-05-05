import { Networking } from "@flamework/networking";
import type { DataValue } from "./data-models/generic";
import type { GitHubInfo } from "./structs/github";
import type { GamepassInfo } from "./structs/roblox-api";

interface ServerEvents {
  battle: {
    usePips(amount: number): void;
    usePowerPips(amount: number): void;
    useShadowPips(amount: number): void;
  };
  data: {
    initialize(): void;
    set(directory: string, value: DataValue): void;
    increment(directory: string, amount?: number): void;
  };
  character: {
    playAs(index: number): void;
    toggleDefaultMovement(on: boolean): void;
    updateStats(stats: unknown): void;
  };
}

interface ClientEvents {
  battle: {
    turnChanged(): void;
    createClient(battleCircleID: string, team: Model[], opponents: Model[], characterData: unknown): void;
  };
  data: {
    updated(directory: string, value: DataValue): void;
  };
  character: {
    playAs(index: number): void;
    toggleCustomMovement(on: boolean): void;
  };
}

interface ClientEvents {
  data: {
    updated(directory: string, value: unknown): void;
  };
}

interface ServerFunctions {
  battle: {
    getTotalPips(): number;
    getShadowPips(): number;
  };
  character: {
    getStats(): unknown;
  };
  data: {
    get(directory: string): unknown;
  };
  github: {
    getInfo(): GitHubInfo;
  };
  roblox: {
    getGamepasses(amount?: number): GamepassInfo[];
  };
}

interface ClientFunctions { }

export const GlobalEvents = Networking.createEvent<ServerEvents, ClientEvents>();
export const GlobalFunctions = Networking.createFunction<ServerFunctions, ClientFunctions>();
