const ConodeStatsViewModel = require("./conode-stats-view-model");

const conodeStatsViewModel = new ConodeStatsViewModel();

function onNavigatingTo(args) {
  if (args.isBackNavigation) {
    return;
  }

  const page = args.object;
  const conodeToDisplay = page.bindingContext;

  page.bindingContext = conodeStatsViewModel;

  loadFunction(conodeToDisplay);
}

function loadFunction(conode) {
  conodeStatsViewModel.statsList.empty();
  conodeStatsViewModel.statsList.load(conode);
}

exports.onNavigatingTo = onNavigatingTo;
