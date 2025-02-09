
import type { BaseID } from "@rbxts/id";
import type { EnemyDescriptor } from "./descriptor";

export interface EnemyEntity extends EnemyDescriptor, BaseID<number> { }