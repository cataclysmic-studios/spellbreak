interface CharacterModel extends Model {
  Collider: Part;
  AnimationController: AnimationController & {
    Animator: Animator;
  };
}