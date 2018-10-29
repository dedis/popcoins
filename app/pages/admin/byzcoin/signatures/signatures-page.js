const Frame = require("ui/frame");
const Dialog = require("ui/dialogs");
const ObservableModule = require("data/observable");
const ObservableArray = require("data/observable-array").ObservableArray;
const Timer = require("tns-core-modules/timer");
const Observable = require("data/observable");

const gData = require("~/app").gData;
const lib = require("~/lib");
const Log = lib.Log.default;
const Messages = lib.pop.Messages;
const User = lib.User;

const viewModel = ObservableModule.fromObject({
    messageList: new ObservableArray(),
    isEmpty: true,
    networkStatus: undefined,
    isRosterEmpty: true,
    rosterModule: Observable.fromObject({
        list: new ObservableArray()
    })
});

let page = undefined;
let conode = undefined;
let party = undefined;
let msgService = undefined;
let pageObject = undefined;

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

function loadConodeList() {
    return User.getRosterStatus()
        .then(status => {
            viewModel.rosterModule.list.splice(0);
            viewModel.isRosterEmpty = true;
            viewModel.rosterModule.list.push({
              description: "ByzCoin Config",
              id:          "bc:hexadecimalid",
              status:      "Roster",
            });
            viewModel.rosterModule.list.push({
              description: "Test DARC",
              id:          "darc:hexadecimalid",
              status:      "1",
            });
            page.getViewById("listView").refresh();
        });
}

function onLoaded(args) {
    page = args.object;
    page.bindingContext = viewModel;
    pageObject = page.page;

    Log.print("Gdata is:", gData);

    updateMessages();
}

function onUnloaded() {
    // remove polling when page is leaved
    // Timer.clearInterval(timerId);
}

function updateMessages() {
  viewModel.messageList.splice(0);
  viewModel.messageList.push(
      ObservableModule.fromObject({
          description: "Test Instruction",
          type: "invoke:test",
          author: "ed25519:authorkey",
      })
  );
}

function onNavigatingTo(args) {
    page = args.object.page;
}

function itemTapped(args) {
  const index = args.index;
  let conodeAndStatusPair = undefined;
  Frame.topmost().navigate({
      moduleName: "pages/admin/byzcoin/signatures/sig-stats-page",
      bindingContext: conodeAndStatusPair
  });
}

module.exports = {
    onLoaded,
    onUnloaded,
    onNavigatingTo,
    updateMessages,
    itemTapped,
    onFocus,
    onBlur,
    cancelNetwork: function () {
        setProgress();
    },
    onBack: function () {
        Frame.topmost().goBack();
    },
}
