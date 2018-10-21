const Frame = require("ui/frame");
var getViewById = require("tns-core-modules/ui/core/view").getViewById;

const Dialog = require("ui/dialogs");
const ObservableModule = require("data/observable");
const ObservableArray = require("data/observable-array").ObservableArray;

const gData = require("~/app").default;
const lib = require("~/lib");
const Convert = lib.Convert;
const Scan = lib.Scan;
const FileIO = lib.FileIO;
const FilePaths = lib.FilePaths;
const Coupon = lib.Coupon;
const Log = lib.Log.default;
const Badge = lib.pop.Badge;

const viewModel = ObservableModule.fromObject({
    couponListDescriptions: new ObservableArray(),
    isLoading: false,
    isEmpty: true
});

let view = undefined;
let page = undefined;

// Use onFocus here because it comes from the SegmentBar event simulation in admin-pages.
function onFocus(v) {
    view = v;

    page = view.page;
    view.bindingContext = viewModel;
    loadCoupons();
}

// Use onBlur here because it comes from the SegmentBar event simulation in admin-pages.
function onBlur(v){
}

function loadCoupons() {
    viewModel.isLoading = true;

    // Bind isEmpty to the length of the array
    viewModel.couponListDescriptions.on(ObservableArray.changeEvent, () => {
        viewModel.set('isEmpty', viewModel.couponListDescriptions.length === 0);
    });

    let coupon = undefined;
    viewModel.couponListDescriptions.splice(0);
    FileIO.forEachFolderElement(FilePaths.COUPON_PATH, function (couponFolder) {
        coupon = new Coupon(couponFolder.name);
        // Observables have to be nested to reflect changes
        viewModel.couponListDescriptions.push(ObservableModule.fromObject({
            coupon: coupon,
            desc: coupon.getConfigModule(),
        }));
    });
    viewModel.isLoading = false;
}

function couponTapped(args) {
    const index = args.index;
    const coupon = viewModel.couponListDescriptions.getItem(index).coupon;
    const USER_CANCELED = "USER_CANCELED_STRING";
    const actionShare = "Share coupon";
    const actionRequest = "Scan request";
    const actionOrders = "Show orders history"
    const actionDelete = "Delete coupon";
    return Dialog.action({
        message: "What do you want to do ?",
        cancelButtonText: "Cancel",
        actions: [actionShare, actionRequest, actionOrders, actionDelete]
    }).then(result => {
            switch (result) {
                case actionShare:
                    return page.showModal("pages/common/qr-code/qr-code-page", {
                        textToShow: coupon.getConfigString(),
                        title: "Coupon information",
                    }, () => {
                        return Frame.topmost().navigate({
                            moduleName: "pages/admin/admin-page"
                        });
                    }, true);
                    break;
                case actionRequest:
                    return Scan.scan()
                        .then(signatureJson => {
                            const signature = Convert.jsonToObject(signatureJson);
                            const sig = Convert.hexToByteArray(signature.signature);
                            let message = coupon.getSigningData();
                            message.nonce = Convert.hexToByteArray(signature.nonce);
                            return coupon.registerClient(sig, message)
                                .then(() => {
                                    return coupon.addOrderToHistory(new Date(Date.now()));
                                }).then(() => {
                                    // Alert is shown in the modal page if not enclosed in setTimeout
                                    setTimeout(() => {
                                        // There is a strange mis-communication between the scan module and the
                                        // main UI - it doesn't work without a setTimeout.
                                        return Dialog.alert({
                                            title: "Success !",
                                            message: "The item is delivered !",
                                            okButtonText: "Great"
                                        });
                                    }, 100);
                                }).catch(error => {
                                    if (error === USER_CANCELED) {
                                        return Promise.resolve();
                                    }

                                    // Alert is shown in the modal page if not enclosed in setTimeout
                                    setTimeout(() => {
                                        // There is a strange mis-communication between the scan module and the
                                        // main UI - it doesn't work without a setTimeout.
                                        return Dialog.alert({
                                            title: "Error",
                                            message: error,
                                            okButtonText: "Ok"
                                        });
                                    }, 100);

                                    Log.rcatch(error);
                                })
                        });
                    break;
                case actionOrders:
                    return Frame.topmost().navigate({
                        moduleName: "pages/admin/coupons/order-history/order-history-page",
                        context: {
                            coupon: coupon,
                        }
                    });
                    break;
                case actionDelete:
                    return coupon.remove()
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
    const coupon = args.object.bindingContext.coupon;
    return coupon.remove()
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
    if (gData.badges.length == 0) {
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

module.exports = {
    onFocus,
    onBlur,
    couponTapped,
    deleteCoupon,
    addCoupon
}
