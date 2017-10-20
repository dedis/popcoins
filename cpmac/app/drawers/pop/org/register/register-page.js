const Dialog = require("ui/dialogs");
const SwipeToDelete = require("~/shared/lib/ios-swipe-delete/ios-swipe-delete");

const RegisterViewModel = require("./register-view-model");

const registerViewModel = new RegisterViewModel();
const myRegisteredKeys = registerViewModel.registeredKeys;

function onLoaded(args) {
  if (args.isBackNavigation) {
    return;
  }

  const page = args.object;

  // TODO: implement item delete for Android
  if (page.ios) {
    let listView = page.getViewById("list-view-registered-keys");

    SwipeToDelete.enable(listView, function (index) {
      myRegisteredKeys.deleteByIndex(index);
    });
  }

  page.bindingContext = registerViewModel;

  loadRegisteredKeys();
}

/**
 * Loads the registered public keys of the attendees into the list.
 */
function loadRegisteredKeys() {
  myRegisteredKeys.clear();
  myRegisteredKeys.load();
}

/**
 * Function that gets called when the user wants to register a public key manually.
 */
function addManual() {
  Dialog.prompt({
                  title: "Public Key",
                  message: "Please enter the public key of an attendee.",
                  okButtonText: "Register",
                  cancelButtonText: "Cancel",
                  inputType: Dialog.inputType.text
                })
        .then(args => {
          if (args.result) {
            return myRegisteredKeys.addKey(args.text);
          }
        });
}

/**
 * Function that gets called when the user wants to register a public key by scanning it.
 */
function addScan() {
}

/**
 * Function that gets called when the user wants to delete the whole list of registered keys.
 */
function empty() {
  myRegisteredKeys.empty();
}

exports.onLoaded = onLoaded;
exports.addManual = addManual;
exports.addScan = addScan;
exports.empty = empty;
