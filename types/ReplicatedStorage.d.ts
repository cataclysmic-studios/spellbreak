interface ReplicatedStorage extends Instance {
  assets: Folder & {
    characters: Folder & {
      roslyn: CharacterModel;
    };
  }
}