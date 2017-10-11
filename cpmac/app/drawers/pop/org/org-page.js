const Frame = require("ui/frame");

const OrgViewModel = require("./org-view-model");

function onNavigatingTo(args) {
  if (args.isBackNavigation) {
    return;
  }

  const page = args.object;
  page.bindingContext = new OrgViewModel();
}

function configButtonTapped(args) {
  Frame.topmost().navigate({
                             moduleName: "drawers/pop/org/config/config-page"
                           });
}

function registerButtonTapped(args) {
  Frame.topmost().navigate({
                             moduleName: "drawers/pop/org/register/register-page"
                           });
}

exports.onNavigatingTo = onNavigatingTo;
exports.configButtonTapped = configButtonTapped;
exports.registerButtonTapped = registerButtonTapped;
