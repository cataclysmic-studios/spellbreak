interface ReplicatedFirst extends Instance {
  Assets: Folder & {
    BattleCircle: Model & {
      Main: BasePart;
      TeamPositions: Folder;
      OpponentPositions: Folder;
    }
  };
}