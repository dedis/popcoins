const Frame = require("ui/frame");

const HomeViewModel = require("./home-view-model");

const homeViewModel = new HomeViewModel();

/* ***********************************************************
 * Use the "onNavigatingTo" handler to initialize the page binding context.
 *************************************************************/
function onNavigatingTo(args) {
  /* ***********************************************************
   * The "onNavigatingTo" event handler lets you detect if the user navigated with a back button.
   * Skipping the re-initialization on back navigation means the user will see the
   * page in the same data state that he left it in before navigating.
   *************************************************************/
  if (args.isBackNavigation) {
    return;
  }

  const page = args.object;
  page.bindingContext = homeViewModel;

  loadConodeList();
}

function loadConodeList() {
  homeViewModel.set("isLoading", true);
  const myConodeList = homeViewModel.conodeList;

  myConodeList.empty();
  myConodeList.load()
              .then(x => homeViewModel.set("isLoading", false));
}

function deblockConodeList() {
  Frame.topmost().navigate({
                             moduleName: "drawers/home/home-page"
                           });
}

function conodeTapped(args) {
  Frame.topmost().navigate({
                             moduleName: "drawers/home/conode-stats/conode-stats",
                             bindingContext: homeViewModel.conodeList.getItem(args.index).conode
                           });
}

/* ***********************************************************
 * According to guidelines, if you have a drawer on your page, you should always
 * have a button that opens it. Get a reference to the RadSideDrawer view and
 * use the showDrawer() function to open the app drawer section.
 *************************************************************/
function onDrawerButtonTap(args) {
  const sideDrawer = Frame.topmost().getViewById("sideDrawer");
  sideDrawer.showDrawer();
}

exports.onNavigatingTo = onNavigatingTo;
exports.onDrawerButtonTap = onDrawerButtonTap;
exports.loadConodeList = loadConodeList;
exports.deblockConodeList = deblockConodeList;
exports.conodeTapped = conodeTapped;
