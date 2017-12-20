const ObservableModule = require("data/observable");
const ObservableArray = require("data/observable-array").ObservableArray;
const Package = require("../../../Package");
const Convert = require("../../../Convert");
const Helper = require("../../../Helper");
const ObjectType = require("../../../ObjectType");
const FilesPath = require("../../../../../res/files/files-path");
const CothorityMessages = require("../../../protobuf/build/cothority-messages");

/**
 * This singleton represents the organizer of a PoP party. It contains everything related to the organizer.
 */

/**
 * We define the Org class which is the object representing the organizer.
 */

class Org {

  // TODO: test
  // TODO: parse methods in Convert
  // TODO: add/delete registered att, set popdesc {name, dateTime, location}, add/delete server in roster.list
  // TODO: link to conode, hash + register pop desc on conode, finalize party with registered atts, fetch party by id
  // TODO: reset + load

  /**
   * Constructor for the Org class.
   */
  constructor() {
    this._isLoaded = false;
    this._linkedConode = ObservableModule.fromObjectRecursive({
      public: new Uint8Array(),
      id: new Uint8Array(),
      address: "",
      description: ""
    });
    this._popDesc = ObservableModule.fromObjectRecursive({
      name: "",
      dateTime: "",
      location: "",
      roster: {
        id: new Uint8Array(),
        list: new ObservableArray(),
        aggregate: new Uint8Array()
      }
    });
    this._registeredAtts = ObservableModule.fromObjectRecursive({
      array: new ObservableArray()
    });
    this._popDescHash = ObservableModule.fromObjectRecursive({
      hash: new Uint8Array()
    });
  }

  /**
   * Getters and Setters.
   */

  /**
   * Gets the isLoaded property of the organizer. It is only true once all the settings have been loaded into memory.
   * @returns {boolean} - a boolean that is true once the organizer has completely been loaded into memory
   */
  isLoaded() {
    return this._isLoaded;
  }

  /**
   * Returns the observable module for the linked conode.
   * @returns {ObservableModule} - the observable module for the conode
   */
  getLinkedConodeModule() {
    return this._linkedConode;
  }

  /**
   * Returns the server identity representing the conode the organizer is linked to.
   * @returns {ServerIdentity} - the ServerIdentity object the organizer is linked to
   */
  getLinkedConode() {
    const linkedConodeModule = this.getLinkedConodeModule();

    return CothorityMessages.createServerIdentity(linkedConodeModule.public, linkedConodeModule.id, linkedConodeModule.address, linkedConodeModule.description);
  }

  /**
   * Sets the new conode given as parameter as linked conode.
   * @param {ServerIdentity} conode - the new conode to set as linked conode
   * @param {boolean} save - if the new conode should be saved permanently
   * @returns {Promise} - a promise that gets resolved once the new conode has been set and saved if the save parameter is set to true
   */
  setLinkedConode(conode, save) {
    if (!Helper.isOfType(conode, ObjectType.SERVER_IDENTITY)) {
      throw new Error("conode must be an instance of ServerIdentity");
    }
    if (typeof save !== "boolean") {
      throw new Error("save must be of type boolean");
    }

    const oldLinkedConode = this.getLinkedConode();

    const linkedConodeModule = this.getLinkedConodeModule();
    linkedConodeModule.public = Uint8Array.from(conode.public);
    linkedConodeModule.id = Uint8Array.from(conode.id);
    linkedConodeModule.address = conode.address;
    linkedConodeModule.description = conode.description;

    const newLinkedConode = this.getLinkedConode();

    if (save) {
      let toWrite = "";
      if (newLinkedConode.public.length > 0 && newLinkedConode.id.length > 0 && newLinkedConode.address.length > 0 && newLinkedConode.description.length > 0) {
        toWrite = Convert.objectToJson(newLinkedConode);
      }

      return FileIO.writeStringTo(FilesPath.POP_ORG_CONODE, toWrite)
        .catch((error) => {
          console.log(error);
          console.dir(error);
          console.trace();

          return this.setLinkedConode(oldLinkedConode, false)
            .then(() => {
              return Promise.reject(error);
            });
        });
    } else {
      return new Promise((resolve, reject) => {
        resolve();
      });
    }
  }

  /**
   * Returns the observable module for the pop description.
   * @returns {ObservableModule} - the observable module for the pop description
   */
  getPopDescModule() {
    return this._popDesc;
  }

  /**
   * Returns the pop description.
   * @returns {PopDesc} - the pop description
   */
  getPopDesc() {
    const popDescModule = this.getPopDescModule();

    let id = undefined;
    if (popDescModule.roster.id.length > 0) {
      id = popDescModule.roster.id;
    }

    const list = [];
    popDescModule.roster.list.forEach(server => {
      list.push(server);
    });

    const roster = CothorityMessages.createRoster(id, list, popDescModule.roster.aggregate);

    return CothorityMessages.createPopDesc(popDescModule.name, popDescModule.dateTime, popDescModule.location, roster);
  }

  /**
   * Sets the pop description.
   * @param {PopDesc} popDesc - the new pop description to set
   * @param {boolean} save - if the new pop description should be saved permanently
   * @returns {Promise} - a promise that gets resolved once the new pop description has been set and saved if the save parameter is set to true
   */
  setPopDesc(popDesc, save) {
    if (!Helper.isOfType(popDesc, ObjectType.POP_DESC)) {
      throw new Error("popDesc must be an instance of PopDesc");
    }
    if (typeof save !== "boolean") {
      throw new Error("save must be of type boolean");
    }

    const oldPopDesc = this.getPopDesc();

    const popDescModule = this.getPopDescModule();

    popDescModule.name = popDesc.name;
    popDescModule.dateTime = popDesc.dateTime;
    popDescModule.location = popDesc.location;
    popDescModule.roster.id = Uint8Array.from(popDesc.roster.id);

    this.emptyPopDescRosterList();
    popDesc.list.forEach(server => {
      popDescModule.roster.list.push(server);
    });

    popDescModule.roster.aggregate = Uint8Array.from(popDesc.roster.aggregate);

    const newPopDesc = this.getPopDesc();

    if (save) {
      let toWrite = "";
      if (newPopDesc.name.length > 0 || newPopDesc.dateTime.length > 0 || newPopDesc.location.length > 0 || newPopDesc.roster.list.length > 0) {
        toWrite = Convert.objectToJson(newPopDesc);
      }

      return FileIO.writeStringTo(FilesPath.POP_ORG_DESC, toWrite)
        .catch((error) => {
          console.log(error);
          console.dir(error);
          console.trace();

          return this.setPopDesc(oldPopDesc, false)
            .then(() => {
              return Promise.reject(error);
            });
        });
    } else {
      return new Promise((resolve, reject) => {
        resolve();
      });
    }
  }

  /**
   * Returns the observable module for the registered attendees.
   * @returns {ObservableModule} - the observable module for the registered attendees
   */
  getRegisteredAttsModule() {
    return this._registeredAtts;
  }

  /**
   * Returns the registered attendees.
   * @returns {ObservableArray} - the registered attendees
   */
  getRegisteredAtts() {
    return this.getRegisteredAttsModule().array;
  }

  /**
   * Sets the registered attendees array.
   * @param {Array} array - the new array of attendees to set
   * @param {boolean} save - if the new array of attendees should be saved permanently
   * @returns {Promise} - a promise that gets resolved once the new array of attendees has been set and saved if the save parameter is set to true
   */
  setRegisteredAtts(array, save) {
    if (!(array instanceof Array)) {
      throw new Error("array must be an instance of Array");
    }
    if (array.length > 0 && !(array[0] instanceof Uint8Array)) {
      throw new Error("array[i] must be an instance of Uint8Array or be empty");
    }
    if (typeof save !== "boolean") {
      throw new Error("save must be of type boolean");
    }

    const oldRegisteredAtts = this.getRegisteredAtts().slice();

    this.emptyRegisteredAttsArray();
    array.forEach(publicKey => {
      this.getRegisteredAtts().push(publicKey);
    });

    const newRegisteredAtts = this.getRegisteredAtts().slice();

    if (save) {
      let toWrite = "";
      if (newRegisteredAtts.length > 0) {
        const object = {};
        object.array = newRegisteredAtts;

        toWrite = Convert.objectToJson(object);
      }

      return FileIO.writeStringTo(FilesPath.POP_ORG_ATTENDEES, toWrite)
        .catch((error) => {
          console.log(error);
          console.dir(error);
          console.trace();

          return this.setRegisteredAtts(oldRegisteredAtts, false)
            .then(() => {
              return Promise.reject(error);
            });
        });
    } else {
      return new Promise((resolve, reject) => {
        resolve();
      });
    }
  }

  /**
   * Returns the observable module for the pop description hash.
   * @returns {ObservableModule} - the observable module for the pop description hash
   */
  getPopDescHashModule() {
    return this._popDescHash;
  }

  /**
   * Returns the pop description hash.
   * @returns {Uint8Array} - the pop description hash
   */
  getPopDescHash() {
    return this.getPopDescHashModule().hash;
  }

  /**
   * Sets the pop description hash.
   * @param {Uint8Array} hash - the new hash to set
   * @param {boolean} save - if the new hash should be saved permanently
   * @returns {Promise} - a promise that gets resolved once the new hash has been set and saved if the save parameter is set to true
   */
  setPopDescHash(hash, save) {
    if (!(hash instanceof Uint8Array)) {
      throw new Error("hash must be an instance of Uint8Array");
    }
    if (typeof save !== "boolean") {
      throw new Error("save must be of type boolean");
    }

    const oldHash = this.getPopDescHash();

    this.getPopDescHash().hash = Uint8Array.from(hash);

    const newHash = this.getPopDescHash();

    if (save) {
      let toWrite = "";
      if (newHash.length > 0) {
        const object = {};
        object.hash = newHash;

        toWrite = Convert.objectToJson(object);
      }

      return FileIO.writeStringTo(FilesPath.POP_ORG_DESC_HASH, toWrite)
        .catch((error) => {
          console.log(error);
          console.dir(error);
          console.trace();

          return this.setPopDescHash(oldHash, false)
            .then(() => {
              return Promise.reject(error);
            });
        });
    } else {
      return new Promise((resolve, reject) => {
        resolve();
      });
    }
  }

  /**
   * Action functions.
   */

  /**
   * Empties the registered attendees list. This action is not stored permanently.
   */
  emptyRegisteredAttsArray() {
    while (this.getRegisteredAtts().array.length > 0) {
      this.getRegisteredAtts().array.pop();
    }
  }

  /**
   * Empties the roster list of the pop description. This action is not stored permanently.
   */
  emptyPopDescRosterList() {
    while (this.getPopDescModule().roster.list.length > 0) {
      this.getPopDescModule().roster.list.pop();
    }
  }

  /**
   * Load and reset functions and sub-functions to load/reset PoP.
   */
}

/**
 * Now we create a singleton object for Org.
 */

// The symbol key reference that the singleton will use.
const ORG_PACKAGE_KEY = Symbol.for(Package.ORG);

// We create the singleton if it hasn't been instanciated yet.
const globalSymbols = Object.getOwnPropertySymbols(global);
const orgExists = (globalSymbols.indexOf(ORG_PACKAGE_KEY) >= 0);

if (!orgExists) {
  global[ORG_PACKAGE_KEY] = (function () {
    const newOrg = new Org();
    //newOrg.load();

    return newOrg;
  })();
}

// Singleton API
const ORG = {};

Object.defineProperty(ORG, "get", {
  configurable: false,
  enumerable: false,
  get: function () {
    return global[ORG_PACKAGE_KEY];
  },
  set: undefined
});

// We freeze the singleton.
Object.freeze(ORG);

// We export only the singleton API.
module.exports = ORG;
