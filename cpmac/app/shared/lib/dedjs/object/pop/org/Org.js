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

const EMPTY_SERVER_IDENTITY = CothorityMessages.createServerIdentity(new Uint8Array(), new Uint8Array(), "", "");
const EMPTY_ROSTER = CothorityMessages.createRoster(new Uint8Array(), [], new Uint8Array());
const EMPTY_POP_DESC = CothorityMessages.createPopDesc("", "", "", EMPTY_ROSTER);

class Org {

  // TODO: test
  // TODO: link to conode, hash + register pop desc on conode, finalize party with registered atts, fetch party by id

  /**
   * Constructor for the Org class.
   */
  constructor() {
    this._isLoaded = false;
    this._linkedConode = ObservableModule.fromObject({
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
    this._registeredAtts = ObservableModule.fromObject({
      array: new ObservableArray()
    });
    this._popDescHash = ObservableModule.fromObject({
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
   * Sets the name of the PopDesc.
   * @param {string} name - the new name of the PopDesc
   * @returns {Promise} - a promise that gets completed once the name of the PopDesc has been set
   */
  setPopDescName(name) {
    if (typeof name !== "string") {
      throw new Error("name must be of type string");
    }

    const popDesc = this.getPopDesc();
    popDesc.name = name;

    return this.setPopDesc(popDesc, true);
  }

  /**
   * Sets the date and time of the PopDesc.
   * @param {string} dateTime - the new date and time of the PopDesc
   * @returns {Promise} - a promise that gets completed once the date and time of the PopDesc has been set
   */
  setPopDescDateTime(dateTime) {
    if (typeof dateTime !== "string") {
      throw new Error("dateTime must be of type string");
    }

    const popDesc = this.getPopDesc();
    popDesc.dateTime = dateTime;

    return this.setPopDesc(popDesc, true);
  }

  /**
   * Sets the location of the PopDesc.
   * @param {string} location - the new location of the PopDesc
   * @returns {Promise} - a promise that gets completed once the location of the PopDesc has been set
   */
  setPopDescLocation(location) {
    if (typeof location !== "string") {
      throw new Error("location must be of type string");
    }

    const popDesc = this.getPopDesc();
    popDesc.location = location;

    return this.setPopDesc(popDesc, true);
  }

  /**
   * Adds a conode to the roster of the PopDesc.
   * @param {ServerIdentity} conode - the new conode to add to the PopDesc roster
   * @returns {Promise} - a promise that gets completed once the conode has been added to the PopDesc roster
   */
  addPopDescConode(conode) {
    if (!Helper.isOfType(conode, ObjectType.SERVER_IDENTITY)) {
      throw new Error("conode must be an instance of ServerIdentity");
    }

    let newRoster = {
      list: this.getPopDesc().roster.list
    };
    newRoster.list.push(conode);
    newRoster = Convert.parseJsonRoster(Convert.objectToJson(newRoster));

    const newPopDesc = this.getPopDesc();
    newPopDesc.roster = newRoster;

    return this.setPopDesc(newPopDesc, true);
  }

  /**
   * Removes the conode at the index given as parameter from the roster of the PopDesc.
   * @param {number} index - the index of the conode to remove from the PopDesc roster
   * @returns {Promise} - a promise that gets completed once the conode at the index given as parameter has been removed from the PopDesc roster
   */
  removePopDescConodeByIndex(index) {
    if (typeof index !== "number" || !(0 <= index && index < this.getPopDescModule().roster.list.length)) {
      throw new Error("index must be of type number and be in the right range");
    }

    let newRoster = {
      list: []
    };
    for (let i = 0; i < this.getPopDescModule().roster.list.length; ++i) {
      if (i !== index) {
        newRoster.list.push(this.getPopDescModule().roster.list.getItem(i));
      }
    }
    newRoster = Convert.parseJsonRoster(Convert.objectToJson(newRoster));

    const newPopDesc = this.getPopDesc();
    newPopDesc.roster = newRoster;

    return this.setPopDesc(newPopDesc, true);
  }

  /**
   * Registers the public key of the attendee.
   * @param {Uint8Array} publicKey - the public key of the attendee
   * @returns {Promise} - a promise that gets completed once the attendee has been registered
   */
  registerAttendee(publicKey) {
    if (!(publicKey instanceof Uint8Array) || !Helper.isValidPublicKey(publicKey)) {
      throw new Error("publicKey must be an instance of Uint8Array and have the right format");
    }

    const newAttendees = this.getRegisteredAtts().slice();
    newAttendees.push(publicKey);

    return this.setRegisteredAtts(newAttendees, true);
  }

  /**
   * Unregisters the public key of the attendee corresponding to the given index.
   * @param {number} index - the index of the public key to unregister
   * @returns {Promise} - a promise that gets completed once the attendee has been unregistered
   */
  unregisterAttendeeByIndex(index) {
    if (typeof index !== "number" || !(0 <= index && index < this.getRegisteredAtts().length)) {
      throw new Error("index must be of type number and be in the right range");
    }

    const newAttendees = [];
    for (let i = 0; i < this.getRegisteredAtts().length; ++i) {
      if (i !== index) {
        newAttendees.push(this.getRegisteredAtts().getItem(i));
      }
    }

    return this.setRegisteredAtts(newAttendees, true);
  }

  /**
   * Load and reset functions and sub-functions to load/reset PoP.
   */

  /**
   * Completely resets the organizer.
   * @returns {Promise} - a promise that gets completed once the organizer has been reset
   */
  reset() {
    this._isLoaded = false;

    const promises = [this.setLinkedConode(EMPTY_SERVER_IDENTITY, true), this.setPopDesc(EMPTY_POP_DESC, true), this.setRegisteredAtts([], true), this.setPopDescHash(new Uint8Array(), true)];

    return Promise.all(promises)
      .then(() => {
        this._isLoaded = true;
      })
      .catch(error => {
        console.log(error);
        console.dir(error);
        console.trace();

        return Promise.reject(error);
      });
  }

  /**
   * Main load function.
   * @returns {Promise} - a promise that gets resolved once everything belonging to Org has been loaded into memory
   */
  load() {
    this._isLoaded = false;

    const promises = [this.loadLinkedConode(), this.loadPopDesc(), this.loadRegisteredAtts(), this.loadPopDescHash()];

    return Promise.all(promises)
      .then(() => {
        this._isLoaded = true;
      })
      .catch(error => {
        console.log(error);
        console.dir(error);
        console.trace();

        return Promise.reject(error);
      });
  }

  /**
   * Loads the linked conode into memory.
   * @returns {Promise} - a promise that gets resolved once the linked conode has been loaded into memory
   */
  loadLinkedConode() {
    return FileIO.getStringOf(FilesPath.POP_ORG_CONODE)
      .then(jsonLinkedConode => {
        if (jsonLinkedConode.length > 0) {
          const linkedConode = Convert.parseJsonServerIdentity(jsonLinkedConode);

          return this.setLinkedConode(linkedConode, false);
        } else {
          return Promise.resolve();
        }
      })
      .catch(error => {
        console.log(error);
        console.dir(error);
        console.trace();

        return Promise.reject(error);
      });
  }

  /**
   * Loads the PopDesc into memory.
   * @returns {Promise} - a promise that gets resolved once the PopDesc has been loaded into memory
   */
  loadPopDesc() {
    return FileIO.getStringOf(FilesPath.POP_ORG_DESC)
      .then(jsonPopDesc => {
        if (jsonPopDesc.length > 0) {
          const popDesc = Convert.parseJsonPopDesc(jsonPopDesc);

          return this.setPopDesc(popDesc, false);
        } else {
          return Promise.resolve();
        }
      })
      .catch(error => {
        console.log(error);
        console.dir(error);
        console.trace();

        return Promise.reject(error);
      });
  }

  /**
   * Loads the registered attendees into memory.
   * @returns {Promise} - a promise that gets resolved once all the registered attendees have been loaded into memory
   */
  loadRegisteredAtts() {
    return FileIO.getStringOf(FilesPath.POP_ORG_ATTENDEES)
      .then(jsonRegisteredAtts => {
        if (jsonRegisteredAtts.length > 0) {
          const registeredAtts = Convert.parseJsonArrayOfKeys(jsonRegisteredAtts);

          return this.setRegisteredAtts(registeredAtts, false);
        } else {
          return Promise.resolve();
        }
      })
      .catch(error => {
        console.log(error);
        console.dir(error);
        console.trace();

        return Promise.reject(error);
      });
  }

  /**
   * Loads the PopDesc hash into memory.
   * @returns {Promise} - a promise that gets resolved once the PopDesc hash has been loaded into memory
   */
  loadPopDescHash() {
    return FileIO.getStringOf(FilesPath.POP_ORG_DESC_HASH)
      .then(jsonPopDescHash => {
        if (jsonPopDescHash.length > 0) {
          const popDescHash = Convert.parseJsonPopDescHash(jsonPopDescHash);

          return this.setPopDescHash(popDescHash, false);
        } else {
          return Promise.resolve();
        }
      })
      .catch(error => {
        console.log(error);
        console.dir(error);
        console.trace();

        return Promise.reject(error);
      });
  }
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
