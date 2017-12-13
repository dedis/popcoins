const FrameModule = require("ui/frame");
const Dialog = require("ui/dialogs");
const CothorityPath = require("~/shared/res/cothority-path/cothority-path");
const CothorityMessages = require("~/shared/lib/cothority-protobuf/build/cothority-messages");
const CothorityDecodeTypes = require("~/shared/res/cothority-decode-types/cothority-decode-types");
const DedisJsNet = require("~/shared/lib/dedis-js/src/net");
const FileIO = require("~/shared/lib/file-io/file-io");
const FilePaths = require("~/shared/res/files/files-path");
const DeepCopy = require("~/shared/lib/deep-copy/DeepCopy");

let viewmodel;
let Page;

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
    Page = page.page;
    page.bindingContext = page.page.bindingContext;
    viewmodel = page.bindingContext;
}

function addKeyValue() {
    let key;
    let value;
    let proposeSendMessage;
    let edited;

    return Dialog.prompt({
        title: "Key",
        message: "What is the key you want to add ?",
        okButtonText: "Ok",
        cancelButtonText: "Cancel",
        inputType: Dialog.inputType.text
    })
        .then((response) => {
            if (response.result) {
                key = response.text;
                return Dialog.prompt({
                    title: "Value",
                    message: `What is the value that goes with ${key}`,
                    okButtonText: "Ok",
                    cancelButtonText: "Cancel",
                    inputType: Dialog.inputType.text
                })
            }
        })
        .then((response) => {
            if (response.result) {
                value = response.text;
                edited = DeepCopy.copy(viewmodel.data);
                edited.storage[key]=value;
                edited.votes = null;
                proposeSendMessage = CothorityMessages.createProposeSend(viewmodel.id, edited);
                return FileIO.getStringOf(FilePaths.CISC_IDENTITY_LINK);
            }
        })
        .then((result) => {
            const cothoritySocket = new DedisJsNet.CothoritySocket();
            return cothoritySocket.send({Address: `tcp://${result.split("/")[2]}`}, CothorityPath.IDENTITY_PROPOSE_SEND, proposeSendMessage, CothorityDecodeTypes.DATA_UPDATE_REPLY)
        })
        .then((response)=>console.dir(response))
        .catch((error) => console.log(`There was an error: ${error}`));
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
exports.addKeyValue = addKeyValue;
