import type { OnStart } from "@flamework/core";
import { Component, Components } from "@flamework/components";
import { Players } from "@rbxts/services";

import { Enemy } from "./enemy";
import DestroyableComponent from "shared/base-components/destroyable-component";
import { tween } from "shared/utility/ui";
import { TweenInfoBuilder } from "@rbxts/builders";

type Combatant = Player | Enemy;

const MAX_COMBATANTS = 4;

@Component({ tag: "BattleCircle" })
export class BattleCircle extends DestroyableComponent<{}, ReplicatedFirst["Assets"]["BattleCircle"]> implements OnStart {
  private readonly team: Player[] = [];
  private readonly opponents: Combatant[] = [];
  private pvp = false;

  public constructor(
    private readonly components: Components
  ) { super(); }

  public onStart(): void {
    this.janitor.Add(this.instance.Main.Touched.Connect(hit => {
      const modelThatTouched = hit.FindFirstAncestorOfClass("Model");
      if (!modelThatTouched?.FindFirstChildOfClass("Humanoid")) return;

      const playerWhoTouched = <Maybe<Player>>Players.FindFirstChild(modelThatTouched?.Name ?? "");
      const enemyWhoTouched = this.components.getComponent<Enemy>(modelThatTouched);
      if (this.pvp) {
        if (playerWhoTouched === undefined) return;
      } else
        if (playerWhoTouched !== undefined)
          this.addTeammate(playerWhoTouched);
        else if (enemyWhoTouched !== undefined)
          this.addOpponent(enemyWhoTouched);
    }));
  }

  public addTeammate(player: Player): void {
    if (this.team.includes(player)) return;
    this.team.push(player);
    this.pullInCombatant(player)
  }

  public addOpponent(opponent: Combatant): void {
    if (this.opponents.includes(opponent)) return;
    this.opponents.push(opponent);
    this.pullInCombatant(opponent)
  }

  public destroy(): void {
    this.janitor.Destroy();
    for (const combatant of this.team)
      this.toggleMovement(combatant, true);
    for (const combatant of this.opponents) {
      if (combatant instanceof Enemy) continue;
      this.toggleMovement(combatant, true);
    }
  }

  private toggleMovement(combatant: Player, on: boolean) {
    const movementMode = on ? <ExtractKeys<typeof Enum.DevComputerMovementMode, EnumItem>>combatant.GetAttribute("DefaultMovementMode") : "Scriptable";
    const touchMode = on ? <ExtractKeys<typeof Enum.DevTouchMovementMode, EnumItem>>combatant.GetAttribute("DefaultTouchMode") : "Scriptable";
    combatant.DevComputerMovementMode = Enum.DevComputerMovementMode[movementMode];
    combatant.DevTouchMovementMode = Enum.DevTouchMovementMode[touchMode];
  }

  private pullInCombatant(combatant: Combatant) {
    const combatantIsNPC = combatant instanceof Enemy;
    const character = combatantIsNPC ? combatant.instance : combatant.Character!;
    if (!combatantIsNPC) {
      combatant.SetAttribute("DefaultMovementMode", combatant.DevComputerMovementMode.Name);
      combatant.SetAttribute("DefaultTouchMode", combatant.DevTouchMovementMode.Name)
      combatant.DevComputerMovementMode = Enum.DevComputerMovementMode.Scriptable;
      combatant.DevTouchMovementMode = Enum.DevTouchMovementMode.Scriptable;
    }

    const combatantCollection = this.opponents.includes(combatant) ? this.opponents : this.team;
    const positions = this.instance[this.opponents.includes(combatant) ? "OpponentPositions" : "TeamPositions"];
    const position = <BasePart>positions.FindFirstChild(combatantCollection.size() + 1);
    const tweenInfo = new TweenInfoBuilder()
      .SetTime(1)
      .SetEasingStyle(Enum.EasingStyle.Linear);

    const movement = tween(character.PrimaryPart!, tweenInfo, { CFrame: position.CFrame });
    if (combatantIsNPC) return;
    movement.Completed.Once(() => {}); // TODO: set camera mode to Battle, enable DeckHand UI, and add cards from deck to hand
  }
}