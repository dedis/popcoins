const Dialog = require("ui/dialogs");
const Convert = require("../../lib/dedjs/Convert");
const Helper = require("../../lib/dedjs/Helper");
const NetDedis = require("@dedis/cothority").net;
const RequestPath = require("../../lib/dedjs/RequestPath");
const DecodeType = require("../../lib/dedjs/DecodeType");
const CothorityMessages = require("../../lib/dedjs/protobuf/build/cothority-messages");
const StatusExtractor = require("../../lib/dedjs/extractor/StatusExtractor");

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

  if (address.length > 0 && description.length > 0) {
    try {
      console.log("SKDEBUG HEREEEE 1 " + publicKey);
      if (publicKey.length === 0) {
        console.log("SKDEBUG HEREEEE 2 " + publicKey);
        if(!Helper.isValidAddress(address)) {
          return Dialog.alert({
            title: "Address or server incorrect",
            message: "Please double check your address.",
            okButtonText: "Ok"
          });
        }
        const statusRequestMessage = CothorityMessages.createStatusRequest();
        const cothoritySocket = new NetDedis.Socket(Convert.tlsToWebsocket(address, ""), RequestPath.STATUS);
        return cothoritySocket.send(RequestPath.STATUS_REQUEST, DecodeType.STATUS_RESPONSE, statusRequestMessage)
          .then(statusResponse => {
            const hexKey = StatusExtractor.getPublicKey(statusResponse);
            const server = Convert.toServerIdentity(address, Convert.hexToByteArray(hexKey), description, undefined);

            closeCallBackFunction(server);
          })
          .catch(error =>  {
            console.log(error);
            console.dir(error);

            return Dialog.alert({
              title: "Address or server incorrect",
              message: "Please double check your address.",
              okButtonText: "Ok"
            });

          })
      }
      publicKey = Convert.hexToByteArray(publicKey);
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
