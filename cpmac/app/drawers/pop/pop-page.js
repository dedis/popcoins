const FrameModule = require("ui/frame");
const ScanToClip = require("~/shared/lib/scan-to-clip/scan-to-clip");

const PopViewModel = require("./pop-view-model");

/* ***********************************************************
 * Use the "onNavigatingTo" handler to initialize the page binding context.
 *************************************************************/
function onNavigatingTo(args) {
  /* ***********************************************************
   * The "onNavigatingTo" event handler lets you detect if the user navigated with a back button.
   * Skipping the re-initialization on back navigation means the user will see the
   * page in the same data state that he left it in before navigating.
   *************************************************************/
  if (args.isBackNavigation) {
    return;
  }

  const page = args.object;
  page.bindingContext = new PopViewModel();
}

/* ***********************************************************
 * According to guidelines, if you have a drawer on your page, you should always
 * have a button that opens it. Get a reference to the RadSideDrawer view and
 * use the showDrawer() function to open the app drawer section.
 *************************************************************/
function onDrawerButtonTap(args) {
  const sideDrawer = FrameModule.topmost().getViewById("sideDrawer");
  sideDrawer.showDrawer();
}

/**
 * Global button to "scan to clip" in the PoP drawer.
 * @returns {Promise.<any>}
 */
function scanToClip() {
  return ScanToClip.scanToClip();
}

exports.onNavigatingTo = onNavigatingTo;
exports.onDrawerButtonTap = onDrawerButtonTap;
exports.scanToClip = scanToClip;
