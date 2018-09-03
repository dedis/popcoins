const Helper = require("../../../Helper");
const ObservableModule = require("data/observable");
const KeyPair = require("../../../Crypto").KeyPair;
const FileIO = require("../../../../file-io/file-io");
const FilePath = require("../../../../../res/files/files-path");
const Convert = require("../../../Convert");
const Net = require("@dedis/cothority").net;
const CothorityMessages = require("../../../network/cothority-messages");
const RequestPath = require("../../../network/RequestPath");
const DecodeType = require("../../../network/DecodeType");
const Party = require("../Party");
const PlatformModule = require("tns-core-modules/platform");
const ZXing = require("nativescript-zxing");
const ImageSource = require("image-source");
const QRGenerator = new ZXing();
const OmniLedger = require("@dedis/cothority").omniledger;
var text = undefined;

/**
 * We define the AttParty class which is the object representing the attendee.
 */

class AttParty extends Party {

    /**
     * Constructor for the AttParty class.
     * @param {string} id - the hash of the party
     * @param {string} omniledgerId - the id of the omniledger hosting this party
     * @param {string} [address] - address of the conode in the format tls://XXX.XXX.XXX.XXX:XXX. It is required
     * if the party needs to be retrieved from the conode. If the address is not specified, the leader conode is used.
     *
     */
    constructor(id, omniledgerId, address) {
        super();
        if (typeof id !== "string" || id === "") {
            throw new Error("id must be of type string and shouldn't be empty");
        }
        this._folderName = id;

        this._partyExistLocally = FileIO.folderExists(FileIO.join(FilePath.POP_ATT_PATH, this._folderName));
        if (!this._partyExistLocally && address === undefined) {
            throw new Error("address should not be undefined as the party isn't stored locally");
        } else if (!this._partyExistLocally && !Helper.isValidAddress(address)) {
            throw new Error("address is not in a correct format");
        }
        this._address = address;
        this._id = Convert.hexToByteArray(id);
        this._isLoaded = false;
        this._finalStatement = undefined;
        this._keyPair = undefined;
        this._poptoken = undefined;
        this._olRPC = undefined;
        this._popPartyOlInstance = undefined;
        this._coinInstance = undefined;
        this._omniledgerId = Convert.hexToByteArray(omniledgerId);


        this._status = ObservableModule.fromObject({
            status: States.UNDEFINED,
            balance: "loading...",
            qrcode: undefined
        });


    }

    /**
     Sets the popToken
     */
    setPopToken(pop) {
        this._poptoken = pop;
        this._status.status = States.POPTOKEN;
    }


    getQRCode() {
        return this._status.qrcode;
    }

    setQRCode(code) {
        this._status.qrcode = code;
    }

    /**
     Gets the popToken
     */
    getPopToken(pop) {
        return this._poptoken;
    }

    /**
     * Retrieve the final statement from the conode and update the status of the party.
     *
     * @returns {Promise} - a promise that gets solved once the final statement is retrieved and the status updated
     */
    retrieveFinalStatementAndStatus() {
        return this._popPartyOlInstance.update()
            .then(() => {
                this._finalStatement = this._popPartyOlInstance.finalStatement;
                if (this._poptoken === undefined) {
                    if (this._popPartyOlInstance.state === 1) {
                        this._status.status = States.PUBLISHED;
                    } else if (this._popPartyOlInstance.state === 2) {
                        this._status.status = States.POPTOKEN;
                    } else {
                        console.log("Error: invalid state number " + this._popPartyOlInstance.state);
                        this._status.status = States.ERROR;

                    }
                }
                else {

                    this._status.status = States.POPTOKEN;
                }

                if (this._status.status !== States.POPTOKEN) {
                    if (text !== " { \"public\" :  \"" + Convert.byteArrayToBase64(this.getKeyPair().public) + "\"}") {
                        text = " { \"public\" :  \"" + Convert.byteArrayToBase64(this.getKeyPair().public) + "\"}";
                        let sideLength = PlatformModule.screen.mainScreen.widthPixels / 4;
                        const QR_CODE = QRGenerator.createBarcode({
                            encode: text,
                            format: ZXing.QR_CODE,
                            height: sideLength,
                            width: sideLength
                        });


                        this._status.qrcode = ImageSource.fromNativeSource(QR_CODE);

                    }
                }

                return this._status.status === States.POPTOKEN ? this.updateCoinInstance() : Promise.resolve();
            })
            .catch(error => {
                console.log(error);
                console.log(error.stack);
                this._status.status = States.ERROR;

                //Promise is resolved as the status is set to "error"
                return Promise.resolve(error);
            });

    }

    /**
     * This updates the party (final statement, status and description) by downloading the last
     * final statement and loading the correct information using it
     *
     * @return {Promise}
     */
    update() {

        let omniLegder = undefined;
        if (this._popPartyOlInstance === undefined) {
            this._popPartyOlInstance = {}; // avoid concurrent calls problems
            omniLegder = this.initPopInstance()
        } else {
            omniLegder = Promise.resolve();
        }

        console.log(omniLegder);
        console.dir(omniLegder);

        return omniLegder
            .catch(err => {
                this._popPartyOlInstance = undefined;
                return Promise.reject(err)
            }).then(() => {
                return this.retrieveFinalStatementAndStatus()
            }).then(() => {
                return this.loadPopDesc();
            })
    }

    /**
     * Load the final statement from local storage
     * @returns {Promise} - a promise that gets resolved once the final statement is load in memory
     */
    loadFinalStatement() {
        return FileIO.getStringOf(FileIO.join(FilePath.POP_ATT_PATH, this._folderName, FilePath.POP_ATT_FINAL))
            .then(string => {
                console.log("Got string: " + string);
                this._finalStatement = Convert.jsonToObject(string);
            })
            .catch(error => {
                console.log("No final statement yet.");
            })
        return Promise.resolve();
    }

    /**
     * Use the final statement in memory to update the party description module
     * @returns {Promise} - the promise gets resolved as soon as the description is updated
     */
    loadPopDesc() {
        const popDesc = this._finalStatement.desc;
        const popDescModule = this.getPopDescModule();
        popDescModule.name = popDesc.name;
        popDescModule.datetime = popDesc.datetime;
        popDescModule.location = popDesc.location;
        popDescModule.roster.id = Uint8Array.from(popDesc.roster.id);

        popDescModule.roster.list.splice(0);
        popDesc.roster.list.forEach(server => {
            server.toHex = Convert.byteArrayToHex;
            popDescModule.roster.list.push(server);
        });

        popDescModule.roster.aggregate = Uint8Array.from(popDesc.roster.aggregate);

        return Promise.resolve(popDesc);
    }

    /**
     * Creates the pop instance (that interact with the contract instance)
     *
     * @return {PromiseLike<>}
     */
    initPopInstance() {
        const cothoritySocketPop = new Net.Socket(Convert.tlsToWebsocket(this._address, ""), RequestPath.POP);
        const message = {
            partyid: this._id
        };
        let instanceIdBuffer = undefined;
        return cothoritySocketPop.send(RequestPath.POP_GET_INSTANCE_ID, RequestPath.POP_GET_INSTANCE_ID_REPLY, message)
            .then(reply => {
                instanceIdBuffer = reply.instanceid;

                const cothoritySocketOl = new Net.Socket(Convert.tlsToWebsocket(this._address, ""), RequestPath.OMNILEDGER);

                return OmniLedger.OmniledgerRPC.fromKnownConfiguration(cothoritySocketOl, this._omniledgerId);
            })
            .then(ol => {
                this._olRPC = ol;
                return OmniLedger.contracts.PopPartyInstance.fromInstanceId(ol, instanceIdBuffer)
            })
            .then(inst => {
                this._popPartyOlInstance = inst;
                return Promise.resolve(inst);
            })
    }

    /**
     * Creates the pop coin instance (that interacts with the contract instance) if it doesn't exist and the
     * updates it to get the last info
     * @return {Promise} - a promise that resolves once it's up to date
     */
    updateCoinInstance() {
        let signer = OmniLedger.darc.SignerEd25519.fromByteArray(this._keyPair.private);
        let identity = OmniLedger.darc.IdentityEd25519.fromSigner(signer);
        let instId = this._popPartyOlInstance.getAccountInstanceId(identity);
        let update = this._coinInstance === undefined ? OmniLedger.contracts.CoinsInstance.fromInstanceId(this._olRPC, instId) : this._coinInstance.update();


        return update.then(coinInst => {
            this._coinInstance = coinInst;
            this._status.balance = coinInst.balance;
            return Promise.resolve();
        }).catch(err => {
            console.log(err);
            return Promise.reject(err);
        })
    }

    /**
     *  Transfer an amount of PoP-Coins to a destination public key
     * @param {number} amount
     * @param {Uint8Array} destination - the public key of the destination
     * @return {*}
     */
    transferCoin(amount, destination) {
        let identity = OmniLedger.darc.IdentityEd25519.fromPublicKey(destination);
        let accountId = this._popPartyOlInstance.getAccountInstanceId(identity);
        let signer = OmniLedger.darc.SignerEd25519.fromByteArray(this._keyPair.private);

        return this._coinInstance.transfer(amount, accountId, signer);
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
     * Randomize the key par associated with this party
     * @returns {Promise} - a promise that gets resolved once the key pair has been saved
     */
    randomizeKeyPair() {
        return this._keyPair.randomize();
    }

    /**
     * Load everyhting needed to the party :
     *  - get the party infos from the disk
     *  - download the final statement if need/available
     *  - cache it on the disk
     *  - update the party description with the current final statement
     *  - update the status of the party
     * @returns {Promise.<Party>}- a promise that gets resolved once the loading is finished
     */
    static loadFromDisk(id) {
        if (typeof id !== "string") {
            throw new Error("id must be of type string");
        }

        let promises = [FileIO.getStringOf(FileIO.join(FilePath.POP_ATT_PATH, id, FilePath.POP_ATT_INFOS)),
            new KeyPair(FileIO.join(FilePath.POP_ATT_PATH, id))];

        let party = undefined;

        return Promise.all(promises)
            .then(array => {
                let object = Convert.jsonToObject(array[0]);
                party = new AttParty(id, object.omniledgerId, object.address);
                party._setKeyPair(array[1]);
                return party.loadFinalStatement()
                    .then(() => {
                        console.log("loading pop desc");
                        return party.loadPopDesc()
                    })
                    .catch(() => {
                        party.retrieveFinalStatementAndStatus()
                            .then(() => {
                                return party.cacheFinalStatement();
                            })
                            .catch(error => {
                                console.dir(error);
                                return Promise.resolve(party)
                            })
                    })
            })
            .catch(error => {
                return Promise.reject("couldn't load from disk: " + error);
            })
    }

    /**
     * Save the party informations (id, address of leader conode and keypair) on the disk. This does not save
     * the final statement (see loadFinalStatement and cacheFinalStatement for this). A new key pair is also
     * generate for this party if this is the first saving.
     *
     * @return {Promise.<AttParty>}
     */
    save() {
        console.log("saving attparty");
        return new KeyPair(FileIO.join(FilePath.POP_ATT_PATH, this._folderName)).then((key) => {
            this._keyPair = key;

            const infos = {
                id: Convert.byteArrayToHex(this._id),
                omniledgerId: Convert.byteArrayToHex(this._omniledgerId),
                address: this._address
            };

            const toWrite = Convert.objectToJson(infos);
            const folder = this._folderName;
            return FileIO.writeStringTo(FileIO.join(FilePath.POP_ATT_PATH, this._folderName, FilePath.POP_ATT_INFOS), toWrite)
                .then(() => {
                    console.log("successfully wrote attparty to SD: " + toWrite);
                    console.log(folder);
                    return this;
                })
                .catch(error => {
                    console.log(error);
                    console.dir(error);
                    console.trace();

                    return Promise.reject(error);
                })

        })
    }

    /**
     * Check if a specific public key is part of the party
     *
     * @param publicKey - the public that has to be checked
     * @return {boolean} - returns true if the publix key is in the party
     */
    isAttendee(publicKey) {
        let attendees = this._finalStatement.attendees;
        let publicKeyHexString = Convert.byteArrayToHex(publicKey);
        for (let i = 0; i < attendees.length; i++) {
            if (Convert.byteArrayToHex(attendees[i]) === publicKeyHexString) {
                return true;
            }
        }

        return false;
    }

    /**
     * Returns the pop status observable module
     * @returns {ObservableModule}
     */
    getPopStatusModule() {
        return this._status;
    }

    /**
     * Returns the key pair associated with this party
     * @returns {KeyPair}
     */
    getKeyPair() {
        return this._keyPair;
    }

    /**
     * Return the current finalStatement of the party
     * Be careful, if no final statement retrieval has been operated, it could be
     * not up-to-date
     * @returns {FinalStatement}
     */
    getFinalStatement() {
        return CothorityMessages.createFinalStatement(
            this._finalStatement.desc,
            this._finalStatement.attendees,
            this._finalStatement.signature,
            this._finalStatement.merged
        );
    }

    _setKeyPair(newKeyPair) {
        if (!newKeyPair instanceof KeyPair) {
            throw "newKeyPair should be an instance of KeyPair"
        }

        this._keyPair = newKeyPair;
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

    /**POP TOKEN GENERATED**/
    POPTOKEN: "poptoken",
    /** Used if the status connot be retrieved **/
    ERROR: "offline"
});

module.exports.Party = AttParty;
module.exports.States = States;
