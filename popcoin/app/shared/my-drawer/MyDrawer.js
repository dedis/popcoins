const frameModule = require("ui/frame");

const MyDrawerViewModel = require("./MyDrawer-view-model");

/* ***********************************************************
 * Use the "loaded" event handler of the wrapping layout element to bind the view model to your view.
 *************************************************************/
function onLoaded(args) {
    console.log("mydrawer.onloaded");
    const component = args.object;
    const componentTitle = component.selectedPage;

    component.bindingContext = new MyDrawerViewModel(componentTitle);
}

/* ***********************************************************
 * Use the "itemTap" event handler of the <ListView> component for handling list item taps.
 * The "itemTap" event handler of the app drawer <ListView> is used to navigate the app
 * based on the tapped navigationItem's route.
 *************************************************************/
function onNavigationItemTap(args) {
    console.dir("tapping on:", args.view);
    const navigationItem = args.view.bindingContext;
    console.dir("tapping on 2", navigationItem, frameModule.topmost());
    frameModule.topmost().navigate({
        clearHistory: true,
        moduleName: navigationItem.route,
        transition: {
            name: "slide"
        }
    })
    console.dir("tapping on 3");
}

exports.onLoaded = onLoaded;
exports.onNavigationItemTap = onNavigationItemTap;
