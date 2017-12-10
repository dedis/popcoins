const Frame = require("ui/frame");
const Helper = require("~/shared/lib/dedjs/Helper");
const ObjectType = require("~/shared/lib/dedjs/ObjectType");
const User = require("~/shared/object/user/User").get;

const viewModel = User.getRosterModule();

let pageObject = undefined;

function onNavigatingTo(args) {
  if (args.isBackNavigation) {
    return;
  }

  const page = args.object;
  pageObject = page.page;
  page.bindingContext = viewModel;

  if (viewModel.statusList.length !== viewModel.list.length) {
    //loadConodeList();
  }
}

function loadConodeList() {
  return User.getRosterStatus();
}

function deblockConodeList() {
  Frame.topmost().navigate({
    clearHistory: true,
    moduleName: "drawers/home/home-page",
    transition: {
      name: "fade",
      duration: 0
    }
  });
}

function conodeTapped(args) {
  return User.substractServerByIndex(args.index);
  /*
  Frame.topmost().navigate({
    moduleName: "drawers/home/conode-stats/conode-stats-page",
    bindingContext: args.index
  });
  */
}

function addConodeManual() {
  function addManualCallBack(server) {
    if (server !== undefined && !Helper.isOfType(server, ObjectType.SERVER_IDENTITY)) {
      throw new Error("server must be an instance of ServerIdentity or undefined to be skipped");
    }

    if (server !== undefined) {
      return User.addServer(server)
        .then(() => {
          return loadConodeList();
        });
    }
  }

  pageObject.showModal("drawers/home/add-conode-manual/add-conode-manual", undefined, addManualCallBack, true);
}

function onDrawerButtonTap(args) {
  const sideDrawer = Frame.topmost().getViewById("sideDrawer");
  sideDrawer.showDrawer();
}

module.exports = {
  onNavigatingTo,
  onDrawerButtonTap,
  loadConodeList,
  deblockConodeList,
  conodeTapped,
  addConodeManual
}
