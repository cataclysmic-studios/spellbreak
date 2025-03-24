import Object from "@rbxts/object-utils";

export const anchorPoints = {
  topLeft: new Vector2(0, 0),
  topRight: new Vector2(1, 0),
  topCenter: new Vector2(0.5, 0),
  bottomLeft: new Vector2(0, 1),
  bottomRight: new Vector2(1, 1),
  bottomCenter: new Vector2(0.5, 1),
  leftCenter: new Vector2(0, 0.5),
  rightCenter: new Vector2(1, 0.5),
  center: new Vector2(0.5, 0.5)
};

export const positions = Object.fromEntries(Object.entries(anchorPoints)
  .map(([name, vector]) => [name, UDim2.fromScale(vector.X, vector.Y)]));