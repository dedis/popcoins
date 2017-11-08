const Dialog = require("ui/dialogs");
const Frame = require("ui/frame");
const CothorityPath = require("~/shared/res/cothority-path/cothority-path");
const FilesPath = require("~/shared/res/files/files-path");
const FileIO = require("~/shared/lib/file-io/file-io");
const Crypto = require("~/shared/lib/dedis-js/src/crypto");
const Misc = require("~/shared/lib/dedis-js/src/misc");
const ConodeStatsViewModel = require("./conode-stats-view-model");

const conodeStatsViewModel = new ConodeStatsViewModel();

const myStatsList = conodeStatsViewModel.statsList;
let selectedConode = undefined;

function onNavigatingTo(args) {
  if (args.isBackNavigation) {
    return;
  }

  const page = args.object;
  selectedConode = page.bindingContext;

  page.bindingContext = conodeStatsViewModel;

  loadFunction(selectedConode);
}

/**
 * Loads the properties of the selected conode into the list to display them to the user.
 * @param conode - the selected conode
 */
function loadFunction(conode) {
  myStatsList.empty();
  myStatsList.load(conode);
}

function displayQrOfConodeStats() {
  const statsString = "[[servers]]\n" +
                      "  Address = \"" + selectedConode.server.address + "\"\n" +
                      "  Public = \"" + Misc.uint8ArrayToHex(selectedConode.server.public) + "\"\n" +
                      "  Description = \"" + selectedConode.server.description + "\"\n";

  Frame.topmost().navigate({
                             moduleName: "drawers/home/conode-stats/qr-code/qr-code-page",
                             bindingContext: {
                               statsString: statsString
                             }
                           });
}

/**
 * Function called when the user wants to link to his conode.
 * @returns {Promise.<any>}
 */
function linkToConode() {
  return Dialog.prompt({
                         title: "Link to Conode",
                         message: "Leave blank if you are requesting the PIN from your conode.",
                         okButtonText: "Link PoP",
                         cancelButtonText: "Cancel",
                         neutralButtonText: "Link CISC",
                         defaultText: "",
                         inputType: Dialog.inputType.text
                       })
               .then(result => {
                 if (result.result) {
                   return FileIO.getStringOf(FilesPath.PUBLIC_KEY)
                                .then(publicKey => {
                                  const pair = Crypto.generateRandomKeyPair();
                                  publicKey = Crypto.marshal(pair.getPublic());
                                  console.log("ICIIIIIIIIIIIIIIII" + publicKey.length);
                                  console.log("ICIIIIIIIIIIIIIIIIawdawdwa" + result.text);
                                  // TODO: if no public key?
                                  return myStatsList.linkToConode(selectedConode, result.text, publicKey,
                                                                  CothorityPath.POP_PIN_REQUEST);
                                });
                 } else if (result.result === undefined) {
                   // TODO: Case CISC - Use your own public key and path
                   return Promise.resolve();
                 } else {
                   return Promise.resolve();
                 }
               })
               .catch(() => {
                 return Dialog.alert({
                                       title: "Error",
                                       message: "An unexpected error occurred during the linking" +
                                                " process. Please try again.",
                                       okButtonText: "Ok"
                                     });
               });
}

exports.onNavigatingTo = onNavigatingTo;
exports.displayQrOfConodeStats = displayQrOfConodeStats;
exports.linkToConode = linkToConode;
