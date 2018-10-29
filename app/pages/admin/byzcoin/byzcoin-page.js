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
    }),
    baseRosterModule: Observable.fromObject({
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
            viewModel.baseRosterModule.list.splice(0);
            viewModel.baseRosterModule.list.push({
              description: "ByzCoin Config",
              id:          "bc:hexadecimalid",
              status:      "Roster",
            });
            viewModel.baseRosterModule.list.push({
              description: "Pending Signature Requests",
              id:          "ed25519:mypublickey",
              status:      "1",
            });
            viewModel.rosterModule.list.splice(0);
            viewModel.isRosterEmpty = true;
            viewModel.rosterModule.list.push({
              description: "Test DARC",
              id:          "darc:hexadecimalid",
              status:      "1",
            });
            page.getViewById("listView").refresh();
        });
}

function adminTapped(args) {
    const index = args.index;

    if (index == 0) {
      displayByzCoinInfo(args);
    } else if (index == 1) {
      displayPendingRequests(args);
    }
}

function conodeTapped(args) {
  const index = args.index;
  let conodeAndStatusPair = User._statusList[index];
  if (conodeAndStatusPair !== undefined) {
    Frame.topmost().navigate({
      moduleName: "pages/admin/byzcoin/darc-stats-page",
      bindingContext: conodeAndStatusPair
    });
  } else {
    return Dialog.alert({
      title: "No Status for this DARC",
      message: "Please check your conodes information and try to reload.",
      okButtonText: "Ok"
    });
  }
}

function addConode() {
  Dialog.alert({
      title: "Adding a new DARC",
      message: "This is not implemented yet",
      okButtonText: "Ok I'm sorry"
  });
}

function displayByzCoinInfo(args) {
  const index = args.index;
  let conodeAndStatusPair = User._statusList[index];
  Frame.topmost().navigate({
      moduleName: "pages/admin/byzcoin/bc-stats-page",
      bindingContext: conodeAndStatusPair
  });
}

function displayPendingRequests(args) {
  const index = args.index;
  let conodeAndStatusPair = User._statusList[index];
  Frame.topmost().navigate({
      moduleName: "pages/admin/byzcoin/signatures/signatures-page",
      bindingContext: conodeAndStatusPair
  });
}

module.exports = {
    loadConodeList,
    adminTapped,
    conodeTapped,
    addConode,
    onFocus,
    onBlur
}
