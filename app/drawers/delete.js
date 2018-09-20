const Frame = require("ui/frame");

const lib = require("../shared/lib");
const FileIO = lib.file_io;
const Wallet = lib.dedjs.object.pop.Wallet;

module.exports = {
    onNavigatingTo: function (args) {
        const page = args.object;
    },

    onDrawerButtonTap: function (args) {
        const sideDrawer = Frame.topmost().getViewById("sideDrawer");
        sideDrawer.showDrawer();
    },

    confirm: function () {
        Wallet.List = {}
        return FileIO.rmrf("shared/res/files")
            .catch(err=>{
                Log.catch(err, "while deleting all files");
            });
    }
}