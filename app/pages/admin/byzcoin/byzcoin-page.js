const Frame = require("ui/frame");
const Observable = require("data/observable");
const ObservableArray = require("data/observable-array").ObservableArray;
const Timer = require("timer");
const Dialog = require("ui/dialogs");

const lib = require("../../../lib");
const ObjectType = lib.ObjectType;
const Scan = lib.Scan;
const Helper = lib.Helper;
const Convert = lib.Convert;
const Log = lib.Log.default;
const Darc = require("../../../lib/cothority/omniledger/darc/Darc.js");
const User = lib.User;

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

  Timer.setTimeout(() => loadDarcList());
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

function loadDarcList() {
  User.getBCConfig().then(cfg => User.getDarcs().then(darcs => {
    viewModel.baseRosterModule.list.splice(0);
    viewModel.baseRosterModule.list.push({
      description: "ByzCoin Config",
      id: (User._config != null) ? User._config._roster : "BC Config not set",
      status: (User._config != null) ? User._config._byzcoinID : "0",
    });
    viewModel.baseRosterModule.list.push({
      description: "Pending Signature Requests",
      id: User.getKeyPair().public.string(),
      status: "1",
    });

    viewModel.rosterModule.list.splice(0);
    viewModel.isRosterEmpty = true;

    for (i = 0; i < darcs.length; i++) {
      viewModel.rosterModule.list.push({
        description: darcs[i]._description,
        id: darcs[i].getBaseIDString(),
        status: darcs[i]._version,
      });
    }

    page.getViewById("listView").refresh();
  })).catch(err => Log.print("err"));
}

function adminTapped(args) {
  const index = args.index;

  if (index == 0) {
    displayByzCoinInfo();
  } else if (index == 1) {
    displayPendingRequests();
  }
}

function darcTapped(args) {
  const index = args.index;
  Frame.topmost().navigate({
    moduleName: "pages/admin/byzcoin/darc-stats-page",
    bindingContext: index
  });
}

function newDarc() {
  if (User._config != null) {
    Dialog.confirm({
      title: "Adding DARC",
      message: "How do you want to add a new DARC?",
      okButtonText: "From an existing one (QR Code)",
      cancelButtonText: "Spawn a new DARC",
      neutralButtonText: "Cancel"
    }).then(function(r) {
      if (r == true) {
        Scan.scan().then(str => {
          User.scanDarc(str)
          onFocus(view)
        })
      } else if (r == false) {
        try {
          User.spawnDarc()
          onFocus(view)
        } catch (err) {
          Dialog.alert({
            title: "Error",
            message: err.message,
            okButtonText: "OK"
          });
        }
      }
    }).catch(err => Log.print(err));
  } else {
    Dialog.alert({
      title: "Error",
      message: "You must set up a BC Config before administrating your DARCs",
      okButtonText: "OK"
    });
  }
}

function displayByzCoinInfo() {
  Frame.topmost().navigate({
    moduleName: "pages/admin/byzcoin/bc-stats-page",
    bindingContext: ""
  });
}

function displayPendingRequests() {
  Frame.topmost().navigate({
    moduleName: "pages/admin/byzcoin/signatures/signatures-page",
    bindingContext: ""
  });
}

module.exports = {
  loadDarcList,
  adminTapped,
  darcTapped,
  newDarc,
  onFocus,
  onBlur
}