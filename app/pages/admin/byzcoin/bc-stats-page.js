const BCStatsViewModel = require("./bc-stats-view-model");
const topmost = require("ui/frame").topmost;
const bcStatsViewModel = new BCStatsViewModel();
const myStatsList = bcStatsViewModel.statsList;

const lib = require("../../../lib");
const User = lib.User;
const Convert = lib.Convert;

let bc = undefined;
let bcStatus = undefined;
let pageObject = undefined;

function onLoaded(args) {
    const page = args.object;
    pageObject = page.page;
    bc = page.bindingContext.bc;
    bcStatus = page.bindingContext;
    page.bindingContext = bcStatsViewModel;

    myStatsList.empty();
    myStatsList.load(bcStatus);
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
    return User.removeBCConfig()
}

module.exports.onLoaded = onLoaded;
module.exports.displayQrOfBC = displayQrOfBC;
module.exports.goBack = goBack;
module.exports.deleteConfig = deleteConfig;
