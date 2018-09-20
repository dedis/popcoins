const Frame = require("ui/frame");
const Observable = require("data/observable");
const ObservableArray = require("data/observable-array").ObservableArray;
const Timer = require("timer");
const Dialog = require("ui/dialogs");

const lib = require("../../../shared/lib");
const dedjs = lib.dedjs;
const Helper = dedjs.Helper;
const Convert = dedjs.Convert;
const ObjectType = dedjs.ObjectType;
const ScanToReturn = lib.scan_to_return;
const User = dedjs.object.user.get;

const viewModel = Observable.fromObject({
    isRosterEmpty: true,
    rosterModule: Observable.fromObject({
        list: new ObservableArray()
    })
});

let page = undefined;
let timerId = undefined;
let pageObject = undefined;

function onLoaded(args) {
    page = args.object;

    page.bindingContext = viewModel;
    pageObject = args.object.page;

    // Bind isEmpty to the length of the array
    viewModel.rosterModule.list.on(ObservableArray.changeEvent, () => {
        viewModel.set('isRosterEmpty', viewModel.rosterModule.list.length === 0);
    });

    loadConodeList();

    // Poll the statuses every 2s
    timerId = Timer.setInterval(() => {
        loadConodeList();
    }, 2000)
    console.log("pop: loading done");
}

function onUnloaded() {
    // remove polling when page is leaved
    console.log("pop: unloading");
    Timer.clearInterval(timerId);
    console.log("pop: unloading end");
}

function onDrawerButtonTap(args) {
    const sideDrawer = Frame.topmost().getViewById("sideDrawer");
    sideDrawer.showDrawer();
}

function loadConodeList() {
    if (viewModel.rosterModule.isLoading) {
        return Promise.resolve();
    }
    User.getRosterStatus()
        .then(status => {
            viewModel.rosterModule.list.splice(0);
            viewModel.isRosterEmpty = true;
            status.forEach(s =>{
                viewModel.rosterModule.list.push({
                    description: s.conode.description,
                    address: s.conode.tcpAddr,
                    status: s.status.Generic.field.Version,
                });
                viewModel.isRosterEmpty = false;
            });
            pageObject.getViewById("listView").refresh();
        });
}

function conodeTapped(args) {
    const index = args.index;
    let conodeAndStatusPair = User._statusList[index];
    if (conodeAndStatusPair !== undefined) {
        Frame.topmost().navigate({
            moduleName: "drawers/pop/conodes/conode-stats-page",
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
                        } catch (error) {
                        }

                        if (conode === undefined) {
                            try {
                                conode = Convert.parseTomlRoster(string).list[0];
                            } catch (error) {
                            }
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

function onDrawerButtonTap(args) {
    const sideDrawer = Frame.topmost().getViewById("sideDrawer");
    sideDrawer.showDrawer();
}

module.exports.onDrawerButtonTap = onDrawerButtonTap;
module.exports.loadConodeList = loadConodeList;
module.exports.conodeTapped = conodeTapped;
module.exports.addConode = addConode;
module.exports.onLoaded = onLoaded;
module.exports.onUnloaded = onUnloaded;


