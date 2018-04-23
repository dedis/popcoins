const ScanToReturn = require("../../../shared/lib/scan-to-return/scan-to-return");
const Frame = require("ui/frame");
const Dialog = require("ui/dialogs");
const ObservableModule = require("data/observable");
const ObservableArray = require("data/observable-array").ObservableArray;
const FileIO = require("../../../shared/lib/file-io/file-io");
const FilePaths = require("../../../shared/res/files/files-path");
const AttParty = require("../../../shared/lib/dedjs/object/pop/att/AttParty").Party;
const Convert = require("../../../shared/lib/dedjs/Convert");
const PartyStates = require("../../../shared/lib/dedjs/object/pop/org/OrgParty").States;

let loaded = false;
const viewModel = ObservableModule.fromObject({
  partyListDescriptions: new ObservableArray(),
  isLoading: false
});

let page = undefined;

function onLoaded(args) {
  page = args.object;

  page.bindingContext = viewModel;

  if (!loaded) {
    loadParties();
    loaded = true;
  }
}

function loadParties() {
  viewModel.isLoading = true;
  let party = undefined;
  viewModel.partyListDescriptions.splice(0);
  FileIO.forEachFolderElement(FilePaths.POP_ATT_PATH, function (partyFolder) {
    party = new AttParty(partyFolder.name, true);
    // Observables have to be nested to reflect changes
    viewModel.partyListDescriptions.push(ObservableModule.fromObject({
      party: party,
      desc: party.getPopDescModule(),
      status: party.getPopStatusModule()
    }));
  });
  viewModel.isLoading = false;
}

function partyTapped(args) {
  const index = args.index;
  const status = viewModel.partyListDescriptions.getItem(index).status.status;
  const party = viewModel.partyListDescriptions.getItem(index).party;
  switch (status) {
    case PartyStates.ERROR:
      Dialog.alert({
        title: "Error",
        message: "The conode is offline, please wait until it comes online.",
        okButtonText: "Ok"
      });
      break;
    case PartyStates.PUBLISHED:
    case PartyStates.FINALIZING:
      // TODO handles the case when a party is running
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

function addParty() {
  return ScanToReturn.scan()
    .then(string => {
      const infos = Convert.jsonToObject(string);
      const newParty = new AttParty(infos.id, false, infos.address);
      viewModel.partyListDescriptions.push(ObservableModule.fromObject({
        party: newParty,
        desc: newParty.getPopDescModule(),
        status: newParty.getPopStatusModule()
      }));

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

module.exports.onLoaded = onLoaded;
module.exports.partyTapped = partyTapped;
module.exports.onSwipeCellStarted = onSwipeCellStarted;
module.exports.deleteParty = deleteParty;
module.exports.addParty = addParty;
