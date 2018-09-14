const Log = require("../../shared/lib/dedjs/Log");
let log = new Log(3);

const Frame = require("ui/frame");
const Dialog = require("ui/dialogs");
const ObservableModule = require("data/observable");
const ObservableArray = require("data/observable-array").ObservableArray;
const FileIO = require("../../shared/lib/file-io/file-io");
const FilePaths = require("../../shared/lib/file-io/files-path");
const PoPMessages = require("../../shared/lib/dedjs/object/pop/Messages").get;
const AttParty = require("../../shared/lib/dedjs/object/pop/att/AttParty").Party;
const Convert = require("../../shared/lib/dedjs/Convert");

const viewModel = ObservableModule.fromObject({
    messageList: new ObservableArray(),
    isLoading: false,
    isEmpty: true
});

let page = undefined;
let timerId = undefined;
let conode = undefined;
// AttParty
let myParty = undefined;

function onLoaded(args) {
    page = args.object;
    page.bindingContext = viewModel;

    let files = [];
    FileIO.forEachFolderElement(FilePaths.POP_ATT_PATH, function (partyFolder) {
        console.log("loading party: " + partyFolder.name);
        files.push(partyFolder.name);
    });
    return Promise.all(files.map(pf => {
        return AttParty.loadFromDisk(pf)
            .then(party => {
                console.log("loaded from disk");
                myParty = party;
                return myParty.update()
            })
            .then(() => {
                console.log("party updated");
                return myParty.loadFinalStatement()
            })
            .then(fs => {
                console.log("final statement loaded");
                let ser = fs.desc.roster.list[0];
                let public = Convert.base64ToByteArray(ser.public);
                let id = Convert.base64ToByteArray(ser.id);

                conode = Convert.toServerIdentity(ser.address, public, ser.description, id);
                if (conode !== undefined) {
                    console.dir("having conode:", conode);
                    viewModel.isEmpty = false;
                    return updateMessages();
                }
                return Promise.resolve();
            })
            .then(() => {
                console.log("finished loading, conode is:", conode);
            })
            .catch(error => {
                console.dir("error:", error);
                return Promise.resolve();
            })
    }));
}

function onUnloaded() {
    // remove polling when page is leaved
    // Timer.clearInterval(timerId);
}

function messageTapped(args) {
    console.dir("message tapped. Args are:", args);
    let msg = viewModel.messageList.getItem(args.index);
    console.dir("Message is:", msg);
    // console.dir("reading message:", msg);
    // console.dir("myparty is:", myParty);
    let pol = myParty._popPartyOlInstance;
    if (pol === undefined){
        return Dialog.alert({
            title: "please wait",
            message: "still updating"
        })
    }
    let partyId = pol._instanceId;
    let ourCoinsId = pol.getAccountInstanceId(myParty._keyPair.public);
    console.dir("reading from conode:", conode);
    return PoPMessages.readMessage(conode, msg.id, partyId, ourCoinsId)
        .then(response => {
            return Dialog.alert({
                title: "Got coins",
                message: "If this is the first time you read this message, you got coins: " + msg.reward,
                okButtonText: "Confirm"
            })
                .then(() => {
                    return response;
                })
        })
        .then(response => {
            console.log("got response to read message:");
            console.dir(response);
            return Dialog.alert({
                title: response.message.subject,
                message: response.message.text,
                okButtonText: "Confirm"
            })
                .then(() => {
                    return updateMessages();
                })
        })
        .then(() => {
        })
        .catch(error => {
            Dialog.alert({
                title: "Error while reading",
                message: error,
                okButtonText: "Continue"
            })
        });
}

function updateMessages() {
    viewModel.messageList.splice(0);
    if (conode === undefined){
        return Dialog.alert({
            title: "No token",
            message: "Either there is no token or the party has not been finalized yet."
        })
    }
    console.dir("conode is:", conode);
    return PoPMessages.fetchListMessages(conode, 0, 10)
        .then(response => {
            viewModel.messageList.slice();
            for (var i = 0; i < response.subjects.length; i++) {
                console.log("Appending message " + i + ": " + response.subjects[i])
                console.dir("message is:", response.subjects)
                console.dir("balance is:", response.balances)
                console.dir("rewards is:", response.rewards)
                console.dir("ids is:", response.msgids)
                viewModel.messageList.push(
                    ObservableModule.fromObject({
                        subject: response.subjects[i],
                        balance: response.balances[i],
                        reward: response.rewards[i],
                        id: response.msgids[i],
                    })
                )
            }
        })
        .catch(error => {
            console.log("error: " + error);
        })
}

function addMessage() {
    if (conode === undefined){
        return Dialog.alert({
            title: "No token",
            message: "Either there is no token or the party has not been finalized yet."
        })
    }
    return page.showModal("shared/pages/messages/newMessage", undefined, addNewMessage, true);
}

function addNewMessage(arg) {
    if (arg !== undefined) {
        if (arg.reward < 0){
            return Dialog.alert({
                title: "Hacker",
                message: "Nice try - but Jeff was there before you and it got fixed..."
            })
        }
        if (arg.reward > arg.balance){
            return Dialog.alert({
                title: "Reward > Balance",
                message: "Please enter a reward that is smaller than the balance."
            })
        }
        return Dialog.confirm({
            title: "Send message",
            message: "Subject: " + arg.subject + "\n" +
                "Cost: " + arg.balance + "\n" +
                "The cost will be withdrawn from your account.",
            okButtonText: "Confirm",
            cancelButtonText: "Abort",
        }).then(function (result) {
            if (result) {
                console.dir(arg);
                console.log("sending coins");

                let ci = myParty.getCoinInstance();
                if (ci == undefined) {
                    throw new Error("coininstance not defined");
                }
                if (ci.balance < arg.balance) {
                    return Dialog.alert({
                        title: "Balance is not high enough",
                        message: "Please top up your account or make smaller balance in message",
                    })
                }
                myParty.transferCoin(arg.balance, myParty.getPopPartyInstance().getServiceCoinInstanceId())
                    .then(() => {
                        // log.lvl3("Sending message");
                        return PoPMessages.sendMessage(conode, arg)
                    })
                    .then(result => {
                        return Dialog.alert({
                            title: "Message sent",
                            message: "Stored the message and took " + arg.balance +
                                " from your account.",
                            okButtonText: "Continue"
                        })
                    })
                    .then(() => {
                        // log.lvl3("Sent message - searching for new messages", result);
                        return updateMessages();
                    })
                    .catch(error => {
                        // log.error(error)
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

function onNavigatingTo(args) {
    console.dir(args);
    page = args.object.page;
}

module.exports.onDrawerButtonTap = onDrawerButtonTap;
module.exports.onLoaded = onLoaded;
module.exports.messageTapped = messageTapped;
module.exports.onUnloaded = onUnloaded;
module.exports.addMessage = addMessage;
module.exports.onNavigatingTo = onNavigatingTo;
module.exports.updateMessages = updateMessages;
