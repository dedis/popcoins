const Frame = require("ui/frame");
const Dialog = require("ui/dialogs");
const ObservableModule = require("data/observable");
const ObservableArray = require("data/observable-array").ObservableArray;
const Timer = require("tns-core-modules/timer");

const lib = require("../../../lib");
const Log = lib.Log.default;
const Wallet = lib.pop.Badge;
const Messages = lib.pop.Messages;

const viewModel = ObservableModule.fromObject({
    messageList: new ObservableArray(),
    isLoading: false,
    isEmpty: true
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

    Timer.setTimeout(() => {
        let wallets = Wallet.List;
        if (wallets.length > 0) {
            party = wallets[0];
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
        }
    }, 100)
}

function onUnloaded() {
    // remove polling when page is leaved
    // Timer.clearInterval(timerId);
}

function messageTapped(args) {
    let msg = viewModel.messageList.getItem(args.index);
    Log.lvl2("Tapped message is:", msg);
    party
        .getPartyInstance()
        .then(pi => {
            let ourCoinsId = pi.getAccountInstanceId(party._keypair.public);
            return msgService.readMessage(msg.id, pi.instanceId, ourCoinsId);
        })
        .then(response => {
            return Promise.resolve()
                .then(() => {
                    if (response.rewarded) {
                        return Dialog.alert({
                            title: "Got coins",
                            message: "You got coins: " + msg.reward,
                            okButtonText: "Confirm"
                        });
                    }
                })
                .then(() => {
                    return response;
                });
        })
        .then(response => {
            return Dialog.alert({
                title: response.message.subject,
                message: response.message.text,
                okButtonText: "Confirm"
            }).then(() => {
                return updateMessages();
            });
        })
        .catch(error => {
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
            if (conode === undefined || msgService === undefined ) {
                return Dialog.alert({
                    title: "No token",
                    message:
                        "Either there is no token or the party has not been finalized yet.",
                    okButtonText: "Continue"
                });
            }
            viewModel.isLoading = true;
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
                    viewModel.isLoading = false;
                });
        })
        .then(() => {
            viewModel.isLoading = false;
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
                message: "Nice try - but Jeff was there before you and it got fixed..."
            });
        }
        if (arg.reward > arg.balance) {
            return Dialog.alert({
                title: "Reward > Balance",
                message: "Please enter a reward that is smaller than the balance."
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
                            "Please top up your account or make smaller balance in message"
                    });
                }

                Log.lvl2(
                    "sending coins to message-account",
                    msgService.serviceAccountId
                );
                viewModel.isLoading = true;
                pageObject.getViewById("listView").refresh();
                return party
                    .transferCoin(arg.balance, msgService.serviceAccountId)
                    .then(() => {
                        Log.lvl2("Sending message");
                        return msgService.sendMessage(arg);
                    })
                    .then(() => {
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
                        viewModel.isLoading = false;
                        pageObject.getViewById("listView").refresh();
                        return Dialog.alert({
                            title: "while sending",
                            message: "couldn't send message: " + error
                        });
                    });
            }
        });
    }
}

function onNavigatingTo(args) {
    page = args.object.page;
}

module.exports.onBack = function () {
    Frame.topmost().goBack();
};

module.exports.onLoaded = onLoaded;
module.exports.messageTapped = messageTapped;
module.exports.onUnloaded = onUnloaded;
module.exports.addMessage = addMessage;
module.exports.onNavigatingTo = onNavigatingTo;
module.exports.updateMessages = updateMessages;
