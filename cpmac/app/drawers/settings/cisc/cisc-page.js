const CiscViewModel = require("./cisc-view-model");

function onNavigatingTo(args) {
  if (args.isBackNavigation) {
    return;
  }

  const page = args.object;
  page.bindingContext = new CiscViewModel();
}

exports.onNavigatingTo = onNavigatingTo;
