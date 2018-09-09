const Frame = require("ui/frame");

function onDrawerButtonTap(args) {
    const sideDrawer = Frame.topmost().getViewById("sideDrawer");
    sideDrawer.showDrawer();
}

module.exports.onDrawerButtonTap = onDrawerButtonTap;