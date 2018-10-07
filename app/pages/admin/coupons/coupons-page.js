const Frame = require("ui/frame");

const Dialog = require("ui/dialogs");
const ObservableModule = require("data/observable");
const ObservableArray = require("data/observable-array").ObservableArray;

const lib = require("../../../lib");
const Convert = lib.Convert;
const Scan = lib.Scan;
const FileIO = lib.FileIO;
const FilePaths = lib.FilePaths;
const Coupon = lib.Coupon;
const Log = lib.Log.default;
const Badge = lib.pop.Badge;

const viewModel = ObservableModule.fromObject({
    barListDescriptions: new ObservableArray(),
    isLoading: false,
    isEmpty: true
});

let page = undefined;
let pageObject = undefined;

function onLoaded(args) {
    Log.print("Loaded coupons");
    page = args.object;
    page.bindingContext = viewModel;
    loadCoupons();
}

function loadCoupons() {
    viewModel.isLoading = true;

    // Bind isEmpty to the length of the array
    viewModel.barListDescriptions.on(ObservableArray.changeEvent, () => {
        viewModel.set('isEmpty', viewModel.barListDescriptions.length === 0);
    });

    let bar = undefined;
    viewModel.barListDescriptions.splice(0);
    FileIO.forEachFolderElement(FilePaths.BEERCOIN_PATH, function (barFolder) {
        bar = new Coupon(barFolder.name);
        // Observables have to be nested to reflect changes
        viewModel.barListDescriptions.push(ObservableModule.fromObject({
            bar: bar,
            desc: bar.getConfigModule(),
        }));
    });
    viewModel.isLoading = false;
}

function couponTapped(args) {
    const index = args.index;
    const bar = viewModel.barListDescriptions.getItem(index).bar;
    const signData = bar.getSigningData();
    const USER_CANCELED = "USER_CANCELED_STRING";
    return Dialog.action({
        message: "What do you want to do ?",
        cancelButtonText: "Cancel",
        actions: ["Show service info to user", "Show orders history", "Delete Service"]
    }).then(result => {
        if (result === "Show service info to user") {
            return pageObject.showModal("pages/common/qr-code/qr-code-page", {
                textToShow: Convert.objectToJson(signData),
                title: "Service information"
            }, () => {
                return Dialog.confirm({
                    title: "Client confirmation",
                    message: "Do you want to also scan the client confirmation ?",
                    okButtonText: "Yes",
                    cancelButtonText: "No"
                }).then(function (result) {
                    if (!result) {
                        return Promise.reject(USER_CANCELED);
                    }
                    return Scan.scan();
                }).then(signatureJson => {
                    Log.lvl1(signatureJson);
                    const sig = Convert.hexToByteArray(Convert.jsonToObject(signatureJson).signature);
                    Log.print(sig);
                    return bar.registerClient(sig, signData)
                }).then(() => {
                    return bar.addOrderToHistory(new Date(Date.now()));
                }).then(() => {
                    // Alert is shown in the modal page if not enclosed in setTimeout
                    return Dialog.alert({
                        title: "Success !",
                        message: "The item is delivered !",
                        okButtonText: "Great"
                    });
                }).catch(error => {
                    if (error === USER_CANCELED) {
                        return Promise.resolve();
                    }
                    Log.catch(error);

                    // Alert is shown in the modal page if not enclosed in setTimeout
                    return Dialog.alert({
                        title: "Error",
                        message: error,
                        okButtonText: "Ok"
                    }).then(() => {
                        return Promise.reject(error);
                    });
                });
            }, true);
        } else if (result === "Show orders history") {
            return Frame.topmost().navigate({
                moduleName: "pages/admin/coupons/order-history/order-history-page",
                context: {
                    bar: bar,
                }
            });
        } else if (result === "Delete Service") {
            return bar.remove()
                .then(() => {
                    const listView = Frame.topmost().currentPage.getViewById("listView2");
                    listView.notifySwipeToExecuteFinished();

                    return loadCoupons();
                })
                .catch((error) => {
                    Log.catch(error);

                    return Dialog.alert({
                        title: "Error",
                        message: "An error occured, please try again. - " + error,
                        okButtonText: "Ok"
                    }).then(() => {
                        return Promise.reject(error);
                    })
                });
        }
    })
}

function deleteCoupon(args) {
    console.dir(args.object.bindingContext);
    const bar = args.object.bindingContext.bar;
    return bar.remove()
        .then(() => {
            const listView = Frame.topmost().currentPage.getViewById("listView2");
            return listView.notifySwipeToExecuteFinished();
        })
        .then(() => {
            return loadCoupons();
        })
        .catch((error) => {
            Log.catch(error);

            return Dialog.alert({
                title: "Error",
                message: "An error occured, please try again. - " + error,
                okButtonText: "Ok"
            }).then(() => {
                return Promise.reject(error);
            })
        });
}

function addCoupon() {
    let badges = Object.values(Badge.List);
    if (badges.length == 0) {
        return Dialog.alert({
            title: "No group available",
            message: "You didn't participate to any party. Please do so to have a group to which you can get items !",
            okButtonText: "Ok"
        });
    } else {
        Frame.topmost().navigate({
            moduleName: "pages/admin/coupons/config/config-page",
        });
    }
}

module.exports.onLoaded = onLoaded;
module.exports.couponTapped = couponTapped;
module.exports.deleteCoupon = deleteCoupon;
module.exports.addCoupon = addCoupon;
