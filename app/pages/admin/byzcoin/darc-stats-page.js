const DarcStatsViewModel = require("./darc-stats-view-model");
const topmost = require("ui/frame").topmost;
const darcStatsViewModel = new DarcStatsViewModel();
const myStatsList = darcStatsViewModel.statsList;

const lib = require("../../../lib");
const User = lib.User;
const Convert = lib.Convert;

let darc = undefined;
let darcStatus = undefined;
let pageObject = undefined;

function onLoaded(args) {
    const page = args.object;
    pageObject = page.page;
    darc = page.bindingContext.darc;
    darcStatus = page.bindingContext;
    page.bindingContext = darcStatsViewModel;

    myStatsList.empty();
    myStatsList.load(darcStatus);
}

/**
 * Changes the frame to the QR displaying of the conodes.
 */
function displayQrOfDarc() {
    pageObject.showModal("pages/common/qr-code/qr-code-page", {
        textToShow: "darc:hexadecimalid",
        title: "DARC informations"
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
    return User.removeDarc(darc)
}

module.exports.onLoaded = onLoaded;
module.exports.displayQrOfDarc = displayQrOfDarc;
module.exports.goBack = goBack;
module.exports.deleteDarc = deleteDarc;
