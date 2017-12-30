const ObservableModule = require("data/observable");
const Dialog = require("ui/dialogs");
const Convert = require("../../../shared/lib/dedjs/Convert");
const Net = require("../../../shared/lib/dedjs/Net");
const ScanToReturn = require("../../../shared/lib/scan-to-return/scan-to-return");
const User = require("../../../shared/lib/dedjs/object/user/User").get;
const PoP = require("../../../shared/lib/dedjs/object/pop/PoP").get;

const FINAL_STATEMENT_OPTION_DELETE = "Delete";
const FINAL_STATEMENT_OPTION_QR = "QR";
const FINAL_STATEMENT_OPTION_POP_TOKENIFY = "PoP-Tokenify";

const POP_TOKEN_OPTION_REVOKE = "Revoke";

let pageObject = undefined;

const viewModel = ObservableModule.fromObject({
  finalStatements: PoP.getFinalStatements(),
  popToken: PoP.getPopToken()
});

function onLoaded(args) {
  if (args.isBackNavigation) {
    return;
  }

  const page = args.object;
  pageObject = page.parent.page;
  page.bindingContext = viewModel;
}

function finalStatementTapped(args) {
  return Dialog.action({
    message: "Choose an Action",
    cancelButtonText: "Cancel",
    actions: [FINAL_STATEMENT_OPTION_DELETE, FINAL_STATEMENT_OPTION_QR, FINAL_STATEMENT_OPTION_POP_TOKENIFY]
  })
    .then(result => {
      if (result === FINAL_STATEMENT_OPTION_DELETE) {
        // Delete Final Statement
        return PoP.deleteFinalStatementByIndex(args.index);
      } else if (result === FINAL_STATEMENT_OPTION_POP_TOKENIFY) {
        // PoP-Tokenify
        if (User.isKeyPairSet()) {
          return PoP.generatePopTokenByIndex(args.index);
        } else {
          return Dialog.alert({
            title: "Missing Key Pair",
            message: "Please set a key pair in your settings.",
            okButtonText: "Ok"
          });
        }
      } else if (result === FINAL_STATEMENT_OPTION_QR) {
        // Show QR of Final Statement

        const PasteBin = new Net.PasteBin();
        const finalStatementJson = JSON.stringify(PoP.getFinalStatements().getItem(args.index));

        return PasteBin.paste(finalStatementJson)
          .then(id => {
            const object = {};
            object.id = id;

            pageObject.showModal("shared/pages/qr-code/qr-code-page", {
              textToShow: Convert.objectToJson(object)
            }, () => { }, true);

            return Promise.resolve();
          });
      }

      return Promise.resolve();
    })
    .catch(error => {
      console.log(error);
      console.dir(error);
      console.trace();

      Dialog.alert({
        title: "Error",
        message: "An error occured, please retry. - " + error,
        okButtonText: "Ok"
      });

      return Promise.reject(error);
    });
}

function popTokenTapped(args) {
  return Dialog.action({
    message: "Choose an Action",
    cancelButtonText: "Cancel",
    actions: [POP_TOKEN_OPTION_REVOKE]
  })
    .then(result => {
      if (result === POP_TOKEN_OPTION_REVOKE) {
        // Revoke Token
        return PoP.revokePopTokenByIndex(args.index);
      }

      return Promise.resolve();
    })
    .catch(error => {
      console.log(error);
      console.dir(error);
      console.trace();

      Dialog.alert({
        title: "Error",
        message: "An error occured, please retry.",
        okButtonText: "Ok"
      });

      return Promise.reject(error);
    });
}

function scanFinalStatement() {
  return ScanToReturn.scan()
    .then(pasteBinIdJson => {
      const id = Convert.jsonToObject(pasteBinIdJson).id;
      const PasteBin = new Net.PasteBin();

      // TODO: remove
      //return PasteBin.get(id);
      return PasteBin.get("8VPb6X5g");
    })
    .then(finalStatementJson => {
      const finalStatement = Convert.parseJsonFinalStatement(finalStatementJson);

      return PoP.addFinalStatement(finalStatement, true);
    })
    .catch(error => {
      console.log(error);
      console.dir(error);
      console.trace();

      Dialog.alert({
        title: "Error",
        message: "An error occured, please retry.",
        okButtonText: "Ok"
      });

      return Promise.reject(error);
    });
}

module.exports.onLoaded = onLoaded;
module.exports.finalStatementTapped = finalStatementTapped;
module.exports.popTokenTapped = popTokenTapped;
module.exports.scanFinalStatement = scanFinalStatement;
