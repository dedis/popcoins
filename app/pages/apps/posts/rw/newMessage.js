const ObservableModule = require("data/observable");

const viewModel = ObservableModule.fromObject({
  newMessage: ObservableModule.fromObject({
      subject: "",
      text: "",
      balance: 100000,
      reward: 20000,
  }),
  isLoading: false,
  isEmpty: true
});

let closeCallBackFunction = undefined;

let page = undefined;

function onShownModally(args) {
    closeCallBackFunction = args.closeCallback;
}

function onLoaded(args) {
  page = args.object;

  page.bindingContext = viewModel;
}

function onUnloaded() {
  // remove polling when page is leaved
  // Timer.clearInterval(timerId);
}

function addManual(){
    closeCallBackFunction(viewModel.newMessage);
}

function onCancel(){
    closeCallBackFunction();
}

module.exports.addManual = addManual;
module.exports.onCancel = onCancel;
module.exports.onLoaded = onLoaded;
module.exports.onUnloaded = onUnloaded;
module.exports.onShownModally = onShownModally;
