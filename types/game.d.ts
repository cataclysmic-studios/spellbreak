interface BattleCirclePositions extends Folder {
  "1": Part;
  "2": Part;
  "3": Part;
  "4": Part;
}

interface BattleCircleModel extends Model, WithAnimationController {
  opponentPositions: BattleCirclePositions;
  teamPositions: BattleCirclePositions;
}

interface EnemyModel extends Model {
  collider: Part;
}

interface CharacterModel extends Model, WithAnimationController {
  collider: Part;
}

interface WithAnimationController {
  AnimationController: AnimationController & {
    Animator: Animator;
  };
}