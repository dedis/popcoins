const Dialog = require("ui/dialogs");
const Frame = require("ui/frame");
const Convert = require("../../../../shared/lib/dedjs/Convert");
const ScanToReturn = require("../../../../shared/lib/scan-to-return/scan-to-return");

const User = require("../../../../shared/lib/dedjs/object/user/User").get;

let viewModel = undefined;
let Party = undefined;


function onLoaded(args) {
  const page = args.object;
  const context = page.navigationContext;

  if(context.party === undefined) {
    throw new Error("Party should be given in the context");
  }

  Party = context.party;
  viewModel = Party.getRegisteredAttsModule();
  page.bindingContext = viewModel;
  let finalizeLabel = page.getViewById("finalize");
  // Without this the text is not vertically centered in is own view
  finalizeLabel.android.setGravity(android.view.Gravity.CENTER);

}

/**
 * Function that gets called when the user wants to register a public key manually.
 */
function addManual() {
  return Dialog.prompt({
    title: "Public Key",
    message: "Please enter the public key of an attendee.",
    okButtonText: "Register",
    cancelButtonText: "Cancel",
    neutralButtonText: "Add Myself",
    inputType: Dialog.inputType.text
  })
    .then(args => {
      if (args.result && args.text !== undefined && args.text.length > 0) {
        // Add Key
        return Party.registerAttendee(Convert.hexToByteArray(args.text));
      } else if (args.result === undefined) {
        // Add Myself
        if (!User.isKeyPairSet()) {
          return Dialog.alert({
            title: "Key Pair Missing",
            message: "Please generate a key pair.",
            okButtonText: "Ok"
          });
        }

        return Party.registerAttendee(User.getKeyPair().public);
      } else {
        // Cancel
        return Promise.resolve();
      }
    })
    .catch(error => {
      console.log(error);
      console.dir(error);
      console.trace();

      Dialog.alert({
        title: "Error",
        message: "An error occured, please try again. - " + error,
        okButtonText: "Ok"
      });

      return Promise.reject(error);
    });
}

/**
 * Function that gets called when the user wants to register a public key by scanning it.
 */
function addScan() {
  return ScanToReturn.scan()
    .then(keyPairJson => {
      const keyPair = Convert.parseJsonKeyPair(keyPairJson);

      return Party.registerAttendee(keyPair.public);
    })
    .catch(error => {
      console.log(error);
      console.dir(error);
      console.trace();

      Dialog.alert({
        title: "Error",
        message: "An error occured, please try again. - " + error,
        okButtonText: "Ok"
      });

      return Promise.reject(error);
    });
}

function onSwipeCellStarted(args) {
  const swipeLimits = args.data.swipeLimits;
  const swipeView = args.object;

  const deleteButton = swipeView.getViewById("button-delete");

  const width = deleteButton.getMeasuredWidth();

  swipeLimits.right = width;
  swipeLimits.threshold = width / 2;
}

function deleteAttendee(args) {
  // We do not get the index of the item swiped/clicked...
  const attendee = Convert.byteArrayToBase64(args.object.bindingContext);
  const attendeeList = Party.getRegisteredAtts().slice().map(attendee => {
    return Convert.byteArrayToBase64(attendee);
  });

  const index = attendeeList.indexOf(attendee);

  return Party.unregisterAttendeeByIndex(index)
    .then(() => {
      const listView = Frame.topmost().currentPage.getViewById("list-view-registered-keys");
      listView.notifySwipeToExecuteFinished();

      return Promise.resolve();
    })
    .catch(error => {
      console.log(error);
      console.dir(error);
      console.trace();

      Dialog.alert({
        title: "Error",
        message: "An error occured, please try again. - " + error,
        okButtonText: "Ok"
      });

      return Promise.reject(error);
    });
}

/**
 * Function called when the button "register" is clicked. It starts the registration process with the organizers conode.
 * @returns {Promise.<any>}
 */
function registerKeys() {
  if (!User.isKeyPairSet()) {
    return Dialog.alert({
      title: "Key Pair Missing",
      message: "Please generate a key pair.",
      okButtonText: "Ok"
    });
  }
  if (!Party.isPopDescComplete()) {
    return Dialog.alert({
      title: "No PopDesc",
      message: "Please configure the PopDesc first.",
      okButtonText: "Ok"
    });
  }
  if (Party.getPopDescHash().length === 0) {
    return Dialog.alert({
      title: "No PopDesc Hash",
      message: "Please register you PopDesc on your conode first.",
      okButtonText: "Ok"
    });
  }
  if (!Party.isLinkedConodeSet()) {
    return Dialog.alert({
      title: "Not Linked to Conode",
      message: "Please link to a conode first.",
      okButtonText: "Ok"
    });
  }
  if (Party.getRegisteredAtts().length === 0) {
    return Dialog.alert({
      title: "No Attendee to Register",
      message: "Please add some attendees first.",
      okButtonText: "Ok"
    });
  }

  return Party.registerAttsAndFinalizeParty()
    .then(() => {
      return Dialog.alert({
        title: "Success",
        message: "The final statement of you PoP-Party is accessible in the PoP tab.",
        okButtonText: "Ok"
      });
    })
    .catch(error => {
      console.log(error);
      console.dir(error);
      console.trace();

      Dialog.alert({
        title: "Error",
        message: "An error occured, please try again. - " + error,
        okButtonText: "Ok"
      });

      return Promise.reject(error);
    });
}

function addNewKey() {
  Dialog.action({
    message: "How would you like to specify the key ?",
    cancelButtonText: "Cancel",
    actions: ["Scan QR", "Enter manually"]
  }).then(function (result) {
    console.log("Dialog result: " + result);
    if(result == "Scan QR"){
      addScan();
    }else if(result == "Enter manually"){
      addManual();
    }
  });
}

module.exports.onLoaded = onLoaded;
module.exports.addManual = addManual;
module.exports.addScan = addScan;
module.exports.registerKeys = registerKeys;
module.exports.deleteAttendee = deleteAttendee;
module.exports.onSwipeCellStarted = onSwipeCellStarted;
module.exports.addNewKey = addNewKey;
