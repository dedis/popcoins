require("./bundle-config");
const application = require("application");

// application.start({ moduleName: "drawers/tokens/main" });
application.start({ moduleName: "drawers/messages/main" });
// application.start({ moduleName: "drawers/pop/pop-page" });

/*
Do not place any code after the application has been started as it will not
be executed on iOS.
*/
