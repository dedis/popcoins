const Frame = require("ui/frame");
const Dialog = require("ui/dialogs");
const ObservableModule = require("data/observable");
const ObservableArray = require("data/observable-array").ObservableArray;
const FileIO = require("../../../shared/lib/file-io/file-io");
const FilePaths = require("../../../shared/res/files/files-path");
const OrgParty = require("../../../shared/lib/dedjs/object/pop/org/OrgParty").Party;
const User = require("../../../shared/lib/dedjs/object/user/User").get;
const Convert = require("../../../shared/lib/dedjs/Convert");
const PartyStates = require("../../../shared/lib/dedjs/object/pop/org/OrgParty").States;

const CANCELED_BY_USER = "CANCELED_BY_USER_STRING";

const viewModel = ObservableModule.fromObject({
  partyListDescriptions: new ObservableArray(),
  isLoading: false
});

let page = undefined;

function onLoaded(args) {
  page = args.object;

  page.bindingContext = viewModel;

  loadParties();
}

function loadParties() {
  viewModel.isLoading = true;
  let party = undefined;
  viewModel.partyListDescriptions.splice(0);
  FileIO.forEachFolderElement(FilePaths.POP_ORG_PATH, function (partyFolder) {
    party = new OrgParty(partyFolder.name);
    // Observables have to be nested to reflect changes
    viewModel.partyListDescriptions.push(ObservableModule.fromObject({
      party: party,
      desc: party.getPopDescModule(),
      status: party.getPopStatusModule()
    }));
  });
  viewModel.isLoading = false;
}

function hashAndSave(party) {

  if (!User.isKeyPairSet()) {
    Dialog.alert({
      title: "Key Pair Missing",
      message: "Please generate a key pair.",
      okButtonText: "Ok"
    });

    return Promise.reject("Key Pair Missing");
  }
  if (!party.isPopDescComplete()) {
    Dialog.alert({
      title: "Missing Information",
      message: "Please provide a name, date, time, location and the list (min 3) of conodes" +
      " of the organizers of your PoP Party.",
      okButtonText: "Ok"
    });

    return Promise.reject("Missing Information");
  }
  if (!party.isLinkedConodeSet()) {
    Dialog.alert({
      title: "Not Linked to Conode",
      message: "Please link to a conode first.",
      okButtonText: "Ok"
    });

    return Promise.reject("Not Linked to Conode");
  }

  function registerPopDesc() {
    return party.registerPopDesc()
      .then(() => {
        return party.loadStatus();
      })
      .then(() => {
        return Dialog.alert({
          title: "Successfully Registered",
          message: "Your party has been correctly published ! You can now register the public key of each attendee.",
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


function partyTapped(args) {
  const index = args.index;
  const status = viewModel.partyListDescriptions.getItem(index).status.status;
  const party = viewModel.partyListDescriptions.getItem(index).party;
  switch (status) {
    case PartyStates.CONFIGURATION:

      Dialog
        .action({
          message: "What do you want to do ?",
          cancelButtonText: "Cancel",
          actions: ["Configure the party", "Publish the party"]
        })
        .then(result => {
          if (result === "Configure the party") {
            Frame.topmost().navigate({
              moduleName: "drawers/pop/org/config/config-page",
              context: {
                party: party
              }
            });
          } else if (result === "Publish the party") {
            hashAndSave(party);
          }
        })
        .catch((error) => {
          Dialog.alert({
            title: "Error",
            message: "An error occured, please try again. - " + error,
            okButtonText: "Ok"
          });
        });

      break;
    case PartyStates.PUBLISHED:
      Frame.topmost().navigate({
        moduleName: "drawers/pop/org/register/register-page",
        context: {
          party: party
        }
      });
      break;
    case PartyStates.ERROR:
      Dialog.alert({
        title: "Error",
        message: "The linked conode is offline, please turn it on to retrieve the party infos",
        okButtonText: "Ok"
      });
      break;
    case PartyStates.FINALIZING:
      Dialog.alert({
        title: "Finalizing",
        message: "You have to wait until all the other organizers have finalized the party.",
        okButtonText: "Ok"
      });
      break;
    case PartyStates.FINALIZED:
      Dialog.alert({
        title: "Finalized",
        message: "This party has been finalized by all the organizers.",
        okButtonText: "Ok"
      });
      break;
    default:
      Dialog.alert({
        title: "Not implemented",
        okButtonText: "Ok"
      })
  }

}

function deleteParty(args) {
  const party = args.object.bindingContext;
  party.remove()
    .then(() => {
      const listView = Frame.topmost().currentPage.getViewById("listView");
      listView.notifySwipeToExecuteFinished();

      return Promise.resolve();
    })
    .catch((error) => {
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

function linkToConode(party) {
  if (!User.isKeyPairSet()) {
    return Dialog.alert({
      title: "Key Pair Missing",
      message: "Please generate a key pair.",
      okButtonText: "Ok"
    });
  }

  const conodes = User.getRoster().list;
  const conodesNames = conodes.map(serverIdentity => {
    return serverIdentity.description + " - " + Convert.byteArrayToHex(serverIdentity.id);
  });

  let index = undefined;

  return Dialog.action({
    message: "Choose a Conode",
    cancelButtonText: "Cancel",
    actions: conodesNames
  })
    .then(result => {
      if (result !== "Cancel") {
        index = conodesNames.indexOf(result);

        return party.linkToConode(conodes[index], "")
          .then(result => {
            return Dialog.prompt({
              title: "Requested PIN",
              message: result,
              okButtonText: "Link",
              cancelButtonText: "Cancel",
              defaultText: "",
              inputType: Dialog.inputType.text
            })
          })
          .then(result => {
            if (result.result) {
              console.log("SKDEBUG TEXT = " + result.result.text);
              if (result.result.text === undefined) {
                return Promise.reject("PIN should not be empty");
              }
              return party.linkToConode(conodes[index], result.text)
                .then(result => {
                  return Promise.resolve(conodes[index]);
                });
            } else {
              return Promise.reject(CANCELED_BY_USER);
            }
          });
      } else {
        return Promise.reject(CANCELED_BY_USER);
      }
    })
    .catch(error => {
      console.log(error);
      console.dir(error);
      console.trace();

      if (error !== CANCELED_BY_USER) {
        Dialog.alert({
          title: "Error",
          message: "An unexpected error occurred. Please try again. - " + error,
          okButtonText: "Ok"
        });
      }
      return Promise.reject(error);
    });
}


function addParty() {
  const newParty = new OrgParty();
  let conode = undefined;
  linkToConode(newParty)
    .then((result) => {
      conode = result;
      return Dialog.action({
        message: "Successfully linked to your conode ! What do you want to do ?",
        cancelButtonText: "Cancel",
        actions: ["Configure a new party", "List the proposals"]
      })
    })
    .then(result => {
      if (result === "Configure a new party") {
        Frame.topmost().navigate({
          moduleName: "drawers/pop/org/config/config-page",
          context: {
            party: newParty,
            leader: conode,
            newParty: true
          }
        });
      } else if (result === "List the proposals") {
        Frame.topmost().navigate({
          moduleName: "drawers/pop/org/proposals/org-party-proposals",
          context: {
            conode: conode,
          }
        });

        return Promise.reject("New party is not needed anymore");
      } else {
        return Promise.reject("User canceled");
      }

      return Promise.resolve()
    })
    .catch(() => {
      newParty.remove();
    });

}

module.exports.onLoaded = onLoaded;
module.exports.partyTapped = partyTapped;
module.exports.onSwipeCellStarted = onSwipeCellStarted;
module.exports.deleteParty = deleteParty;
module.exports.addParty = addParty;
