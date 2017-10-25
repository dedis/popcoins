const ObservableModule = require("data/observable");
const ObservableArray = require("data/observable-array").ObservableArray;
const viewModel = ObservableModule.fromObject({
    isLoading:true,
    deviceList:new ObservableArray()
});
function DevicesViewModel() {
    setupDeviceList();

    return viewModel;
}

function setupDeviceList() {
    const myDeviceList = viewModel.deviceList;
    myDeviceList.mock = [{ id:"Test id" }, { id:"Test id" }];

    myDeviceList.load = function() {
        const temp = myDeviceList.mock.map((device) => myDeviceList.push({ device:device }));
        const toRet = Promise.all(temp);

        return toRet;
    };

    myDeviceList.empty = function() {
        while (myDeviceList.length) {
            myDeviceList.pop();
        }
    };
}

module.exports = DevicesViewModel;
