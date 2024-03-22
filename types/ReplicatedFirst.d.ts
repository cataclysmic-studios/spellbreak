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
      Main: MeshPart;
      Glow: MeshPart;
      Vortex: MeshPart;
      Root: Part;
      TeamPositions: Folder;
      OpponentPositions: Folder;
      AnimationController: AnimationController;
    };
  };
}