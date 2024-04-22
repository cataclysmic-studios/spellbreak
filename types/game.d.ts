interface CharacterModel extends Model {
  PrimaryPart: Part;
  Humanoid: Humanoid;
  Head: Part;
}

interface ToggleSwitchButton extends ImageButton {
  UIPadding: UIPadding;
  UICorner: UICorner;
  UIStroke: UIStroke;
  UIAspectRatioConstraint: UIAspectRatioConstraint;
  Node: Frame & {
    UICorner: UICorner;
    UIStroke: UIStroke;
    UIAspectRatioConstraint: UIAspectRatioConstraint;
  };
}