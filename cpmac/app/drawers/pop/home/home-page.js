const HomeViewModel = require("./home-view-model");

function onNavigatingTo(args) {
  if (args.isBackNavigation) {
    return;
  }

  const page = args.object;
  page.bindingContext = new HomeViewModel();
}

exports.onNavigatingTo = onNavigatingTo;
