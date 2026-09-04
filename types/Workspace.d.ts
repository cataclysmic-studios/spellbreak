interface Workspace extends WorldRoot {
  Zones: Folder & {
    WizardCity: Folder & {
      TownSquare: ZoneModel;
      PegasusLane: ZoneModel;
      HeadmastersOffice: ZoneModel;
      ShatterbonesTower: ZoneModel;
    };
  };
  TargetSelectionStorage: Folder;
}