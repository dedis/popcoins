const observableModule = require("data/observable");
const platformModule = require("tns-core-modules/platform");

/* ***********************************************************
 * Keep data that is displayed in your app drawer in the MyDrawer custom component view model.
 *************************************************************/
function MyDrawerViewModel(selectedPage) {
    const viewModel = observableModule.fromObject({
        /* ***********************************************************
         * Use the MyDrawer view model to initialize the properties data values.
         * The navigationItems property is initialized here and is data bound to <ListView> in the MyDrawer view file.
         * Add, remove or edit navigationItems to change what is displayed in the app drawer list.
         *************************************************************/
        navigationItems: [
            {
                title: "Messages",
                name: "messages",
                route: "drawers/messages/main",
                icon: "\uf086",
                isSelected: selectedPage === "Messages"
            },

            {
                title: "Tokens",
                name: "tokens",
                route: "drawers/tokens/main",
                icon: "\uf015",
                isSelected: selectedPage === "Tokens"
            }
        ]
    });

    if (platformModule.isAndroid) {
        console.log("adding PoP for Android");
        viewModel.navigationItems.push({
            title: "PoP",
            name: "pop",
            route: "drawers/pop/pop-page",
            icon: "\uf0a1",
            isSelected: selectedPage === "PoP"
        });
        message = "You are using IOS device";
    }

    viewModel.navigationItems.push(
        {
            title: "Delete",
            name: "delete",
            route: "drawers/delete",
            icon: "\uf013",
            isSelected: selectedPage === "Delete"
        }
    );

    // viewModel.navigationItems.push( {
    //     title: "CISC",
    //     name: "cisc",
    //     route: "drawers/cisc/cisc-page",
    //     icon: "\uf0c1",
    //     isSelected: selectedPage === "CISC"
    // });

    return viewModel;
}

module.exports = MyDrawerViewModel;