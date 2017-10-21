const Dialog = require("ui/dialogs");
const HomeViewModel = require("./home-view-model");

let textFieldSignMessage = undefined;
let textFieldSignContext = undefined;

let textFieldVerifyMessage = undefined;
let textFieldVerifyContext = undefined;
let textFieldVerifySignature = undefined;
let textFieldVerifyTag = undefined;

function onLoaded(args) {
  if (args.isBackNavigation) {
    return;
  }

  const page = args.object;

  loadViews(page);
  if (textFieldSignMessage === undefined || textFieldSignContext === undefined ||
      textFieldVerifyMessage === undefined || textFieldVerifyContext === undefined ||
      textFieldVerifySignature === undefined || textFieldVerifyTag === undefined) {
    throw new Error("one of the fields is undefined, but it shouldn't");
  }

  page.bindingContext = new HomeViewModel();
}

/**
 * Loads the needed views of the text fields.
 * @param page - the current page object
 */
function loadViews(page) {
  // Sign
  textFieldSignMessage = page.getViewById("text-field-sign-message");
  textFieldSignContext = page.getViewById("text-field-sign-context");

  // Verify
  textFieldVerifyMessage = page.getViewById("text-field-verify-message");
  textFieldVerifyContext = page.getViewById("text-field-verify-context");
  textFieldVerifySignature = page.getViewById("text-field-verify-signature");
  textFieldVerifyTag = page.getViewById("text-field-verify-tag");
}

/**
 * Function called when the user wants to sign a message given a context.
 * @returns {Promise.<any>}
 */
function signButtonTapped() {
  const message = textFieldSignMessage.text;
  const context = textFieldSignContext.text;

  if (message.length > 0 && context.length > 0) {
    // TODO: implement signature
    return Promise.resolve();
  } else {
    return Dialog.alert({
                          title: "Missing Information",
                          message: "Please provide a message and a context to be signed.",
                          okButtonText: "Ok"
                        });
  }
}

/**
 * Function called when the user wants to verify a signature given a message, a context and a tag.
 * @returns {Promise.<any>}
 */
function verifyButtonTapped() {
  const message = textFieldVerifyMessage.text;
  const context = textFieldVerifyContext.text;
  const signature = textFieldVerifySignature.text;
  const tag = textFieldVerifyTag.text;

  if (message.length > 0 && context.length > 0 && signature.length > 0 && tag.length > 0) {
    // TODO: implement verify
    return Promise.resolve();
  } else {
    return Dialog.alert({
                          title: "Missing Information",
                          message: "Please provide a message, a context, a signature and a tag to be verified.",
                          okButtonText: "Ok"
                        });
  }
}

exports.onLoaded = onLoaded;
exports.signButtonTapped = signButtonTapped;
exports.verifyButtonTapped = verifyButtonTapped;
