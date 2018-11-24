const DarcStatsViewModel = require("./darc-stats-view-model");
const topmost = require("ui/frame").topmost;
const darcStatsViewModel = new DarcStatsViewModel();
const myStatsList = darcStatsViewModel.statsList;

const lib = require("../../../lib");
const User = lib.User;
const Convert = lib.Convert;
const Log = lib.Log.default;
const Darc = require("../../../lib/cothority/omniledger/darc/Darc.js");
const Dialog = require("ui/dialogs");

let darc = undefined;
let darcStatus = undefined;
let pageObject = undefined;

function onLoaded(args) {
    const page = args.object;
    pageObject = page.page;
    User.getDarcs().then(darcs => {
      darc = darcs[page.bindingContext];
      page.bindingContext = darcStatsViewModel;
      myStatsList.empty();
      myStatsList.load(darc);
    });
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

function infoTapped(args) {
    const index = args.index;

    switch (index) {
      case 0:
        Dialog.prompt({
          title: "Edit Description",
          okButtonText: "OK",
          cancelButtonText: "Cancel",
          defaultText: darc._description
        }).then(function (r) {
          if (r.result) darc.evolve()._description = r.text;
          myStatsList.empty();
          myStatsList.load(darc);
        });
        break;
      case 1:
      case 2:
      case 3:
      case 4:
        Dialog.alert({
            title: "Error",
            message: "This field is not editable",
            okButtonText: "Ok"
        });
        break;
      default:
        [rule, expr] = darc.getRule(index - 5);
        Dialog.prompt({
          title: "Edit Rule",
          message: rule,
          okButtonText: "OK",
          cancelButtonText: "Cancel",
          neutralButtonText: "Delete Rule",
          defaultText: expr
        }).then(function (r) {
          if (r.result) darc.evolve()._rules.set(rule, r.text);
          if (r.result == undefined) {
            if (rule == "_sign" || rule == "invoke:evolve") {
              Dialog.alert({
                  title: "Error",
                  message: "This rule cannot be deleted",
                  okButtonText: "Ok"
              });
            } else {
              darc.evolve()._rules.delete(rule);
            }
          }
          myStatsList.empty();
          myStatsList.load(darc);
        });
      break;
    }
}

function newRule() {
  Dialog.prompt({
    title: "Add Rule",
    message: "Please enter the rule",
    okButtonText: "Next",
    cancelButtonText: "Cancel",
    defaultText: ""
  }).then(function (r1) {
    if (r1.result) {
      Dialog.prompt({
        title: "Add Rule",
        message: "Please enter the expression",
        okButtonText: "OK",
        cancelButtonText: "Cancel",
        defaultText: ""
      }).then(function (r2) {
        if (r2.result) {
          darc.evolve()._rules.set(r1.text, r2.text);
          myStatsList.empty();
          myStatsList.load(darc);
        }
      });
    }
  });
}

module.exports.onLoaded = onLoaded;
module.exports.displayQrOfDarc = displayQrOfDarc;
module.exports.goBack = goBack;
module.exports.deleteDarc = deleteDarc;
module.exports.infoTapped = infoTapped;
module.exports.newRule = newRule;
