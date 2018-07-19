const Frame = require("ui/frame");

function onNavigatingTo(args) {
  const page = args.object;
}

function onDrawerButtonTap(args) {
  const sideDrawer = Frame.topmost().getViewById("sideDrawer");
  sideDrawer.showDrawer();
}

module.exports.onNavigatingTo = onNavigatingTo;
module.exports.onDrawerButtonTap = onDrawerButtonTap;
const topmost = require("ui/frame").topmost;
const Dialog = require("ui/dialogs");
const Helper = require("../../shared/lib/dedjs/Helper");
const Convert = require("../../shared/lib/dedjs/Convert");
const ObjectType = require("../../shared/lib/dedjs/ObjectType");
const CothorityMessages = require("../../shared/lib/dedjs/network/cothority-messages");
const ScanToReturn = require("../../shared/lib/scan-to-return/scan-to-return");
const User = require("../../shared/lib/dedjs/object/user/User").get;
const ObservableModule = require("data/observable");
const ObservableArray = require("data/observable-array").ObservableArray;
const Timer = require("timer");

const viewModel = ObservableModule.fromObject({
    rosterModule: User.getRosterModule(),
    isRosterEmpty: true
});

let pageObject = undefined;
let timerId = undefined;

function onLoaded() {
    // Poll the statuses every 2s
    timerId = Timer.setInterval(() => {
        loadConodeList();
    }, 2000)

}

function onUnloaded() {
    // remove polling when page is leaved
    Timer.clearInterval(timerId);
}

function onNavigatingTo(args) {
    const page = args.object;
    pageObject = page.page;
    page.bindingContext = viewModel;

    // Bind isEmpty to the length of the array
    viewModel.isRosterEmpty = viewModel.rosterModule.list.length === 0;
    viewModel.rosterModule.list.on(ObservableArray.changeEvent, () => {
        viewModel.set('isRosterEmpty', viewModel.rosterModule.list.length === 0);
    });

    if (viewModel.rosterModule.statusList.length !== viewModel.rosterModule.list.length) {
        loadConodeList();
    }
}

function loadConodeList() {
    if (viewModel.rosterModule.isLoading) {
        return Promise.resolve();
    }
    return User.getRosterStatus();
}

function deblockConodeList() {
    Frame.topmost().navigate({
        clearHistory: true,
        moduleName: "drawers/pop/conode/conode-page",
        transition: {
            name: "fade",
            duration: 0
        }
    });
}

function conodeTapped(args) {
    const index = args.index;
    const conodesId = Convert.byteArrayToBase64(User.getRoster().list[index].id);
    let conodeAndStatusPair = undefined;
    User._roster.statusList.slice().forEach(object => {
        if (Convert.byteArrayToBase64(object.conode.id) === conodesId) {
            conodeAndStatusPair = object;
        }
    });

    if (conodeAndStatusPair !== undefined) {
        Frame.topmost().navigate({
            moduleName: "drawers/pop/conode-stats/conode-stats-page",
            bindingContext: conodeAndStatusPair
        });
    } else {
        return Dialog.alert({
            title: "No Status for this Conode",
            message: "Please check your conodes information and try to reload.",
            okButtonText: "Ok"
        });
    }
}

function addConode() {
    function addManualCallBack(server) {
        if (server !== undefined && !Helper.isOfType(server, ObjectType.SERVER_IDENTITY)) {
            throw new Error("server must be an instance of ServerIdentity or undefined to be skipped");
        }

        if (server !== undefined) {
            return User.addServer(server)
                .then(() => {
                    return loadConodeList();
                })
                .catch(error => {
                    console.log(error);
                    console.dir(error);
                    console.trace();

                    Dialog.alert({
                        title: "Error",
                        message: "An error occured, please try again. - " + error,
                        okButtonText: "Ok"
                    });

                    return Promise.reject(error);
                });
        }
    }

    return Dialog.confirm({
        title: "Choose a Method",
        message: "How do you want to add the conode?",
        okButtonText: "Scan QR",
        cancelButtonText: "Cancel",
        neutralButtonText: "Manual"
    })
        .then(result => {
            if (result) {
                // Scan
                return ScanToReturn.scan()
                    .then(string => {
                        let conode = undefined;

                        try {
                            conode = Convert.parseJsonServerIdentity(string);
                        } catch (error) { }

                        if (conode === undefined) {
                            try {
                                conode = Convert.parseTomlRoster(string).list[0];
                            } catch (error) { }
                        }

                        if (conode === undefined) {
                            return Promise.reject("parsing error");
                        }

                        return User.addServer(conode);
                    });
            } else if (result === undefined) {
                pageObject.showModal("shared/pages/add-conode-manual/add-conode-manual", undefined, addManualCallBack, true);
                return Promise.resolve();
            } else {
                // Cancel
                return Promise.resolve();
            }
        })
        .catch(error => {
            console.log(error);
            console.dir(error);
            console.trace();

            if (error !== ScanToReturn.SCAN_ABORTED) {
                setTimeout(() => {
                    Dialog.alert({
                        title: "Error",
                        message: "An error occured, please check the code you scanned. - " + error,
                        okButtonText: "Ok"
                    });
                });
            }

            return Promise.reject(error);
        });
}

function deleteConode(conode) {
    // We do not get the index of the item swiped/clicked...
  //  const conode = args.object.bindingContext;

    return User.substractRoster(CothorityMessages.createRoster(undefined, [conode], conode.public))
        .then(() => {
            const listView = Frame.topmost().currentPage.getViewById("listView");


            return Promise.resolve();
        })
        .catch(error => {
            console.log(error);
            console.dir(error);
            console.trace();

            Dialog.alert({
                title: "Error",
                message: "An error occured, please try again. - " + error,
                okButtonText: "Ok"
            });

            return Promise.reject(error);
        });



}



function onDrawerButtonTap(args) {
    const sideDrawer = Frame.topmost().getViewById("sideDrawer");
    sideDrawer.showDrawer();
}

module.exports.onDrawerButtonTap = onDrawerButtonTap;
module.exports.loadConodeList = loadConodeList;
module.exports.deblockConodeList = deblockConodeList;
module.exports.conodeTapped = conodeTapped;
module.exports.addConode = addConode;
module.exports.deleteConode = deleteConode;
module.exports.onLoaded = onLoaded;
module.exports.onUnloaded = onUnloaded;




const FileIO = require("../../shared/lib/file-io/file-io");
const FilePaths = require("../../shared/res/files/files-path");
const PartyStates = require("../../shared/lib/dedjs/object/pop/att/AttParty").States;
const PoP = require("../../shared/lib/dedjs/object/pop/PoP").get;
const Bar = require("../../shared/lib/dedjs/object/beercoin/Bar").Bar;

const viewModel2 = ObservableModule.fromObject({
    barListDescriptions: new ObservableArray(),
    isLoading: false,
    isEmpty: true
});

let page2 = undefined;
let pageObject2 = undefined;

function onNavigatingTo2(args) {
    pageObject2 = args.object.page;


}

function onLoaded2(args) {
    page2 = args.object;

    page2.bindingContext = viewModel2;

    loadBars();

}

function loadBars() {
    viewModel2.isLoading = true;

    // Bind isEmpty to the length of the array
    viewModel2.barListDescriptions.on(ObservableArray.changeEvent, () => {
        viewModel.set('isEmpty', viewModel2.barListDescriptions.length === 0);
});

    let bar = undefined;
    viewModel2.barListDescriptions.splice(0);
    FileIO.forEachFolderElement(FilePaths.BEERCOIN_PATH, function (barFolder) {
        bar = new Bar(barFolder.name);
        // Observables have to be nested to reflect changes
        viewModel2.barListDescriptions.push(ObservableModule.fromObject({
            bar: bar,
            desc: bar.getConfigModule(),
        }));
    });
    viewModel2.isLoading = false;
}

function barTapped(args) {
    const index = args.index;
    const bar = viewModel2.barListDescriptions.getItem(index).bar;
    const signData = bar.getSigningData();
    const USER_CANCELED = "USER_CANCELED_STRING";
    Dialog
        .action({
            message: "What do you want to do ?",
            cancelButtonText: "Cancel",
            actions: ["Show bar info to user", "Show orders history" , "Delete Bar"]
        })
        .then(result => {
        if (result === "Show bar info to user") {
        pageObject.showModal("shared/pages/qr-code/qr-code-page", {
            textToShow: Convert.objectToJson(signData),
            title: "Bar informations"
        }, () => {
            Dialog.confirm({
            title: "Client confirmation",
            message: "Do you want to also scan the client confirmation ?",
            okButtonText: "Yes",
            cancelButtonText: "No"
        }).then(function (result) {
            if (!result) {
                return Promise.reject(USER_CANCELED);
            }
            return ScanToReturn.scan();
        }).then(signatureJson => {
            console.log(signatureJson);
        const sig = Convert.hexToByteArray(Convert.jsonToObject(signatureJson).signature);
        console.dir(sig);
        return bar.registerClient(sig, signData)
    }).then(() => {
            return bar.addOrderToHistory(new Date(Date.now()));
    })
    .then(() => {
            // Alert is shown in the modal page if not enclosed in setTimeout
            setTimeout(() => {
            Dialog.alert({
            title: "Success !",
            message: "The beer is paid !",
            okButtonText: "Great"
        })
    });
    }).catch(error => {
            if (error === USER_CANCELED) {
            return Promise.resolve();
        }
        console.log(error);
        console.dir(error);
        console.trace();

        // Alert is shown in the modal page if not enclosed in setTimeout
        setTimeout(() => {
            Dialog.alert({
            title: "Error",
            message: error,
            okButtonText: "Ok"
        });
    });

        return Promise.reject(error);
    });

    }, true);
    } else if (result === "Show orders history") {
        Frame.topmost().navigate({
            moduleName: "drawers/pop/bar/order-history/bar-history-list",
            context: {
                bar: bar,
            }
        });

    } else if (result === "Delete Bar"){
        bar.remove()
            .then(() => {
            const listView = Frame.topmost().currentPage.getViewById("listView");
        listView.notifySwipeToExecuteFinished();

        return loadBars();
    })
    .catch((error) => {
            console.log(error);
        console.dir(error);
        console.trace();

        Dialog.alert({
            title: "Error",
            message: "An error occured, please try again. - " + error,
            okButtonText: "Ok"
        });

        return Promise.reject(error);

    });
    }

})

}

function deleteBar(args) {
    console.dir(args.object.bindingContext);
    const bar = args.object.bindingContext.bar;
    bar.remove()
        .then(() => {
        const listView = Frame.topmost().currentPage.getViewById("listView");
    listView.notifySwipeToExecuteFinished();

    return loadBars();
})
.catch((error) => {
        console.log(error);
    console.dir(error);
    console.trace();

    Dialog.alert({
        title: "Error",
        message: "An error occured, please try again. - " + error,
        okButtonText: "Ok"
    });

    return Promise.reject(error);

});
}



function addBar() {
    if (PoP.getFinalStatements().length === 0) {
        return Dialog.alert({
            title: "No group available",
            message: "You didn't participate to any party. Please do so to have a group to which you can pay beers !",
            okButtonText: "Ok"
        });

    }
    Frame.topmost().navigate({
        moduleName: "drawers/pop/bar/config/bar-config",
    });
}

function onDrawerButtonTap(args) {
    const sideDrawer = Frame.topmost().getViewById("sideDrawer");
    sideDrawer.showDrawer();
}

module.exports.onLoaded = onLoaded;
module.exports.onLoaded2 = onLoaded2;
module.exports.onUnloaded = onUnloaded;
module.exports.partyTapped = barTapped;
module.exports.deleteBar = deleteBar;
module.exports.addBar = addBar;
module.exports.onNavigatingTo2 = onNavigatingTo2;
module.exports.onDrawerButtonTap = onDrawerButtonTap;
module.exports.barTapped = barTapped;




const OrgParty = require("../../shared/lib/dedjs/object/pop/org/OrgParty").Party;


const CANCELED_BY_USER = "CANCELED_BY_USER_STRING";

const viewModel3 = ObservableModule.fromObject({
    partyListDescriptions: new ObservableArray(),
    isLoading: false,
    isEmpty: true
});

let page = undefined;
let timerId3 = undefined;

function onLoaded3(args) {
    page = args.object;

    page.bindingContext = viewModel3;

    loadParties();

    // Poll the status every 5s
    timerId3 = Timer.setInterval(() => {
        reloadStatuses();
}, 5000)

}

function onUnloaded3() {
    // remove polling when page is leaved
    Timer.clearInterval(timerId3);
}

function loadParties() {
    viewModel3.isLoading = true;

    // Bind isEmpty to the length of the array
    viewModel3.partyListDescriptions.on(ObservableArray.changeEvent, () => {
        viewModel3.set('isEmpty', viewModel3.partyListDescriptions.length === 0);
});

    let party = undefined;
    viewModel3.partyListDescriptions.splice(0);
    FileIO.forEachFolderElement(FilePaths.POP_ORG_PATH, function (partyFolder) {
        party = new OrgParty(partyFolder.name);
        // Observables have to be nested to reflect changes
        viewModel3.partyListDescriptions.push(ObservableModule.fromObject({
            party: party,
            desc: party.getPopDescModule(),
            status: party.getPopStatusModule()
        }));
    });
    viewModel3.isLoading = false;
}

function hashAndSave(party) {

    if (!User.isKeyPairSet()) {
        Dialog.alert({
            title: "Key Pair Missing",
            message: "Please generate a key pair.",
            okButtonText: "Ok"
        });

        return Promise.reject("Key Pair Missing");
    }
    if (!party.isPopDescComplete()) {
        Dialog.alert({
            title: "Missing Information",
            message: "Please provide a name, date, time, location and the list (min 3) of conodes" +
            " of the organizers of your PoP Party.",
            okButtonText: "Ok"
        });

        return Promise.reject("Missing Information");
    }
    if (!party.isLinkedConodeSet()) {
        Dialog.alert({
            title: "Not Linked to Conode",
            message: "Please link to a conode first.",
            okButtonText: "Ok"
        });

        return Promise.reject("Not Linked to Conode");
    }

    function registerPopDesc() {
        return party.registerPopDesc()
            .then(() => {
            return party.loadStatus();
    })
    .then(() => {
            return Dialog.alert({
                title: "Successfully Registered",
                message: "Your party has been correctly published ! You can now register the public key of each attendee.",
                okButtonText: "Ok"
            });
    })
    .catch(error => {
            console.log(error);
        console.dir(error);
        console.trace();

        Dialog.alert({
            title: "Error",
            message: "An error occured, please try again. - " + error,
            okButtonText: "Ok"
        });

        return Promise.reject(error);
    });
    }

    return registerPopDesc();
}


function partyTapped(args) {

    const index = args.index;
    const status = viewModel3.partyListDescriptions.getItem(index).status.status;
    const party = viewModel3.partyListDescriptions.getItem(index).party;
    switch (status) {
        case PartyStates.CONFIGURATION:

            Dialog
                .action({
                    message: "What do you want to do ?",
                    cancelButtonText: "Cancel",
                    actions: ["Configure the party", "Publish the party", "Remove the party"]
                })
                .then(result => {
                if (result === "Configure the party") {
            Frame.topmost().navigate({
                moduleName: "drawers/pop/org/config/config-page",
                context: {
                    party: party
                }
            });
        } else if (result === "Publish the party") {
            hashAndSave(party);
        } else if (result === "Remove the party") {
            return party.remove()
                .then(() => {
                viewModel3.partyListDescriptions.splice(index, 1);
            return Promise.resolve();
        });
        }
    })
.catch((error) => {
        Dialog.alert({
        title: "Error",
        message: "An error occured, please try again. - " + error,
        okButtonText: "Ok"
    });
});

    break;
case PartyStates.PUBLISHED:
    Frame.topmost().navigate({
        moduleName: "drawers/pop/org/register/register-page",
        context: {
            party: party
        }
    });
    break;
case PartyStates.ERROR:
    Dialog.alert({
        title: "Error",
        message: "The linked conode is offline, please turn it on to retrieve the party infos",
        okButtonText: "Ok"
    });
    break;
case PartyStates.FINALIZING:
    /* Dialog.alert({
       title: "Finalizing",
       message: "You have to wait until all the other organizers have finalized the party.",
       okButtonText: "Ok"
     });*/

    Frame.topmost().navigate({
        moduleName: "drawers/pop/org/register/register-page",
        context: {
            party: party

        }
    });
    break;
case PartyStates.FINALIZED:
    Dialog.alert({
        title: "Finalized",
        message: "This party has been finalized by all the organizers.",
        okButtonText: "Ok"
    });
    break;
default:
    Dialog.alert({
        title: "Not implemented",
        okButtonText: "Ok"
    })
}

}

function deleteParty(args) {
    const party = args.object.bindingContext;
    party.remove()
        .then(() => {
        const listView = Frame.topmost().currentPage.getViewById("listView");
    listView.notifySwipeToExecuteFinished();

    return Promise.resolve();
})
.catch((error) => {
        console.log(error);
    console.dir(error);
    console.trace();

    Dialog.alert({
        title: "Error",
        message: "An error occured, please try again. - " + error,
        okButtonText: "Ok"
    });

    return Promise.reject(error);

});
}

function onSwipeCellStarted(args) {
    const swipeLimits = args.data.swipeLimits;
    const swipeView = args.object;

    const deleteButton = swipeView.getViewById("button-delete");

    const width = deleteButton.getMeasuredWidth();

    swipeLimits.right = width;
    swipeLimits.threshold = width / 2;
}

function linkToConode(party) {

    if (!User.isKeyPairSet()) {
        return Dialog.alert({
            title: "Key Pair Missing",
            message: "Please generate a key pair.",
            okButtonText: "Ok"
        });
    }

    const conodes = User.getRoster().list;
    const conodesNames = conodes.map(serverIdentity => {
        return serverIdentity.description;
});

    let index = undefined;

    return Dialog.action({
        message: "Choose a Conode",
        cancelButtonText: "Cancel",
        actions: conodesNames
    })
        .then(result => {

        if (result !== "Cancel") {
        index = conodesNames.indexOf(result);

        return party.linkToConode(conodes[index], "")
            .then(result => {
                if (result.alreadyLinked !== undefined && result.alreadyLinked) {
            return Promise.resolve(conodes[index])
        }

        return Dialog.prompt({
            title: "Requested PIN",
            message: result,
            okButtonText: "Link",
            cancelButtonText: "Cancel",
            defaultText: "",
            inputType: Dialog.inputType.text
        })
            .then(result => {
            if (result.result) {
            if (result.text === "") {
                return Promise.reject("PIN should not be empty");
            }
            return party.linkToConode(conodes[index], result.text)
                .then(() => {
                return Promise.resolve(conodes[index]);
        });
        } else {
            return Promise.reject(CANCELED_BY_USER);
        }
    });

    })
    } else {
        return Promise.reject(CANCELED_BY_USER);
    }
})
.catch(error => {
        console.log(error);
    console.dir(error);
    console.trace();

    if (error !== CANCELED_BY_USER) {
        Dialog.alert({
            title: "Error",
            message: "An unexpected error occurred. Please try again. - " + error,
            okButtonText: "Ok"
        });
    }
    return Promise.reject(error);
});

}


function addParty() {
    const newParty = new OrgParty();
    let conode = undefined;
    linkToConode(newParty)
        .then((result) => {
        conode = result;
    return Dialog.action({
        message: "You are linked to your conode ! What do you want to do ?",
        cancelButtonText: "Cancel",
        actions: ["Configure a new party", "List the proposals"]
    })
})
.then(result => {
        if (result === "Configure a new party") {
        Frame.topmost().navigate({
            moduleName: "drawers/pop/org/config/config-page",
            context: {
                party: newParty,
                leader: conode,
                newParty: true
            }
        });
    } else if (result === "List the proposals") {
        Frame.topmost().navigate({
            moduleName: "drawers/pop/org/proposals/org-party-proposals",
            context: {
                conode: conode,
            }
        });

        return Promise.reject("New party is not needed anymore");
    } else {
        return Promise.reject("User canceled");
    }

    return Promise.resolve()
})
.catch(() => {
        newParty.remove();
});

}

function reloadStatuses() {
    viewModel3.partyListDescriptions.forEach(model => {
        model.party.loadStatus();
})
}

module.exports.onLoaded3 = onLoaded;
module.exports.partyTapped = partyTapped;

module.exports.deleteParty = deleteParty;
module.exports.addParty = addParty;
module.exports.onUnloaded3 = onUnloaded;

