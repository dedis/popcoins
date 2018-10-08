const Frame = require("ui/frame");

const Dialog = require("ui/dialogs");
const ObservableModule = require("data/observable");
const ObservableArray = require("data/observable-array").ObservableArray;

const lib = require("~/lib");
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
    page = args.object;
    pageObject = args.object.page;
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
    FileIO.forEachFolderElement(FilePaths.COUPON_PATH, function (barFolder) {
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
    const USER_CANCELED = "USER_CANCELED_STRING";
    const actionShow = "Show service info to user";
    const actionRequest = "Scan request";
    const actionOrders = "Show orders history"
    const actionDelete = "Delete coupon";
    return Dialog.action({
        message: "What do you want to do ?",
        cancelButtonText: "Cancel",
        actions: [actionShow, actionRequest, actionOrders, actionDelete]
    }).then(result => {
            switch (result) {
                case actionShow:
                    return pageObject.showModal("pages/common/qr-code/qr-code-page", {
                        textToShow: bar.getConfigString(),
                        title: "Service information",
                    }, () => {
                        return Frame.topmost().navigate({
                            moduleName: "pages/admin/admin-page"
                        });
                    }, true);
                    break;
                case actionRequest:
                    return Scan.scan()
                        .then(signatureJson => {
                            Log.lvl1(signatureJson);
                            const signature = Convert.jsonToObject(signatureJson);
                            const sig = Convert.hexToByteArray(signature.signature);
                            let message = bar.getSigningData();
                            message.nonce = Convert.hexToByteArray(signature.nonce);
                            // This is strange - the scan module returns the value, but the rest of the ui is
                            // not really updated yet...
                            setTimeout(() => {
                                return bar.registerClient(sig, message)
                                    .then(() => {
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
                                    })
                            }, 100);
                        });
                    break;
                case
                actionOrders:
                    return Frame.topmost().navigate({
                        moduleName: "pages/admin/coupons/order-history/order-history-page",
                        context: {
                            bar: bar,
                        }
                    });
                    break;
                case
                actionDelete:
                    return bar.remove()
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
        }
    )
}

function deleteCoupon(args) {
    console.dir(args.object.bindingContext);
    const bar = args.object.bindingContext.bar;
    return bar.remove()
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
