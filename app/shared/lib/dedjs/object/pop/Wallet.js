const FilePaths = require("../../../../res/files/files-path");
const FileIO = require("../../../file-io/file-io");
const Convert = require("../../Convert");
const FileSystem = require("tns-core-modules/file-system");
const Documents = FileSystem.knownFolders.documents();
// const Net = require("@dedis/cothority").net;
const RequestPath = require("../../network/RequestPath");
const Net = require("../../network/NSNet");
const OmniLedger = require("@dedis/cothority").omniledger;
const Crypto = require('crypto-browserify');
const Configuration = require('./Configuration');
const KeyPair = require('./KeyPair');

/**
 * Wallet holds one or more configurations, final statements, and keypairs and lets the user and the organizer
 * use them.
 *
 * TODO: add more than one configuration.
 */

// List is all the Wallets that have been loaded from disk.
let List = {};

const STATE_CONFIG = 1;
const STATE_PUBLISH = 2;
const STATE_FINALIZED = 3;
const STATE_TOKEN = 4;

class Wallet {
    /**
     * The constructor creates the basic wallet element given a configuration. It will create a random keypair and
     * is ready to be promoted to a published, then finalized and tokenized wallet.
     *
     * @param config
     * @return {Promise<Wallet>}
     */
    constructor(config) {
        this._config = config;
        this._keypair = new KeyPair();
        this._finalStatement = null;
        this._token = null;
        this._omniledgerID = null;
        this._omniledgerRPC = null;
        this._partyInstanceId = null;
        this._partyInstance = null;
        this._coinInstance = null;
        this._balance = -1;
    }

    /**
     * @returns {number} the current state of the wallet.
     */
    state() {
        if (this._token != null) {
            return STATE_TOKEN;
        }
        if (this._finalStatement != null) {
            if (this._finalStatement.signature !== undefined && this._finalStatement.signatre.length > 0) {
                return STATE_FINALIZED;
            }
            return STATE_PUBLISH;
        }
        return STATE_CONFIG;
    }

    /**
     * Saves this wallet to disk.
     * @return {Promise<Wallet>} the saved wallet.
     */
    save() {
        // Do saving to disk
        if (!this._addedLoaded) {
            console.log("saving wallet:" + this.filePath());
            this._addedLoaded = true;
            List[this._config.hashStr()] = this;
        }

        const infos = {
            name: this._config.name,
            datetime: this._config.datetime,
            location: this._config.location,
            roster: this._config.roster,
            pubKey: this._keypair.public,
            privKey: this._keypair.private,
            balance: this._balance
        };
        if (this._finalStatement != null) {
            infos.attendees = this._finalStatement.attendees;
            infos.signatre = this._finalStatement.signature;
        }
        if (this._omniledgerID != null) {
            infos.omniledgerID = this._omniledgerID;
        }
        if (this._partyInstanceId != null) {
            infos.partyInstanceId = this._partyInstanceId;
        }

        const toWrite = Convert.objectToJson(infos);
        return FileIO.writeStringTo(this.filePath(), toWrite)
            .then(() => {
                console.log("saved file to: " + this.filePath());
                return this;
            })
            .catch(error => {
                console.dir("error while saving wallet:", error);
                return Promise.reject(error);
            })
    }

    filePath() {
        return FileIO.join(FilePaths.WALLET_PATH,
            "wallet_" + this._config.hashStr(), FilePaths.WALLET_FINAL);
    }

    /**
     * If the state of the wallet is < STATE_TOKEN, it tries to update it through the net to get STATE_TOKEN.
     * If it is STATE_TOKEN, the wallet tries to update the coin amount.
     * @returns {Promise<number>}
     */
    update() {
        switch (this.state()) {
            case STATE_CONFIG:
                return this.getPartyInstance()
                    .then(pi => {
                        this._finalStatement = pi.finalStatement;
                        return update();
                    });
            case STATE_PUBLISH:
                return this.getPartyInstance(true)
                    .then(pi => {
                        this._finalStatement = pi.finalStatement;
                        if (this.state() != STATE_PUBLISH) {
                            return this.update();
                        }
                        return STATE_PUBLISH;
                    });
            case STATE_FINALIZED:
                this._token = new Token(this._finalStatement, this._keypair);
                return this.update();
            case STATE_TOKEN:
                return this.getCoinInstance(true)
                    .then(ci => {
                        this._balance = ci.balance;
                        return STATE_TOKEN;
                    });
            default:
                throw new Error("Wallet is in unknown state");
        }
    }

    /**
     * Remove will delete the party from the list of available parties.
     */
    remove(){
        return FileIO.rmrf(this.filePath());
    }

    /**
     * Publish will send the party to the pop-service and freeze it. Other organizers can then also
     * get the party.
     */
    publish(){
        return Promise.resolve()
    }

    /**
     * Finalize will store all the attendees in the final statement of the party.
     */
    finalize(){
        if (this.attendees == null || this.attendees.length == 0){
            throw new Error("Cannot finalize a party without attendees!");
        }
        return Promise.resolve()
    }

    /**
     * Creates an omniledgerRPC that can be used to access the party and the coin instance.
     * @returns {OmniledgerRPC}
     */
    get omniledgerRPC() {
        if (this._omniledgerRPC != null) {
            return this.omniledgerRPC;
        }
        if (this._omniledgerID == null) {
            throw new Error("don't have omniledgerID");
        }

        const cothoritySocketOl = new Net.RosterSocket(this._config.roster, RequestPath.OMNILEDGER);
        this._omniledgerRPC = OmniLedger.OmniledgerRPC.fromKnownConfiguration(cothoritySocketOl, this._omniledgerID);
        return this._omniledgerRPC;
    }

    /**
     * @returns {Promise<PartyInstanceID>}
     */
    getPartyInstanceId() {
        if (this._partyInstanceId != null) {
            return Promis.resolve(this._partyInstanceId);
        }
        const cothoritySocketPop = new Net.RosterSocket(this.config.roster, RequestPath.POP);
        const message = {
            partyid: this.config.id
        };
        return cothoritySocketPop.send(RequestPath.POP_GET_INSTANCE_ID, RequestPath.POP_GET_INSTANCE_ID_REPLY, message)
            .then(reply => {
                this._partyInstanceId = reply.instanceid;
                return this._partyInstanceId;
            });
    }

    /**
     * Creates and returns a poppartyinstance that can be connected to the network. As it eventually requires to ask
     * the pop-service for the party instance ID, it might need the network.
     * @param update if defined, will update the party instance
     * @returns {Promise<PartyInstance>}
     */
    getPartyInstance(update) {
        if (this._partyInstance != null || update !== undefined) {
            return Promise.resolve(this._partyInstance);
        }
        return this.getPartyInstanceId().then(piid => {
            this._partyInstance = OmniLedger.contracts.PopPartyInstance.fromInstanceId(this.omniledgerRPC, piid);
            return this._partyInstance;
        })
    }

    /**
     * Creates and returns a coin instance that can be connected to the network.
     * @param update if defined, will update the party instance
     * @returns {Promise<CoinInstance>}
     */
    getCoinInstance(update) {
        if (this._coinInstance != null || update !== undefined) {
            return Promise.resolve(this._coinInstance);
        }
        return this.getPartyInstance().then(pi => {
            let coinIID = pi.getAccountInstanceId(this._keypair.public);
            this._coinInstance = OmniLedger.contracts.CoinInstance.fromInstanceId(this._omniledgerRPC, coinIID);
            return this._coinInstance;
        })
    }

    /**
     * Loads all wallets from disk and does eventual conversion from older formats to new formats.
     * @return {Promise<{}>}
     */
    static loadAll() {
        // Only loading if not done yet.
        if (List.length == 0) {
            // Start with compatibility test
            return MigrateFrom.version0()
                .then(() => {
                    return this.loadNewVersions()
                })
        }
        return Promise.resolve(List);
    }

    /**
     * @returns {Promise<Wallet[]>} of all wallets stored
     */
    static loadNewVersions() {
        let fileNames = [];
        FileIO.forEachFolderElement(FilePaths.WALLET_PATH, function (partyFolder) {
            if (partyFolder.name.startsWith("wallet_")) {
                console.log("found wallet-dir: ", partyFolder.name);
                fileNames.push(FileIO.join(FilePaths.WALLET_PATH, partyFolder.name, FilePaths.WALLET_FINAL));
            }
        });
        return Promise.all(
            fileNames.map(fileName => {
                console.log("reading wallet from: " + fileName);
                return this.loadFromFile(fileName);
            })
        )
    }

    static loadFromFile(fileName) {
        return FileIO.getStringOf(fileName)
            .then(file => {
                // console.log("file is:", file);
                let object = Convert.jsonToObject(file);
                // console.dir("converting file to wallet:", object);
                let config = new Configuration(object.name, object.datetime, object.location, object.roster);
                let wallet = new Wallet(config);
                List[config.hashStr()] = wallet;
                return wallet;
            })
    }

    set attendees(a) {
        if (this.state >= STATE_FINALIZED) {
            throw new Error("Cannot add attendees to a finalized party");
        }
        if (this._finalStatement == null) {
            this._finalStatement = new FinalStatement(this._config, a, null);
        } else {
            this._finalStatement.attendees = a;
        }
    }

    set signature(s) {
        if (this.state != STATE_PUBLISH) {
            throw new Error("Can only add signature once the party is published.");
        }
    }

    /**
     * @returns {Configuration}
     */
    get config() {
        return this._config;
    }

    /**
     * @returns {KeyPair}
     */
    get keypair() {
        return this._keypair;
    }

    /**
     * @returns {FinalStatement}
     */
    get finalStatement() {
        return this._finalStatement;
    }

    /**
     * @returns {Token}
     */
    get token() {
        return this._token;
    }

    /**
     * @returns {number}
     */
    get balance() {
        return this._balance;
    }
}

/**
 * How to migrate from version 0 of the wallets, which were only configuration
 *
 */
class MigrateFrom {
    /**
     * Loads all old configs, converts them to wallets, and deletes them.
     * @returns {Promise<Wallet[] | never>}
     */
    static version0() {
        // Get all filenames for the old structures and the keypairs
        let attInfos = [];
        let keyPairs = [];
        FileIO.forEachFolderElement(FilePaths.POP_ATT_PATH, function (partyFolder) {
            attInfos.push(FileIO.join(FilePaths.POP_ATT_PATH, partyFolder.name, FilePaths.POP_ATT_INFOS));
            keyPairs.push(FileIO.join(FilePaths.POP_ATT_PATH, partyFolder.name, FilePaths.KEY_PAIR));
        });

        return Promise.all(
            // Read in the old Attendee structures
            attInfos.map(fileName => {
                console.log("converting party-config to wallet: " + fileName);
                return FileIO.getStringOf(fileName);
            })
        ).then(files => {
            // Convert all files to wallets
            return Promise.all(
                files.map(file => {
                    let object = Convert.jsonToObject(file);
                    return this.conodeGetWallet(object.address, object.omniledgerId, object.id);
                })
            );
        }).then(wallets => {
            // Read in keypairs and store them in the wallet
            return Promise.all(
                keyPairs.map(keyFile => {
                    return KeyPair.fromFileBase64(keyFile);
                })
            ).then(keyPairs => {
                return keyPairs.map((keyPair, idx) => {
                    wallets[idx]._keypair = keyPair;
                    return wallets[idx];
                })
            })
        }).then(wallets => {
            // Save the wallets
            return Promise.all(
                wallets.map(wallet => {
                    return wallet.save();
                })
            )
        }).then(wallets => {
            // And if all wallets are correctly saved, delete the old data.
            console.log("deleting all old folders");
            let fileNames = [];
            FileIO.forEachFolderElement(FilePaths.POP_ATT_PATH, function (partyFolder) {
                fileNames.push(FileIO.join(FilePaths.POP_ATT_PATH, partyFolder.name, FilePaths.POP_ATT_INFOS))
            });
            return Promise.all(
                fileNames.map(fileName => {
                    return Documents.getFile(fileName).remove();
                })
            ).then(() => {
                return wallets;
            })
        }).catch(err => {
            console.log("couldn't read files: " + err);
            console.log("couldn't read files: " + err);
            return [];
        })
    }

    /**
     * Gets a party configuration from a conode. This is necessary when migrating old versions.
     * @param address
     * @param omniledgerId
     * @param partyId
     * @returns {Promise<Wallet>}
     */
    static conodeGetWallet(address, omniledgerId, partyId) {
        const cothoritySocketPop = new Net.Socket(Convert.tlsToWebsocket(address, ""), RequestPath.POP);
        console.log("Getting party from omniledger:", partyId, omniledgerId);
        const message = {
            partyid: Convert.hexToByteArray(partyId)
        };
        let instanceIdBuffer = undefined;

        return cothoritySocketPop.send(RequestPath.POP_GET_INSTANCE_ID, RequestPath.POP_GET_INSTANCE_ID_REPLY, message)
            .then(reply => {
                // console.log("got reply", reply);
                instanceIdBuffer = reply.instanceid;
                const cothoritySocketOl = new Net.Socket(Convert.tlsToWebsocket(address, ""), RequestPath.OMNILEDGER);
                return OmniLedger.OmniledgerRPC.fromKnownConfiguration(cothoritySocketOl, Convert.hexToByteArray(omniledgerId));
            })
            .then(ol => {
                // console.log("got omniledger");
                return OmniLedger.contracts.PopPartyInstance.fromInstanceId(ol, instanceIdBuffer)
            })
            .then(inst => {
                // console.dir("got poppartyinstance", inst);
                let config = Configuration.fromPopPartyInstance(inst);
                let wallet = new Wallet(config);
                if (inst.attendees !== undefined && inst.attendees.length > 0) {
                    let fs = new FinalStatement(config, inst.attendees, inst.signature);
                    wallet._finalStatement = fs;
                }
                return wallet;
            })
    }
}

module.exports = Wallet;
module.exports.List = List;
module.exports.MigrateFrom = MigrateFrom;
module.exports.STATE_CONFIG = STATE_CONFIG;
module.exports.STATE_PUBLISH = STATE_PUBLISH;
module.exports.STATE_FINALIZED = STATE_FINALIZED;
module.exports.STATE_TOKEN = STATE_TOKEN;