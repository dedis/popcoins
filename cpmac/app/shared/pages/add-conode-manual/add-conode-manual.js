const Dialog = require("ui/dialogs");
const Convert = require("../../lib/dedjs/Convert");
const Helper = require("../../lib/dedjs/Helper");
const CothorityMessages = require("../../lib/dedjs/protobuf/build/cothority-messages");
//const dns = require("dns");

let textFieldAddress = undefined;
let textFieldPublicKey = undefined;
let textFieldDescription = undefined;

let closeCallBackFunction = undefined;

function onShownModally(args) {
  closeCallBackFunction = args.closeCallback;
}

function onLoaded(args) {
  const page = args.object;

  loadViews(page);
  if (textFieldAddress === undefined || textFieldPublicKey === undefined || textFieldDescription === undefined) {
    throw new Error("a field is undefined, but it shouldn't");
  }

  // Can be removed. Only used for testing purposes.
  //textFieldAddress.text = "tls://10.0.2.2:7002";
  //textFieldPublicKey.text = "HkDzpR5Imd7WNx8kl2lJcIVRVn8gfDByJnmlfrYh/zU=";
  //textFieldDescription.text = "Conode_1";
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
  let publicKey = textFieldPublicKey.text;
  const description = textFieldDescription.text;

  if (address.length > 0 && publicKey.length > 0 && description.length > 0) {
    try {
      publicKey = Convert.hexToByteArray(publicKey);
     // dns.lookup('cothority.net', function(err, result) {
     //   console.log(result)
      //})
      const server = Convert.toServerIdentity(address, publicKey, description, undefined);

      closeCallBackFunction(server);
    } catch (error) {
      console.log(error);
      console.dir(error);
      console.trace();

      return Dialog.alert({
        title: "Incorrect Input",
        message: "Please double check your address and public key.",
        okButtonText: "Ok"
      });
    }
  } else {
    return Dialog.alert({
      title: "Provide More Information",
      message: "Please provide the address, the public key and the description of the conode.",
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
