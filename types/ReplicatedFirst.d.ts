interface ReplicatedFirst extends Instance {
  Assets: Folder & {
    UI: Folder & {
      EnemyNametag: BillboardGui & {
        Title: TextLabel;
        Bottom: Frame & {
          Info: TextLabel;
          SchoolIcon: ImageLabel;
        };
      };
    };
    BattleCircle: Model & {
      Main: BasePart;
      TeamPositions: Folder;
      OpponentPositions: Folder;
    }
  };
}