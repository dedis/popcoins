const ObservableModule = require("data/observable");
const ObservableArray = require("data/observable-array").ObservableArray;
const FileIO = require("../../../file-io/file-io");
const FilesPath = require("../../../../res/files/files-path");
const Package = require("../../Package");
const Convert = require("../../Convert");
const ObjectType = require("../../ObjectType");
const Helper = require("../../Helper");
const Net = require("../../Net");
const Crypto = require("../../Crypto");
const RequestPath = require("../../RequestPath");
const DecodeType = require("../../DecodeType");
const CothorityMessages = require("../../protobuf/build/cothority-messages");

/**
 * This singleton is the user of the app. It contains everything needed that is general, app-wide or does not belong to any precise subpart.
 */

/**
 * We define the User class which is the object representing the user of the app.
 */

const EMPTY_KEYPAIR = CothorityMessages.createKeyPair(new Uint8Array(), new Uint8Array(), new Uint8Array());
const EMPTY_ROSTER = CothorityMessages.createRoster(new Uint8Array(), [], new Uint8Array());

class User {

  /**
   * Constructor for the User class.
   */
  constructor() {
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
  }

  /**
   * Getters and Setters.
   */

  /**
   * Gets the isLoaded property of the user. It is only true once all the settings of the user have been loaded into memory.
   * @returns {boolean} - a boolean that is true once the user has been completely loaded into memory
   */
  isLoaded() {
    return this._isLoaded;
  }

  /**
   * Gets the users key pair.
   * @returns {KeyPair} - a key pair object containg the keys of the user
   */
  getKeyPair() {
    let publicComplete = undefined;
    if (this._keyPair.publicComplete.length > 0) {
      publicComplete = this._keyPair.publicComplete;
    }

    return CothorityMessages.createKeyPair(this._keyPair.public, this._keyPair.private, publicComplete);
  }

  /**
   * Sets the new key pair given in parameters.
   * @param {KeyPair} keyPair - the new key pair to set
   * @param {boolean} save - if the new key pair should be saved permanently
   * @returns {Promise} - a promise that gets resolved once the new key pair has been set and saved if the save parameter is set to true
   */
  setKeyPair(keyPair, save) {
    if (!Helper.isOfType(keyPair, ObjectType.KEY_PAIR)) {
      throw new Error("keyPair must be an instance of KeyPair");
    }
    if (typeof save !== "boolean") {
      throw new Error("save must be of type boolean");
    }

    const oldKeyPair = this.getKeyPair();

    this._keyPair.public = keyPair.public;
    this._keyPair.private = keyPair.private;

    if (keyPair.publicComplete !== undefined) {
      this._keyPair.publicComplete = keyPair.publicComplete;
    } else {
      this._keyPair.publicComplete = new Uint8Array();
    }

    const newKeyPair = this.getKeyPair();

    if (save) {
      let toWrite = "";
      if (newKeyPair.public.length > 0 && newKeyPair.private.length > 0) {
        toWrite = Convert.objectToJson(newKeyPair);
      }

      return FileIO.writeStringTo(FilesPath.KEY_PAIR, toWrite)
        .catch((error) => {
          console.log(error);
          console.dir(error);
          console.trace();

          return this.setKeyPair(oldKeyPair, false)
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
   * Returns the observable roster module.
   * @returns {ObservableModule} - the observable roster module
   */
  getRosterModule() {
    return this._roster;
  }

  /**
   * Gets the users roster.
   * @returns {Roster} - a roster object containing the conodes of the user
   */
  getRoster() {
    let id = undefined;
    if (this._roster.id.length > 0) {
      id = this._roster.id;
    }

    const list = [];
    if (this._roster.list.length > 0) {
      this._roster.list.forEach(server => {
        list.push(server);
      });
    }

    return CothorityMessages.createRoster(id, list, this._roster.aggregate);
  }

  /**
   * Sets the new roster given in parameters.
   * @param {Roster} roster - the new roster to set
   * @param {boolean} save - if the new roster should be saved permanently
   * @returns {Promise} - a promise that gets resolved once the new roster has been set and saved if the save parameter is set to true
   */
  setRoster(roster, save) {
    if (!Helper.isOfType(roster, ObjectType.ROSTER)) {
      throw new Error("roster must be an instance of Roster");
    }
    if (typeof save !== "boolean") {
      throw new Error("save must be of type boolean");
    }

    const oldRoster = this.getRoster();

    this._roster.id = new Uint8Array();
    if (roster.id !== undefined) {
      this._roster.id = roster.id;
    }
    this._roster.list = new ObservableArray();
    roster.list.forEach((server) => {
      server.toBase64 = Convert.byteArrayToBase64;
      this._roster.list.push(server);
    });
    this._roster.aggregate = roster.aggregate;

    const newRoster = this.getRoster();

    if (save) {
      let toWrite = "";
      if (newRoster.list.length > 0) {
        toWrite = Convert.objectToJson(newRoster);
      }

      return FileIO.writeStringTo(FilesPath.CONODES_JSON, toWrite)
        .catch((error) => {
          console.log(error);
          console.dir(error);
          console.trace();

          return this.setRoster(oldRoster, false)
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
   * Substracts a server form the roster of the user by its index.
   * @param {number} index - the index of the server to remove
   * @returns {Promise} - a promise that gets returned once the server has been removed from the roster and saved
   */
  substractServerByIndex(index) {
    if (typeof index !== "number" || !(0 <= index && index < this._roster.list.length)) {
      throw new Error("index must be of type number and be in the right range");
    }

    const server = this._roster.list.getItem(index);

    return this.substractRoster(CothorityMessages.createRoster(undefined, [server], server.public));
  }

  /**
   * Substracts the roster given as parameter from the users roster.
   * @param {Roster} roster - the roster to substract
   * @returns {Promise} - a promise that gets resolved once the roster has been substracted and saved
   */
  substractRoster(roster) {
    if (!Helper.isOfType(roster, ObjectType.ROSTER)) {
      throw new Error("roster must be an instance of Roster");
    }

    if (this._roster.list.length === 0) {
      return new Promise((resolve, reject) => {
        resolve();
      });
    } else if (roster.list.length === 0) {
      return new Promise((resolve, reject) => {
        resolve();
      });
    } else {
      const idsToExclude = roster.list.map(server => {
        return Convert.byteArrayToBase64(server.id);
      });

      const newList = [];
      const points = [];
      this._roster.list.forEach(server => {
        if (!idsToExclude.includes(Convert.byteArrayToBase64(server.id))) {
          newList.push(server);
          points.push(Crypto.unmarshal(server.public));
        }
      });

      let newRoster = undefined;
      if (newList.length > 0) {
        newRoster = CothorityMessages.createRoster(undefined, newList, Crypto.aggregatePublicKeys(points));
      } else {
        newRoster = CothorityMessages.createRoster(new Uint8Array(), [], new Uint8Array());
      }

      return this.setRoster(newRoster, true);
    }
  }

  /**
   * Adds a server to the roster of the user by constructing it from the given parameters.
   * @param {string} address - the address of the server
   * @param {Uint8Array} publicKey - the public key of the server
   * @param {string} description - the description of the server
   * @returns {Promise} - a promise that gets resolved once the server has been added to the roster and saved
   */
  addServerByInfo(address, publicKey, description) {
    if (typeof address !== "string") {
      throw new Error("address must be of type string");
    }
    if (!(publicKey instanceof Uint8Array)) {
      throw new Error("publicKey must be an instance of Uint8Array");
    }
    if (typeof description !== "string") {
      throw new Error("description must be of type string");
    }

    return this.addServer(Convert.toServerIdentity(address, publicKey, description, undefined));
  }

  /**
   * Adds a server to the roster of the user.
   * @param {ServerIdentity} server - the server to add to the roster
   * @returns {Promise} - a promise that gets resolved once the server has been added to the roster and saved
   */
  addServer(server) {
    if (!Helper.isOfType(server, ObjectType.SERVER_IDENTITY)) {
      throw new Error("server must be of type ServerIdentity");
    }

    return this.addRoster(CothorityMessages.createRoster(undefined, [server], server.public));
  }

  /**
   * Adds the roster given as parameter to the roster of the user.
   * @param {Roster} roster - the roster to add
   * @returns {Promise} - a promise that gets resolved once the roster has been added and saved
   */
  addRoster(roster) {
    if (!Helper.isOfType(roster, ObjectType.ROSTER)) {
      throw new Error("roster must be an instance of Roster");
    }

    if (this._roster.list.length === 0) {
      return this.setRoster(roster, true);
    } else if (roster.list.length === 0) {
      return new Promise((resolve, reject) => {
        resolve();
      });
    } else {
      const newList = [];
      const points = [];
      const idsToExclude = [];

      this._roster.list.forEach(server => {
        newList.push(server);
        points.push(Crypto.unmarshal(server.public));
        idsToExclude.push(Convert.byteArrayToBase64(server.id));
      });

      roster.list.forEach(server => {
        if (!idsToExclude.includes(Convert.byteArrayToBase64(server.id))) {
          newList.push(server);
          points.push(Crypto.unmarshal(server.public));
        }
      });

      const newRoster = CothorityMessages.createRoster(undefined, newList, Crypto.aggregatePublicKeys(points));

      return this.setRoster(newRoster, true);
    }
  }

  /**
   * Empties the roster status list.
   */
  emptyRosterStatusList() {
    while (this._roster.statusList.length > 0) {
      this._roster.statusList.pop();
    }
  }

  /**
   * Gets the status of all the conodes in the users roster.
   * @returns {Promise} - a promise that gets resolved once all the statuses of the conodes were received
   */
  getRosterStatus() {
    this._roster.isLoading = true;
    this.emptyRosterStatusList();

    const conodes = Array.from(this.getRoster().list);
    const cothoritySocket = new Net.CothoritySocket();
    const statusRequestMessage = CothorityMessages.createStatusRequest();

    conodes.map((server) => {
      return cothoritySocket.send(server, RequestPath.STATUS_REQUEST, statusRequestMessage, DecodeType.STATUS_RESPONSE)
        .then(statusResponse => {
          this._roster.statusList.push({
            conode: server,
            conodeStatus: statusResponse
          });

          return Promise.resolve();
        })
        .catch(error => {
          console.log(error);
          console.dir(error);
          console.trace();

          return Promise.reject(error);
        });
    });

    return Promise.all(conodes)
      .then(() => {
        this._roster.isLoading = false;
      });
  }

  /**
   * Load and reset functions and sub-functions to load/reset the user.
   */

  /**
   * Completely resets the user.
   * @returns {Promise} - a promise that gets completed once the user has been reset
   */
  reset() {
    this._isLoaded = false;

    const promises = [this.setKeyPair(EMPTY_KEYPAIR, true), this.setRoster(EMPTY_ROSTER, true)];

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
   * @returns {Promise} - a promise that gets resolved once everything belonging to the user is loaded into memory
   */
  load() {
    this._isLoaded = false;

    const promises = [this.loadKeyPair(), this.loadRoster()];

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
   * Loads the users key pair into memory.
   * @returns {Promise} - a promise that gets resolved once the key pair is loaded into memory
   */
  loadKeyPair() {
    return FileIO.getStringOf(FilesPath.KEY_PAIR)
      .then(jsonKeyPair => {
        if (jsonKeyPair.length > 0) {
          return Convert.parseJsonKeyPair(jsonKeyPair);
        } else {
          return EMPTY_KEYPAIR;
        }
      })
      .then(keyPair => {
        return this.setKeyPair(keyPair, false);
      })
      .catch(error => {
        console.log(error);
        console.dir(error);
        console.trace();

        return Promise.reject(error);
      });
  }

  /**
   * Loads the users roster into memory.
   * @returns {Promise} - a promise that gets resolved once the complete roster is loaded into memory
   */
  loadRoster() {
    return FileIO.getStringOf(FilesPath.CONODES_JSON)
      .then(jsonRoster => {
        if (jsonRoster.length > 0) {
          return Convert.parseJsonRoster(jsonRoster);
        } else {
          return EMPTY_ROSTER;
        }
      })
      .then(roster => {
        return this.setRoster(roster, false);
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
 * Now we create a singleton object for the User.
 */

// The symbol key reference that the singleton will use.
const USER_PACKAGE_KEY = Symbol.for(Package.USER);

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
const USER = {};

Object.defineProperty(USER, "get", {
  configurable: false,
  enumerable: false,
  get: function () {
    return global[USER_PACKAGE_KEY];
  },
  set: undefined
});

// We freeze the singleton.
Object.freeze(USER);

// We export only the singleton API.
module.exports = USER;
