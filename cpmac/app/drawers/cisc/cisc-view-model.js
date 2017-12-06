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
        proposedDeviceList: new ObservableArray(),
        storageList: new ObservableArray(),
        proposedStorageList: new ObservableArray(),
        label: "",
        id:undefined,
        data: undefined,
        proposedData:undefined,
        isOnProposed: false
    });
    setupViewModel();
    return viewModel;
}

function setupViewModel() {


    viewModel.update = function () {
        const cothoritySocket = new DedisJsNet.CothoritySocket();
        let address;

        return FileIO.getStringOf(FilePaths.CISC_IDENTITY_LINK)
            .then((result) => {
                address = result;
                viewModel.id = DedisMisc.hexToUint8Array(address.split("/")[3]);
                const dataUpdateMessage = CothorityMessages.createDataUpdate(viewModel.id);
                viewModel.label = `cisc://${address.split("/")[2]}/${address.split("/")[3]}`;

                return cothoritySocket.send({Address: `tcp://${address.split("/")[2]}`}, CothorityPath.IDENTITY_DATA_UPDATE, dataUpdateMessage, CothorityDecodeTypes.DATA_UPDATE_REPLY)
            })
            .then((response) => {
                console.log("received data update: ");
                console.dir(response);
                viewModel.isConnected = true;
                viewModel.data = response.data;

                const proposeUpdateMessage = CothorityMessages.createProposeUpdate(viewModel.id);
                return cothoritySocket.send({Address: `tcp://${address.split("/")[2]}`}, CothorityPath.IDENTITY_PROPOSE_UPDATE, proposeUpdateMessage, CothorityDecodeTypes.DATA_UPDATE_REPLY)
            })
            .then((response) => {
                console.log("received propose update: ");
                console.dir(response);
                viewModel.proposedData = response.data;

                return Promise.resolve();
            })
            .then(()=>{
                updateViewModel();

                return Promise.resolve();
            })
            .catch((error) => {
                viewModel.isConnected = false;
                console.log("Error: ");
                console.log(error);
            });
    };

    viewModel.storageList.update = function () {
        if (viewModel.data !== undefined && viewModel.data !== null) {
            for (const property in viewModel.data.storage) {
                if (viewModel.data.storage.hasOwnProperty(property)) {
                    const value = viewModel.data.storage[property];
                    viewModel.storageList.push({
                        keyValuePair: {
                            key: property,
                            value: value,
                            showValue: () => Dialog.alert({
                                title: property,
                                message: value,
                                okButtonText: "Ok"
                            })
                        }
                    });
                }
            }
        }
    };

    viewModel.storageList.empty = function () {
        while (viewModel.storageList.length) {
            viewModel.storageList.pop();
        }
    };

    viewModel.deviceList.update = function () {
        if (viewModel.data !== undefined && viewModel.data !== null) {
            for (const property in viewModel.data.device) {
                if (viewModel.data.device.hasOwnProperty(property)) {
                    const point = viewModel.data.device[property];
                    viewModel.deviceList.push({
                        device: {
                            id: property,
                            point: DedisMisc.uint8ArrayToHex(point.point),
                            showPub: () => Dialog.alert({
                                title: `${property} public key`,
                                message: DedisMisc.uint8ArrayToHex(point.point),
                                okButtonText: "Ok"
                            })
                        }
                    });
                }
            }
        }
    };

    viewModel.deviceList.empty = function () {
        while (viewModel.deviceList.length) {
            viewModel.deviceList.pop();
        }
    };

    viewModel.proposedStorageList.update = function () {
        if (viewModel.proposedData !== undefined && viewModel.proposedData !== null) {
            for (const property in viewModel.proposedData.storage) {
                if (viewModel.proposedData.storage.hasOwnProperty(property)) {
                    const value = viewModel.proposedData.storage[property];
                    viewModel.proposedStorageList.push({
                        keyValuePair: {
                            key: property,
                            value: value,
                            showValue: () => Dialog.alert({
                                title: property,
                                message: value,
                                okButtonText: "Ok"
                            })
                        }
                    });
                }
            }
        }
    };

    viewModel.proposedStorageList.empty = function () {
        while (viewModel.proposedStorageList.length) {
            viewModel.proposedStorageList.pop();
        }
    };

    viewModel.proposedDeviceList.update = function () {
        if (viewModel.proposedData !== undefined && viewModel.proposedData !== null) {
            for (const property in viewModel.proposedData.device) {
                if (viewModel.proposedData.device.hasOwnProperty(property)) {
                    const point = viewModel.proposedData.device[property];
                    viewModel.proposedDeviceList.push({
                        device: {
                            id: property,
                            point: DedisMisc.uint8ArrayToHex(point.point),
                            showPub: () => Dialog.alert({
                                title: `${property} public key`,
                                message: DedisMisc.uint8ArrayToHex(point.point),
                                okButtonText: "Ok"
                            })
                        }
                    });
                }
            }
        }
    };

    viewModel.proposedDeviceList.empty = function () {
        while (viewModel.proposedDeviceList.length) {
            viewModel.proposedDeviceList.pop();
        }
    };

    const cothoritySocket = new DedisJsNet.CothoritySocket();

    FileIO.getStringOf(FilePaths.CISC_IDENTITY_LINK)
        .then((result) => {
            viewModel.id = DedisMisc.hexToUint8Array(result.split("/")[3]);
            const dataUpdateMessage = CothorityMessages.createDataUpdate(viewModel.id);
            viewModel.label = `cisc://${result.split("/")[2]}/${result.split("/")[3]}`;

            return cothoritySocket.send({Address: `tcp://${result.split("/")[2]}`}, CothorityPath.IDENTITY_DATA_UPDATE, dataUpdateMessage, CothorityDecodeTypes.DATA_UPDATE_REPLY)})
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
}

function updateViewModel() {
    // update devices list
    // first empty the list
    viewModel.deviceList.empty();
    viewModel.deviceList.update();
    viewModel.storageList.empty();
    viewModel.storageList.update();
    viewModel.proposedDeviceList.empty();
    viewModel.proposedDeviceList.update();
    viewModel.proposedStorageList.empty();
    viewModel.proposedStorageList.update();

    for (let i=0; i<viewModel.proposedStorageList.length; i++ ){
        let item = viewModel.proposedStorageList.getItem(""+i);
        let NewOrChanged = true;
        for (let j=0; j<viewModel.storageList.length; j++ ){
            let oldItem = viewModel.storageList.getItem(""+j);
            if (oldItem.keyValuePair.key === item.keyValuePair.key && oldItem.keyValuePair.value === item.keyValuePair.value){
                NewOrChanged = false;
            }
        }
        item.keyValuePair.newOrChanged = NewOrChanged;
        viewModel.proposedStorageList.setItem(""+i,item);
    }
    for (let i=0; i<viewModel.storageList.length; i++ ){
        let item = viewModel.storageList.getItem(""+i);
        let deleted = true;
        for (let j=0; j<viewModel.proposedStorageList.length; j++ ){
            let oldItem = viewModel.proposedStorageList.getItem(""+j);
            if (oldItem.keyValuePair.key === item.keyValuePair.key && oldItem.keyValuePair.value === item.keyValuePair.value){
                deleted = false;
            }
        }

        if (deleted) {
            item.keyValuePair.deleted = "deleted";
            viewModel.proposedStorageList.push(item);
        }
    }
    for (let i=0; i<viewModel.proposedDeviceList.length; i++ ){
        let item = viewModel.proposedDeviceList.getItem(""+i);
        let NewOrChanged = true;
        for (let j=0; j<viewModel.deviceList.length; j++ ){
            let oldItem = viewModel.deviceList.getItem(""+j);
            if (item.device.id === oldItem.device.id && item.device.point === oldItem.device.point){
                NewOrChanged = false;
            }
        }
        item.device.newOrChanged = NewOrChanged;
        viewModel.proposedDeviceList.setItem(""+i,item);
    }

    for (let i=0; i<viewModel.deviceList.length; i++ ){
        let item = viewModel.deviceList.getItem(""+i);
        let deleted = true;
        for (let j=0; j<viewModel.proposedDeviceList.length; j++ ){
            let oldItem = viewModel.proposedDeviceList.getItem(""+j);
            if (item.device.id === oldItem.device.id && item.device.point === oldItem.device.point){
                deleted = false;
            }
        }

        if (deleted) {
            item.device.deleted = "deleted";
            viewModel.proposedDeviceList.push(item);
        }
    }
}

module.exports = CiscPageViewModel;
