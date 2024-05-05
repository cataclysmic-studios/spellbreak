import { HttpService as HTTP } from "@rbxts/services";
import Signal from "@rbxts/signal";

import { Events, Functions } from "server/network";
import { USE_CURLY_BRACES_FOR_UUIDS } from "shared/constants";
import Destroyable from "shared/classes/destroyable";

import { Enemy } from "server/components/enemy";
import type BattleLogic from "./battle-logic";

const { clamp, floor } = math;

const MAX_PIPS = 14;

interface PlayerPipState {
  powerPips: number;
  pips: number;
  shadowPips: number;
}

export default class PipState extends Destroyable {
  public readonly pipsChanged = new Signal;
  private playerStates: Record<string, PlayerPipState> = {};

  public constructor(
    private readonly battleLogic: BattleLogic
  ) {
    super();
    Functions.battle.getShadowPips.setCallback(player => this.get(player.Character!).shadowPips);
    Functions.battle.getTotalPips.setCallback(player => this.getTotalPips(player.Character!));
    this.janitor.Add(Events.battle.usePips.connect((player, amount) => this.usePips(player.Character!, amount)));
    this.janitor.Add(Events.battle.usePowerPips.connect((player, amount) => this.usePowerPips(player.Character!, amount)));
    this.janitor.Add(Events.battle.useShadowPips.connect((player, amount) => {
      const { stats: { maxShadowPips } } = battleLogic.circle.characterData.getCurrent(player);
      this.useShadowPips(player.Character!, maxShadowPips, amount);
    }));

    this.janitor.Add(battleLogic.turnChanged.Connect(() => this.turnChanged()));
    this.janitor.Add(() => this.playerStates = {});
  }

  public getTotalPips(combatant: Model): number {
    const { pips, powerPips } = this.get(combatant);
    return powerPips * 2 + pips;
  }

  public usePips(combatant: Model, amount: number): void {
    this.update(combatant, state => state.pips = clamp(state.pips - amount, 0, floor(MAX_PIPS - (state.powerPips * 2))));
    this.pipsChanged.Fire();
  }

  public usePowerPips(combatant: Model, amount: number): void {
    this.update(combatant, state => state.powerPips = clamp(state.powerPips - amount, 0, floor((MAX_PIPS - state.pips) / 2)));
    this.pipsChanged.Fire();
  }

  public useShadowPips(combatant: Model, maxShadowPips: number, amount: number): void {
    this.update(combatant, state => state.shadowPips = clamp(state.shadowPips - amount, 0, maxShadowPips));
    this.pipsChanged.Fire();
  }

  public gainPip(combatant: Model): void {
    this.update(combatant, state => state.pips += 1);
    this.pipsChanged.Fire();
  }

  public gainPowerPip(combatant: Model): void {
    this.update(combatant, state => state.powerPips += 1);
    this.pipsChanged.Fire();
  }

  public gainShadowPip(combatant: Model): void {
    this.update(combatant, state => state.shadowPips += 1);
    this.pipsChanged.Fire();
  }

  public get(combatant: Model): PlayerPipState {
    return this.playerStates[this.getCombatantID(combatant)] ?? {
      pips: 0,
      powerPips: 0,
      shadowPips: 0
    };
  }

  private turnChanged(): void {
    for (const combatant of this.battleLogic.circle.getAllCombatants())
      task.spawn(() => {
        const data = this.battleLogic.getCombatantData(combatant);
        const combatantModel = combatant instanceof Enemy ? combatant.instance : combatant.Character!;
        this.gainTurnPips(combatantModel, data.stats.powerPipChance, data.stats.shadowPipRating);
      });
  }

  private gainTurnPips(combatant: Model, powerPipChance: number, shadowPipRating: number): void {
    const gainPowerPip = math.random(1, 100) <= powerPipChance;
    if (gainPowerPip)
      this.gainPowerPip(combatant);
    else
      this.gainPip(combatant);
  }

  private update(combatant: Model, updater: (state: PlayerPipState) => void): void {
    const state = this.get(combatant);
    updater(state);
    this.set(combatant, state);
  }

  private set(combatant: Model, state: PlayerPipState): void {
    this.playerStates[this.getCombatantID(combatant)] = state;
  }

  private getCombatantID(combatant: Model): string {
    const id = <Maybe<string>>combatant.GetAttribute("ID");
    if (id === undefined) {
      const generatedID = HTTP.GenerateGUID(USE_CURLY_BRACES_FOR_UUIDS);
      combatant.SetAttribute("ID", generatedID);
      return generatedID
    }
    return id;
  }
}