const frameModule = require("ui/frame");
const ScanToClip = require("~/shared/lib/scan-to-clip/scan-to-clip");

const SettingsViewModel = require("./settings-view-model");

/* ***********************************************************
 * Use the "onNavigatingTo" handler to initialize the page binding context.
 *************************************************************/
function onNavigatingTo(args) {

  // TODO: export - import settings

  /* ***********************************************************
   * The "onNavigatingTo" event handler lets you detect if the user navigated with a back button.
   * Skipping the re-initialization on back navigation means the user will see the
   * page in the same data state that he left it in before navigating.
   *************************************************************/
  if (args.isBackNavigation) {
    return;
  }

  const page = args.object;
  page.bindingContext = new SettingsViewModel();
}

/* ***********************************************************
 * According to guidelines, if you have a drawer on your page, you should always
 * have a button that opens it. Get a reference to the RadSideDrawer view and
 * use the showDrawer() function to open the app drawer section.
 *************************************************************/
function onDrawerButtonTap(args) {
  const sideDrawer = frameModule.topmost().getViewById("sideDrawer");
  sideDrawer.showDrawer();
}

/**
 * Global button to "scan to clip" in the settings drawer.
 * @returns {Promise.<any>}
 */
function scanToClip() {
  return ScanToClip.scanToClip();
}

exports.onNavigatingTo = onNavigatingTo;
exports.onDrawerButtonTap = onDrawerButtonTap;
exports.scanToClip = scanToClip;
