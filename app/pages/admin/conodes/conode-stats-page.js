const ConodeStatsViewModel = require("./conode-stats-view-model");
const topmost = require("ui/frame").topmost;
const conodeStatsViewModel = new ConodeStatsViewModel();
const myStatsList = conodeStatsViewModel.statsList;

const lib = require("../../../lib");
const User = lib.User;
const Convert = lib.Convert;

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
    pageObject.showModal("pages/common/qr-code/qr-code-page", {
        textToShow: Convert.serverIdentityToJson(conode),
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