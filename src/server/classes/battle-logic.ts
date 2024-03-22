import type { BattleTriangle } from "server/components/battle-triangle";
import type { BattleCircle } from "server/components/battle-circle";
import type { Enemy } from "server/components/enemy";

type Combatant = Player | Enemy;

export default class BattleLogic {
  private readonly triangle: BattleTriangle;
  private currentPositions: Folder;
  private currentCombatants: Combatant[];
  private currentTurnIndex: number;

  public constructor(
    private readonly circle: BattleCircle
  ) {
    this.triangle = circle.battleTriangle;

    math.randomseed(os.time());
    const team1First = math.random(1, 2) === 1;
    this.currentPositions = circle.instance[team1First ? "TeamPositions" : "OpponentPositions"];
    this.currentCombatants = team1First ? circle.team : circle.opponents;
    this.currentTurnIndex = 0;
  }

  public updateTriangle(doTween = true): void {
    this.triangle.pointAt(this.getTurnCombatantPosition(), doTween);
  }

  private getTurnCombatantPosition(): Vector3 {
    const currentPosition = <Part>this.currentPositions.FindFirstChild(this.currentTurnIndex + 1);
    return currentPosition.Position;
  }

  private getTurnCombatant(): Combatant {
    return this.currentCombatants[this.currentTurnIndex];
  }

  private advanceTurn(): void {
    this.currentTurnIndex += 1;
    this.currentTurnIndex %= 4;
    if (this.currentTurnIndex === 0) {
      this.currentCombatants = this.currentCombatants === this.circle.team ? this.circle.opponents : this.circle.team;
      this.currentPositions = this.currentPositions === this.circle.instance.TeamPositions ? this.circle.instance.OpponentPositions : this.circle.instance.TeamPositions;
    }

    this.updateTriangle();
  }
}