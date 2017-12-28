const Frame = require("ui/frame");
const ScanToClip = require("../../shared/lib/scan-to-clip/scan-to-clip");

function onNavigatingTo(args) {
  if (args.isBackNavigation) {
    return;
  }

  const page = args.object;
}

function onDrawerButtonTap(args) {
  const sideDrawer = Frame.topmost().getViewById("sideDrawer");
  sideDrawer.showDrawer();
}

/**
 * Global button to "scan to clip" in the PoP drawer.
 * @returns {Promise.<any>}
 */
function scanToClip() {
  return ScanToClip.scan();
}

module.exports.onNavigatingTo = onNavigatingTo;
module.exports.onDrawerButtonTap = onDrawerButtonTap;
module.exports.scanToClip = scanToClip;
