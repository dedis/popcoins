const DarcStatsViewModel = require("./darc-stats-view-model");
const topmost = require("ui/frame").topmost;
const darcStatsViewModel = new DarcStatsViewModel();
const myStatsList = darcStatsViewModel.statsList;

const lib = require("../../../lib");
const User = lib.User;
const Convert = lib.Convert;
const Log = lib.Log.default;
const Darc = require("../../../lib/cothority/omniledger/darc/Darc.js");

let darc = undefined;
let darcStatus = undefined;
let pageObject = undefined;

function onLoaded(args) {
    const page = args.object;
    pageObject = page.page;
    darc = User.getDarcs()[page.bindingContext];
    page.bindingContext = darcStatsViewModel;

    myStatsList.empty();
    myStatsList.load(darc);
}

/**
 * Changes the frame to the QR displaying of the conodes.
 */
function displayQrOfDarc() {
    pageObject.showModal("pages/common/qr-code/qr-code-page", {
        textToShow: darc.getBaseIDString(),
        title: darc._description
    }, () => {
    }, true);
}

/**
 * Go back to the previous page
 */
function goBack() {
    topmost().goBack();
}

function deleteDarc() {
    User.removeDarc(darc._baseID);
    goBack();
}

module.exports.onLoaded = onLoaded;
module.exports.displayQrOfDarc = displayQrOfDarc;
module.exports.goBack = goBack;
module.exports.deleteDarc = deleteDarc;
