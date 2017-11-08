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

const viewModel = ObservableModule.fromObject({
    isLoading: true,
    deviceList: new ObservableArray()
});
function DevicesViewModel() {
    setupDeviceList();

    return viewModel;
}

function setupDeviceList() {
    const myDeviceList = viewModel.deviceList;

    myDeviceList.load = function () {
        const cothoritySocket = new DedisJsNet.CothoritySocket();

        return FileIO.getStringOf(FilePaths.CISC_IDENTITY_LINK)
            .then((result) => {
                const dataUpdateMessage = CothorityMessages.createDataUpdate(DedisMisc.hexToUint8Array(result.split("/")[3]));
                cothoritySocket.send({ Address: `tcp://${result.split("/")[2]}` }, CothorityPath.IDENTITY_DATA_UPDATE, dataUpdateMessage, CothorityDecodeTypes.DATA_UPDATE_REPLY)
                    .then((response) => {
                        console.log("received response: ");
                        console.dir(response)
                        for (const property in response.data.device) {
                            if (response.data.device.hasOwnProperty(property)) {
                                const point = response.data.device[property];
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
                    })
                    .catch((error) => {
                        console.log("Error: ");
                        console.log(error);
                    });
            })
            .catch((error) => console.log(`error while getting content: ${error}`));
    };

    myDeviceList.empty = function () {
        while (myDeviceList.length) {
            myDeviceList.pop();
        }
    };
}

module.exports = DevicesViewModel;
