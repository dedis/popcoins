require("nativescript-nodeify");
const ObservableModule = require("data/observable");
const Kyber = require("@dedis/kyber-js");
const CurveEd25519 = new Kyber.curve.edwards25519.Curve;

const Net = require("../../network/NSNet");
const Roster = require("../../../../cothority/lib/identity").Roster;
const ServerIdentity = require("../../../../cothority/lib/identity").ServerIdentity;
const FileIO = require("../../../file-io/file-io");
const FilePaths = require("../../../file-io/files-path");
const Package = require("../../Package");
const Convert = require("../../Convert");
const Log = require("../../Log");
const ObjectType = require("../../ObjectType");
const Helper = require("../../Helper");
const Crypto = require("../../Crypto");
const RequestPath = require("../../network/RequestPath");
const DecodeType = require("../../network/DecodeType");
const CothorityMessages = require("../../network/cothority-messages");
const KeyPair = require('../../KeyPair');

/**
 * This singleton is the user of the app. It contains everything needed that is general, app-wide or does not belong to any precise subpart.
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
                    Log.lvl1("Creating test identities");
                    return Promise.all(RequestPath.DEDIS_CONODES.map(address => {
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
            return Promise.resolve(this._keypair);
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
