const BCStatsViewModel = require("./bc-stats-view-model");
const topmost = require("ui/frame").topmost;
const bcStatsViewModel = new BCStatsViewModel();
const myStatsList = bcStatsViewModel.statsList;

const lib = require("../../../lib");
const User = lib.User;
const Convert = lib.Convert;
const Config = require("../../../lib/cothority/omniledger/Config.js");
const Log = require("~/lib/Log").default;

let pageObject = undefined;

function onLoaded(args) {
    const page = args.object;
    pageObject = page.page;

    Log.print("Loading page");

    User.getBCConfig().then(cfg => {
      page.bindingContext = bcStatsViewModel;
      myStatsList.empty();
      myStatsList.load(cfg);
    }).catch(err => Log.print(err));
}

/**
 * Changes the frame to the QR displaying of the conodes.
 */
function displayQrOfBC() {
    pageObject.showModal("pages/common/qr-code/qr-code-page", {
        textToShow: "bcconfig",
        title: "ByzCoin Configuration"
    }, () => {
    }, true);
}

/**
 * Go back to the previous page
 */
function goBack() {
    topmost().goBack();
}

function deleteConfig() {
    User.removeBCConfig();
    BCStatsViewModel.setDefined(false);
    myStatsList.empty();
    myStatsList.load(User._config);
}

function addBCConfig() {
    User.setBCConfig(new Config(1, null));
    BCStatsViewModel.setDefined(true);
    myStatsList.empty();
    myStatsList.load(User._config);
}

module.exports.onLoaded = onLoaded;
module.exports.displayQrOfBC = displayQrOfBC;
module.exports.goBack = goBack;
module.exports.deleteConfig = deleteConfig;
module.exports.addBCConfig = addBCConfig;
