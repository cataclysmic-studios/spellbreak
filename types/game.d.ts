interface CharacterModel extends Model {
  Humanoid: Humanoid & {
    Animator: Animator;
  };
}