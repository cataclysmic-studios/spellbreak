interface PlayerGui extends BasePlayerGui {
  LoadScreen: ScreenGui & {
    ViewportFrame: ViewportFrame & {
      Page: Model & WithAnimationController;
    };
  };
}