const FrameModule = require("ui/frame");
const Dialog = require("ui/dialogs");
const RequestPath = require("~/shared/lib/dedjs/RequestPath");
const CothorityMessages = require("~/shared/lib/dedjs/protobuf/build/cothority-messages");
const DecodeType = require("~/shared/lib/dedjs/DecodeType");
const DedisJsNet = require("~/shared/lib/dedjs/Net");
const Convert = require("~/shared/lib/dedjs/Convert");
const Helper = require("~/shared/lib/dedjs/Helper");
const Cisc = require("~/shared/lib/dedjs/object/cisc/Cisc").get;

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
    page.bindingContext = Cisc.getVMModule();
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
                edited = Helper.deepCopy(Cisc.getData());
                if (edited.storage === null || edited.storage === undefined) {
                    edited.storage = {};
                }
                edited.storage[key]=value;
                edited.votes = null;
                proposeSendMessage = CothorityMessages.createProposeSend(Convert.hexToByteArray(Cisc.getIdentity().id), edited);
                const cothoritySocket = new DedisJsNet.CothoritySocket();
                let node = CothorityMessages.createServerIdentity(new Uint8Array({}), new Uint8Array({}), Cisc.getIdentity().address,"lelele");
                return cothoritySocket.send(node, RequestPath.IDENTITY_PROPOSE_SEND, proposeSendMessage, DecodeType.DATA_UPDATE_REPLY)
            }
        })
        .then(()=>{
            Cisc.updateAll().then(()=>Cisc.voteForProposed());
        })
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
