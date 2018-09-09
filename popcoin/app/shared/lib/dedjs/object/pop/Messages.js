const ObservableModule = require("data/observable");
const ObservableArray = require("data/observable-array").ObservableArray;
const Package = require("../../Package");
const ObjectType = require("../../ObjectType");
const Helper = require("../../Helper");
const Convert = require("../../Convert");
const RequestPath = require("../../network/RequestPath");
const DecodeType = require("../../network/DecodeType");
const Net = require("@dedis/cothority").net;
const FilesPath = require("../../../../res/files/files-path");
const FileIO = require("../../../../lib/file-io/file-io");
const CothorityMessages = require("../../network/cothority-messages");
const RingSig = require("../../RingSig");
const Kyber = require("@dedis/kyber-js");
const Suite = new Kyber.curve.edwards25519.Curve;
const PopToken = require("./att/PopToken");

const User = require("../user/User").get;
const platform = require("tns-core-modules/platform");
var Directory = require("../../../Directory/Directory");

/**
 * This singleton is the PoP-messages component of the app.
 * It allows the app to contact the nodes to write and read
 * messages.
 * ATTENTION: the messages module is an elaborate mock-up,
 * most of the functions are not secure at all, and it is
 * very easy to cheat. So don't be proud if you manage to
 * double-spend, send more messages than allowed, or other
 * stuff. That's normal!
 */

class PoPMsg {

    /**
     * Constructor for the PoP class.
     */
    constructor() {
        this._isLoaded = false;
        this._finalStatements = ObservableModule.fromObject({
            array: new ObservableArray()
        });
        this._popToken = ObservableModule.fromObject({
            array: new ObservableArray()
        });
    }

    /**
     * fetchListMessages requests a number of messages from the server. You should call it
     * always on the same server, because for now they don't communicate with each other to
     * exchange messages!
     *
     * @param conode whom to contact
     * @param start index of first message - starts at 0
     * @param number maximum number of messages to retrieve
     * @returns {*} a list of messages, that can be empty
     */
    fetchListMessages(conode, start, number) {
        if (!Helper.isOfType(conode, ObjectType.SERVER_IDENTITY)) {
            throw new Error("conode must be an instance of ServerIdentity");
        }

        const cothoritySocket = new Net.Socket(Convert.tlsToWebsocket(conode, ""), RequestPath.PERSONHOOD);
        const requestLM = CothorityMessages.createListMessages(start, number);

        return cothoritySocket.send(RequestPath.PERSONHOOD_LISTMESSAGES, DecodeType.LISTMESSAGES_REPLY, requestLM)
            .then(response => {
                return Promise.resolve(response);
            })
            .catch(error => {
                console.log(error);
                console.dir(error);
                console.trace();

                return Promise.reject(error);
            });
    }

    sendMessage(conode, msg){
        if (!Helper.isOfType(conode, ObjectType.SERVER_IDENTITY)) {
            throw new Error("conode must be an instance of ServerIdentity");
        }

        const cothoritySocket = new Net.Socket(Convert.tlsToWebsocket(conode, ""), RequestPath.PERSONHOOD);
        const msgProto = CothorityMessages.createMessage(msg);
        const sendMessage = CothorityMessages.createSendMessage(msgProto);

        return cothoritySocket.send(RequestPath.PERSONHOOD_SENDMESSAGE, DecodeType.STRING_REPLY, sendMessage)
            .then(response =>{
                return Promise.resolve(response);
            })
            .catch(error =>{
                console.log(error);
                console.dir(error);
                console.trace();

                return Promise.reject(error);
            })
    }

    readMessage(conode, msgID, partyID, readerID){
        if (!Helper.isOfType(conode, ObjectType.SERVER_IDENTITY)) {
            throw new Error("conode must be an instance of ServerIdentity");
        }

        const cothoritySocket = new Net.Socket(Convert.tlsToWebsocket(conode, ""), RequestPath.PERSONHOOD);
        const readMessage = CothorityMessages.createReadMessage(msgID, partyID, readerID);

        return cothoritySocket.send(RequestPath.PERSONHOOD_READMESSAGE, DecodeType.READMESSAGE_REPLY, readMessage)
            .then(response =>{
                return Promise.resolve(response);
            })
            .catch(error =>{
                console.log(error);
                console.dir(error);
                console.trace();

                return Promise.reject(error);
            })
    }

}

// The symbol key reference that the singleton will use.
const POPMSG_PACKAGE_KEY = Symbol.for(Package.POPMSG);

// We create the singleton if it hasn't been instanciated yet.
const globalSymbols = Object.getOwnPropertySymbols(global);
const popMsgExists = (globalSymbols.indexOf(POPMSG_PACKAGE_KEY) >= 0);

if (!popMsgExists) {
    global[POPMSG_PACKAGE_KEY] = (function () {
        const newPoPMsg = new PoPMsg();

        return newPoPMsg;
    })();
}

// Singleton API
const POPMSG = {};

Object.defineProperty(POPMSG, "get", {
    configurable: false,
    enumerable: false,
    get: function () {
        return global[POPMSG_PACKAGE_KEY];
    },
    set: undefined
});

// We freeze the singleton.
Object.freeze(POPMSG);

// We export only the singleton API.
module.exports = POPMSG;
