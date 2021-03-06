const Frame = require("ui/frame");
const Dialog = require("ui/dialogs");
const ObservableModule = require("data/observable");
const ObservableArray = require("data/observable-array").ObservableArray;
const Timer = require("tns-core-modules/timer");

const gData = require("~/app").gData;
const lib = require("~/lib");
const Log = lib.Log.default;
const Messages = lib.pop.Messages;

const viewModel = ObservableModule.fromObject({
    messageList: new ObservableArray(),
    isEmpty: true,
    networkStatus: undefined
});

let page = undefined;
let conode = undefined;
let party = undefined;
let msgService = undefined;
let pageObject = undefined;

function onLoaded(args) {
    page = args.object;
    page.bindingContext = viewModel;
    pageObject = page.page;

    Log.print("Gdata is:", gData);

    setProgress();
    Timer.setTimeout(() => {
        let badges = gData.badges;
        Log.print("setting viewModel.isEmpty = true");
        viewModel.isEmpty = true;
        viewModel.messageList.splice(0);
        if (badges.length > 0) {
            Log.print("found badges");
            party = badges[0];
            conode = party.config.roster.identities[0];
            viewModel.isEmpty = false;
            return party
                .getCoinInstance()
                .then(() => {
                    return party.getPartyInstance();
                })
                .then(pi => {
                    msgService = new Messages(party, pi);
                    return msgService.loadMessages();
                })
                .then(() => {
                    return updateMessages();
                });
        } else {
            conode = undefined;
            party = undefined;
            viewModel.isEmpty = true;
        }
    }, 100)
}

function onUnloaded() {
    // remove polling when page is leaved
    // Timer.clearInterval(timerId);
}

function setProgress(text, width) {
    if (width == 0 || !width) {
        viewModel.set("networkStatus", undefined);
    } else {
        Log.print("setting progress to", text, width);
        pageObject.getViewById("progress_bar").setInlineStyle("width:" + width + "%;");
        pageObject.getViewById("progress_text").text = text;
    }
}

function messageTapped(args) {
    Log.print("mt:", args);
    let msg = viewModel.messageList.getItem(args.index);
    let response = undefined;
    Log.lvl2("Tapped message is:", msg.title);
    setProgress("Fetching message", 20)
    return msgService.readMessage(msg.id)
        .then(r => {
            response = r;
            setProgress("Done", 100);
            if (response.rewarded) {
                return Dialog.alert({
                    title: "Got coins",
                    message: "You got coins: " + msg.reward,
                    okButtonText: "Confirm"
                })
            }
        })
        .then(() => {
            return Dialog.alert({
                title: response.message.subject,
                message: response.message.text,
                okButtonText: "Confirm"
            })
        }).then(() => {
            return updateMessages();
        }).catch(error => {
            setProgress();
            Dialog.alert({
                title: "Error while reading",
                message: error,
                okButtonText: "Continue"
            });
        });
}

function updateMessages() {
    return Promise.resolve()
        .then(() => {
            if (conode === undefined || msgService === undefined) {
                return Dialog.alert({
                    title: "No token",
                    message:
                        "Either there is no token or the party has not been finalized yet.",
                    okButtonText: "Continue"
                });
            }
            setProgress("Fetching List of Messages", 70);
            pageObject.getViewById("listView").refresh();

            return msgService.fetchListMessages(0, 10)
                .then(response => {
                    viewModel.messageList.splice(0);
                    for (let i = 0; i < response.subjects.length; i++) {
                        viewModel.messageList.push(
                            ObservableModule.fromObject({
                                subject: response.subjects[i],
                                balance: response.balances[i],
                                reward: response.rewards[i],
                                id: response.msgids[i]
                            })
                        );
                    }
                })
                .catch(error => {
                    Log.catch(error, "error");
                    setProgress();
                });
        })
        .then(() => {
            setProgress();
            pageObject.getViewById("listView").refresh();
        })
        .catch(error => {
            Log.catch(error);
        });
}

function addMessage() {
    if (conode === undefined) {
        return Dialog.alert({
            title: "No token",
            message:
                "Either there is no token or the party has not been finalized yet.",
            okButtonText: "Continue"
        });
    }
    // let d = new Date();
    // return addNewMessage({
    //     reward: 1000,
    //     balance: 10000,
    //     subject: "direct msg " + d.toString(),
    //     text: "this is a long text",
    // });
    return page.showModal(
        "pages/apps/posts/rw/newMessage",
        undefined,
        addNewMessage,
        true
    );
}

function addNewMessage(arg) {
    if (arg !== undefined) {
        if (arg.reward < 0) {
            return Dialog.alert({
                title: "Hacker",
                message: "Nice try - but Jeff was there before you and it got fixed...",
                okButtonText: "Understood",
            });
        }
        if (arg.reward > arg.balance) {
            return Dialog.alert({
                title: "Reward > Balance",
                message: "Please enter a reward that is smaller than the balance.",
                okButtonText: "OK",
            });
        }
        return Promise.resolve(() => {
            return Dialog.confirm({
                title: "Send message",
                message:
                    "Subject: " +
                    arg.subject +
                    "\n" +
                    "Cost: " +
                    arg.balance +
                    "\n" +
                    "The cost will be withdrawn from your account.",
                okButtonText: "Confirm",
                cancelButtonText: "Abort"
            });
        }).then(result => {
            if (result) {
                if (party.balance < arg.balance) {
                    return Dialog.alert({
                        title: "Balance is not high enough",
                        message:
                            "Please top up your account or make smaller balance in message",
                        okButtonText: "OK",
                    });
                }

                Log.lvl2(
                    "sending coins to message-account",
                    msgService.serviceAccountId
                );
                setProgress("Sending coins to service", 30);
                pageObject.getViewById("listView").refresh();
                return party
                    .transferCoin(arg.balance, msgService.serviceAccountId)
                    .then(() => {
                        Log.lvl2("Sending message");
                        setProgress("Sending message", 70)
                        return msgService.sendMessage(arg);
                    })
                    .then(() => {
                        setProgress("Done", 100);
                        return Dialog.alert({
                            title: "Message sent",
                            message:
                                "Stored the message and took " +
                                arg.balance +
                                " from your account.",
                            okButtonText: "Continue"
                        });
                    })
                    .then(() => {
                        Log.lvl2("Sent message - searching for new messages", result);
                        return updateMessages();
                    })
                    .catch(error => {
                        Log.catch(error, "while sending messages");
                        setProgress();
                        pageObject.getViewById("listView").refresh();
                        return Dialog.alert({
                            title: "while sending",
                            message: "couldn't send message: " + error,
                            okButtonText: "OK",
                        });
                    });
            }
        });
    }
}

function onNavigatingTo(args) {
    page = args.object.page;
}

module.exports = {
    onLoaded,
    messageTapped,
    onUnloaded,
    addMessage,
    onNavigatingTo,
    updateMessages,
    cancelNetwork: function () {
        setProgress();
    },
    onBack: function () {
        Frame.topmost().goBack();
    },
}