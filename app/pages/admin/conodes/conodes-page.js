const Frame = require("ui/frame");
const Observable = require("data/observable");
const ObservableArray = require("data/observable-array").ObservableArray;
const Timer = require("timer");
const Dialog = require("ui/dialogs");

const lib = require("../../../lib");
const ObjectType = lib.ObjectType;
const Scan = lib.Scan;
const Helper = lib.Helper;
const User = lib.User;
const Convert = lib.Convert;
const Log = lib.Log.default;

const viewModel = Observable.fromObject({
    isRosterEmpty: true,
    rosterModule: Observable.fromObject({
        list: new ObservableArray()
    })
});

let view = undefined;
let timerId = undefined;
let page = undefined;

// Use onFocus here because it comes from the SegmentBar event simulation in admin-pages.
function onFocus(p) {
    view = p;
    view.bindingContext = viewModel;
    page = view.page;

    // Bind isEmpty to the length of the array
    viewModel.rosterModule.list.on(ObservableArray.changeEvent, () => {
        viewModel.set('isRosterEmpty', viewModel.rosterModule.list.length === 0);
    });

    Timer.setTimeout(() => {
        return loadConodeList()
            .then(() => {
                // Poll the statuses every 1m
                timerId = Timer.setInterval(() => {
                    loadConodeList();
                }, 60000)
            })
    }, 100);
}

// Use onBlur here because it comes from the SegmentBar event simulation in admin-pages.
function onBlur() {
    // remove polling when page is leaved
    Timer.clearInterval(timerId);
}

function onDrawerButtonTap(args) {
    const sideDrawer = Frame.topmost().getViewById("sideDrawer");
    sideDrawer.showDrawer();
}

function loadConodeList() {
    return User.getRosterStatus()
        .then(status => {
            viewModel.rosterModule.list.splice(0);
            viewModel.isRosterEmpty = true;
            status.forEach(s => {
                viewModel.rosterModule.list.push({
                    description: s.conode.description,
                    address: s.conode.tcpAddr,
                    status: s.status.Generic.field.Version,
                });
                viewModel.isRosterEmpty = false;
            });
            page.getViewById("listView").refresh();
        });
}

function conodeTapped(args) {
    const index = args.index;
    let conodeAndStatusPair = User._statusList[index];
    if (conodeAndStatusPair !== undefined) {
        Frame.topmost().navigate({
            moduleName: "pages/admin/conodes/conode-stats-page",
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
            User.addServer(server)
            return loadConodeList()
                .catch(error => {
                    return Dialog.alert({
                        title: "Error",
                        message: "An error occured, please try again. - " + error,
                        okButtonText: "Ok"
                    }).then(() => {
                        Log.rcatch(error)
                    })
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
                return Scan.scan()
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
                page.showModal("pages/admin/conodes/add-manual/add-manual",
                    undefined, addManualCallBack, true);
                return Promise.resolve();
            } else {
                // Cancel
                return Promise.resolve();
            }
        })
        .catch(error => {
            Log.catch(error);

            if (error !== Scan.SCAN_ABORTED) {
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

module.exports = {
    loadConodeList,
    conodeTapped,
    addConode,
    onFocus,
    onBlur
}
