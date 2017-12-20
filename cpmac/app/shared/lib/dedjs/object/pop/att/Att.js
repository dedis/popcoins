const Package = require("../../../Package");

/**
 * This singleton represents the attendee of a PoP party. It contains everything related to the attendee.
 */

/**
 * We define the Att class which is the object representing the attendee.
 */

class Att {

  /**
   * Constructor for the Att class.
   */
  constructor() {
    // Unused class for now. Maybe in the future.
  }
}

/**
 * Now we create a singleton object for Att.
 */

// The symbol key reference that the singleton will use.
const ATT_PACKAGE_KEY = Symbol.for(Package.ATT);

// We create the singleton if it hasn't been instanciated yet.
const globalSymbols = Object.getOwnPropertySymbols(global);
const attExists = (globalSymbols.indexOf(ATT_PACKAGE_KEY) >= 0);

if (!attExists) {
  global[ATT_PACKAGE_KEY] = (function () {
    const newAtt = new Att();
    //newAtt.load();

    return newAtt;
  })();
}

// Singleton API
const ATT = {};

Object.defineProperty(ATT, "get", {
  configurable: false,
  enumerable: false,
  get: function () {
    return global[ATT_PACKAGE_KEY];
  },
  set: undefined
});

// We freeze the singleton.
Object.freeze(ATT);

// We export only the singleton API.
module.exports = ATT;
