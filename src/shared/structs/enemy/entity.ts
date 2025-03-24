
import type { BaseID } from "@rbxts/id";
import type { BaseEnemyDescriptor } from "./descriptor";

export interface EnemyEntity extends BaseEnemyDescriptor, BaseID<number> { }