const Dialog = require("ui/dialogs");
const Frame = require("ui/frame");
const Convert = require("../../../../shared/lib/dedjs/Convert");
const ScanToReturn = require("../../../../shared/lib/scan-to-return/scan-to-return");

const Org = require("../../../../shared/lib/dedjs/object/pop/org/Org").get;
const User = require("../../../../shared/lib/dedjs/object/user/User").get;

const viewModel = Org.getRegisteredAttsModule()

function onLoaded(args) {
  const page = args.object;
  page.bindingContext = viewModel;
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
        return Org.registerAttendee(Convert.base64ToByteArray(args.text));
      } else if (args.result === undefined) {
        // Add Myself
        if (!User.isKeyPairSet()) {
          return Dialog.alert({
            title: "Key Pair Missing",
            message: "Please generate a key pair.",
            okButtonText: "Ok"
          });
        }

        return Org.registerAttendee(User.getKeyPair().public);
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
        message: "An error occured, please try again.",
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

      return Org.registerAttendee(keyPair.public);
    })
    .catch(error => {
      console.log(error);
      console.dir(error);
      console.trace();

      Dialog.alert({
        title: "Error",
        message: "An error occured, please try again.",
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
  const attendeeList = Org.getRegisteredAtts().slice().map(attendee => {
    return Convert.byteArrayToBase64(attendee);
  });

  const index = attendeeList.indexOf(attendee);

  return Org.unregisterAttendeeByIndex(index)
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
        message: "An error occured, please try again.",
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
  if (!Org.isPopDescComplete()) {
    return Dialog.alert({
      title: "No PopDesc",
      message: "Please configure the PopDesc first.",
      okButtonText: "Ok"
    });
  }
  if (Org.getPopDescHash().length === 0) {
    return Dialog.alert({
      title: "No PopDesc Hash",
      message: "Please register you PopDesc on your conode first.",
      okButtonText: "Ok"
    });
  }
  if (!Org.isLinkedConodeSet()) {
    return Dialog.alert({
      title: "Not Linked to Conode",
      message: "Please link to a conode first.",
      okButtonText: "Ok"
    });
  }
  if (Org.getRegisteredAtts().length === 0) {
    return Dialog.alert({
      title: "No Attendee to Register",
      message: "Please add some attendees first.",
      okButtonText: "Ok"
    });
  }

  return Org.registerAttsAndFinalizeParty()
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

module.exports.onLoaded = onLoaded;
module.exports.addManual = addManual;
module.exports.addScan = addScan;
module.exports.registerKeys = registerKeys;
module.exports.deleteAttendee = deleteAttendee;
module.exports.onSwipeCellStarted = onSwipeCellStarted;
