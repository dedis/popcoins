const Frame = require("ui/frame");
const Dialog = require("ui/dialogs");
const ObservableModule = require("data/observable");
const ObservableArray = require("data/observable-array").ObservableArray;
const FileIO = require("../../../shared/lib/file-io/file-io");
const FilePaths = require("../../../shared/res/files/files-path");
const OrgParty = require("../../../shared/lib/dedjs/object/pop/org/OrgParty");
const User = require("../../../shared/lib/dedjs/object/user/User").get;
const Convert = require("../../../shared/lib/dedjs/Convert");

const CANCELED_BY_USER = "CANCELED_BY_USER_STRING";

const viewModel = ObservableModule.fromObject({
  partyListDescriptions: new ObservableArray(),
  isLoading: false
});

let page = undefined;
let popParties = new Map();


function onLoaded(args) {
  page = args.object;

  page.bindingContext = viewModel;

  loadParties();
}

function loadParties() {
  viewModel.isLoading = true;
  viewModel.partyListDescriptions = new ObservableArray;
  FileIO.forEachFolderElement(FilePaths.POP_ORG_PATH, function (partyFolder) {
    viewModel.partyListDescriptions.push(new OrgParty(partyFolder.name))
  });
  viewModel.isLoading = false;
}

function partyTapped(args) {
  const index = args.index;
  Frame.topmost().navigate({
    moduleName: "drawers/pop/org/org-party-home",
    context: {
      party: viewModel.partyListDescriptions.getItem(index)
    }
  });

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
              return party.linkToConode(conodes[index], result.text)
                .then(result => {
                  // This is to ensure that id and public will be updated in the UI when linking process is done.
                  page.bindingContext = undefined;
                  page.bindingContext = viewModel;

                  return Dialog.alert({
                    title: "Success",
                    message: "Your are now linked to the conode.",
                    okButtonText: "Configure the party"
                  });
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
  linkToConode(newParty).then(result => {
    Frame.topmost().navigate({
      moduleName: "drawers/pop/org/config/config-page",
      context: {
        party: newParty
      }
    });
  });

}


module.exports.onLoaded = onLoaded;
module.exports.partyTapped = partyTapped;
module.exports.onSwipeCellStarted = onSwipeCellStarted;
module.exports.deleteParty = deleteParty;
module.exports.addParty = addParty;
