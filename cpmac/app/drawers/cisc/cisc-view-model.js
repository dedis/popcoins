const observableModule = require("data/observable");
const WS = require("~/shared/lib/ws/ws");

function CiscPageViewModel() {
    // let returnedValue;
    // WS.testMyWebSocket((message) => returnedValue = message);
    // const viewModel = observableModule.fromObject({
    //     myMessage: returnedValue
    // });
    // console.log("this should work ".concat(returnedValue))
    const socket = new WS.Socket();
    const returnedPromise = socket.send("test message");
    let returnedValue;
    returnedPromise.then((result) => returnedValue = result);
    const viewModel = observableModule.fromObject({
        myMessage: returnedValue
    });

    return viewModel;
}

module.exports = CiscPageViewModel;
