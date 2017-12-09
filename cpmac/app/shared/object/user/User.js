const ObservableModule = require("data/observable");
const ObservableArray = require("data/observable-array").ObservableArray;
const FileIO = require("~/shared/lib/file-io/file-io");
const FilesPath = require("~/shared/res/files/files-path");
const Convert = require("~/shared/lib/dedjs/Convert");
const ObjectType = require("~/shared/lib/dedjs/ObjectType");
const Helper = require("~/shared/lib/dedjs/Helper");
const Net = require("~/shared/lib/dedjs/Net");
const RequestPath = require("~/shared/lib/dedjs/RequestPath");
const DecodeTypes = require("~/shared/lib/dedjs/DecodeTypes");
const CothorityMessages = require("~/shared/lib/dedjs/protobuf/build/cothority-messages");

/**
 * This singleton is the user of the app. It contains everything needed that is general, app-wide or does not belong to any precise subpart.
 */

/**
 * We define the User class which is the object representing the user of the app.
 */

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
      isLoading: true,
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
  getIsLoaded() {
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

    const oldKeyPair = getKeyPair();

    this._keyPair.public = keyPair.public;
    this._keyPair.private = keyPair.private;

    if (keyPair.publicComplete !== undefined) {
      this._keyPair.publicComplete = keyPair.publicComplete;
    } else {
      this._keyPair.publicComplete = new Uint8Array();
    }

    const newKeyPair = getKeyPair();

    if (save) {
      return FileIO.writeStringTo(FilesPath.KEY_PAIR, Convert.objectToJson(newKeyPair))
        .catch((error) => {
          console.log(error);
          console.dir(error);

          return setKeyPair(oldKeyPair, false)
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
   * Gets the users roster.
   * @returns {Roster} - a roster object containing the conodes of the user
   */
  getRoster() {
    let id = undefined;
    if (this._roster.id.length > 0) {
      id = this._roster.id;
    }

    return CothorityMessages.createRoster(id, this._roster.list, this._roster.aggregate);
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

    const oldRoster = getRoster();

    this._roster.id = roster.id;
    this._roster.list.push(roster.list);
    this._roster.aggregate = roster.aggregate;

    const newRoster = getRoster();

    if (save) {
      return FileIO.writeStringTo(FilesPath.CONODES_JSON, Convert.objectToJson(newRoster))
        .catch((error) => {
          console.log(error);
          console.dir(error);

          return setRoster(oldRoster, false)
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
   * Empties the roster status list.
   */
  emptyRosterStatusList() {
    while (this._roster.statusList.length) {
      this._roster.statusList.pop();
    }
  }

  /**
   * Gets the status of all the conodes in the users roster.
   * @returns {Promise} - a promise that gets resolved once all the statuses of the conodes were received
   */
  getRosterStatus() {
    emptyRosterStatusList();

    const conodes = Array.from(getRoster().list);
    const cothoritySocket = new DedisJsNet.CothoritySocket();
    const statusRequestMessage = CothorityMessages.createStatusRequest();

    conodes.map((server) => {
      return cothoritySocket.send(server, RequestPath.STATUS_REQUEST, statusRequestMessage, DecodeTypes.STATUS_RESPONSE)
        .then(statusResponse => {
          this._roster.statusList.push(statusResponse);

          return Promise.resolve();
        })
        .catch(error => {
          console.log(error);
          console.dir(error);

          return Promise.reject(error);
        });
    });

    return Promise.all(conodes);
  }

  /**
   * Load functions and sub-functions to load the user into memory.
   */

  /**
   * Main load function.
   * @returns {Promise} - a promise that gets resolved once everything belonging to the user is loaded into memory
   */
  load() {
    this._isLoaded = false;

    const promises = [loadKeyPair, loadRoster];

    return Promise.all(promises)
      .then(() => {
        this._isLoaded = true;
      })
      .catch(error => {
        console.log(error);
        console.dir(error);

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
        return Convert.parseJsonKeyPair(jsonKeyPair);
      })
      .then(keyPair => {
        return setKeyPair(keyPair, false);
      })
      .catch(error => {
        console.log(error);
        console.dir(error);

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
        return Convert.parseJsonRoster(jsonRoster);
      })
      .then(roster => {
        return setRoster(roster, false);
      })
      .catch(error => {
        console.log(error);
        console.dir(error);

        return Promise.reject(error);
      });
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
const USER = {};

Object.defineProperty(USER, "get", {
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
Object.freeze(USER);

// We export only the singleton API.
module.exports = USER;
