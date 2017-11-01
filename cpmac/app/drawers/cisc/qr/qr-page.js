const Frame = require("ui/frame");
const Dialog = require("ui/dialogs");
const BarcodeScanner = require("nativescript-barcodescanner").BarcodeScanner;
const CothorityPath = require("~/shared/res/cothority-path/cothority-path");
const CothorityMessages = require("~/shared/lib/cothority-protobuf/build/cothority-messages");
const CothorityDecodeTypes = require("~/shared/res/cothority-decode-types/cothority-decode-types");
const DedisJsNet = require("~/shared/lib/dedis-js/src/net");
const DedisMisc = require("~/shared/lib/dedis-js/src/misc")

const PopViewModel = require("./qr-view-model");

//Hardcoded value of the public ip of the computer
//TODO: change this so that it take the value from the TOML
const IP = "//128.179.185.4";

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
    page.bindingContext = new PopViewModel();
}

/* ***********************************************************
 * According to guidelines, if you have a drawer on your page, you should always
 * have a button that opens it. Get a reference to the RadSideDrawer view and
 * use the showDrawer() function to open the app drawer section.
 *************************************************************/
function onDrawerButtonTap(args) {
    const sideDrawer = Frame.topmost().getViewById("sideDrawer");
    sideDrawer.showDrawer();
}

function sendDataUpdate(Address, ID) {
    Dialog.alert({
        title:"Scan Succesfull",
        message:`connection to ${Address}`,
        okButtonText: "Ok"
    });
    const cothoritySocket = new DedisJsNet.CothoritySocket();
    const dataUpdateMessage = CothorityMessages.createDataUpdate(DedisMisc.hexToUint8Array(ID));

    return cothoritySocket.send({ Address: Address }, CothorityPath.IDENTITY_DATA_UPDATE, dataUpdateMessage, CothorityDecodeTypes.DATA_UPDATE_REPLY)
        .then((response) => {
        console.log("received response:");
        console.log(response);
        console.dir(response);
        });
}

function connectButtonTapped(args) {
    const barcodescanner = new BarcodeScanner();

    barcodescanner.scan({
        formats: "QR_CODE", // Pass in of you want to restrict scanning to certain types
        cancelLabel: "EXIT. Also, try the volume buttons!", // iOS only, default 'Close'
        cancelLabelBackgroundColor: "#333333", // iOS only, default '#000000' (black)
        message: "Use the volume buttons for extra light", // Android only, default is 'Place a barcode inside the viewfinder rectangle to scan it.'
        showFlipCameraButton: true, // default false
        preferFrontCamera: false, // default false
        showTorchButton: true, // default false
        beepOnScan: true, // Play or Suppress beep on scan (default true)
        torchOn: false, // launch with the flashlight on (default false)
        closeCallback: function () {
            console.log("Scanner closed");
        }, // invoked when the scanner was closed (success or abort)
        resultDisplayDuration: 500, // Android only, default 1500 (ms), set to 0 to disable echoing the scanned text
        orientation: "landscape", // Android only, optionally lock the orientation to either "portrait" or "landscape"
        openSettingsIfPermissionWasPreviouslyDenied: true // On iOS you can send the user to the settings app if access was previously denied
    }).then(
        (result) => {
            console.log(`Scan format: ${result.format}`);
            console.log(`Scan text: ${result.text}`);
            const splitColon = result.text.split(":");
            const splitSlash = splitColon[2].split("/");
            const goodURL = `tcp:${IP}:${splitSlash[0]}`;
            console.log(goodURL);
            setTimeout(() => sendDataUpdate(goodURL, splitSlash[1]), 100);
        },
        (error) => setTimeout(() => Dialog.alert({
            title: "Scanner Error",
            message: error,
            okButtonText: "Ok"
        }), 100)
    );
}

exports.onNavigatingTo = onNavigatingTo;
exports.onDrawerButtonTap = onDrawerButtonTap;
exports.connectButtonTapped = connectButtonTapped;
