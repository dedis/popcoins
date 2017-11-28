const FrameModule = require("ui/frame");
const CothorityPath = require("~/shared/res/cothority-path/cothority-path");
const CothorityMessages = require("~/shared/lib/cothority-protobuf/build/cothority-messages");
const CothorityDecodeTypes = require("~/shared/res/cothority-decode-types/cothority-decode-types");
const DedisJsNet = require("~/shared/lib/dedis-js/src/net");
const DedisMisc = require("~/shared/lib/dedis-js/src/misc");
const FileIO = require("~/shared/lib/file-io/file-io");
const FilePaths = require("~/shared/res/files/files-path");

/* ***********************************************************
 * Use the "onNavigatingTo" handler to initialize the page binding context.
 *************************************************************/
function onLoaded(args) {
    /* ***********************************************************
     * The "onNavigatingTo" event handler lets you detect if the user navigated with a back button.
     * Skipping the re-initialization on back navigation means the user will see the
     * page in the same data state that he left it in before navigating.
     *************************************************************/
    if (args.isBackNavigation) {
        return;
    }

    const page = args.object;
    page.bindingContext = page.page.bindingContext;
}

function proposeUpdateTaped () {
    const cothoritySocket = new DedisJsNet.CothoritySocket();

    FileIO.getStringOf(FilePaths.CISC_IDENTITY_LINK)
        .then((result) => {
            const proposeUpdateMessage = CothorityMessages.createProposeUpdate(DedisMisc.hexToUint8Array(result.split("/")[3]));
            cothoritySocket.send({Address: `tcp://${result.split("/")[2]}`}, CothorityPath.IDENTITY_PROPOSE_UPDATE, proposeUpdateMessage, CothorityDecodeTypes.DATA_UPDATE_REPLY)
                .then((response) => {
                    console.log("received response: ");
                    console.dir(response);
                })
                .catch((error) => {
                    console.log("Error: ");
                    console.log(error);
                });
        })
        .catch((error) => console.log(`error while getting content: ${error}`));
}

function dataUpdateTaped () {
    const cothoritySocket = new DedisJsNet.CothoritySocket();

    FileIO.getStringOf(FilePaths.CISC_IDENTITY_LINK)
        .then((result) => {
            const dataUpdateMessage = CothorityMessages.createDataUpdate(DedisMisc.hexToUint8Array(result.split("/")[3]));
            cothoritySocket.send({Address: `tcp://${result.split("/")[2]}`}, CothorityPath.IDENTITY_DATA_UPDATE, dataUpdateMessage, CothorityDecodeTypes.DATA_UPDATE_REPLY)
                .then((response) => {
                    console.log("received response: ");
                    console.dir(response);
                })
                .catch((error) => {
                    console.log("Error: ");
                    console.log(error);
                });
        })
        .catch((error) => console.log(`error while getting content: ${error}`));
}


/* ***********************************************************
 * According to guidelines, if you have a drawer on your page, you should always
 * have a button that opens it. Get a reference to the RadSideDrawer view and
 * use the showDrawer() function to open the app drawer section.
 *************************************************************/
function onDrawerButtonTap(args) {
    const sideDrawer = FrameModule.topmost().getViewById("sideDrawer");
    sideDrawer.showDrawer();
}

exports.onLoaded = onLoaded;
exports.onDrawerButtonTap = onDrawerButtonTap;
exports.dataUpdateTaped = dataUpdateTaped;
exports.proposeUpdateTaped = proposeUpdateTaped;
