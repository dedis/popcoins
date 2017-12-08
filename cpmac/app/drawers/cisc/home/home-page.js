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
    page.bindingContext = page.page.bindingContext;
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

    viewmodel.update()
        .then(() => {
            if (proposedStorage.visibility === "collapse"){
                if (viewmodel.proposedData === null) {
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

function voteForProposed(){

    let hashedData = hashData(viewmodel.proposedData);
    let signature;
    let proposeVoteMessage;
    let name;
    const cothoritySocket = new DedisJsNet.CothoritySocket();

    FileIO.getStringOf(FilePaths.CISC_NAME)
        .then((result) => {
            name = result;
            return FileIO.getStringOf(FilePaths.PRIVATE_KEY)
        })
        .then(privateKey => {

            const keyPair = DedisCrypto.getKeyPairFromPrivate(privateKey);
            let alreadySigned = false;
            if (viewmodel.proposedData.votes[name] !== null && viewmodel.proposedData.votes[name] !== undefined){
                alreadySigned = DedisCrypto.schnorrVerify(keyPair.getPublic(),DedisMisc.hexToUint8Array(hashedData),viewmodel.proposedData.votes[name])
            }
            if (alreadySigned) {
                Dialog.alert({
                    title: "Already signed",
                    message: "You already signed this proposition",
                    okButtonText: "Ok"
                });
                throw new Error("You already signed this message")
            }


            signature = DedisCrypto.schnorrSign(DedisCrypto.toRed(keyPair.getPrivate()), DedisMisc.hexToUint8Array(hashedData));

            return FileIO.getStringOf(FilePaths.CISC_IDENTITY_LINK)
        })
        .then(((result) => {
            proposeVoteMessage = CothorityMessages.createProposeVote(viewmodel.id, name, signature);
            return cothoritySocket.send({Address: `tcp://${result.split("/")[2]}`}, CothorityPath.IDENTITY_PROPOSE_VOTE, proposeVoteMessage, CothorityDecodeTypes.PROPOSE_VOTE_REPLY)
        }))
        .then((response)=>{
            console.dir(response);
            return viewmodel.update();
        })
        .then(() => viewmodel.isOnProposed = false)
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

exports.onLoaded = onLoaded;
exports.toggleProposed = toggleProposed;
exports.onDrawerButtonTap = onDrawerButtonTap;
exports.voteForProposed = voteForProposed;
