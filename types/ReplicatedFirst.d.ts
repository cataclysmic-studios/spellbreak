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
      Main: MeshPart & {
        Decal: Decal;
      };
      Glow: MeshPart & {
        Decal: Decal;
      };
      Vortex: MeshPart & {
        Decal: Decal;
      };
      Root: Part;
      TeamPositions: Folder;
      OpponentPositions: Folder;
      AnimationController: AnimationController;
      Animations: Folder & {
        Idle: Animation;
        OnAdd: Animation;
        OnRemove: Animation;
      };
    };
  };
}