const Helper = require("../../../Helper");
const ObservableModule = require("data/observable");
const ObservableArray = require("data/observable-array").ObservableArray;
const KeyPair = require("../../../Crypto").KeyPair;
const FileIO = require("../../../../file-io/file-io");
const FilePath = require("../../../../../res/files/files-path");
const Convert = require("../../../Convert");
const NetDedis = require("@dedis/cothority").net;
const CothorityMessages = require("../../../protobuf/build/cothority-messages");
const RequestPath = require("../../../RequestPath");
const DecodeType = require("../../../DecodeType");


/**
 * This singleton represents the attendee of a PoP party. It contains everything related to the attendee.
 */

/**
 * We define the AttParty class which is the object representing the attendee.
 */

class AttParty {

  /**
   * Constructor for the AttParty class.
   * @param {string} id - the hash of the party
   * @param {boolean} loadLocally - precise if the party has to be loaded from the local storage
   * @param {string} [address] - address of the conode in the format tls://XXX.XXX.XXX.XXX:XXX. It is required
   * if the party needs to be retrieved from the conode. If the address is not specified, the leader conode is used.
   *
   */
  constructor(id, loadLocally, address) {
    if (typeof id !== "string" || id === "") {
      throw new Error("id must be of type string and shouldn't be empty");
    }
    this._folderName = id;
    this._partyExistLocally = FileIO.folderExists(FileIO.join(FilePath.POP_ATT_PATH, this._folderName));
    this._partyExistLocally = loadLocally;
    if (!this._partyExistLocally && address === undefined) {
      throw new Error("address should not be undefined as the party isn't stored locally");
    } else if (!this._partyExistLocally && !Helper.isValidAddress(address)) {
      throw new Error("address is not in a correct format");
    }
    this._address = address;
    this._id = Convert.hexToByteArray(id);
    this._isLoaded = false;
    this._finalStatement = undefined;
    this._keyPair = new KeyPair(FileIO.join(FilePath.POP_ATT_PATH, this._folderName));
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
    this._status = ObservableModule.fromObject({
      status: States.UNDEFINED
    });

    this.load();

  }

  /**
   * Retrieve the final statement from the conode and update the status of the party.
   *
   * @returns {Promise} - a promise that gets solved once the final statement is retrieved and the status updated
   */
  retrieveFinalStatementAndStatus() {
    const cothoritySocket = new NetDedis.Socket(Convert.tlsToWebsocket(this._address, ""), RequestPath.POP);
    const fetchRequest = CothorityMessages.createFetchRequest(this._id, true);

    return cothoritySocket.send(RequestPath.POP_FETCH_REQUEST, DecodeType.FINALIZE_RESPONSE, fetchRequest)
      .then((response) => {
        this._finalStatement = response.final;

        if (Object.keys(response.final.attendees).length === 0) {
          this._status.status = States.PUBLISHED;
        } else if (response.final.signature.length === 0) {
          this._status.status = States.FINALIZING;
        } else {
          this._status.status = States.FINALIZED;
        }

        return Promise.resolve();
      })
      .catch(error => {
        this._status.status = States.ERROR;

        //Promise is resolved as the status is set to "error"
        return Promise.resolve(error);
      });

  }

  /**
   * Load the final statement from local storage
   * @returns {Promise} - a promise that gets resolved once the final statement is load in memory
   */
  loadFinalStatement() {
    return FileIO.getStringOf(FileIO.join(FilePath.POP_ATT_PATH, this._folderName, FilePath.POP_ATT_FINAL))
      .then(string => {
        this._finalStatement = Convert.jsonToObject(string);
        console.dir(this._finalStatement);
        return Promise.resolve();
      })
      .catch(error => {
        console.log(error);
        console.dir(error);
        console.trace();

        return Promise.reject(error);
      })
  }

  /**
   * Use the final statement in memory to update the party description module
   * @returns {Promise} - the promise gets resolved as soon as the description is updated
   */
  loadPopDesc() {
    const popDesc = this._finalStatement.desc;
    const popDescModule = this.getPopDescModule();
    popDescModule.name = popDesc.name;
    popDescModule.dateTime = popDesc.dateTime;
    popDescModule.location = popDesc.location;
    popDescModule.roster.id = Uint8Array.from(popDesc.roster.id);

    popDescModule.roster.list.splice();
    popDesc.roster.list.forEach(server => {
      server.toHex = Convert.byteArrayToHex;
      popDescModule.roster.list.push(server);
    });

    // We loaded from local data, address used should be the one of the leader
    console.dir(popDescModule.roster);
    this._address = popDescModule.roster.list.getItem(0).address;

    popDescModule.roster.aggregate = Uint8Array.from(popDesc.roster.aggregate);

    return Promise.resolve();
  }

  /**
   * Write the final statement of the party on the disk to speed up the startup
   * @returns {Promise} - a promise that gets resolved once the file is written
   */
  cacheFinalStatement() {
    const toWrite = Convert.objectToJson(this._finalStatement);

    return FileIO.writeStringTo(FileIO.join(FilePath.POP_ATT_PATH, this._folderName, FilePath.POP_ATT_FINAL), toWrite)
      .catch(error => {
        console.log(error);
        console.dir(error);
        console.trace();

        return Promise.reject(error);
      })
  }

  /**
   * Load everyhting needed to the party :
   *  - download the final statement if need
   *  - cache it on the disk
   *  - update the party description with the current final statement
   *  - update the status of the party
   * @returns {Promise}- a promise that gets resolved once the loading is finished
   */
  load() {
    if (this._partyExistLocally) {
      return this.loadFinalStatement()
        .then(() => {
          return this.loadPopDesc();
        })
        .then(() => {
          return this.retrieveFinalStatementAndStatus();
        })
        .catch(error => {
          console.log(error);
          console.dir(error);
          console.trace();

          return Promise.reject(error);
        });
    } else {
      return this.retrieveFinalStatementAndStatus()
        .then(() => {
          return Promise.all([this.cacheFinalStatement(), this.loadPopDesc()]);
        })
        .catch(error => {
          console.log(error);
          console.dir(error);
          console.trace();

          return Promise.reject(error);
        })
    }
  }

  /**
   * Returns the observable module for the description of the party
   * @returns {ObservableModule}
   */
  getPopDescModule() {
    return this._popDesc;
  }

  /**
   * Returns the pop status observable module
   * @returns {ObservableModule}
   */
  getPopStatusModule() {
    return this._status;
  }

  /**
   * Completely remove Party from disk
   * @returns {Promise} a promise that gets resolved once the party is deleted
   */
  remove() {
    return FileIO.removeFolder(FileIO.join(FilePath.POP_ATT_PATH, this._folderName));
  }
}

/**
 * Enumerate the different possible state for a party
 * @readonly
 * @enum {string}
 */
const States = Object.freeze({
  /** Status is loading **/
  UNDEFINED: "loading",

  /** Party is published (Stored) on the conode but not yet finalized **/
  PUBLISHED: "running",

  /** Party is finalizing (not every nodes are finalized) **/
  FINALIZING: "closing soon",

  /** Party is fianlized **/
  FINALIZED: "finalized",

  /** Used if the status connot be retrieved **/
  ERROR: "offline"
});

module.exports.Party = AttParty;
module.exports.States = States;

