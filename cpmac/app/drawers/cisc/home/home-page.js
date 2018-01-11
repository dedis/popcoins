const FrameModule = require("ui/frame");
const Dialog = require("ui/dialogs");
const RequestPath = require("~/shared/lib/dedjs/RequestPath");
const CothorityMessages = require("~/shared/lib/dedjs/protobuf/build/cothority-messages");
const DecodeType = require("~/shared/lib/dedjs/DecodeType");
const DedisJsNet = require("~/shared/lib/dedjs/Net");
const Convert = require("~/shared/lib/dedjs/Convert");
const DedisCrypto = require("~/shared/lib/dedjs/Crypto");
const HASH = require("hash.js");
const BarcodeScanner = require("nativescript-barcodescanner").BarcodeScanner;
const Helper = require("~/shared/lib/dedjs/Helper");
const Cisc = require("~/shared/lib/dedjs/object/cisc/Cisc").get;
const User = require("~/shared/lib/dedjs/object/user/User").get;

let page;
let viewmodel;

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

    page = args.object;
    page.bindingContext = Cisc.getVMModule();
    viewmodel = page.bindingContext;
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

    Cisc.updateAll()
        .then(() => {
            if (proposedStorage.visibility === "collapse") {
                if (JSON.stringify(Cisc.getProposedData()) === "{}" ){
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

    Cisc.voteForProposed()
        .then(() => {
            viewmodel.isOnProposed = false;
        })
        .catch((error) => {
                Dialog.alert({
                    title: "Already signed",
                    message: "You already signed this proposition",
                    okButtonText: "Ok"
                });
                throw new Error("You already signed this message")
            }
        );
}


function connectButtonTapped(args) {
    const barcodescanner = new BarcodeScanner();
    if (Cisc.getName() === null || Cisc.getName() === undefined || Cisc.getName() === "") {
        throw new Error("Go to the settings to set your name")
    }
    if (!(User.isKeyPairSet())) {
        throw new Error("Go to the settings to generate a keypair")
    }
    return barcodescanner.available()
        .then(function (available) {
            if (available) {
                return availableFunction();
            } else {
                return notAvailableFunction();
            }
        })
        .catch((error) => {
            console.log(error);
            setTimeout(() => Dialog.alert({
                title: "Scanner Error",
                message: error.toString(),
                okButtonText: "Ok"
            }), 100)
        });

    function availableFunction() {
        return barcodescanner.scan({
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
            orientation: "portrait", // Android only, optionally lock the orientation to either "portrait" or "landscape"
            openSettingsIfPermissionWasPreviouslyDenied: true // On iOS you can send the user to the settings app if access was previously denied
        }).then(
            (result) => {
                console.dir(result);
                const splitColon = result.text.split(":");
                const splitSlash = splitColon[2].split("/");
                const goodURL = `tcp:${splitColon[1]}:${splitSlash[0]}`;

                let label = result.text;
                let address = goodURL;
                let id = `${splitSlash[1]}`;


                Cisc.setIdentity(id, address, label, true)
                    .then(() => askForDevice());
            })
            .catch(
                (error) => setTimeout(() => Dialog.alert({
                    title: "Scanner Error",
                    message: error.toString(),
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

function askForDevice() {
    return Cisc.updateAll().then(() => {
        console.log("checking for device");
        let isIn = false;
        for (let i = 0; i < Cisc.getDevices().length; i++) {
            let device = Cisc.getDevices().getItem("" + i).device;
            if (device.id === Cisc.getName() && device.point === Convert.byteArrayToHex(User.getKeyPairModule().public)) {
                isIn = true;
            }
        }
        if (isIn) {
            return Dialog.alert({
                title: "Connection successful",
                message: "You successfully connected to this identity!",
                okButtonText: "Ok"
            })
        } else {
            return Dialog.confirm({
                title: "First Connection",
                message: "Do you want to add this device to the identity ?",
                okButtonText: "yes",
                cancelButtonText: "no"
            })
        }
    })
        .then((result) => {
            if (result) {
                addDevice()
            }
        })
        .catch((error) => console.log(error));
}

function addDevice() {
    let data = Helper.deepCopy(Cisc.getData());
    data.device[Cisc.getName()] = CothorityMessages.createDevice(User.getKeyPairModule().public);
    data.votes = {};
    console.dir(data);

    let proposeSendMessage = CothorityMessages.createProposeSend(Convert.hexToByteArray(Cisc.getIdentity().id), data);
    console.log(Cisc.getIdentity().id);
    const cothoritySocket = new DedisJsNet.CothoritySocket();
    let node = CothorityMessages.createServerIdentity(new Uint8Array({}), new Uint8Array({}), Cisc.getIdentity().address,"lelele");
    cothoritySocket.send(node, RequestPath.IDENTITY_PROPOSE_SEND, proposeSendMessage, DecodeType.DATA_UPDATE_REPLY)
        .then((response) => {
            console.log(response);
            console.dir(response);
        })
        .catch((error) => {
            console.log(error);
            console.dir(error);
            console.trace();
        });
}


exports.onLoaded = onLoaded;
exports.toggleProposed = toggleProposed;
exports.onDrawerButtonTap = onDrawerButtonTap;
exports.voteForProposed = voteForProposed;
exports.connectButtonTapped = connectButtonTapped;