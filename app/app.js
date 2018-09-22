require("./bundle-config");
const application = require("application");

if (application.android) {
    application.android.on(application.AndroidApplication.activityResultEvent, function (args) {
        console.log("Event: " + args.eventName + ", Activity: " + args.activity +
            ", requestCode: " + args.requestCode + ", resultCode: " + args.resultCode + ", Intent: " + args.intent);
    });
}

application.on(application.uncaughtErrorEvent, (args) => {
    if (application.android) {
        // For Android applications, args.android is an NativeScriptError.
        console.log(" *** NativeScriptError *** : " + args.android);
        console.log(" *** StackTrace *** : " + args.android.stackTrace);
        console.log(" *** nativeException *** : " + args.android.nativeException);
    } else if (application.ios) {
        // For iOS applications, args.ios is NativeScriptError.
        console.log(" ||||| NativeScriptError in iOS ||||| " + args.ios);
    }
});

application.start({ moduleName: "drawers/tokens/main" });
// application.start({ moduleName: "drawers/messages/main" });
// application.start({ moduleName: "drawers/pop/pop-page" });

/*
Do not place any code after the application has been started as it will not
be executed on iOS.
*/
