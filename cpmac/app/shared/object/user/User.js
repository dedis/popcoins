const ObservableModule = require("data/observable");
const ObservableArray = require("data/observable-array").ObservableArray;
const FileIO = require("~/shared/lib/file-io/file-io");
const FilesPath = require("~/shared/res/files/files-path");

/**
 * This singleton is the user of the app. It contains everything needed that is general, app-wide or does not belong to any precise subpart.
 */

/**
 * We define the User class which is the object representing the user of the app.
 */

class User {
  constructor() {
    this.isLoaded = false;
    this.home = ObservableModule.fromObject({
      isLoading: true,
      conodes: new ObservableArray(),
      conodesStatus: new ObservableArray()
    });
  }

  load() {
  }

  loadHome() {
  }

  loadHomeConodes() {
    return FileIO.getStringOf(FilesPath.CONODES_TOML);
  }

  requestHomeConodesStatus() {
  }
}

/**
 * Now we create a singleton object for the User.
 */

// The symbol key reference that the singleton will use.
const USER_PACKAGE_KEY = Symbol.for("ch.epfl.dedis.cpmac.user");

// We create the singleton if it hasn't been instanciated yet.
const globalSymbols = Object.getOwnPropertySymbols(global);
const userExists = (globalSymbols.indexOf(USER_PACKAGE_KEY) >= 0);

if (!userExists) {
  global[USER_PACKAGE_KEY] = (function () {
    const newUser = new User();
    newUser.load();

    return newUser;
  })();
}

// Singleton API
const userSingleton = {};

Object.defineProperty(userSingleton, "get", {
  configurable: false,
  enumerable: false,
  value: undefined,
  writable: false,
  get: function () {
    return global[USER_PACKAGE_KEY];
  },
  set: undefined
});

// We freete the singleton.
Object.freeze(userSingleton);

// We export only the singleton API.
module.exports = userSingleton;
