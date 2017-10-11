const ConfigViewModel = require("./config-view-model");

function onNavigatingTo(args) {
  if (args.isBackNavigation) {
    return;
  }

  const page = args.object;
  page.bindingContext = new ConfigViewModel();
}

exports.onNavigatingTo = onNavigatingTo;
