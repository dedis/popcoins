"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*
In NativeScript, the app.ts file is the entry point to your application.
You can use this file to perform app-level initialization, but the primary
purpose of the file is to pass control to the app’s first module.
*/
const app = require("application");
function setGdata(d) {
    exports.gData = d;
}
exports.setGdata = setGdata;
app.run({ moduleName: "app-root" });
/*
Do not place any code after the application has been started as it will not
be executed on iOS.
*/
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYXBwLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7RUFJRTtBQUNGLG1DQUFtQztBQU1uQyxrQkFBeUIsQ0FBTztJQUM1QixhQUFLLEdBQUcsQ0FBQyxDQUFDO0FBQ2QsQ0FBQztBQUZELDRCQUVDO0FBRUQsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFDLFVBQVUsRUFBRSxVQUFVLEVBQUMsQ0FBQyxDQUFDO0FBR2xDOzs7RUFHRSIsInNvdXJjZXNDb250ZW50IjpbIi8qXG5JbiBOYXRpdmVTY3JpcHQsIHRoZSBhcHAudHMgZmlsZSBpcyB0aGUgZW50cnkgcG9pbnQgdG8geW91ciBhcHBsaWNhdGlvbi5cbllvdSBjYW4gdXNlIHRoaXMgZmlsZSB0byBwZXJmb3JtIGFwcC1sZXZlbCBpbml0aWFsaXphdGlvbiwgYnV0IHRoZSBwcmltYXJ5XG5wdXJwb3NlIG9mIHRoZSBmaWxlIGlzIHRvIHBhc3MgY29udHJvbCB0byB0aGUgYXBw4oCZcyBmaXJzdCBtb2R1bGUuXG4qL1xuaW1wb3J0ICogYXMgYXBwIGZyb20gXCJhcHBsaWNhdGlvblwiO1xuaW1wb3J0IHsgRGF0YSB9IGZyb20gXCJ+L2xpYi9EYXRhXCI7XG5cbi8vIEV4cG9ydGluZyBhIHNpbmdsZXRvbiBvZiBkYXRhIHRvIGJlIHVzZWQgYnkgYWxsIG90aGVyIG1vZHVsZXMuXG5leHBvcnQgbGV0IGdEYXRhOiBEYXRhO1xuXG5leHBvcnQgZnVuY3Rpb24gc2V0R2RhdGEoZDogRGF0YSl7XG4gICAgZ0RhdGEgPSBkO1xufVxuXG5hcHAucnVuKHttb2R1bGVOYW1lOiBcImFwcC1yb290XCJ9KTtcblxuXG4vKlxuRG8gbm90IHBsYWNlIGFueSBjb2RlIGFmdGVyIHRoZSBhcHBsaWNhdGlvbiBoYXMgYmVlbiBzdGFydGVkIGFzIGl0IHdpbGwgbm90XG5iZSBleGVjdXRlZCBvbiBpT1MuXG4qL1xuIl19