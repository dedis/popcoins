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
const ObjectType = require("../../shared/lib/dedjs/ObjectType");
const PoPMessages = require("../../shared/lib/dedjs/object/pop/Messages").get;
const Crypto = require("crypto-browserify");

const CANCELED_BY_USER = "CANCELED_BY_USER_STRING";

const viewModel = ObservableModule.fromObject({
    messageList: new ObservableArray(),
    isLoading: false,
    isEmpty: true
});

let page = undefined;
let timerId = undefined;
let conode = undefined;

function onLoaded(args) {
    page = args.object;

    page.bindingContext = viewModel;

    var roster = User.getRoster();
    if (roster.list.length == 0){
        console.dir("no roster yet");
        return;
    } else {
        conode = roster.list[0];
    }
    updateMessages()
    // timerId = Timer.setInterval(() => {
    //     updateMessages();
    // }, 2000)
}

function onUnloaded() {
    // remove polling when page is leaved
    Timer.clearInterval(timerId);
}

function messageTapped(args) {
    console.log("message tapped");
    console.dir(args);
    msg = viewModel.messageList.getItem(args.index);
    console.dir(msg)
    PoPMessages.readMessage(conode, msg.id, Crypto.randomBytes(32), Crypto.randomBytes(32))
        .then(response => {
            console.log("got response to read message:");
            console.dir(response);
            Dialog.alert({
                title: response.message.subject,
                message: response.message.text,
                okButtonText: "Confirm"
            })
        })
        .catch(error=>{
            Dialog.alert({
                title: "Error while reading",
                message: error,
                okButtonText: "Continue"
            })
        });
    updateMessages()
}

function updateMessages(){
    viewModel.messageList.splice(0);
    PoPMessages.fetchListMessages(conode, 0, 10)
        .then(response =>{
            viewModel.messageList.slice();
            for (var i = 0; i < response.subjects.length; i++) {
                console.log("Appending message " + i + ": " + response.subjects[i])
                viewModel.messageList.push(
                    ObservableModule.fromObject({
                        subject: response.subjects[i],
                        balance: response.balances[i],
                        reward: response.rewards[i],
                        id: response.ids[i],
                    })
                )
            }
        })
        .catch(error =>{
            console.log("error: " + error);
        })
    viewModel.isEmpty = false;
    // viewModel.messageList.push(
    //     ObservableModule.fromObject({
    //         subject: "test1",
    //         balance: 1000,
    //         reward: 10
    //     }));
    // viewModel.messageList.push(
    //     ObservableModule.fromObject({
    //         subject: "test2",
    //         balance: 2000,
    //         reward: 20
    //     }));
}

function addMessage() {
    page.showModal("shared/pages/messages/newMessage", undefined, addNewMessage, true);
}

function addNewMessage(arg) {
    if (arg !== undefined) {
        Dialog.confirm({
            title: "Send message",
            message: "Subject: " + arg.subject + "\n" +
                "Balance: " + arg.balance,
            okButtonText: "Confirm",
            cancelButtonText: "Abort",
        }).then(function (result) {
            if (result) {
                console.dir(arg);
                PoPMessages.sendMessage(conode, arg)
                    .then(result =>{
                        console.log("Successfully sent message");
                        updateMessages();
                    })
                    .catch(error =>{
                        console.log("error while sending message: " + error);
                    })
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
