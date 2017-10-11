const PopViewModel = require("./pop-view-model");

function onNavigatingTo(args) {
  if (args.isBackNavigation) {
    return;
  }

  const page = args.object;
  page.bindingContext = new PopViewModel();
}

exports.onNavigatingTo = onNavigatingTo;
