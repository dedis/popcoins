const Frame = require("ui/frame");
const Dialog = require("ui/dialogs");
const Timer = require("timer");
const ObservableModule = require("data/observable");
const ObservableArray = require("data/observable-array").ObservableArray;
const FileIO = require("../../lib/file-io/file-io");
const FilePaths = require("../../res/files/files-path");
const OrgParty = require("../../lib/dedjs/object/pop/org/OrgParty").Party;
const User = require("../../lib/dedjs/object/user/User").get;
const Convert = require("../../lib/dedjs/Convert");
const PartyStates = require("../../lib/dedjs/object/pop/org/OrgParty").States;

const CANCELED_BY_USER = "CANCELED_BY_USER_STRING";

const viewModel = ObservableModule.fromObject({
  messageList: new ObservableArray(),
  isLoading: false,
  isEmpty: true
});

let page = undefined;
let timerId = undefined;

function onLoaded(args) {
  page = args.object;

  page.bindingContext = viewModel;

  viewModel.messageList.splice(0);
  viewModel.isEmpty = false;
  viewModel.messageList.push(
      ObservableModule.fromObject({
      subject: "test1",
      balance: 1000,
      reward: 10
  }));
  viewModel.messageList.push(
      ObservableModule.fromObject({
      subject: "test2",
      balance: 2000,
      reward: 20
  }));
}

function onUnloaded() {
  // remove polling when page is leaved
  // Timer.clearInterval(timerId);
}

function messageTapped(args){
    console.log("message tapped");
    console.dir(args)
}

function addMessage(){
    viewModel.messageList.push(
        ObservableModule.fromObject({
            subject: "test3",
            balance: 300,
            reward: 20
        })
    )
}

module.exports.onLoaded = onLoaded;
module.exports.messageTapped = messageTapped;
module.exports.onUnloaded = onUnloaded;
module.exports.addMessage = addMessage;
