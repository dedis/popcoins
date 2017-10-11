const AttViewModel = require("./att-view-model");

function onNavigatingTo(args) {
  if (args.isBackNavigation) {
    return;
  }

  const page = args.object;
  page.bindingContext = new AttViewModel();
}

exports.onNavigatingTo = onNavigatingTo;
