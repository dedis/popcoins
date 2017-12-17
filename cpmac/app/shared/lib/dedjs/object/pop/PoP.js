const ObservableModule = require("data/observable");
const ObservableArray = require("data/observable-array").ObservableArray;
const Package = require("../../Package");
const CothorityMessages = require("../../protobuf/build/cothority-messages");

/**
 * This singleton is the PoP component of the app. It contains everything related to PoP in general and used by both, the organizer and the attendee.
 */

/**
 * We define the PoP class which is the object representing the PoP component of the app.
 */

const EMPTY_ROSTER = CothorityMessages.createRoster(new Uint8Array(), [], new Uint8Array());
const EMPTY_POP_DESC = CothorityMessages.createPopDesc("", "", "", EMPTY_ROSTER);
const EMPTY_FINAL_STATEMENT = CothorityMessages.createFinalStatement(EMPTY_POP_DESC, [], new Uint8Array(), false);
const EMPTY_POP_TOKEN = CothorityMessages.createPopToken(EMPTY_FINAL_STATEMENT, new Uint8Array(), new Uint8Array());

class PoP {

  /**
   * Constructor for the PoP class.
   */
  constructor() {
    /*
    this._isLoaded = false;
    this._keyPair = ObservableModule.fromObject({
      public: new Uint8Array(),
      private: new Uint8Array(),
      publicComplete: new Uint8Array()
    });
    this._roster = ObservableModule.fromObject({
      isLoading: false,
      id: new Uint8Array(),
      list: new ObservableArray(),
      aggregate: new Uint8Array(),
      statusList: new ObservableArray()
    });
    */
  }

  /**
   * Getters and Setters.
   */

  /**
   * Action functions.
   */

  /**
   * Load and reset functions and sub-functions to load/reset PoP.
   */
}

/**
 * Now we create a singleton object for PoP.
 */

// The symbol key reference that the singleton will use.
const POP_PACKAGE_KEY = Symbol.for(Package.POP);

// We create the singleton if it hasn't been instanciated yet.
const globalSymbols = Object.getOwnPropertySymbols(global);
const popExists = (globalSymbols.indexOf(POP_PACKAGE_KEY) >= 0);

if (!popExists) {
  global[POP_PACKAGE_KEY] = (function () {
    const newPoP = new PoP();
    // TODO: decomment
    //newPoP.load();

    return newPoP;
  })();
}

// Singleton API
const POP = {};

Object.defineProperty(POP, "get", {
  configurable: false,
  enumerable: false,
  get: function () {
    return global[POP_PACKAGE_KEY];
  },
  set: undefined
});

// We freeze the singleton.
Object.freeze(POP);

// We export only the singleton API.
module.exports = POP;
