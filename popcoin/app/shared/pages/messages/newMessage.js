const Dialog = require("ui/dialogs");
const Helper = require("../../lib/dedjs/Helper");
const NetUtils = require("../../lib/dedjs/network/NetUtils");
const ObservableModule = require("data/observable");

const viewModel = ObservableModule.fromObject({
  newMessage: ObservableModule.fromObject({
      subject: "enter subject",
      text: "multiline text",
      balance: 1000,
      reward: 100,
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
