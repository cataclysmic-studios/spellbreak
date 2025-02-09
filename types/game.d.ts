interface DuelCirclePositions extends Folder {
  "1": Part;
  "2": Part;
  "3": Part;
  "4": Part;
}

interface DuelCircleModel extends Model, WithAnimationController {
  opponentPositions: DuelCirclePositions;
  teamPositions: DuelCirclePositions;
}

type CombatantModel = CharacterModel | EnemyModel;

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