const Dialog = require("ui/dialogs");
const Frame = require("ui/frame");
const ModalPicker = require("nativescript-modal-datetimepicker").ModalDatetimepicker;
const Helper = require("../../../../shared/lib/dedjs/Helper");
const Convert = require("../../../../shared/lib/dedjs/Convert");
const Net = require("../../../../shared/lib/dedjs/Net");
const ObjectType = require("../../../../shared/lib/dedjs/ObjectType");
const ScanToReturn = require("../../../../shared/lib/scan-to-return/scan-to-return");

const User = require("../../../../shared/lib/dedjs/object/user/User").get;

let viewModel = undefined;
let Party = undefined;

const DateTimePicker = new ModalPicker();

let textFieldName = undefined;
let labelDate = undefined;
let labelTime = undefined;
let textFieldLocation = undefined;
let chosenDateTime = undefined;

let pageObject = undefined;

function onLoaded(args) {
  const page = args.object;
  const context = page.navigationContext;

  if(context.party === undefined) {
    throw new Error("Party should be given in the context");
  }

  Party = context.party;
  viewModel = Party.getPopDescModule();
  pageObject = page.page;
  page.bindingContext = viewModel;

  loadViews(page);
  if (textFieldName === undefined || labelDate === undefined || labelTime === undefined || textFieldLocation === undefined) {
    throw new Error("a field is undefined, but it shouldn't");
  }

  setUpDate();
}

/**
 * Loads the needed views into their variables.
 * @param page - the current page object
 */
function loadViews(page) {
  textFieldName = page.getViewById("text-field-name");
  labelDate = page.getViewById("label-date");
  labelTime = page.getViewById("label-time");
  textFieldLocation = page.getViewById("text-field-location");

  textFieldName.on("textChange", onNameChangeHandler);
  textFieldLocation.on("textChange", onLocationChangeHandler);
}

function onNameChangeHandler() {
  return Party.setPopDescName(textFieldName.text)
    .catch(error => {
      console.log(error);
      console.dir(error);
      console.trace();

      Dialog.alert({
        title: "Error",
        message: "An unexpected error occurred during the save process. - " + error,
        okButtonText: "Ok"
      });

      return Promise.reject(error);
    });
}

function onLocationChangeHandler() {
  return Party.setPopDescLocation(textFieldLocation.text)
    .catch(error => {
      console.log(error);
      console.dir(error);
      console.trace();

      Dialog.alert({
        title: "Error",
        message: "An unexpected error occurred during the save process. - " + error,
        okButtonText: "Ok"
      });

      return Promise.reject(error);
    });
}

function setUpDate() {
  const dateTimeString = Party.getPopDesc().dateTime;
  if (dateTimeString === "") {
    chosenDateTime = new Date(Date.now());
    chosenDateTime.setMilliseconds(0);
    chosenDateTime.setSeconds(0);
  } else {
    chosenDateTime = new Date(Date.parse(dateTimeString));
  }

  labelDate.text = chosenDateTime.toDateString();
  labelTime.text = chosenDateTime.toTimeString();
}

function setDate() {
  return DateTimePicker.pickDate({
    title: "Pick a Date for you PoP-Party"
  })
    .then(date => {
      const newDate = new Date(date.year, date.month - 1, date.day, 0, 0, 0, 0);

      if (newDate.toDateString() !== "Invalid Date") {
        chosenDateTime.setYear(date.year);
        chosenDateTime.setMonth(date.month - 1);
        chosenDateTime.setDate(date.day);

        labelDate.text = chosenDateTime.toDateString();

        return Party.setPopDescDateTime(chosenDateTime.toUTCString());
      }

      return Promise.resolve();
    })
    .catch(error => {
      console.log(error);
      console.dir(error);
      console.trace();

      Dialog.alert({
        title: "Error",
        message: "An unexpected error occurred during the save process. - " + error,
        okButtonText: "Ok"
      });

      return Promise.reject(error);
    });
}

function setTime() {
  return DateTimePicker.pickTime({
    title: "Pick a Time for you PoP-Party"
  })
    .then(time => {
      const newTime = new Date(0, 0, 0, time.hour, time.minute, 0, 0);

      if (newTime.toDateString() !== "Invalid Date") {
        chosenDateTime.setHours(time.hour);
        chosenDateTime.setMinutes(time.minute);

        labelTime.text = chosenDateTime.toTimeString();

        return Party.setPopDescDateTime(chosenDateTime.toUTCString());
      }

      return Promise.resolve();
    })
    .catch(error => {
      console.log(error);
      console.dir(error);
      console.trace();

      Dialog.alert({
        title: "Error",
        message: "An unexpected error occurred during the save process. - " + error,
        okButtonText: "Ok"
      });

      return Promise.reject(error);
    });
}

/**
 * Changes the frame to be able to add a conode manually.
 */
function addManual() {
  function addManualCallBack(server) {
    if (server !== undefined && !Helper.isOfType(server, ObjectType.SERVER_IDENTITY)) {
      throw new Error("server must be an instance of ServerIdentity or undefined to be skipped");
    }

    if (server !== undefined) {
      return Party.addPopDescConode(server)
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
  }

  return Dialog.confirm({
    title: "Conode",
    message: "What conode do you want to add?",
    okButtonText: "Another",
    cancelButtonText: "Cancel",
    neutralButtonText: "My Own"
  })
    .then(result => {
      if (result) {
        // Another
        pageObject.showModal("shared/pages/add-conode-manual/add-conode-manual", undefined, addManualCallBack, true);
        return Promise.resolve();
      } else if (result === undefined) {
        // My Own
        if (!Party.isLinkedConodeSet()) {
          return Dialog.alert({
            title: "Not Linked to Conode",
            message: "Please link to a conode first.",
            okButtonText: "Ok"
          });
        }

        return Party.addPopDescConode(Party.getLinkedConode());
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

function addScan() {
  return ScanToReturn.scan()
    .then(string => {
      const conode = Convert.parseJsonServerIdentity(string);

      return Party.addPopDescConode(conode);
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

function deleteConode(args) {
  // We do not get the index of the item swiped/clicked...
  const conodeId = Convert.byteArrayToBase64(args.object.bindingContext.id);
  const conodesList = Party.getPopDesc().roster.list.map(server => {
    return Convert.byteArrayToBase64(server.id);
  });

  const index = conodesList.indexOf(conodeId);

  return Party.removePopDescConodeByIndex(index)
    .then(() => {
      const listView = Frame.topmost().currentPage.getViewById("list-view-conodes");
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

function onSwipeCellStarted(args) {
  const swipeLimits = args.data.swipeLimits;
  const swipeView = args.object;

  const deleteButton = swipeView.getViewById("button-delete");

  const width = deleteButton.getMeasuredWidth();

  swipeLimits.right = width;
  swipeLimits.threshold = width / 2;
}

/**
 * Hashes and saves the config/description entered by the organizer of the PoP party.
 * @returns {Promise.<*[]>}
 */
function hashAndSave() {
  if (!User.isKeyPairSet()) {
    return Dialog.alert({
      title: "Key Pair Missing",
      message: "Please generate a key pair.",
      okButtonText: "Ok"
    });
  }
  if (!Party.isPopDescComplete()) {
    return Dialog.alert({
      title: "Missing Information",
      message: "Please provide a name, date, time, location and the list (min 3) of conodes" +
        " of the organizers of your PoP Party.",
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

  function registerPopDesc() {
    return Party.registerPopDesc()
      .then(descHash => {
        return Dialog.alert({
          title: "Successfully Hashed",
          message: "The hash of you description is accessible in the organizers tab.\n\nHash:\n" + Convert.byteArrayToHex(descHash),
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

  const oldPopDescHash = Party.getPopDescHash();
  if (oldPopDescHash.length > 0) {
    return Dialog.confirm({
      title: "Old Description Hash Overwriting",
      message: "You already have a description hash stored. Do you really want to overwrite it?",
      okButtonText: "Yes",
      cancelButtonText: "Cancel"
    })
      .then(result => {
        if (result) {
          return registerPopDesc();
        } else {
          return Promise.resolve();
        }
      });
  } else {
    return registerPopDesc();
  }
}

function manageDesc() {
  return Dialog.confirm({
    title: "PoP-Description",
    message: "Do you want to share your description or import a new one?",
    okButtonText: "Import",
    cancelButtonText: "Cancel",
    neutralButtonText: "Share"
  })
    .then(result => {
      if (result) {
        // Import
        return ScanToReturn.scan()
          .then(pasteBinIdJson => {
            const id = Convert.jsonToObject(pasteBinIdJson).id;
            const PasteBin = new Net.PasteBin();

            return PasteBin.get(id);
          })
          .then(popDescJson => {
            const popDesc = Convert.parseJsonPopDesc(popDescJson);

            return Party.setPopDesc(popDesc, true)
              .then(() => {
                return setUpDate();
              });
          })
      } else if (result === undefined) {
        // Share
        if (!Party.isPopDescComplete()) {
          return Dialog.alert({
            title: "Missing Information",
            message: "Please provide a name, date, time, location and the list (min 3) of conodes" +
              " of the organizers of your PoP Party.",
            okButtonText: "Ok"
          });
        }

        const PasteBin = new Net.PasteBin();
        const popDescJson = JSON.stringify(Party.getPopDesc());

        return PasteBin.paste(popDescJson)
          .then(id => {
            const object = {};
            object.id = id;

            pageObject.showModal("shared/pages/qr-code/qr-code-page", {
              textToShow: Convert.objectToJson(object),
              title: "Party informations"
            }, () => { }, true);

            return Promise.resolve();
          });
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

module.exports.onLoaded = onLoaded;
module.exports.setDate = setDate;
module.exports.setTime = setTime;
module.exports.hashAndSave = hashAndSave;
module.exports.addManual = addManual;
module.exports.addScan = addScan;
module.exports.deleteConode = deleteConode;
module.exports.onSwipeCellStarted = onSwipeCellStarted;
module.exports.manageDesc = manageDesc;
