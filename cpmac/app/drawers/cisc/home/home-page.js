const FrameModule = require("ui/frame");
const Dialog = require("ui/dialogs");
const RequestPath = require("~/shared/lib/dedjs/RequestPath");
const CothorityMessages = require("~/shared/lib/dedjs/protobuf/build/cothority-messages");
const DecodeType = require("~/shared/lib/dedjs/DecodeType");
const DedisJsNet = require("~/shared/lib/dedjs/Net");
const Convert = require("~/shared/lib/dedjs/Convert");
const BarcodeScanner = require("nativescript-barcodescanner").BarcodeScanner;
const Helper = require("~/shared/lib/dedjs/Helper");
const FileIO = require("../../../shared/lib/file-io/file-io");
const Cisc = require("~/shared/lib/dedjs/object/cisc/Cisc").Skipchain;
const User = require("~/shared/lib/dedjs/object/user/User").get;
const NetDedis = require("@dedis/cothority").net;
const ObservableModule = require("data/observable");
const ObservableArray = require("data/observable-array").ObservableArray;
const FilePaths = require("../../../shared/res/files/files-path");
const SkipPage = require("../skipchain-page");

let page = undefined;
let skipchain;
let viewmodel;

function onLoaded(args) {

    if (args.isBackNavigation) {
        return;
    }

    page = args.object;

    skipchain = SkipPage.skipchain.elem;
    viewmodel = skipchain.getVMModule();
    page.bindingContext = viewmodel;

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

function toggleProposed() {

    let storage = page.getViewById("storage");
    let storageLabel = page.getViewById("storageLabel");
    let device = page.getViewById("device");
    let deviceLabel = page.getViewById("deviceLabel");

    let proposedStorage = page.getViewById("proposedStorage");
    let proposedStorageLabel = page.getViewById("proposedStorageLabel");
    let proposedDevice = page.getViewById("proposedDevice");
    let proposedDeviceLabel = page.getViewById("proposedDeviceLabel");

    skipchain.updateAll()
        .then(() => {
            if (proposedStorage.visibility === "collapse") {
                if (JSON.stringify(skipchain.getProposedData()) === "{}" ){
                    Dialog.alert({
                        title: "No data",
                        message: `There is no proposed data`,
                        okButtonText: "Ok"
                    });
                } else {
                    viewmodel.isOnProposed = true;
                }
            } else {
                viewmodel.isOnProposed = false;
            }
        });
}

function voteForProposed() {

    skipchain.voteForProposed()
        .then(() => {
            viewmodel.isOnProposed = false;
        })
        .catch((error) => {
                console.log(error);
                console.dir(error);
                console.trace();

                Dialog.alert({
                    title: "Error",
                    message: "Already signed or invalid operation",
                    okButtonText: "Ok"
                });
                throw new Error("Already signed or invalid operation")
            }
        );
}

function reloadData(args) {
    skipchain.updateAll()
        .catch((error) => {
            console.log(error);
            console.dir(error);
            console.trace(); 
        });
}

exports.reloadData = reloadData;
exports.onLoaded = onLoaded;
exports.toggleProposed = toggleProposed;
exports.onDrawerButtonTap = onDrawerButtonTap;
exports.voteForProposed = voteForProposed;
