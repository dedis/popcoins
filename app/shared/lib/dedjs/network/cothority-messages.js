require("nativescript-nodeify");
const UUID = require("pure-uuid");
const Crypto = require("crypto-browserify");
const Kyber = require("@dedis/kyber-js");
const CurveEd25519 = new Kyber.curve.edwards25519.Curve;

const ServerIdentity = require("../../../cothority/lib/identity").ServerIdentity;
const DedisProtobuf = require("../../../cothority/lib/protobuf");
const Helper = require("../Helper");
const Log = require("../Log");
const ObjectType = require("../ObjectType");

/**
 * Helpers to encode and decode messages of the Cothority
 *
 * @author Gaylor Bosson (gaylor.bosson@epfl.ch)
 * @author Cedric Maire (cedric.maire@epfl.ch)
 * @author Vincent Petri (vincent.petri@epfl.ch)
 */
module.exports = {

    READ_PIN_ERROR: 'Read PIN in server-log',

    /**
     * Returns the protobuf loaded model.
     * @param {string} name - the name of the model
     * @returns {ReflectionObject|?ReflectionObject|string} - the model
     */
    getModel: function(name) {
        if (typeof name !== "string") {
            throw new Error("name must be of type string");
        }

        const model = DedisProtobuf.root.lookup(`${name}`);
        if (model === undefined || model === null) {
            throw new Error("unknown model: " + name);
        }

        return model;
    },

    /**
     * Server related messages.
     */

    /**
     * Creates a ServerIdentity object from the given parameters.
     * @param {Uint8Array|Point} publicKey - the public key of the conode
     * @param {Uint8Array|null} id - the id of the conode
     * @param {string} address - the address of the conode
     * @param {string} desc - the description of the conode
     * @returns {ServerIdentity} - the server identity object created from the parameters
     */
    createServerIdentity: function(publicKey, id, address, desc) {
        if (!(publicKey instanceof Kyber.Point)) {
            if (!(publicKey instanceof Uint8Array)) {
                throw new Error("csi: publicKey must be an instance of Point or Uint8Array");
            }
            let pub = CurveEd25519.point();
            pub.unmarshalBinary(publicKey);
            publicKey = pub;
        }
        if (!(id instanceof Uint8Array)) {
            const hex = Buffer.from(publicKey.marshalBinary()).toString('hex');
            const url = "https://dedis.epfl.ch/id/" + hex;
            id = new UUID(5, "ns:URL", url).export();
        }
        if (typeof address !== "string") {
            throw new Error("address must be of type string");
        }
        if (typeof desc !== "string") {
            throw new Error("desc must be of type string");
        }

        const model = this.getModel(ObjectType.SERVER_IDENTITY);

        const fields = {
            public: publicKey,
            id: id,
            address: address,
            description: desc
        };

        return model.create(fields);
    },

    /**
     * Creates a Roster object.
     * @param {Uint8Array} id - the id of the roster
     * @param {ServiceIdentity[]} list - array of ServerIdentity
     * @param {Uint8Array|Point} aggregate - the aggregate of the conodes in list
     * @returns {Roster} - the roster object created form the parameters
     */
    createRoster: function(id, list, aggregate) {
        if (!(id === undefined || id instanceof Uint8Array)) {
            throw new Error("cr: id must be an instance of Uint8Array or be undefined to skip it");
        }
        if (!(list instanceof Array)) {
            throw new Error("list must be an instance of Array");
        }
        if (list.length > 0 && !(list[0] instanceof ServerIdentity)) {
            throw new Error("list[i] must be an instance of ServerIdentity");
        }
        if (!(aggregate instanceof Kyber.Point)) {
            if (!(aggregate instanceof Uint8Array)) {
                throw new Error("aggregate must be an instance of Point or Uint8Array");
            }
            let agg = CurveEd25519.point();
            agg.unmarshalBinary(aggregate);
            aggregate = agg;
        }

        const model = this.getModel(ObjectType.ROSTER);

        const fields = {
            list: list.map(l => {
                return this.createServerIdentity(l.public, l.id, l.tcpAddr, l.description);
            }),
            aggregate: aggregate
        };

        if (id !== undefined) {
            fields.id = id;
        }

        return model.create(fields);
    },

    /**
     * Creates an message to make a StatusRequest to a cothority node.
     * @returns {*|Buffer|Uint8Array} - the status request
     */
    createStatusRequest: function() {
        return {};
    },

    /**
     * PoP related messages.
     */

    /**
     * Creates a PopDesc using the information given as parameters.
     * @param {string} name - the name of the pop party
     * @param {string} datetime - the date and time of the pop party
     * @param {string} location - the location of the pop party
     * @param {Roster} roster - the roster used to host the pop party
     * @returns {PopDesc} - the PopDesc object created using the given parameters
     */
    createPopDesc: function(name, datetime, location, roster) {
        if (typeof name !== "string") {
            throw new Error("name must be of type string");
        }
        if (typeof datetime !== "string") {
            throw new Error("datetime must be of type string");
        }
        if (typeof location !== "string") {
            throw new Error("location must be of type string");
        }
        if (!Helper.isOfType(roster, ObjectType.ROSTER)) {
            throw new Error("roster must be an instance of Roster");
        }

        const model = this.getModel(ObjectType.POP_DESC);

        const fields = {
            name: name,
            datetime: datetime,
            location: location,
            roster: roster
        };

        return model.create(fields);
    },

    /**
     * Creates an message to store configuration information of a given PoP party on a conode.
     * @param {PopDesc} desc - the pop description
     * @param {Uint8Array} signature - the signature of the message
     * @returns {{desc: *, signature: Uint8Array}} - the store config request
     */
    createStoreConfig: function(desc, signature) {
        if (!Helper.isOfType(desc, ObjectType.POP_DESC)) {
            throw new Error("desc must be an instance of PopDesc");
        }
        if (!(signature instanceof Uint8Array)) {
            throw new Error("signature must be an instance of Uint8Array");
        }
        /*
        if (desc.roster.id !== undefined) {
          delete desc.roster.id;
        }
        */

        const fields = {
            desc: desc,
            signature: signature
        };

        return fields;
    },

    /**
     * Creates a FinalStatement given the parameters.
     * @param {PopDesc} desc - the description of the pop party
     * @param {Array} attendees - all the attendees of the pop party
     * @param {Uint8Array} signature - the collective signature of the pop party
     * @param {boolean} merged - if the pop party has been merged
     * @returns {FinalStatement} - the final statement created given the parameters
     */
    createFinalStatement: function(desc, attendees, signature, merged) {
        if (!Helper.isOfType(desc, ObjectType.POP_DESC)) {
            throw new Error("desc must be an instance of PopDesc");
        }
        if (!(attendees instanceof Array)) {
            throw new Error("attendees must be an instance of Array");
        }
        if (attendees.length > 0 && !(attendees[0] instanceof Uint8Array)) {
            throw new Error("attendees[i] must be an instance of Uint8Array");
        }
        if (!(signature instanceof Uint8Array)) {
            throw new Error("signature must be an instance of Uint8Array");
        }
        if (typeof merged !== "boolean") {
            throw new Error("merged must be of type boolean");
        }

        const model = this.getModel(ObjectType.FINAL_STATEMENT);

        const fields = {
            desc: desc,
            attendees: attendees,
            signature: signature,
            merged: merged
        };

        return model.create(fields);
    },

    /**
     * Creates an message to finalize the pop party referenced by descId.
     * @param {Uint8Array} descId - the id of the config
     * @param {Array} attendees - the array containing all the public keys of the attendees
     * @param {Uint8Array} signature - the signature of the message
     * @returns {{descId: Uint8Array, attendees: Array, signature: Uint8Array}} - the finalize request
     */
    createFinalizeRequest: function(descId, attendees, signature) {
        if (!(descId instanceof Uint8Array)) {
            throw new Error("descId must be an instance of Uint8Array");
        }
        if (!(attendees instanceof Array)) {
            throw new Error("attendees must be an instance of Array");
        }
        if (attendees.length > 0 && !(attendees[0] instanceof Uint8Array)) {
            throw new Error("attendees[i] must be an instance of Uint8Array");
        }
        if (!(signature instanceof Uint8Array)) {
            throw new Error("signature must be an instance of Uint8Array");
        }

        const fields = {
            descid: descId,
            attendees: attendees,
            signature: signature
        };

        return fields;
    },

    /**
     * Creates a message to check a PoP Config status
     * @param hash - has of a party
     * @param attendees - array of attendees to the party
     * @returns {{hash: Uint8Array, attendees: Array}}
     */
    createCheckConfigRequest: function(hash, attendees) {
        if (!(hash instanceof Uint8Array)) {
            throw new Error("has must be an instance of Uint8Array");
        }
        if (!(attendees instanceof Array)) {
            throw new Error("attendees must be an instance of Array");
        }
        if (attendees.length > 0 && !(attendees[0] instanceof Uint8Array)) {
            throw new Error("attendees[i] must be an instance of Uint8Array");
        }

        const fields = {
            hash: hash,
            attendees: attendees
        }

        return fields;
    },

    /**
     * Creates an message to make a PinRequest to a cothority node.
     * @param {string} pin - previously generated by the conode
     * @param {Kyber.Point} publicKey - the public key of the organizer
     * @returns {{pin: string, public: Uint8Array}} - the pin request
     */
    createPinRequest: function(pin, publicKey) {
        if (typeof pin !== "string") {
            throw new Error("pin must be of type string");
        }
        if (!(publicKey instanceof Kyber.Point)) {
            throw new Error("publicKey must be an instance of Point");
        }

        const fields = {
            pin: pin,
            public: publicKey.marshalBinary()
        };

        return fields;
    },

    /**
     * Creates a messages to make a VerifyLink reuqest to a conode
     * @param {Uint8Array} publicKey - the public key of the user
     * @returns {{public: Uint8Array}} - the verify link request
     */
    createVerifyLinkMessage: function(publicKey) {
        if (!(publicKey instanceof Kyber.Point)) {
            throw new Error("publicKey must be an instance of Point");
        }

        const fields = {
            public: publicKey.marshalBinary()
        };

        return fields;
    },

    /**
     * Creates an FetchRequest for the pop party referenced by id.
     * @param {Uint8Array} id - the id of the config
     * @param {boolean} returnUncomplete - a boolean to tell the conode if the final statement
     * should be return even if it is uncomplete
     * @returns {{id: Uint8Array, returnUncomplete: *}} - the fetch request
     */
    createFetchRequest: function(id, returnUncomplete) {
        if (!(id instanceof Uint8Array)) {
            throw new Error("cfr: id must be an instance of Uint8Array");
        }

        if (returnUncomplete !== undefined && typeof returnUncomplete !== "boolean") {
            throw new Error("returnUncomplete must be of type boolean or undefined but was " + typeof returnUncomplete);
        }


        const fields = {
            id: id,
            returnuncomplete: returnUncomplete
        };

        return fields;
    },

    /**
     * CISC related messages.
     */

    /**
     * Creates a Config object using the given parameters.
     * @param threshold
     * @param device
     * @param data
     * @returns {object} Config
     */
    createConfig: function(threshold, device, data) {
        const model = this.getModel("Config");

        const fields = {
            threshold: threshold,
            device: device,
            data: data
        };

        return model.create(fields);
    },

    /**
     * Create a message request to get the config of a given conode.
     * @param id
     * @returns {{id: *}}
     */
    createDataUpdate: function(id) {
        const fields = {
            id: id
        };

        return fields;
    },

    /**
     * Creates a SchnorrSig object using the given parameters.
     * @param challenge
     * @param response
     * @returns {object} SchnorrSig
     */
    createSchnorrSig: function(challenge, response) {
        const model = this.getModel("SchnorrSig");

        const fields = {
            challenge: challenge,
            response: response
        };

        return model.create(fields);
    },

    /**
     * Create a device structure, that may be added to a config.
     * @param key
     * @returns {fields}
     */
    createDevice: function(key) {
        const model = this.getModel("Device");

        const fields = {
            point: key
        };

        return model.create(fields);
    },

    /**
     * Create a message request to vote an update to a config.
     * @param id
     * @param signer
     * @param challenge
     * @param response
     * @returns {{id: *, signer: *, signature: *}}
     */
    createProposeVote: function(id, signer, signature) {
        const fields = {
            id: id,
            signer: signer,
            signature: signature
        };

        return fields;
    },

    /**
     * Create a message request to propose an update to a config.
     * @param id
     * @param config
     * @returns {{id: *, data: *}}
     */
    createProposeSend: function(id, data) {
        const fields = {
            id: id,
            data: data
        };

        return fields;
    },

    /**
     * Create a message request to get the current config update propositions.
     * @param id
     * @returns {{id: *}}
     */
    createProposeUpdate: function(id) {
        const fields = {
            id: id
        };

        return fields;
    },

    createLinkPoP: function() {
        // LinkPoP stores a link to a pop-party to accept this configuration. It will
// try to create an account to receive payments from clients.
//       message LinkPoP {
//           required bytes popinstance = 1;
//           required Party party = 2;
//       }

    },

    createGetAccount: function() {
        // required bytes popinstance = 1;
    },

    createMessage: function(msg, authorId, partyIId) {
        const msgProto = this.getModel(ObjectType.MESSAGE);
        Log.print("partyIId is:", partyIId);
        const fields = {
            subject: msg.subject,
            date: 0,
            text: msg.text,
            author: authorId,
            balance: msg.balance,
            reward: msg.reward,
            id: Crypto.randomBytes(32),
            partyiid: partyIId
        }

        return msgProto.create(fields);
    },

    createSendMessage: function(msg) {
        const fields = {
            message: msg
        };

        return fields;
    },

    createListMessages: function(readerId, start, number) {
        const fields = {
            readerid: readerId,
            start: start,
            number: number
        };

        return fields;
    },

    createReadMessage: function(id, party, reader) {
        return {
            msgid: id,
            partyiid: party,
            reader: reader,
        };
    },

    createTopupMessage: function(id, amount) {
        return {
            msgid: id,
            amount: amount
        };
    }
};
