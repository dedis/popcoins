const Frame = require("ui/frame");
const Dialog = require("ui/dialogs");
const BarcodeScanner = require("nativescript-barcodescanner").BarcodeScanner;

const PopViewModel = require("./qr-view-model");

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

function sendProposeUpdate(result) {
    Dialog.alert({
        title:"Scan Succesfull",
        message:`connection to ${result.text}`,
        okButtonText: "Ok"
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
            setTimeout(() => sendProposeUpdate(result), 100);
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
