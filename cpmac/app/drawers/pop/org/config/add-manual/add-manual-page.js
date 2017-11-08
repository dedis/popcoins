const Frame = require("ui/frame");
const ConfigViewModel = require("./add-manual-view-model");

let textViewConodeToml = undefined;

function onLoaded(args) {
  if (args.isBackNavigation) {
    return;
  }

  const page = args.object;

  loadViews(page);
  if (textViewConodeToml === undefined) {
    throw new Error("a field is undefined, but it shouldn't");
  }

  page.bindingContext = new ConfigViewModel();
}

/**
 * Loads the needed views into their variables.
 * @param page - the current page object
 */
function loadViews(page) {
  textViewConodeToml = page.getViewById("text-view-conode-toml");
}

function addManual() {
  Frame.topmost().navigate({
                             moduleName: "drawers/pop/org/config/config-page",
                             bindingContext: homeViewModel.conodeList.getItem(args.index).conode,
                             backstackVisible: false
                           });
  Frame.topmost().goBack();
}

exports.onLoaded = onLoaded;
exports.addManual = addManual;
