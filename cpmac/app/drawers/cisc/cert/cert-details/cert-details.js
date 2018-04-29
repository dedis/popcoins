const Frame = require("ui/frame");
const ObservableArray = require("data/observable-array").ObservableArray;
const ObservableModule = require("data/observable");

let conode = undefined;
let conodeStatus = undefined;
let pageObject = undefined;
let viewModel = ObservableModule.fromObject({
	cert: ""
});

function onNavigatingTo(args) {
  	if (args.isBackNavigation) {
        return;
    }

    page = args.object;

    const context = page.navigationContext;
    console.log("hello "+context.cert);
    viewModel.cert = context.cert;
	    
    page.bindingContext = viewModel

}

function onDrawerButtonTap(args) {
    const sideDrawer = FrameModule.topmost().getViewById("sideDrawer");
    sideDrawer.showDrawer();
}

exports.onNavigatingTo = onNavigatingTo;
exports.onDrawerButtonTap = onDrawerButtonTap;
