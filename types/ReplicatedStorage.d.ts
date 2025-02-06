interface ReplicatedStorage extends Instance {
  assets: Folder & {
    animations: Folder & {
      battle: Folder & {
        circle: Folder & {
          idle: Animation;
          fighterAdded: Animation;
          fighterRemoved: Animation;
        };
      }
    };
    battle: Folder & {
      circle: BattleCircleModel;
      selectionTarget: Model;
      fighterSigil: MeshPart;
      pip: Part;
      powerPip: Part;
      shadowPip: Part;
      pointer: Part;
      pipPositions: Model & {
        "1": Part;
        "2": Part;
        "3": Part;
        "4": Part;
        "5": Part;
        "6": Part;
        "7": Part;
      };
    };
    characters: Folder & {
      roslyn: CharacterModel;
    };
  }
}