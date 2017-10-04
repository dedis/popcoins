const ObservableModule = require("data/observable");
const DedisJsNet = require("~/shared/lib/dedis-js/src/net");
const CothorityMessages = require("~/shared/lib/cothority-protobuf/build/cothority-messages");

function CiscPageViewModel() {
  let returnedValue = ObservableModule.fromObject({
                                                    myMessage: "TO_CHANGE"
                                                  });

  const socket = new DedisJsNet.StandardSocket();

  socket.send("wss://echo.websocket.org", "SEND DIS BAK 2 MI").then((result) => {
    console.log(result);
    returnedValue.myMessage = result;
  }).catch((error) => console.dir(error));

  return returnedValue;
}

module.exports = CiscPageViewModel;
