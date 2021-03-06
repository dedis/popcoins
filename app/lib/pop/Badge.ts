require("nativescript-nodeify");
const FileSystem = require("tns-core-modules/file-system");
const Documents = FileSystem.knownFolders.documents();
const Kyber = require("@dedis/kyber-js");
const CurveEd25519 = new Kyber.curve.edwards25519.Curve;
const Schnorr = Kyber.sign.schnorr;
const HashJs = require("hash.js");
const OmniledgerRPC = require("../cothority/omniledger/OmniledgerRPC");
const Darc = require("../cothority/omniledger/darc");
import {Buffer} from "buffer/";
import * as Identity from "./../cothority/identity";
import * as Defaults from "../Defaults";

const PlatformModule = require("tns-core-modules/platform");
const ZXing = require("nativescript-zxing");
const QRGenerator = new ZXing();
// let ServerIdentity = Identity.ServerIdentity;

import CoinInstance = require("../cothority/omniledger/contracts/CoinInstance");
import PopPartyInstance = require("../cothority/omniledger/contracts/PopPartyInstance");

const FilePaths = require("../FilePaths");
const FileIO = require("../FileIO");
const Convert = require("../Convert");
const RequestPath = require("../network/RequestPath");
const DecodeType = require("../network/DecodeType");
import * as Net from "../network/NSNet";

const Token = require("./Token");
const FinalStatement = require("./FinalStatement");
const KeyPair = require("../crypto/KeyPair");

import {fromNativeSource, ImageSource} from "tns-core-modules/image-source";
import Log from "../Log";
import Configuration from "./Configuration";

export const STATE_CONFIG = 1;
export const STATE_PUBLISH = 2;
export const STATE_FINALIZING = 3;
export const STATE_FINALIZED = 4;
export const STATE_TOKEN = 5;

/**
 * Badge holds one or more configurations, final statements, and keypairs and lets the user and the organizer
 * use them.
 */
export class Badge {
    _config: Configuration;
    _keypair: any;
    _finalStatement: any;
    _token: any;
    _omniledgerID: any;
    _omniledgerRPC: any;
    _partyInstanceId: any;
    _partyInstance: any;
    _coinInstance: any;
    _balance: any;
    _previous: any;
    _linkedConode: any;

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
        this._omniledgerID = Convert.hexToByteArray(Defaults.OMNILEDGER_INSTANCE_ID);
        this._omniledgerRPC = null;
        this._partyInstanceId = null;
        this._partyInstance = null;
        this._coinInstance = null;
        this._balance = "n/a";
        // If previous is not null, then it points to the id of the previous party
        // that must be finalized. this will mean that this party will use the same
        // public key as the previous party and only be shown once in the token
        // list.
        this._previous = null;
        // linkedConode can be null in the case of an attendee. For an
        // organizer, it will point to the conode where the public key
        // of the User-class is stored.
        this._linkedConode = null;
    }

    /**
     * Creates an omniledgerRPC that can be used to access the party and the coin instance.
     * @returns {Promise<OmniledgerRPC>}
     */
    get omniledgerRPC() {
        if (this._omniledgerRPC != null) {
            return this._omniledgerRPC;
        }
        this._omniledgerID = Convert.hexToByteArray(Defaults.OMNILEDGER_INSTANCE_ID);
        if (this._omniledgerID == null) {
            throw new Error("don't have omniledgerID");
        }

        const cothoritySocketOl = new Net.RosterSocket(this.config.roster, RequestPath.OMNILEDGER);
        return OmniledgerRPC.fromKnownConfiguration(cothoritySocketOl, this._omniledgerID)
            .then((olRPC) => {
                this._omniledgerRPC = olRPC;
                return olRPC;
            });
    }

    /**
     * This returns the coin instance, if it is already created. It might be null!
     * @returns {null|CoinInstance}
     */
    get coinInstance() {
        return this._coinInstance;
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
     * @returns {ServerIdentity}
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

    /**
     * Loads all wallets from disk and does eventual conversion from older formats to new formats.
     * @return {Promise<Array<Badge>>}
     */
    static loadAll(): Promise<Array<Badge>> {
        // Only load from disk if not done yet.
        return Promise.resolve()
            .then(() => {
                return this.loadNewVersions();
            });
    }

    /**
     * Fetches upcoming parties from the network.
     *
     * @param wallets {Array<Badge>} eventually existing wallets.
     * @return {Promise<Configuration[]>} the possible new Configurations
     */
    static fetchUpcoming(wallets: Array<Badge>): Promise<Array<Configuration>> {
        let list: Array<Identity.ServerIdentity>;
        if (wallets.length > 0) {
            list = wallets[wallets.length - 1].config.roster.identities;
        } else {
            list = new Convert.parseTomlRoster(
                "[[servers]]\n" +
                "  Address = \"tls://gasser.blue:7770\"\n" +
                "  Public = \"HkDzpR5Imd7WNx8kl2lJcIVRVn8gfDByJnmlfrYh/zU=\"\n" +
                "  Description = \"Linus' conode\"\n" +
                "[[servers]]\n" +
                "  Address = \"tls://conode.dedis.ch:6879\"\n" +
                "  Public = \"HkDzpR5Imd7WNx8kl2lJcIVRVn8gfDByJnmlfrYh/zU=\"\n" +
                "  Description = \"DEDIS' conode\"\n").identities;
        }
        return Promise.resolve([]);
    }

    /**
     * @returns {Promise<Wallet[]>} of all wallets stored
     */
    static loadNewVersions(): Promise<Array<Badge>> {
        const fileNames = [];
        FileIO.forEachFolderElement(FilePaths.WALLET_PATH, function (partyFolder) {
            if (partyFolder.name.startsWith("wallet_")) {
                Log.lvl2("found wallet-dir: ", partyFolder.name);
                fileNames.push(FileIO.join(FilePaths.WALLET_PATH, partyFolder.name, FilePaths.WALLET_FINAL));
            }
        });
        return Promise.all(
            fileNames.map((fileName) => {
                Log.lvl2("reading wallet from: " + fileName);
                return this.loadFromFile(fileName);
            })
        ).then((parties) => {
            return parties.filter(p => {
                return p !== undefined
            });
        });
    }

    static loadFromFile(fileName) {
        function o2u(obj) {
            return new Uint8Array(Object.values(obj));
        }

        return FileIO.getStringOf(fileName)
            .then((file) => {
                const object = Convert.jsonToObject(file);
                Log.lvl3("converting file to wallet:", file);
                const r = Convert.parseJsonRoster(object.roster);
                const config = new Configuration(object.name, object.datetime, object.location, r);
                const wallet = new Badge(config);
                wallet._keypair = new KeyPair(o2u(object.privKey), o2u(object.pubKey));
                if (object.balance) {
                    wallet._balance = parseInt(object.balance);
                }
                if (object.attendees) {
                    Log.lvl2("found attendees");
                    const atts = object.attendees.map((att) => {
                        const pub = CurveEd25519.point();
                        pub.unmarshalBinary(o2u(att));
                        return pub;
                    });
                    wallet._finalStatement = new FinalStatement(config, atts, null);
                }
                if (object.signature) {
                    Log.lvl2("found signature");
                    wallet._finalStatement.signature = o2u(object.signature);
                    wallet._token = new Token(wallet._finalStatement, wallet.keypair);
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
                if (object.balance) {
                    wallet._balance = parseInt(object.balance);
                }
                Log.lvl1("loaded wallet:", wallet.config.name);
                return wallet;
            })
            .catch((err) => {
                Log.catch(err, "couldn't load file", fileName);
            });
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
                this._finalStatement.signature !== undefined) {
                if (this._finalStatement.signature.length > 1) {
                    return STATE_FINALIZED;
                }
                return STATE_FINALIZING;
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
            "Token"][this.state() - 1];
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

        const infos = {
            name: this._config.name,
            datetime: this._config.datetime,
            location: this._config.location,
            roster: Convert.rosterToJson(this._config.roster),
            pubKey: this._keypair.public.marshalBinary(),
            privKey: this._keypair.private.marshalBinary(),
            balance: this._balance,
            attendees: [],
            signature: null,
            omniledgerID: null,
            partyInstanceId: null,
            linkedConode: null
        };
        if (this._finalStatement != null) {
            infos.attendees = this._finalStatement.attendees.map((a) => {
                return a.marshalBinary();
            });
            Log.lvl3("attendees to save are:", infos.attendees);
            infos.signature = this._finalStatement.signature;
        }
        if (this._omniledgerID != null) {
            infos.omniledgerID = this._omniledgerID;
        }
        if (this._partyInstanceId != null) {
            infos.partyInstanceId = this._partyInstanceId;
        }
        if (this._linkedConode != null) {
            Log.lvl3("saving linked conode:", this._linkedConode);
            infos.linkedConode = Convert.serverIdentityToJson(this._linkedConode);
        }
        if (this._balance != "n/a") {
            infos.balance = "" + this._balance;
        }

        const toWrite = Convert.objectToJson(infos);
        return FileIO.writeStringTo(this.filePath(), toWrite)
            .then(() => {
                Log.lvl1("saved file to: " + this.filePath());
                return this;
            })
            .catch((error) => {
                Log.rcatch(error, "error while saving wallet:");
            });
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
            case STATE_FINALIZING:
                return this.getPartyInstance(true)
                    .then((pi) => {
                        if (pi.finalStatement.signature &&
                            pi.finalStatement.signature.length == 64) {
                            this.finalStatement.signature = pi.finalStatement.signature;
                        }
                        if (this.state() == STATE_FINALIZED) {
                            return this.save()
                                .then(() => {
                                    return this.update();
                                });
                        }
                        return STATE_PUBLISH;
                    });
            case STATE_FINALIZED:
                this._token = new Token(this._finalStatement, this._keypair);
                return this.update();
            case STATE_TOKEN:
                return this.getPartyInstance(true)
                    .then((pi) => {
                        this.finalStatement.attendees = pi.finalStatement.attendees.map((att) => {
                            let p = CurveEd25519.point();
                            p.unmarshalBinary(new Uint8Array(Object.values(att)));
                            return p;
                        });
                    })
                    .then(() => {
                        return this.getCoinInstance(true);
                    })
                    .then((ci) => {
                        this._balance = ci.balance;
                        return STATE_TOKEN;
                    });
            default:
                throw new Error("Badge is in unknown state");
        }
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
            throw new Error("don't have a linked conode yet.");
        }

        const descHash = this.config.hash();
        const signature = Schnorr.sign(CurveEd25519, privateKey, descHash);

        const cothoritySocket = new Net.Socket(Convert.tlsToWebsocket(this._linkedConode, ""), RequestPath.POP);

        const storeConfigMessage = {
            desc: this.config.getDesc(),
            signature
        };

        Log.lvl2("Signature length = " + signature.length);

        return cothoritySocket.send(RequestPath.POP_STORE_CONFIG, DecodeType.STORE_CONFIG_REPLY, storeConfigMessage)
            .catch((err) => {
                Log.rcatch(err, "error while sending:");
            })
            .then((response) => {
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
            });
    }

    /**
     * Registers the attendees to the PoP-Party stored on the linked conode, this finalizes the party.
     * @returns {Promise<int>} - a promise that gets completed once the attendees have been registered
     * and the party finalized. The Promise conatins the updated state of the party.
     */
    finalize(privKey) {
        const descId = Uint8Array.from(this.config.hash());
        if (descId.length === 0) {
            throw new Error("organizer should first register the config on his conode");
        }

        const attendees = this.attendees.slice();
        if (attendees.length === 0) {
            throw new Error("no attendee to register");
        }

        let hashToSign = HashJs.sha256();

        hashToSign.update(descId);
        attendees.forEach((attendee) => {
            hashToSign.update(attendee.marshalBinary());
        });

        hashToSign = new Uint8Array(hashToSign.digest());
        const signature = Schnorr.sign(CurveEd25519, privKey, hashToSign);
        const cothoritySocket = new Net.Socket(Convert.tlsToWebsocket(this.linkedConode, ""), RequestPath.POP);

        const finalizeRequestMessage = {
            descid: descId,
            attendees: attendees.map((att) => {
                return att.marshalBinary();
            }),
            signature
        };

        return cothoritySocket.send(RequestPath.POP_FINALIZE_REQUEST, DecodeType.FINALIZE_RESPONSE, finalizeRequestMessage)
            .then((finalStatement) => {
                if (finalStatement.signature && finalStatement.signature.length == 64) {
                    // If the signature is complete, copy it to the final statement.
                    this._finalStatement.signature = finalStatement.signature;
                    return STATE_FINALIZED;
                }
            })
            .catch((error) => {
                if (error.message !== undefined && error.message.includes("Not all other conodes finalized yet")) {
                    // Create a signature with length 1 to indicate we're finalizing.
                    this._finalStatement.signature = [0];
                    return STATE_FINALIZING;
                }
                Log.rcatch(error, "couldn't finalize");
            });
    }

    /**
     * @returns {Promise<PartyInstanceID>}
     */
    getPartyInstanceId() {
        if (this._partyInstanceId != null) {
            return Promise.resolve(this._partyInstanceId);
        }
        const cothoritySocketPop = new Net.RosterSocket(this.config.roster, RequestPath.POP);
        const message = {
            partyid: this.config.hash(),
            omniledgerID: Convert.hexToByteArray(Defaults.OMNILEDGER_INSTANCE_ID)
        };
        return cothoritySocketPop.send(RequestPath.POP_GET_INSTANCE_ID, RequestPath.POP_GET_INSTANCE_ID_REPLY, message)
            .then((reply) => {
                this._partyInstanceId = reply.instanceid;
                return this._partyInstanceId;
            });
    }

    /**
     * Creates and returns a poppartyinstance that can be connected to the network. As it eventually requires to ask
     * the pop-service for the party instance ID, it might need the network.
     * @param update if defined, will update the party instance
     * @returns {PopPartyInstance}
     */
    getPartyInstance(update: boolean = false): PopPartyInstance {
        return Promise.resolve()
            .then(() => {
                if (this._partyInstance == null) {
                    return this.getPartyInstanceId()
                        .then((piid) => {
                            return this.omniledgerRPC
                                .then((olRPC) => {
                                    return PopPartyInstance.fromInstanceId(olRPC, piid);
                                })
                                .then((ppi) => {
                                    this._partyInstance = ppi;
                                });
                        });
                }
            })
            .then(() => {
                if (update) {
                    return this._partyInstance.update();
                }
                return this._partyInstance;
            })
            .then((ppi) => {
                return ppi;
            });
    }

    /**
     * Creates and returns a coin instance that can be connected to the network.
     * @param update if defined, will update the party instance
     * @returns {Promise<CoinInstance>}
     */
    getCoinInstance(update: boolean = false): CoinInstance {
        return Promise.resolve()
            .then(() => {
                if (this._coinInstance == null) {
                    return this.getPartyInstance()
                        .then((pi) => {
                            const coinIID = pi.getAccountInstanceId(this._keypair.public.marshalBinary());
                            return CoinInstance.fromInstanceId(this._omniledgerRPC, coinIID);
                        })
                        .then((ci) => {
                            this._coinInstance = ci;
                        });
                }
            })
            .then(() => {
                return this._coinInstance.update();
            })
            .then((ci) => {
                this._balance = this._coinInstance.balance;
                this.save();
                return ci;
            })
            .catch((err) => {
                Log.rcatch(err, "couldn't get coin instance");
            });
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
            keys: this._finalStatement.attendees.map((att) => {
                return att.marshalBinary();
            }),
            signature: []
        };
        return cothoritySocketPop.send(RequestPath.POP_STORE_KEYS, RequestPath.POP_STORE_KEYS_REPLY, message);
    }

    /**
     * Fetches the organizer's keys from the services. Each organizer should have sent his keys to its conode.
     * @returns {Promise<Array | never>} a promise with the loaded pubKeys from the organizer
     */
    fetchAttendees() {
        // Loop over all nodes from the roster and put together all public keys.
        const pubKeys = [];
        const roster = this.config.roster;
        Log.lvl2("roster identities:", roster.identities);
        return Promise.all(
            roster.identities.map((server) => {
                Log.lvl2("contacting server", server.tcpAddr);
                const cothoritySocketPop = new Net.Socket(Convert.tlsToWebsocket(server, ""), RequestPath.POP);
                const message = {
                    id: this.config.hash()
                };
                return cothoritySocketPop.send(RequestPath.POP_GET_KEYS, RequestPath.POP_GET_KEYS_REPLY, message)
                    .catch((err) => {
                        Log.catch(err, "couldn't contact server", server.tcpAddr);
                    });
            })
        ).then((replies) => {
            Log.lvl3("Got replies:", replies);
            replies.forEach((reply: any) => {
                if (reply && reply.keys) {
                    Log.lvl3("adding other key:", reply.keys);
                    reply.keys.forEach((key) => {
                        const pub = CurveEd25519.point();
                        pub.unmarshalBinary(key);
                        pubKeys.push(pub);
                    });
                }
            });
            this.attendeesAdd(pubKeys);
            return pubKeys;
        }).catch((err) => {
            Log.rcatch(err, "couldn't contact all servers for key-updates:");
        });
    }

    transferCoin(amount, dest, isPub) {
        if (this.state() != STATE_TOKEN) {
            throw new Error("Cannot transfer coins before it's a token");
        }
        let accountId = dest;
        return Promise.resolve()
            .then(() => {
                if (this._partyInstance == undefined || this._coinInstance == undefined) {
                    return this.getCoinInstance(true);
                }
            })
            .then(() => {
                if (isPub) {
                    accountId = this._partyInstance.getAccountInstanceId(dest);
                }
                const signer = Darc.SignerEd25519.fromByteArray(this._keypair.private.marshalBinary());
                return this._coinInstance.transfer(amount, accountId, signer);
            });
    }

    qrcodePublic() {
        const pubBase64 = Buffer.from(this.keypair.public.marshalBinary()).toString("base64");
        const text = " { \"public\" :  \"" + pubBase64 + "\"}";
        const sideLength = PlatformModule.screen.mainScreen.widthPixels / 4;
        const qrcode = QRGenerator.createBarcode({
            encode: text,
            format: ZXing.QR_CODE,
            height: sideLength,
            width: sideLength
        });
        return fromNativeSource(qrcode);
    }

    /**
     * Adds a list of attendees if they are not there yet.
     * @param atts the list of attendees
     */
    attendeesAdd(atts) {
        if (this._finalStatement == null) {
            this.attendees = atts;
        } else {
            atts.forEach((att) => {
                if (!(att instanceof Kyber.Point)) {
                    Log.error("got non-kyber.Point attendee");
                } else {
                    let found = false;
                    this.attendees.forEach((a) => {
                        if (a.equal(att)) {
                            found = true;
                        }
                    });
                    if (!found) {
                        this._finalStatement.attendees.push(att);
                    }
                }
            });
        }
    }
}

/**
 * How to migrate from version 0 of the wallets, which were only configuration
 *
 */
export class MigrateFrom {
    /**
     * Loads all old configs, converts them to wallets, and deletes them.
     * @returns {Promise<Array<Badge> | never>}
     */
    static version0() {
        // Get all filenames for the old structures and the keypairs
        const attInfos = [];
        const keyPairs = [];
        FileIO.forEachFolderElement(FilePaths.POP_ATT_PATH, function (partyFolder) {
            attInfos.push(FileIO.join(FilePaths.POP_ATT_PATH, partyFolder.name, FilePaths.POP_ATT_INFOS));
            keyPairs.push(FileIO.join(FilePaths.POP_ATT_PATH, partyFolder.name, FilePaths.KEY_PAIR));
        });

        return Promise.all(
            // Read in the old Attendee structures
            attInfos.map((fileName) => {
                Log.lvl2("converting party-config to wallet: " + fileName);
                return FileIO.getStringOf(fileName);
            })
        ).then((files) => {
            // Convert all files to wallets
            return Promise.all(
                files.map((file) => {
                    const object = Convert.jsonToObject(file);
                    return this.conodeGetWallet(object.address, object.omniledgerId, object.id);
                })
            );
        }).then((wallets) => {
            // Read in keypairs and store them in the wallet
            return Promise.all(
                keyPairs.map((keyFile) => {
                    return KeyPair.fromFileBase64(keyFile);
                })
            ).then((keyPairs) => {
                return keyPairs.map((keyPair, idx) => {
                    wallets[idx]._keypair = keyPair;
                    return wallets[idx];
                });
            });
        }).then((wallets) => {
            // Save the wallets
            return Promise.all(
                wallets.map((wallet) => {
                    return wallet.save();
                })
            );
        }).then((wallets) => {
            // And if all wallets are correctly saved, delete the old data.
            Log.lvl2("deleting all old folders");
            const fileNames = [];
            FileIO.forEachFolderElement(FilePaths.POP_ATT_PATH, function (partyFolder) {
                fileNames.push(FileIO.join(FilePaths.POP_ATT_PATH, partyFolder.name, FilePaths.POP_ATT_INFOS));
            });
            return Promise.all(
                fileNames.map((fileName) => {
                    return Documents.getFile(fileName).remove();
                })
            ).then(() => {
                return wallets;
            });
        }).catch((err) => {
            Log.error("couldn't read files: " + err);
            return [];
        });
    }

    /**
     * Gets a party configuration from a conode. This is necessary when migrating old versions.
     * @param address
     * @param omniledgerId
     * @param partyId
     * @returns {Promise<Badge>}
     */
    static conodeGetWallet(address, omniledgerId, partyId) {
        const cothoritySocketPop = new Net.Socket(Convert.tlsToWebsocket(address, ""), RequestPath.POP);
        Log.lvl2("Getting party from omniledger:", partyId, omniledgerId);
        const message = {
            partyid: Convert.hexToByteArray(partyId)
        };
        let instanceIdBuffer;

        return cothoritySocketPop.send(RequestPath.POP_GET_INSTANCE_ID, RequestPath.POP_GET_INSTANCE_ID_REPLY, message)
            .then((reply) => {
                // Log.lvl2("got reply", reply);
                instanceIdBuffer = reply.instanceid;
                const cothoritySocketOl = new Net.Socket(Convert.tlsToWebsocket(address, ""), RequestPath.OMNILEDGER);
                return OmniledgerRPC.fromKnownConfiguration(cothoritySocketOl, Convert.hexToByteArray(omniledgerId));
            })
            .then((ol) => {
                return PopPartyInstance.fromInstanceId(ol, instanceIdBuffer);
            })
            .then((inst) => {
                const config = Configuration.fromPopPartyInstance(inst);
                const wallet = new Badge(config);
                if (inst.attendees !== undefined && inst.attendees.length > 0) {
                    const fs = new FinalStatement(config, inst.attendees, inst.signature);
                    wallet._finalStatement = fs;
                }
                return wallet;
            });
    }
}
