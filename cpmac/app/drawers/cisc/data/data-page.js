const FrameModule = require("ui/frame");
const Dialog = require("ui/dialogs");
const CothorityPath = require("~/shared/res/cothority-path/cothority-path");
const CothorityMessages = require("~/shared/lib/cothority-protobuf/build/cothority-messages");
const CothorityDecodeTypes = require("~/shared/res/cothority-decode-types/cothority-decode-types");
const DedisJsNet = require("~/shared/lib/dedis-js/src/net");
const DedisMisc = require("~/shared/lib/dedis-js/src/misc");
const DedisCrypto = require("~/shared/lib/dedis-js/src/crypto");
const FileIO = require("~/shared/lib/file-io/file-io");
const FilePaths = require("~/shared/res/files/files-path");
const HASH = require("hash.js");

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

    const page = args.object;
    page.bindingContext = page.page.bindingContext;
    viewmodel = page.bindingContext;
}

function proposeUpdateTaped() {
    const cothoritySocket = new DedisJsNet.CothoritySocket();

    FileIO.getStringOf(FilePaths.CISC_IDENTITY_LINK)
        .then((result) => {
            const proposeUpdateMessage = CothorityMessages.createProposeUpdate(DedisMisc.hexToUint8Array(result.split("/")[3]));
            cothoritySocket.send({Address: `tcp://${result.split("/")[2]}`}, CothorityPath.IDENTITY_PROPOSE_UPDATE, proposeUpdateMessage, CothorityDecodeTypes.DATA_UPDATE_REPLY)
                .then((response) => {
                    console.log("received response: ");
                    viewmodel.proposedData = response.data;
                    console.dir(response);
                })
                .catch((error) => {
                    console.log("Error: ");
                    console.log(error);
                });
        })
        .catch((error) => console.log(`error while getting content: ${error}`));
}

function dataUpdateTaped() {
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

function checkForDeviceTaped() {
    FileIO.getStringOf(FilePaths.CISC_NAME)
        .then((name) => {
            console.log(`device name is ${name}`);
            if (checkIfDeviceIsInData(name)) {
                Dialog.alert({
                    title: "Yes!",
                    message: `This device is in the id`,
                    okButtonText: "Ok"
                });
            } else {
                Dialog.alert({
                    title: "No!",
                    message: `This device is not in this id yet!`,
                    okButtonText: "Ok"
                });
            }
        })
        .catch((error)=>console.log(`There was an error: ${error}`));
}

function addDeviceTaped() {
    let data =JSON.parse(JSON.stringify(viewmodel.data));
    let device;

    FileIO.getStringOf(FilePaths.PUBLIC_KEY_COTHORITY)
        .then((point) => {
            device = CothorityMessages.createDevice(DedisMisc.hexToUint8Array(point));
            return FileIO.getStringOf(FilePaths.CISC_NAME);
        })
        .then((name)=>data.device[name] = device)
        .then(() => {
            const proposeSendMessage = CothorityMessages.createProposeSend(viewmodel.id, data);
            const cothoritySocket = new DedisJsNet.CothoritySocket();
            FileIO.getStringOf(FilePaths.CISC_IDENTITY_LINK)
                .then((result) => {
                    cothoritySocket.send({Address: `tcp://${result.split("/")[2]}`}, CothorityPath.IDENTITY_PROPOSE_SEND, proposeSendMessage, CothorityDecodeTypes.DATA_UPDATE_REPLY)
                        .then((response)=>console.dir(response))
                        .catch((error)=>console.log(error))
                })
                .catch((error)=>console.log(error))
        })
        .catch((error) => console.log(`There was an error: ${error}`));
}

function voteButtonTaped(){

    let hashedData = hashData(viewmodel.proposedData);
    console.log(hashedData);
    let signature;
    let proposeVoteMessage;
    const cothoritySocket = new DedisJsNet.CothoritySocket();
    let name;
    FileIO.getStringOf(FilePaths.CISC_NAME)
        .then((result) => {
            name = result;
            return FileIO.getStringOf(FilePaths.PRIVATE_KEY)
        })
        .then(privateKey => {
            const keyPair = DedisCrypto.getKeyPairFromPrivate(privateKey);
            signature = DedisCrypto.schnorrSign(DedisCrypto.toRed(keyPair.getPrivate()), DedisMisc.hexToUint8Array(hashedData));

            return FileIO.getStringOf(FilePaths.CISC_IDENTITY_LINK)
        })
        .then(((result) => {
            proposeVoteMessage = CothorityMessages.createProposeVote(viewmodel.id, name, signature);
            return cothoritySocket.send({Address: `tcp://${result.split("/")[2]}`}, CothorityPath.IDENTITY_PROPOSE_VOTE, proposeVoteMessage, CothorityDecodeTypes.PROPOSE_VOTE_REPLY)
        }))
        .then((response)=>console.dir(response))
        .catch((error)=>console.log(error))
}

function hashData(data){
    let tab = new Uint8Array(4);
    tab[3] = data.threshold / Math.pow(2,24);
    tab[2] = (data.threshold % Math.pow(2,24)) / Math.pow(2,16);
    tab[1] = (data.threshold % Math.pow(2,16)) / Math.pow(2,8);
    tab[0] = (data.threshold % Math.pow(2,8));
    const dataHash = HASH.sha256()
        .update(tab);

    let devices = [];
    for (let device in data.device){
        if (data.device.hasOwnProperty(device)){
            devices.push(device);
        }
    }
    devices.sort();
    for (let i in devices){
        console.log(`device: ${devices[i]}`);
        console.log(`point: ${DedisMisc.uint8ArrayToHex(data.device[devices[i]].point)}`);
        dataHash.update(GetByteArrayFromString(devices[i]));
        dataHash.update(data.device[devices[i]].point);
    }

    let storageKeys = [];
    for (let key in data.storage){
        if (data.storage.hasOwnProperty(key)){
            storageKeys.push(key);
        }
    }
    storageKeys.sort();
    for (let i in storageKeys) {
        dataHash.update(GetByteArrayFromString(data.storage[storageKeys[i]]));
    }
    return dataHash.digest("hex");
}

function GetByteArrayFromString(parameter) {
    let mainbytesArray = [];
    for (let i = 0; i < parameter.length; i++)
        mainbytesArray.push(parameter.charCodeAt(i));

    return mainbytesArray;
}

function checkIfDeviceIsInData(deviceName) {
    return viewmodel.data.device.hasOwnProperty(deviceName);
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
exports.checkForDeviceTaped = checkForDeviceTaped;
exports.addDeviceTaped = addDeviceTaped;
exports.voteButtonTaped = voteButtonTaped;
