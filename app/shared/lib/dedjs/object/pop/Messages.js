require("nativescript-nodeify");

const Net = require("../../network/NSNet");
const CothorityMessages = require("../../network/cothority-messages");
const Convert = require("../../Convert");
const Log = require("../../Log");
const RequestPath = require("../../network/RequestPath");
const FileIO = require("../../../file-io/file-io");
const FilePaths = require("../../../file-io/files-path");
const DecodeType = require("../../network/DecodeType");
const Wallet = require("./Wallet");

/**
 * It allows the app to contact the nodes to write and read
 * messages.
 * ATTENTION: the messages module is an elaborate mock-up,
 * most of the functions are not secure at all, and it is
 * very easy to cheat. So don't be proud if you manage to
 * double-spend, send more messages than allowed, or other
 * stuff. That's normal!
 */

class Messages {

    /**
     * Constructor for the PoP class.
     * @param wallet {Wallet}
     * @param partyInstance {PopPartyInstance}
     */
    constructor(wallet, partyInstance) {
        this._wallet = wallet;
        if (wallet.state() < Wallet.STATE_TOKEN) {
            Log.error("not token state");
            throw new Error("Can only use token-wallet");
        }
        this._conode = wallet.config.roster.identities[0];
        this._partyIId = partyInstance.instanceId;
        // the id of the message-service account
        this._serviceAccountId = partyInstance.getServiceCoinInstanceId();
        this._attendeeAccountId = partyInstance.getAccountInstanceId(wallet.keypair.public.marshalBinary());
        // Local cache of messages
        this._sentMessages = [];
        this._readMessages = [];
    }

    /**
     * Returns the id of the service account that holds all the tokens.
     * @returns {Uint8Array}
     */
    get serviceAccountId() {
        return this._serviceAccountId;
    }

    /**
     * Returns the id of the attendee's account.
     * @returns {Uint8Array}
     */
    get attendeeAccountId() {
        return this._attendeeAccountId;
    }

    /**
     * fetchListMessages requests a number of messages from the server. You should call it
     * always on the same server, because for now they don't communicate with each other to
     * exchange messages!
     *
     * @param conode {ServerIdentity} whom to contact
     * @param start index of first message - starts at 0
     * @param number maximum number of messages to retrieve
     * @returns {*} a list of messages, that can be empty
     */
    fetchListMessages(start, number) {
        const cothoritySocket = new Net.Socket(Convert.tlsToWebsocket(this._conode, ""), RequestPath.PERSONHOOD);
        const requestLM = CothorityMessages.createListMessages(this._attendeeAccountId, start, number);

        return cothoritySocket.send(RequestPath.PERSONHOOD_LISTMESSAGES, DecodeType.LISTMESSAGES_REPLY, requestLM)
            .catch(error => {
                Log.rcatch(error, "couldn't get list of messages");
            });
    }

    /**
     * Sends a message to the server
     * @param conode {ServerIdentity}
     * @param msg {string}
     * @returns {Promise<T | never>}
     */
    sendMessage(msg) {
        const cothoritySocket = new Net.Socket(Convert.tlsToWebsocket(this._conode, ""), RequestPath.PERSONHOOD);
        const msgProto = CothorityMessages.createMessage(msg, this._attendeeAccountId, this._partyIId);
        const sendMessage = CothorityMessages.createSendMessage(msgProto);

        return cothoritySocket.send(RequestPath.PERSONHOOD_SENDMESSAGE, DecodeType.STRING_REPLY, sendMessage)
            .then(() => {
                this._sentMessages.push(msg);
                return this.save()
            })
            .catch(error => {
                Log.rcatch(error, "while sending message");
            })
    }

    /**
     * Reads a message from the server.
     * @param msgID
     * @returns {Promise<Message>}
     */
    readMessage(msgID) {
        const cothoritySocket = new Net.Socket(Convert.tlsToWebsocket(this._conode, ""), RequestPath.PERSONHOOD);
        const readMessage = CothorityMessages.createReadMessage(msgID, this._partyIId,
            this._attendeeAccountId);

        return cothoritySocket.send(RequestPath.PERSONHOOD_READMESSAGE, DecodeType.READMESSAGE_REPLY, readMessage)
            .then(msg => {
                this._readMessages.push(msg);
                return this.save().then(() => {
                    return msg;
                })
            })
            .catch(error => {
                Log.rcatch(error, "while reading message");
            })
    }

    get fileName() {
        return FileIO.join(FilePaths.MESSAGES_PATH,
            Buffer.from(this._partyIId).toString('hex') + ".json")
    }

    /**
     * @returns {Promise}
     */
    loadMessages() {
        return FileIO.getStringOf(this.fileName)
            .then(file => {
                let object = Convert.jsonToObject(file);
                Log.llvl3("converting file to messages:", object);
                this._sentMessages = object.sentMessages;
                this._readMessages = object.readMessages;
            })
            .catch(err => {
                Log.catch(err, "couldn't load file");
            })
    }

    save() {
        let msgs = {
            readMessages: this._readMessages,
            sentMessages: this._sentMessages,
        }

        const toWrite = Convert.objectToJson(msgs);
        return FileIO.writeStringTo(this.fileName, toWrite)
            .then(() => {
                Log.lvl1("saved file to: " + this.fileName);
                return this;
            })
            .catch(error => {
                Log.rcatch(error, "error while saving wallet:");
            })
    }
}

module.exports = Messages;
