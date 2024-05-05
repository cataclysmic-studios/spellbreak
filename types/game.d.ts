interface PipPositionsModel extends Model {
  ["1"]: Part;
  ["2"]: Part;
  ["3"]: Part;
  ["4"]: Part;
  ["5"]: Part;
  ["6"]: Part;
  ["7"]: Part;
}

interface CharacterModel extends Model {
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