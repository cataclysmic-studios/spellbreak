interface ReplicatedStorage extends Instance {
  assets: Folder & {
    animations: Folder & {
      duel: Folder & {
        circle: Folder & {
          idle: Animation;
          combatantAdded: Animation;
          combatantRemoved: Animation;
        };
      }
    };
    duel: Folder & {
      circle: DuelCircleModel;
      selectionTarget: Model;
      combatantSigil: MeshPart;
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
    enemies: Folder;
    npcs: Folder;
    questArrow: MeshPart;
  }
}