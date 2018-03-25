const Frame = require("ui/frame");
const Dialog = require("ui/dialogs");
const ObservableModule = require("data/observable");
const ObservableArray = require("data/observable-array").ObservableArray;
const FileIO = require("../../../shared/lib/file-io/file-io");
const FilePaths = require("../../../shared/res/files/files-path");
const OrgParty = require("../../../shared/lib/dedjs/object/pop/org/OrgParty");

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


module.exports.onLoaded = onLoaded;
module.exports.partyTapped = partyTapped;
module.exports.onSwipeCellStarted = onSwipeCellStarted;
module.exports.deleteParty = deleteParty;
