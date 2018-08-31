const Frame = require("ui/frame");
const Dialog = require("ui/dialogs");
const Timer = require("timer");
const ObservableModule = require("data/observable");
const ObservableArray = require("data/observable-array").ObservableArray;
const FileIO = require("../../shared/lib/file-io/file-io");
const FilePaths = require("../../shared/res/files/files-path");
const OrgParty = require("../../shared/lib/dedjs/object/pop/org/OrgParty").Party;
const User = require("../../shared/lib/dedjs/object/user/User").get;
const Convert = require("../../shared/lib/dedjs/Convert");
const PartyStates = require("../../shared/lib/dedjs/object/pop/org/OrgParty").States;

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
    Timer.clearInterval(timerId);
}

function messageTapped(args) {
    console.log("message tapped");
    console.dir(args)
}

function addMessage() {
    page.showModal("shared/pages/messages/newMessage", undefined, addNewMessage, true);
}

function addNewMessage(arg) {
    console.dir(arg);
    if (arg !== undefined) {
        console.log("new message");
        Dialog.confirm({
            title: "Send message",
            message: "Subject: " + arg.subject + "\n" +
                "Balance: " + arg.balance,
            okButtonText: "Confirm",
            cancelButtonText: "Abort",
        }).then(function (result) {
            if (result) {
                viewModel.messageList.push(
                    ObservableModule.fromObject({
                        subject: arg.subject,
                        balance: arg.balance,
                        reward: arg.reward
                    })
                )
            }
        })
    }
}

function onDrawerButtonTap(args) {
    const sideDrawer = Frame.topmost().getViewById("sideDrawer");
    sideDrawer.showDrawer();
}

module.exports.onDrawerButtonTap = onDrawerButtonTap;
module.exports.onLoaded = onLoaded;
module.exports.messageTapped = messageTapped;
module.exports.onUnloaded = onUnloaded;
module.exports.addMessage = addMessage;
