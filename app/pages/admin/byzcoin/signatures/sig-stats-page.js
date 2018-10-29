const SigStatsViewModel = require("./sig-stats-view-model");
const topmost = require("ui/frame").topmost;
const sigStatsViewModel = new SigStatsViewModel();
const myStatsList = sigStatsViewModel.statsList;
const Dialog = require("ui/dialogs");

const lib = require("~/lib");
const User = lib.User;
const Convert = lib.Convert;

let sig = undefined;
let sigStatus = undefined;
let pageObject = undefined;

function onLoaded(args) {
    const page = args.object;
    pageObject = page.page;
    //sig = page.bindingContext.sig;
    sigStatus = page.bindingContext;
    page.bindingContext = sigStatsViewModel;

    myStatsList.empty();
    myStatsList.load(sigStatus);
}

/**
 * Go back to the previous page
 */
function goBack() {
    topmost().goBack();
}

function accept() {
  Dialog.alert({
      title: "Request accepted!",
      message: "This is not implemented yet",
      okButtonText: "Ok I'm sorry"
  });
}

function refuse() {
  Dialog.alert({
      title: "Request refused.",
      message: "This is not implemented yet",
      okButtonText: "Ok I'm sorry"
  });
}

module.exports.onLoaded = onLoaded;
module.exports.goBack = goBack;
module.exports.accept = accept;
module.exports.refuse = refuse;
