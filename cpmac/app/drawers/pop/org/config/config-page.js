const Dialog = require("ui/dialogs");
const Frame = require("ui/frame");
const Helper = require("../../../../shared/lib/dedjs/Helper");
const Convert = require("../../../../shared/lib/dedjs/Convert");
const Net = require("../../../../shared/lib/dedjs/Net");
const ObjectType = require("../../../../shared/lib/dedjs/ObjectType");
const ScanToReturn = require("../../../../shared/lib/scan-to-return/scan-to-return");
const Observable = require("tns-core-modules/data/observable");
const User = require("../../../../shared/lib/dedjs/object/user/User").get;
const topmost = require("ui/frame").topmost;

let viewModel = undefined;
let Party = undefined;

let pageObject = undefined;

let dataForm = Observable.fromObject({
  name: "",
  date: "",
  time: "",
  location: ""
});

function onLoaded(args) {
  const page = args.object;
  const context = page.navigationContext;

  if (context.party === undefined) {
    throw new Error("Party should be given in the context");
  }

  Party = context.party;

  initDate();

  viewModel = {};
  viewModel.descModule = Party.getPopDescModule();
  viewModel.dataForm = dataForm;
  pageObject = page.page;
  page.bindingContext = viewModel;

}

function initDate() {
  // TODO Update when v2 is all here
  const desc = Party.getPopDesc();
  dataForm.set("name", Party.getPopDesc().name);
  dataForm.set("location", Party.getPopDesc().location);

  let date = new Date(Date.parse(desc.dateTime));

  dataForm.set("date", date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + (date.getDay() + 1));
  dataForm.set("time", date.getHours() + ":" + date.getMinutes());
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

/**
 * Add a new conode by scanning it
 *
 * @returns {Promise}
 */
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
 * Parse the date from the data form and save it into the Party
 */
function setDate() {
  let date = viewModel.dataForm.date.split("-");
  let time = viewModel.dataForm.time.split(":");

  if (date.length !== 3 || time.length !== 2) {
    Dialog.alert({
      title: "Internal error",
      message: "Cannot parse date or time.",
      okButtonText: "Ok"
    });

    return Promise.reject("Cannot parse date or time");
  }

  date.map(parseInt);
  time.map(parseInt);

  let dateString = new Date(date[0], date[1] - 1, date[2] - 1, time[0], time[1], 0, 0).toString();

  return Party.setPopDescDateTime(dateString);
}

/**
 * Conclude the creation of the party : save all the infos and register
 * on the conode
 */
function finish() {
  let promises = [
    Party.setPopDescLocation(viewModel.dataForm.location),
    Party.setPopDescName(viewModel.dataForm.name),
    setDate()
  ];

  Promise.all(promises).then(hashAndSave).then(goBack)
}

/**
 * Hashes and saves the config/description entered by the organizer of the PoP party.
 * @returns {Promise.<*[]>}
 */
function hashAndSave() {

  if (!User.isKeyPairSet()) {
    Dialog.alert({
      title: "Key Pair Missing",
      message: "Please generate a key pair.",
      okButtonText: "Ok"
    });

    return Promise.reject("Key Pair Missing");
  }
  if (!Party.isPopDescComplete()) {
    Dialog.alert({
      title: "Missing Information",
      message: "Please provide a name, date, time, location and the list (min 3) of conodes" +
      " of the organizers of your PoP Party.",
      okButtonText: "Ok"
    });

    return Promise.reject("Missing Information");
  }
  if (!Party.isLinkedConodeSet()) {
    Dialog.alert({
      title: "Not Linked to Conode",
      message: "Please link to a conode first.",
      okButtonText: "Ok"
    });

    return Promise.reject("Not Linked to Conode");
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

  return registerPopDesc();
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
            }, () => {
            }, true);

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
function goBack() {
  // Party.remove();
  topmost().goBack();
}

function addOrganizer() {
  Dialog.action({
    message: "How would you like to add the new organizer ?",
    cancelButtonText: "Cancel",
    actions: ["Scan QR", "Enter manually"]
  }).then(function (result) {
    console.log("Dialog result: " + result);
    if(result === "Scan QR"){
      addScan();
    }else if(result === "Enter manually"){
      addManual();
    }
  });
}

module.exports.onLoaded = onLoaded;
module.exports.hashAndSave = hashAndSave;
module.exports.addManual = addManual;
module.exports.addScan = addScan;
module.exports.deleteConode = deleteConode;
module.exports.onSwipeCellStarted = onSwipeCellStarted;
module.exports.manageDesc = manageDesc;
module.exports.goBack = goBack;
module.exports.finish = finish;
module.exports.addOrganizer = addOrganizer;
