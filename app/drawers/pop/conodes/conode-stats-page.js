const Convert = require("../../../shared/lib/dedjs/Convert");
const ConodeStatsViewModel = require("./conode-stats-view-model");
const topmost = require("ui/frame").topmost;
const conodeStatsViewModel = new ConodeStatsViewModel();
const myStatsList = conodeStatsViewModel.statsList;
const User = require("../../../shared/lib/dedjs/object/user/User").get;
const CothorityMessages = require("../../../shared/lib/dedjs/network/cothority-messages");

let conode = undefined;
let conodeStatus = undefined;
let pageObject = undefined;

function onLoaded(args) {
    const page = args.object;
    pageObject = page.page;
    conode = page.bindingContext.conode;
    conodeStatus = page.bindingContext;
    page.bindingContext = conodeStatsViewModel;

    myStatsList.empty();
    myStatsList.load(conodeStatus);
}

/**
 * Changes the frame to the QR displaying of the conodes.
 */
function displayQrOfConode() {
    pageObject.showModal("shared/pages/qr-code/qr-code-page", {
        textToShow: Convert.objectToJson(conode),
        title: "Conode informations"
    }, () => {
    }, true);
}

/**
 * Go back to the previous page
 */
function goBack() {
    topmost().goBack();
}

function deleteConode() {
    return User.removeConode(conode)
        .then(()=>{
            return topmost().goBack();
        })
}

module.exports.onLoaded = onLoaded;
module.exports.displayQrOfConode = displayQrOfConode;
module.exports.goBack = goBack;
module.exports.deleteConode = deleteConode;