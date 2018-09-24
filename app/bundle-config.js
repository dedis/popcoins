if (global.TNS_WEBPACK) {
  // registers tns-core-modules UI framework modules
  require("bundle-entry-points");

  // register application modules
  global.registerModule("nativescript-ui-sidedrawer",
    () => require("../node_modules/nativescript-ui-sidedrawer"));

  global.registerModule("shared/my-drawer/MyDrawer", () => require("./shared/my-drawer/MyDrawer"));
  global.registerModule("tokens/main", () => require("./drawers/tokens/main"));
  global.registerModule("pop/pop-page", () => require("./drawers/pop/pop-page"));
  global.registerModule("messages/main", () => require("./drawers/messages/main"));
  global.registerModule("settings/settings-page", () => require("./drawers/settings/settings-page"));
}
