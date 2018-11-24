require("nativescript-nodeify");
const ObservableModule = require("data/observable");
const Kyber = require("@dedis/kyber-js");
const CurveEd25519 = new Kyber.curve.edwards25519.Curve;

const Net = require("./network/NSNet");
const Roster = require("./cothority/identity").Roster;
const ServerIdentity = require("./cothority/identity").ServerIdentity;
const FileIO = require("./FileIO");
const FilePaths = require("./FilePaths");
const Convert = require("./Convert");
const Log = require("./Log").default;
const ObjectType = require("./ObjectType");
const Helper = require("./Helper");
const Crypto = require("./crypto/Crypto");
const RequestPath = require("./network/RequestPath");
const DecodeType = require("./network/DecodeType");
const CothorityMessages = require("./network/cothority-messages");
const KeyPair = require("./crypto/KeyPair");
const Defaults = require("./Defaults");
const Dialog = require("ui/dialogs");
const Darc = require("../lib/cothority/omniledger/darc/Darc.js");
const Config = require("./cothority/omniledger/Config.js");

/**
 * This class holds a user in the system and has the following fields:
 * - cothority - everything with regard to services of the cothority
 *   - linkedConode - reference to a conode that has our conode-public key stored
 *   - Array<Conode> - all known conodes
 * - keys - a map that holds the following keys:
 *   - conode - keypair used to authenticate to our linked conode
 *   - byzcoin - keypair used in darcs for byzcoin
 *   - personhood - keypair used when signing up for a personhood party
 * - identity - a map to different parts of our real-world identity
 *   - name - full name, if set
 *   - pseudo - pseudonym used in services
 *   - email - eventually an email
 */

/**
 * We define the User class which is the object representing the user of the app.
 */

const EMPTY_ROSTER = CothorityMessages.createRoster(new Uint8Array(), [], new Uint8Array());

class User {

    /**
     * Constructor for the User class.
     */
    constructor() {
        this._name = "";
        this._isLoaded = false;
        this.load().catch(err=>{
            Log.rcatch(err);
        })
        this._darcs = [];
        this._config = null;
    }

    /**
     * Getters and Setters.
     */

    /**
     * Gets the isLoaded property of the user. It is only true once all the settings of the user have been loaded into memory.
     * @returns {boolean} - a boolean that is true once the user has completely been loaded into memory
     */
    isLoaded() {
        return this._isLoaded;
    }

    /**
     * Returns the user name.
     * @returns {String} - the string of the name
     */
    getName() {
        return this._name;
    }


    /**
     * Returns the observable key pair module.
     * @returns {ObservableModule} - the observable key pair module
     */
    getKeyPairModule() {
        return this._keyPair.getModule();
    }

    /**
     * Gets the users key pair.
     * @returns {KeyPair} - a key pair object containg the keys of the user
     */
    getKeyPair() {
        return this._keyPair;
    }

    /**
     * Randomize the key pair of the User
     * @returns {Promise} - a prmise that gets resolved once the key pair has been randomized and saved
     */
    randomizeKeyPair() {
        return this._keyPair.randomize();
    }

    /**
     * Gets the users roster.
     * @returns {Roster} - a roster object containing the conodes of the user
     */
    get roster() {
        if (this._roster === undefined) {
            this._roster = new Roster(CurveEd25519, []);
        }
        // Why would we need this?
        if (this._roster.identities === undefined) {
            this._roster.identities = [];
        }
        return this._roster;
    }

    /**
     * @returns {[any , any , any , any , any , any , any , any , any , any]}
     */
    get statusList(){
        return this._statusList;
    }

    /**
     * Sets the the name of the user given in parameters
     * @param {String} name - The new user name
     * @param {boolean} save - if the new name should be saved permanently
     * @returns {Promise} - a promise that gets resolved once the new name has been set and saved if the save parameter is set to true
     */
    setName(name, save) {
        if (typeof save !== "boolean") {
            throw new Error("save must be of type boolean");
        }
        if (typeof name !== "string") {
            throw new Error("name must be of type string");
        }

        this._name = name;
        let nameObject = {"name": this._name};
        if (save) {
            let toWrite;
            toWrite = Convert.objectToJson(nameObject);
            return FileIO.writeStringTo(FilePaths.USER_NAME, toWrite)
                .catch((error) => {
                    Log.rcatch(error, "error while setting name");
                });
        }

        return Promise.resolve();
    }

    /**
     * Sets the new roster given in parameters.
     * @param {Roster} roster - the new roster to set
     * @param {boolean} save - if the new roster should be saved permanently
     * @returns {Promise} - a promise that gets resolved once the new roster has been set and saved if the save parameter is set to true
     */
    setRoster(roster, save) {
        Log.lvl3("setRoster", save);
        if (!(roster instanceof Roster)) {
            Log.error("not a roster");
            throw new Error("roster must be an instance of Roster");
        }
        if (typeof save !== "boolean") {
            Log.error("not a boolean");
            throw new Error("save must be of type boolean");
        }

        this._roster = roster;

        if (save) {
            let toWrite = "";
            if (roster.identities.length > 0) {
                try {
                    toWrite = Convert.rosterToJson(roster);
                } catch(e){
                    Log.catch(e, "cannot convert");
                }
            }
            Log.llvl3("writing new roster:", toWrite);

            return FileIO.writeStringTo(FilePaths.ROSTER, toWrite)
                .catch((error) => {
                    Log.rcatch(error, "error while setting roster:");
                })
                .then(() => {
                    Log.lvl2("saved roster to:", FilePaths.ROSTER);
                });
        } else {
            return Promise.resolve();
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
        if (typeof index !== "number" || !(0 <= index && index < this.roster.identities.length)) {
            throw new Error("index must be of type number and be in the right range");
        }

        const server = this.roster.identities.getItem(index);

        return this.substractRoster(CothorityMessages.createRoster(undefined, [server], server.public));
    }

    /**
     * @param conode {ServerIdentity} removes this serverIdentity from the roster.
     * @return {Promise} when the new roster is saved.
     */
    removeConode(conode){
        this._roster.identities.forEach((id, i)=>{
            if (id.public.equal(conode.public)){
                this._roster.identities.splice(i, 1);
            }
        })
        return this.setRoster(this._roster, true);
    }

    setBCConfig(config) {
        if (!(config instanceof Config)) {
          throw new Error("config not of type Config")
        }
        this._config = config;
        this.saveBCConfig();
    }

    removeBCConfig(){
      this._config = null;
      this._darcs.splice(0, this._darcs.length);
      this.saveBCConfig();
      this.saveDarcs();
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

        if (this.roster.identities.length === 0) {
            return Promise.resolve();
        } else if (roster.identities.length === 0) {
            return Promise.resolve();
        } else {
            const idsToExclude = roster.identities.map(server => {
                return Convert.byteArrayToBase64(server.id);
            });

            const newList = [];
            const points = [];
            this.roster.identities.forEach(server => {
                if (!idsToExclude.includes(Convert.byteArrayToBase64(server.id))) {
                    newList.push(server);
                    let point = CurveEd25519.point();
                    point.unmarshalBinary(server.public);
                    points.push(point);
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

        return this.addServer(Convert.toServerIdentity(address, publicKey, description));
    }

    /**
     * Adds a server to the roster of the user.
     * @param {ServerIdentity} server - the server to add to the roster
     */
    addServer(server) {
        if (!(server instanceof ServerIdentity)) {
            throw new Error("server must be of type ServerIdentity");
        }
        this.roster.identities.push(server);
    }

    /**
     * Adds the roster given as parameter to the roster of the user.
     * @param {Roster} roster - the roster to add
     * @returns {Promise} - a promise that gets resolved once the roster has been added and saved
     */
    addRoster(roster) {
        console.trace();
        throw new Error("Don't use this");
        if (!Helper.isOfType(roster, ObjectType.ROSTER)) {
            throw new Error("roster must be an instance of Roster");
        }

        if (this.roster.identities.length === 0) {
            return this.setRoster(roster, true);
        } else if (roster.identities.length === 0) {
            return Promise.resolve();
        } else {
            const newList = [];
            const points = [];
            const idsToExclude = [];

            this.roster.identities.forEach(server => {
                newList.push(server);
                let point = CurveEd25519.point();
                point.unmarshalBinary(server.public);
                points.push(point);
                idsToExclude.push(Convert.byteArrayToBase64(server.id));
            });

            roster.identities.forEach(server => {
                if (!idsToExclude.includes(Convert.byteArrayToBase64(server.id))) {
                    newList.push(server);
                    let point = CurveEd25519.point();
                    point.unmarshalBinary(server.public);
                    points.push(point);
                }
            });

            const newRoster = CothorityMessages.createRoster(undefined, newList, Crypto.aggregatePublicKeys(points));

            return this.setRoster(newRoster, true);
        }
    }

    /**
     * Gets the status of all the conodes in the users roster.
     * @returns {Promise} - a promise that gets resolved once all the statuses of the conodes were received
     */
    getRosterStatus() {
        this._statusList = [];

        return Promise.resolve()
            .then(() => {
                if (this.roster.identities === undefined || this.roster.identities.length == 0) {
                    Log.lvl1("Creating test identities", Defaults.DEDIS_CONODES);
                    return Promise.all(Defaults.DEDIS_CONODES.map(address => {
                        return Net.getServerIdentityFromAddress("tls://" + address)
                            .then(server => {
                                this.addServer(server);
                            })
                            .catch(error => {
                                Log.rcatch(error, "couldn't get address");
                            })
                    })).then(() => {
                        return this.setRoster(this.roster, true)
                            .catch(err=>{
                                Log.catch(err, "couldn't set roster");
                            });
                    })
                }
            })
            .then(() => {
                const statusRequestMessage = {};
                return Promise.all(
                    this.roster.identities.map((server) => {
                        const address = server.websocketAddr;
                        const cothoritySocket = new Net.Socket(address, RequestPath.STATUS);
                        return cothoritySocket.send(RequestPath.STATUS_REQUEST, DecodeType.STATUS_RESPONSE, statusRequestMessage)
                            .then(response => {
                                response.conode = server;
                                return response;
                            })
                            .catch(error => {
                                console.log("couldn't reach server", address, error);
                                return {
                                    status: {Generic: {field: {Version: error}}},
                                    conode: server
                                }
                            })
                    })
                ).then(responses => {
                    this._statusList = responses;
                    return this._statusList;
                });
            })
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

        const promises = [this._keyPair.reset(), this.setRoster(EMPTY_ROSTER, true)];

        return Promise.all(promises)
            .then(() => {
                this._isLoaded = true;
            })
            .catch(error => {
                console.log("error while resetting", error);
                return Promise.reject(error);
            });
    }

    /**
     * Main load function.
     * @returns {Promise} - a promise that gets resolved once everything belonging to the user is loaded into memory
     */
    load() {
        this._isLoaded = false;
        const promises = [this.loadKeyPair(), this.loadRoster(), this.loadName()];

        return Promise.all(promises)
            .then(() => {
                this._isLoaded = true;
            })
            .catch(error => {
                Log.rcatch(error, "couldn't load user");
            });
    }

    /**
     * Loads the users key pair into memory.
     * @returns {Promise} - a promise that gets resolved once the key pair is loaded into memory
     */
    loadKeyPair() {
        return KeyPair.fromFile(FilePaths.KEY_PAIR).then((key) => {
            this._keyPair = key;
        }).catch(error => {
            console.log("couldn't load keypair, creating a new one:", error);
            this._keyPair = new KeyPair();
            return this._keyPair.save(FilePaths.KEY_PAIR);
        }).then(() => {
            return Promise.resolve(this._keyPair);
        });
    }

    /**
     * Loads the user name into memory.
     * @returns {Promise} - a promise that gets resolved once the name is loaded into memory
     */
    loadName() {
        return FileIO.getStringOf(FilePaths.USER_NAME)
            .then(jsonName => {
                let name;
                if (jsonName.length > 0) {
                    name = Convert.parseJsonUserName(jsonName);
                }
                else {
                    name = "Undefined";
                }
                return this.setName(name, false);
            })
            .catch(error => {
                Log.rcatch(error, "error while loading:");
            });
    }

    /**
     * Loads the users roster into memory.
     * @returns {Promise} - a promise that gets resolved once the complete roster is loaded into memory
     */
    loadRoster() {
        return FileIO.getStringOf(FilePaths.ROSTER)
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
                return Promise.reject(error);
            });
    }

    /**
     * Sends a link request to the conode given as parameter. If the pin is not empty and the link request succeeds
     * or if the public key of the user is already registered, the conode will be stored as the linked conode.
     * @param {ServerIdentity} conode - the conode to which send the link request
     * @param {string} pin - the pin received from the conode
     * @returns {Promise} - a promise that gets completed once the link request has been sent and a response received
     * @property {boolean} alreadyLinked -  a property of the object returned by the promise that tells if
     * the public key of the user were already registered (thus it won't need to ask PIN in the future)
     */
    sendLinkRequest(conode, pin) {
        if (!(conode instanceof ServerIdentity)) {
            throw new Error("conode must be an instance of ServerIdentity");
        }
        if (typeof pin !== "string") {
            throw new Error("pin must be of type string");
        }
        const ALREADY_LINKED = "ALREADY_LINKED_STRING";
        const cothoritySocket = new Net.Socket(Convert.tlsToWebsocket(conode, ""), RequestPath.POP);
        const pinRequestMessage = CothorityMessages.createPinRequest(pin, this.getKeyPair().public);
        const verifyLinkMessage = CothorityMessages.createVerifyLinkMessage(this.getKeyPair().public);

        // TODO change status request return type
        Log.lvl2("verify link");
        return cothoritySocket.send(RequestPath.POP_VERIFY_LINK, DecodeType.VERIFY_LINK_REPLY, verifyLinkMessage)
            .then(alreadyLinked => {
                Log.lvl2("sending pin request");
                return alreadyLinked.exists ?
                    Promise.resolve(ALREADY_LINKED) :
                    cothoritySocket.send(RequestPath.POP_PIN_REQUEST, RequestPath.STATUS_REQUEST, pinRequestMessage)
            })
            .then(response => {
                Log.lvl2("already linked:", response === ALREADY_LINKED);
                return {
                    alreadyLinked: response === ALREADY_LINKED
                };
            })
            .catch(error => {
                Log.catch(error, "link error");
                if (error.message === CothorityMessages.READ_PIN_ERROR) {
                    return Promise.resolve(error.message)
                }
                return Promise.reject(error);
            });
    }

    addDarc(darc){
      this._darcs.push(darc);
      this.saveDarcs();
    }

    removeDarc(baseID){
        Log.print("removing darc : " + baseID);
        for (i = this._darcs.length - 1; i >= 0 ; i--) {
          if (this._darcs[i]._baseID == baseID) {
            Log.print("confirming rm darc : " + this._darcs[i]._baseID);
            this._darcs.splice(i, 1);
          }
        }
        this.saveDarcs();
    }

    loadDarcs(){
      return FileIO.getStringOf(FilePaths.DARCS)
          .then(jsonDarcs => {
              if (jsonDarcs.length > 0) {
                  return JSON.parse(jsonDarcs);
              } else {
                  return [];
              }
          })
          .then(darcs => {
              var tab = [];
              for (var i = 0 ; i < darcs.length ; i++) {
                  tab.push(Darc.createDarcFromJSON(darcs[i]));
              }
              return tab;
          });

    }

    saveDarcs(){
      let toWrite = "";
      if (this._darcs.length > 0) {
          try {
              toWrite = JSON.stringify(this._darcs.map(d => d.adaptForJSON()));
          } catch(e){
              Log.catch(e, "cannot convert");
          }
      }
      Log.print("writing darcs:", toWrite);

      return FileIO.writeStringTo(FilePaths.DARCS, toWrite)
          .catch((error) => {
              Log.rcatch(error, "error while setting darcs:");
          })
          .then(() => {
              Log.print("saved darcs to:", FilePaths.DARCS);
          });
    }

    getDarcs(){
        return this.loadDarcs().then(tab => {
          this._darcs = tab;
          return this._darcs;
        }).catch(err => Log.print(err));
    }

    saveBCConfig(){
      let toWrite = "";
      if (this._config != null) {
          try {
              toWrite = JSON.stringify(this._config);
          } catch(e){
              Log.catch(e, "cannot convert");
          }
      }
      Log.print("writing bcconfig:", toWrite);

      return FileIO.writeStringTo(FilePaths.BCCONFIG, toWrite)
          .catch((error) => {
              Log.rcatch(error, "error while setting bcconfig:");
          })
          .then(() => {
              Log.print("saved config to:", FilePaths.BCCONFIG);
          });
    }

    loadBCConfig(){
      return FileIO.getStringOf(FilePaths.BCCONFIG)
          .then(json => {
              if (json.length > 0) {
                  return JSON.parse(json);
              } else {
                  return [];
              }
          })
          .then(elems => {
              if (elems.length == 0) return null;
              else return new Config(elems._blockInterval, elems._roster);
          });
    }

    getBCConfig(){
      return this.loadBCConfig().then(cfg => {
        this._config = cfg;
        return this._config;
      }).catch(err => Log.print(err));
    }
}

/**
 * Now we create a singleton object for the User.
 */

module.exports = new User();
