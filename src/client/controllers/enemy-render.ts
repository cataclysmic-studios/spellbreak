import { Controller, type OnStart, type OnRender } from "@flamework/core";
import { CollectionService } from "@rbxts/services";

import { ENEMY_TAG } from "shared/utility/enemy";

// The server throttles patrol CFrame writes well below Heartbeat rate to cut replication
// bandwidth (see `Enemy.moveTo`). This smooths those discrete steps back out by lerping toward
// each newly-replicated CFrame over however long the previous step actually took, so patrol
// motion looks continuous no matter what rate the server ends up throttled to.
const MIN_LERP_DURATION = 0.05;
const MAX_LERP_DURATION = 0.5;
// A replication jump farther than this is a teleport (spawn, duel start/end), not a patrol
// stride - snap instantly instead of gliding across the gap.
const MAX_LERP_DISTANCE = 6;

interface EnemyRenderState {
  root: BasePart;
  from: CFrame;
  to: CFrame;
  startTime: number;
  duration: number;
  lastApplied: CFrame;
  connection: RBXScriptConnection;
}

@Controller()
export class EnemyRenderController implements OnStart, OnRender {
  private readonly states = new Map<Instance, EnemyRenderState>();

  public onStart(): void {
    for (const instance of CollectionService.GetTagged(ENEMY_TAG))
      this.track(instance);

    CollectionService.GetInstanceAddedSignal(ENEMY_TAG).Connect(instance => this.track(instance));
    CollectionService.GetInstanceRemovedSignal(ENEMY_TAG).Connect(instance => this.untrack(instance));
  }

  public onRender(): void {
    const now = os.clock();
    for (const [_, state] of this.states) {
      const progress = state.duration > 0 ? math.clamp((now - state.startTime) / state.duration, 0, 1) : 1;
      state.lastApplied = state.from.Lerp(state.to, progress);
      state.root.CFrame = state.lastApplied;
    }
  }

  private track(instance: Instance): void {
    if (this.states.has(instance)) return;

    const root = (instance as Model).PrimaryPart;
    if (root === undefined) return;

    const initial = root.CFrame;
    const state = {
      root,
      from: initial,
      to: initial,
      startTime: os.clock(),
      duration: 0,
      lastApplied: initial
    } as EnemyRenderState;

    state.connection = root.GetPropertyChangedSignal("CFrame").Connect(() => this.onCFrameReplicated(state));
    this.states.set(instance, state);
  }

  private untrack(instance: Instance): void {
    const state = this.states.get(instance);
    if (state === undefined) return;

    state.connection.Disconnect();
    this.states.delete(instance);
  }

  private onCFrameReplicated(state: EnemyRenderState): void {
    const replicated = state.root.CFrame;
    if (replicated === state.lastApplied) return; // our own interpolated write, not a real update

    const now = os.clock();
    const distance = replicated.Position.sub(state.lastApplied.Position).Magnitude;
    if (distance > MAX_LERP_DISTANCE) {
      state.from = replicated;
      state.to = replicated;
      state.startTime = now;
      state.duration = 0;
      state.lastApplied = replicated;
      return;
    }

    state.duration = math.clamp(now - state.startTime, MIN_LERP_DURATION, MAX_LERP_DURATION);
    state.from = state.lastApplied;
    state.to = replicated;
    state.startTime = now;
  }
}
