const Frame = require("ui/frame");
const Convert = require("../../../shared/lib/dedjs/Convert");
const ConodeStatsViewModel = require("./conode-stats-view-model");

const conodeStatsViewModel = new ConodeStatsViewModel();

const myStatsList = conodeStatsViewModel.statsList;

let conode = undefined;
let conodeStatus = undefined;

function onNavigatingTo(args) {
  if (args.isBackNavigation) {
    return;
  }

  const page = args.object;
  conode = page.bindingContext.conode;
  conodeStatus = page.bindingContext.conodeStatus;

  page.bindingContext = conodeStatsViewModel;

  loadFunction(conode);
}

/**
 * Loads the properties of the selected conode into the list to display them to the user.
 * @param conode - the selected conode
 */
function loadFunction(conode) {
  myStatsList.empty();
  myStatsList.load(conode);
}

/**
 * Changes the frame to the QR displaying of the conodes.
 */
function displayQrOfConode() {
  Frame.topmost().navigate({
    moduleName: "shared/pages/qr-code/qr-code-page",
    bindingContext: {
      textToShow: Convert.objectToJson(conode)
    }
  });
}

module.exports.onNavigatingTo = onNavigatingTo;
module.exports.displayQrOfConode = displayQrOfConode;
