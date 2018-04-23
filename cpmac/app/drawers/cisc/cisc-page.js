const FrameModule = require("ui/frame");
const Cisc = require("../../shared/lib/dedjs/object/cisc/Cisc").Skipchain;
const FilePaths = require("../../shared/res/files/files-path");
const FileIO = require("../../shared/lib/file-io/file-io");
const ObservableModule = require("data/observable");
const ObservableArray = require("data/observable-array").ObservableArray;

const skipchainsArray = [];
const viewModel = ObservableModule.fromObject({
  skipchainsList: new ObservableArray(),
  isLoading: false
});
/* ***********************************************************
 * Use the "onNavigatingTo" handler to initialize the page binding context.
 *************************************************************/
function onNavigatingTo(args) {
    /* ***********************************************************
     * The "onNavigatingTo" event handler lets you detect if the user navigated with a back button.
     * Skipping the re-initialization on back navigation means the user will see the
     * page in the same data state that he left it in before navigating.
     *************************************************************/
    if (args.isBackNavigation) {
        return;
    }

    const page = args.object;

    page.bindingContext = viewModel;
    if (skipchainsArray.length == 0){
        createSkipchains();
        setTimeout(() => {
            loadSkipchains();
        },0);
    }
}

function createSkipchains() {
    FileIO.forEachFolderElement(FilePaths.CISC_PATH, function (ciscFolder) {
        skipchainsArray.push(new Cisc(ciscFolder.name));
    });

}

function loadSkipchains() {
    viewModel.isLoading = true;
    let skipchain = undefined;
    viewModel.skipchainsList.splice(0);

    for (var i = 0; i < skipchainsArray.length; i++) {
        viewModel.skipchainsList.push(ObservableModule.fromObject({
            skipchain: skipchainsArray[i],
            identity: skipchainsArray[i].getIdentity()
        }));
    }    
    viewModel.isLoading = false;
}


function skipchainTapped(args) {
    const index = args.index;
    const skipchain = viewModel.skipchainsList.getItem(index).skipchain;

    FrameModule.topmost().navigate({
        moduleName: "drawers/cisc/skipchain-page",
        context: {
            skipchain: skipchain
        }
    });
}

/* ***********************************************************
 * According to guidelines, if you have a drawer on your page, you should always
 * have a button that opens it. Get a reference to the RadSideDrawer view and
 * use the showDrawer() function to open the app drawer section.
 *************************************************************/
function onDrawerButtonTap(args) {
    const sideDrawer = frameModule.topmost().getViewById("sideDrawer");
    sideDrawer.showDrawer();
}

exports.skipchainTapped = skipchainTapped;
exports.skipchainsArray = skipchainsArray;
exports.onNavigatingTo = onNavigatingTo;
exports.onDrawerButtonTap = onDrawerButtonTap;