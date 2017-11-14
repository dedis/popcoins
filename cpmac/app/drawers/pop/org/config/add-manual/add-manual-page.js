const Dialog = require("ui/dialogs");
const StatusExtractor = require("~/shared/lib/extractors/StatusExtractor");
const DedisJsNet = require("~/shared/lib/dedis-js/src/net");
const ConfigViewModel = require("./add-manual-view-model");

let textFieldAddress = undefined;
let textFieldPublicKey = undefined;
let textFieldDescription = undefined;

let closeCallBackFunction = undefined;

function onShownModally(args) {
  closeCallBackFunction = args.closeCallback;
}

function onLoaded(args) {
  if (args.isBackNavigation) {
    return;
  }

  const page = args.object;

  loadViews(page);
  if (textFieldAddress === undefined || textFieldPublicKey === undefined || textFieldDescription === undefined) {
    throw new Error("a field is undefined, but it shouldn't");
  }

  page.bindingContext = new ConfigViewModel();
}

/**
 * Loads the needed views into their variables.
 * @param page - the current page object
 */
function loadViews(page) {
  textFieldAddress = page.getViewById("text-view-conode-address");
  textFieldPublicKey = page.getViewById("text-view-conode-public-key");
  textFieldDescription = page.getViewById("text-view-conode-description");
}

/**
 * Gets called when the user wants to add a conode manually, it converts the information given to a conode object
 * and sends it back to the description page.
 */
function addManual() {
  const address = textFieldAddress.text;
  const publicKey = textFieldPublicKey.text;
  const description = textFieldDescription.text;

  if (address.length > 0 && publicKey.length > 0 && description.length > 0) {
    const conodesTomlString = StatusExtractor.getToml(address, publicKey, description);
    let conode = DedisJsNet.getConodeFromRoster(conodesTomlString, address);

    closeCallBackFunction(conode);
  } else {
    Dialog.alert({
                   title: "Provide More Information",
                   message: "To be able to add this conode to the list we need more information.",
                   okButtonText: "Ok"
                 });
  }
}

/**
 * When the user wants to cancel the addition of a conode we simply get back to the description with an undefined
 * conode.
 */
function onCancel() {
  closeCallBackFunction(undefined);
}

exports.onShownModally = onShownModally;
exports.onLoaded = onLoaded;
exports.addManual = addManual;
exports.onCancel = onCancel;
