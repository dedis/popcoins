const RegisterViewModel = require("./register-view-model");

function onNavigatingTo(args) {
  if (args.isBackNavigation) {
    return;
  }

  const page = args.object;
  page.bindingContext = new RegisterViewModel();
}

exports.onNavigatingTo = onNavigatingTo;
