require("nativescript-nodeify");
const FileSystem = require("tns-core-modules/file-system");
const Documents = FileSystem.knownFolders.documents();
const OmniLedger = require("@dedis/cothority").omniledger;
const Kyber = require("@dedis/kyber-js");
const CurveEd25519 = new Kyber.curve.edwards25519.Curve;
const Schnorr = Kyber.sign.schnorr;
const Cothority = require("@dedis/cothority");

const FilePaths = require("../../../file-io/files-path");
const FileIO = require("../../../file-io/file-io");
const Convert = require("../../Convert");
const Log = require("../../Log");
const RequestPath = require("../../network/RequestPath");
const DecodeType = require("../../network/DecodeType");
const Net = require("../../network/NSNet");
const Configuration = require('./Configuration');
const FinalStatement = require('./FinalStatement');
const KeyPair = require('../../KeyPair');

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
const STATE_FINALIZING = 3;
const STATE_FINALIZED = 4;
const STATE_TOKEN = 5;

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
        // If previous is not null, then it points to the id of the previous party
        // that must be finalized. This will mean that this party will use the same
        // public key as the previous party and only be shown once in the token
        // list.
        this._previous = null;
        // linkedConode can be null in the case of an attendee. For an
        // organizer, it will point to the conode where the public key
        // of the User-class is stored.
        this._linkedConode = null;
    }

    /**
     * Adds the current wallet to the list.
     */
    addToList() {
        List[this._config.hashStr()] = this;
    }

    /**
     * @returns {number} the current state of the wallet.
     */
    state() {
        if (this._token != null) {
            return STATE_TOKEN;
        }
        if (this._finalStatement != null) {
            if (this._finalStatement.signature !== null &&
                this._finalStatement.signature !== undefined &&
                this._finalStatement.signature.length > 0) {
                return STATE_FINALIZED;
            }
            return STATE_PUBLISH;
        }
        return STATE_CONFIG;
    }

    stateStr() {
        return ["Configurating",
            "Published",
            "Finalizing",
            "Finalized",
            "Token"][this.state() - 1]
    }

    /**
     * Saves this wallet to disk.
     * @return {Promise<Wallet>} the saved wallet.
     */
    save() {
        if (this.state() <= STATE_CONFIG) {
            Log.lvl2("not storing configurations on disk");
            return Promise.reject("no configurations are stored");
        }

        let infos = {
            name: this._config.name,
            datetime: this._config.datetime,
            location: this._config.location,
            roster: Convert.rosterToJson(this._config.roster),
            pubKey: this._keypair.public.marshalBinary(),
            privKey: this._keypair.private.marshalBinary(),
            balance: this._balance,
        };
        if (this._finalStatement != null) {
            infos.attendees = this._finalStatement.attendees.map(a => {
                return a.marshalBinary();
            });
            Log.lvl2("attendees to save are:", infos.attendees);
            infos.signature = this._finalStatement.signature;
        }
        if (this._omniledgerID != null) {
            infos.omniledgerID = this._omniledgerID;
        }
        if (this._partyInstanceId != null) {
            infos.partyInstanceId = this._partyInstanceId;
        }
        if (this._linkedConode != null) {
            Log.lvl2("saving linked conode:", this._linkedConode);
            infos.linkedConode = Convert.serverIdentityToJson(this._linkedConode)
        }

        const toWrite = Convert.objectToJson(infos);
        return FileIO.writeStringTo(this.filePath(), toWrite)
            .then(() => {
                Log.lvl1("saved file to: " + this.filePath());
                return this;
            })
            .catch(error => {
                Log.rcatch(error, "error while saving wallet:");
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
                Log.lvl2(this._finalStatement);
                return Promise.reject("cannot update configuration from network");
            case STATE_PUBLISH:
                return this.getPartyInstance(true)
                    .then(pi => {
                        this._partyInstance = pi;
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
    remove() {
        delete List[this._config.hashStr()];
        return FileIO.rmrf(FileIO.join(FilePaths.WALLET_PATH,
            "wallet_" + this._config.hashStr()));
    }

    /**
     * Publish will send the party to the pop-service and freeze it. Other organizers can then also
     * get the party.
     */
    publish(privateKey) {
        if (this.state() != STATE_CONFIG) {
            throw new Error("can only publish a wallet in configuration state");
        }
        if (!this.linkedConode) {
            throw new Error("don't have a linked conode yet.")
        }

        const descHash = this.config.hash();
        const signature = Schnorr.sign(CurveEd25519, privateKey, descHash);

        const cothoritySocket = new Net.Socket(Convert.tlsToWebsocket(this._linkedConode, ""), RequestPath.POP);

        const storeConfigMessage = {
            desc: this.config.getDesc(),
            signature: signature
        }

        Log.lvl3("Signature length = " + signature.length);

        return cothoritySocket.send(RequestPath.POP_STORE_CONFIG, DecodeType.STORE_CONFIG_REPLY, storeConfigMessage)
            .catch(err => {
                Log.rcatch(err, "error while sending:");
            })
            .then(response => {
                if (Convert.byteArrayToBase64(response.id) === Convert.byteArrayToBase64(descHash)) {
                    Log.lvl2("Successfully stored config");
                    this._finalStatement = new FinalStatement(this._config,
                        [this._keypair.public], null);
                    return this.storeAttendees();
                } else {
                    Log.error("different hash");
                    return Promise.reject("hash was different");
                }
            })
            .then(() => {
                Log.lvl1("stored organizer's key");
                return this.save();
            })
            .then(() => {
                return Promise.resolve(descHash);
            })
    }

    /**
     * Finalize will store all the attendees in the final statement of the party.
     */
    finalize() {
        if (this.attendees == null || this.attendees.length == 0) {
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

        const cothoritySocketOl = new Net.RosterSocket(this.config.roster, RequestPath.OMNILEDGER);
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
        console.dir("config-id is:", this.config.id);
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
     * Stores the attendees public keys in the pop-service. Sends it to the address given in this._linkedConode.
     * @param pub
     */
    storeAttendees() {
        Log.lvl2("storing organizer in:", this._linkedConode.tcpAddr);
        const cothoritySocketPop = new Net.Socket(Convert.tlsToWebsocket(this._linkedConode, ""), RequestPath.POP);
        const message = {
            id: this.config.hash(),
            keys: this._finalStatement.attendees.map(att => {
                return att.marshalBinary()
            }),
            signature: [],
        };
        return cothoritySocketPop.send(RequestPath.POP_STORE_KEYS, RequestPath.POP_STORE_KEYS_REPLY, message);
    }

    /**
     * Fetches the organizer's keys from the services. Each organizer should have sent his keys to its conode.
     * @returns {Promise<Array | never>} a promise with the loaded pubKeys from the organizer
     */
    fetchAttendees() {
        // Loop over all nodes from the roster and put together all public keys.
        let pubKeys = [];
        console.log("0");
        let roster = this.config.roster;
        console.log("1");
        Log.lvl2("roster identities:", roster.identities);
        return Promise.all(
            roster.identities.map(server => {
                console.log("2");
                Log.lvl2("contacting server", server.tcpAddr);
                const cothoritySocketPop = new Net.Socket(Convert.tlsToWebsocket(server, ""), RequestPath.POP);
                const message = {
                    id: this.config.hash(),
                };
                return cothoritySocketPop.send(RequestPath.POP_GET_KEYS, RequestPath.POP_GET_KEYS_REPLY, message)
                    .catch(err => {
                        Log.catch(err, "couldn't contact server", server.tcpAddr);
                    });
            })
        ).then(replies => {
            Log.lvl2("Got replies:", replies);
            replies.forEach(reply => {
                if (reply && reply.keys) {
                    Log.lvl2("adding other key:", reply.keys);
                    reply.keys.forEach(key=>{
                        let pub = CurveEd25519.point();
                        pub.unmarshalBinary(key);
                        pubKeys.push(pub);
                    })
                }
            })
            this.attendeesAdd(pubKeys);
            return pubKeys;
        }).catch(err => {
            Log.rcatch(err, "couldn't contact all servers for key-updates:");
        })
    }

    /**
     * Loads all wallets from disk and does eventual conversion from older formats to new formats.
     * @return {Promise<{}>}
     */
    static loadAll() {
        // Only loading if not done yet.
        if (Object.keys(List).length == 0) {
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
        Log.print("test");
        let fileNames = [];
        Log.print("test");
        FileIO.forEachFolderElement(FilePaths.WALLET_PATH, function (partyFolder) {
            Log.print("test");
            if (partyFolder.name.startsWith("wallet_")) {
                Log.lvl2("found wallet-dir: ", partyFolder.name);
                fileNames.push(FileIO.join(FilePaths.WALLET_PATH, partyFolder.name, FilePaths.WALLET_FINAL));
            }
        });
        Log.print("test");
        return Promise.all(
            fileNames.map(fileName => {
                Log.lvl2("reading wallet from: " + fileName);
                return this.loadFromFile(fileName);
            })
        ).then(() => {
            return List;
        })
    }

    static loadFromFile(fileName) {
        function o2u(obj) {
            return new Uint8Array(Object.values(obj));
        }

        return FileIO.getStringOf(fileName)
            .then(file => {
                let object = Convert.jsonToObject(file);
                Log.lvl3("converting file to wallet:", file);
                let r = Convert.parseJsonRoster(object.roster);
                let config = new Configuration(object.name, object.datetime, object.location, r);
                let wallet = new Wallet(config);
                wallet._keypair = new KeyPair(o2u(object.privKey), o2u(object.pubKey));
                if (object.balance) {
                    wallet._balance = parseInt(object.balance);
                }
                if (object.attendees) {
                    Log.lvl2("found attendees");
                    let atts = object.attendees.map(att => {
                        let pub = CurveEd25519.point();
                        pub.unmarshalBinary(o2u(att));
                        return pub;
                    })
                    wallet._finalStatement = new FinalStatement(config, atts, null);
                }
                if (object.signature) {
                    Log.lvl2("found signature");
                    wallet._finalStatement.signature = o2u(object.signature);
                }
                if (object.omniledgerID) {
                    wallet._omniledgerID = o2u(object.omniledgerID);
                }
                if (object.partyInstanceId != null) {
                    wallet._partyInstanceId = o2u(object.partyInstanceId);
                }
                if (object.linkedConode != null) {
                    Log.lvl2("loading linkedconode", object.linkedConode.address);
                    wallet._linkedConode = Convert.parseJsonServerIdentity(object.linkedConode);
                }
                wallet.addToList();
                Log.lvl1("loaded wallet:", wallet.config.name);
                return wallet;
            })
            .catch(err => {
                Log.catch(err, "couldn't load file");
            })
    }

    /**
     * Sets the attendees, creating a final statement, if needed.
     * @param a the list of attendees
     */
    set attendees(a) {
        if (this.state() >= STATE_FINALIZED) {
            throw new Error("Cannot add attendees to a finalized party");
        }
        if (this._finalStatement == null) {
            this._finalStatement = new FinalStatement(this._config, a, null);
        } else {
            this._finalStatement.attendees = a;
        }
    }

    /**
     * Adds a list of attendees if they are not there yet.
     * @param atts the list of attendees
     */
    attendeesAdd(atts) {
        if (this._finalStatement == null) {
            this.attendees = atts;
        } else {
            atts.forEach(att => {
                if (!(att instanceof Kyber.Point)) {
                    Log.error("got non-kyber.Point attendee");
                } else {
                    let found = false;
                    this.attendees.forEach(a => {
                        if (a.equal(att)) {
                            found = true;
                        }
                    });
                    if (!found) {
                        this._finalStatement.attendees.push(att);
                    }
                }
            })
        }
    }

    set signature(s) {
        if (this.state() != STATE_PUBLISH) {
            throw new Error("Can only add signature once the party is published.");
        }
    }

    /**
     * @param conode {Conode}
     */
    set linkedConode(conode) {
        this._linkedConode = conode;
    }

    /**
     * @returns {Point[]}
     */
    get attendees() {
        if (this._finalStatement != null &&
            this._finalStatement.attendees != undefined) {
            return this._finalStatement.attendees.slice();
        } else {
            return [];
        }
    }

    /**
     * @returns {Conode}
     */
    get linkedConode() {
        return this._linkedConode;
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
                Log.lvl2("converting party-config to wallet: " + fileName);
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
            Log.lvl2("deleting all old folders");
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
            Log.error("couldn't read files: " + err);
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
        Log.lvl2("Getting party from omniledger:", partyId, omniledgerId);
        const message = {
            partyid: Convert.hexToByteArray(partyId)
        };
        let instanceIdBuffer = undefined;

        return cothoritySocketPop.send(RequestPath.POP_GET_INSTANCE_ID, RequestPath.POP_GET_INSTANCE_ID_REPLY, message)
            .then(reply => {
                // Log.lvl2("got reply", reply);
                instanceIdBuffer = reply.instanceid;
                const cothoritySocketOl = new Net.Socket(Convert.tlsToWebsocket(address, ""), RequestPath.OMNILEDGER);
                return OmniLedger.OmniledgerRPC.fromKnownConfiguration(cothoritySocketOl, Convert.hexToByteArray(omniledgerId));
            })
            .then(ol => {
                // Log.lvl2("got omniledger");
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
module.exports.STATE_FINALIZING = STATE_FINALIZING;
module.exports.STATE_FINALIZED = STATE_FINALIZED;
module.exports.STATE_TOKEN = STATE_TOKEN;