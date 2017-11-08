const Frame = require("ui/frame");
const Dialog = require("ui/dialogs");
const BarcodeScanner = require("nativescript-barcodescanner").BarcodeScanner;
const CothorityPath = require("~/shared/res/cothority-path/cothority-path");
const CothorityMessages = require("~/shared/lib/cothority-protobuf/build/cothority-messages");
const CothorityDecodeTypes = require("~/shared/res/cothority-decode-types/cothority-decode-types");
const DedisJsNet = require("~/shared/lib/dedis-js/src/net");
const DedisMisc = require("~/shared/lib/dedis-js/src/misc");
const FileIO = require("~/shared/lib/file-io/file-io");
const FilePaths = require("~/shared/res/files/files-path");
const ZXing = require("nativescript-zxing");
const ImageSource = require("image-source");
const PlatformModule = require("tns-core-modules/platform");

const QRViewModel = require("./qr-view-model");
const QRGenerator = new ZXing();

const viewModel = new QRViewModel();
let label;
let image;

//Hardcoded value of the public ip of the computer
//TODO: change this so that it take the value from the TOML
const IP = "//128.179.188.221";

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
    loadViews(page);
    page.bindingContext = viewModel;
    const cothoritySocket = new DedisJsNet.CothoritySocket();

    FileIO.getStringOf(FilePaths.CISC_IDENTITY_LINK)
        .then((result) => {
        const dataUpdateMessage = CothorityMessages.createDataUpdate(DedisMisc.hexToUint8Array(result.split("/")[3]));
        label.text = `cisc://${result.split("/")[2]}/${result.split("/")[3]}`;
        cothoritySocket.send({ Address: `tcp://${result.split("/")[2]}` }, CothorityPath.IDENTITY_DATA_UPDATE, dataUpdateMessage, CothorityDecodeTypes.DATA_UPDATE_REPLY)
            .then((response) => {
                viewModel.isConnected = true;
                updateImage();
                console.log("received response: ");
                console.log(response);
                console.dir(response);
            })
            .catch((error) => {
                viewModel.isConnected = false;
                updateImage();
                console.log("Error: ");
                console.log(error);
            });
        })
        .catch((error) => console.log(`error while getting content: ${error}`));
}

function updateImage() {
    const sideLength = PlatformModule.screen.mainScreen.widthPixels;
    const QR_CODE = QRGenerator.createBarcode({
        encode: label.text,
        format: ZXing.QR_CODE,
        height: sideLength,
        width: sideLength
    });

    image.imageSource = ImageSource.fromNativeSource(QR_CODE);
}

function loadViews(page) {
    label = page.getViewById("label");
    image = page.getViewById("image");
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
        title:"Scan Successful",
        message:`connection to ${Address}`,
        okButtonText: "Ok"
    });

    const cothoritySocket = new DedisJsNet.CothoritySocket();
    const dataUpdateMessage = CothorityMessages.createDataUpdate(DedisMisc.hexToUint8Array(ID));

    return cothoritySocket.send({ Address: Address }, CothorityPath.IDENTITY_DATA_UPDATE, dataUpdateMessage, CothorityDecodeTypes.DATA_UPDATE_REPLY)
        .then((response) => {
        viewModel.isConnected = true;
        console.log("received response: ");
        console.log(response);
        console.dir(response);
        })
        .catch((error) => {
        viewModel.isConnected = false;
        console.log("Error: ");
        console.log(error);
        });
}

function connectButtonTapped(args) {
    const barcodescanner = new BarcodeScanner();

    return barcodescanner.available().then(function (available) {
        if (available) {
            return availableFunction();
        } else {
            return notAvailableFunction();
        }
    });

    function availableFunction () {
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
                setTimeout(() => {
                    const toWrite = `${goodURL}/${splitSlash[1]}`;
                    FileIO.writeStringTo(FilePaths.CISC_IDENTITY_LINK, toWrite).then(() => console.log(`saved ${toWrite} in ${FilePaths.CISC_IDENTITY_LINK}`));
                    sendDataUpdate(goodURL, splitSlash[1]);
                }, 100);
            },
            (error) => setTimeout(() => Dialog.alert({
                title: "Scanner Error",
                message: error,
                okButtonText: "Ok"
            }), 100)
        );
    }

    function notAvailableFunction() {
        return Dialog.alert({
            title: "Where is your camera?",
            message: "There is no camera available on your phone.",
            okButtonText: "Ok"
        });
    }
}

exports.onLoaded = onLoaded;
exports.onDrawerButtonTap = onDrawerButtonTap;
exports.connectButtonTapped = connectButtonTapped;
