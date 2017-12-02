const ObservableModule = require("data/observable");
const ObservableArray = require("data/observable-array").ObservableArray;
const CothorityPath = require("~/shared/res/cothority-path/cothority-path");
const CothorityMessages = require("~/shared/lib/cothority-protobuf/build/cothority-messages");
const CothorityDecodeTypes = require("~/shared/res/cothority-decode-types/cothority-decode-types");
const DedisJsNet = require("~/shared/lib/dedis-js/src/net");
const DedisMisc = require("~/shared/lib/dedis-js/src/misc");
const FileIO = require("~/shared/lib/file-io/file-io");
const FilePaths = require("~/shared/res/files/files-path");
const Dialog = require("ui/dialogs");

let viewModel;

function CiscPageViewModel() {
    viewModel = ObservableModule.fromObject({
        isConnected: false,
        isConnectedAtBeginning: false,
        deviceList: new ObservableArray(),
        label: "",
        id:undefined,
        data: undefined,
        proposedData:undefined
    });
    setupViewModel();
    return viewModel;
}

function setupViewModel() {
    const myDeviceList = viewModel.deviceList;

    viewModel.update = function () {
        const cothoritySocket = new DedisJsNet.CothoritySocket();

        FileIO.getStringOf(FilePaths.CISC_IDENTITY_LINK)
            .then((result) => {
                viewModel.id = DedisMisc.hexToUint8Array(result.split("/")[3]);
                const dataUpdateMessage = CothorityMessages.createDataUpdate(viewModel.id);
                viewModel.label = `cisc://${result.split("/")[2]}/${result.split("/")[3]}`;
                cothoritySocket.send({Address: `tcp://${result.split("/")[2]}`}, CothorityPath.IDENTITY_DATA_UPDATE, dataUpdateMessage, CothorityDecodeTypes.DATA_UPDATE_REPLY)
                    .then((response) => {
                        console.log("received response: ");
                        console.log(response);
                        console.dir(response);
                        viewModel.isConnected = true;
                        viewModel.data = response.data;
                        updateViewModel(response);
                    })
                    .catch((error) => {
                        viewModel.isConnected = false;
                        console.log("Error: ");
                        console.log(error);
                    });
            })
            .catch((error) => console.log(`error while getting content: ${error}`));
    };

    myDeviceList.update = function () {
        for (const property in viewModel.data.device) {
            if (viewModel.data.device.hasOwnProperty(property)) {
                const point = viewModel.data.device[property];
                viewModel.deviceList.push({
                    device: {
                        id: property,
                        showPub: () => Dialog.alert({
                            title: `${property} public key`,
                            message: DedisMisc.uint8ArrayToHex(point.point),
                            okButtonText: "Ok"
                        })
                    }
                });
            }
        }
    };

    myDeviceList.empty = function () {
        while (myDeviceList.length) {
            myDeviceList.pop();
        }
    };

    const cothoritySocket = new DedisJsNet.CothoritySocket();

    FileIO.getStringOf(FilePaths.CISC_IDENTITY_LINK)
        .then((result) => {
            viewModel.id = DedisMisc.hexToUint8Array(result.split("/")[3]);
            const dataUpdateMessage = CothorityMessages.createDataUpdate(viewModel.id);
            viewModel.label = `cisc://${result.split("/")[2]}/${result.split("/")[3]}`;
            cothoritySocket.send({Address: `tcp://${result.split("/")[2]}`}, CothorityPath.IDENTITY_DATA_UPDATE, dataUpdateMessage, CothorityDecodeTypes.DATA_UPDATE_REPLY)
                .then((response) => {
                    viewModel.isConnectedAtBeginning = true;
                    viewModel.isConnected = true;
                    viewModel.data = response.data;
                    updateViewModel(response);
                    console.log("received response: ");
                    console.log(response);
                    console.dir(response);
                })
                .catch((error) => {
                    viewModel.isConnectedAtBeginning = false;
                    viewModel.isConnected = false;
                    console.log("Error: ");
                    console.log(error);
                });
        })
        .catch((error) => console.log(`error while getting content: ${error}`));
}

function updateViewModel() {
    // update devices list
    // first empty the list
    viewModel.deviceList.empty();
    viewModel.deviceList.update();
}

module.exports = CiscPageViewModel;
