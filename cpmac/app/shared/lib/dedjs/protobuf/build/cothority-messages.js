'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var Protobuf = _interopDefault(require('protobufjs'));

var Skeleton = '{"options":{"java_package":"ch.epfl.dedis.proto","java_outer_classname":"SkipchainProto"},"nested":{"cothority":{},"ClockRequest":{"fields":{"roster":{"rule":"required","type":"Roster","id":1}}},"ClockResponse":{"fields":{"time":{"rule":"required","type":"double","id":1},"children":{"rule":"required","type":"sint32","id":2}}},"Roster":{"fields":{"id":{"type":"bytes","id":1},"list":{"rule":"repeated","type":"ServerIdentity","id":2,"options":{"packed":false}},"aggregate":{"rule":"required","type":"bytes","id":3}}},"CountRequest":{"fields":{}},"CountResponse":{"fields":{"count":{"rule":"required","type":"sint32","id":1}}},"ServerIdentity":{"fields":{"public":{"rule":"required","type":"bytes","id":1},"id":{"rule":"required","type":"bytes","id":2},"address":{"rule":"required","type":"string","id":3},"description":{"rule":"required","type":"string","id":4}}},"KeyPair":{"fields":{"public":{"rule":"required","type":"bytes","id":1},"private":{"rule":"required","type":"bytes","id":2},"publicComplete":{"type":"bytes","id":3}}},"RandomRequest":{"fields":{}},"RandomResponse":{"fields":{"r":{"rule":"required","type":"bytes","id":1},"t":{"rule":"required","type":"Transcript","id":2}},"nested":{"Transcript":{"fields":{"nodes":{"rule":"required","type":"sint32","id":1},"groups":{"rule":"required","type":"sint32","id":2},"purpose":{"rule":"required","type":"string","id":3},"time":{"rule":"required","type":"fixed64","id":4}}}}},"SignatureRequest":{"fields":{"message":{"rule":"required","type":"bytes","id":1},"roster":{"rule":"required","type":"Roster","id":2}}},"SignatureResponse":{"fields":{"hash":{"rule":"required","type":"bytes","id":1},"signature":{"rule":"required","type":"bytes","id":2}}},"Request":{"fields":{}},"Response":{"fields":{"system":{"keyType":"string","type":"Status","id":1},"server":{"rule":"required","type":"ServerIdentity","id":2}},"nested":{"Status":{"fields":{"field":{"keyType":"string","type":"string","id":1}}}}},"Device":{"fields":{"point":{"rule":"required","type":"bytes","id":1}}},"SchnorrSig":{"fields":{"challenge":{"rule":"required","type":"bytes","id":1},"response":{"rule":"required","type":"bytes","id":2}}},"ID":{"fields":{"id":{"rule":"required","type":"bytes","id":1}}},"Data":{"fields":{"threshold":{"rule":"required","type":"sint32","id":1},"device":{"keyType":"string","type":"Device","id":2},"storage":{"keyType":"string","type":"string","id":3},"votes":{"keyType":"string","type":"bytes","id":4}}},"StoreKeys":{"fields":{"type":{"rule":"required","type":"sint32","id":1},"final":{"type":"FinalStatement","id":2},"publics":{"rule":"repeated","type":"bytes","id":3},"sig":{"rule":"required","type":"bytes","id":4}}},"CreateIdentity":{"fields":{"data":{"type":"Data","id":1},"roster":{"type":"Roster","id":2},"type":{"rule":"required","type":"sint32","id":3},"public":{"rule":"required","type":"bytes","id":4},"schnorrSig":{"rule":"required","type":"bytes","id":5},"sig":{"rule":"required","type":"bytes","id":6},"nonce":{"rule":"required","type":"bytes","id":7}}},"CreateIdentityReply":{"fields":{"root":{"type":"SkipBlock","id":1},"data":{"type":"SkipBlock","id":2}}},"DataUpdate":{"fields":{"id":{"rule":"required","type":"bytes","id":1}}},"DataUpdateReply":{"fields":{"data":{"type":"Data","id":1}}},"ProposeSend":{"fields":{"id":{"rule":"required","type":"bytes","id":1},"data":{"type":"Data","id":2}}},"ProposeUpdate":{"fields":{"id":{"rule":"required","type":"bytes","id":1}}},"ProposeUpdateReply":{"fields":{"data":{"type":"Data","id":1}}},"ProposeVote":{"fields":{"id":{"rule":"required","type":"bytes","id":1},"signer":{"rule":"required","type":"string","id":2},"signature":{"type":"SchnorrSig","id":3}}},"ProposeVoteReply":{"fields":{"data":{"type":"SkipBlock","id":1}}},"PropagateIdentity":{"fields":{"tag":{"rule":"required","type":"string","id":1},"public":{"rule":"required","type":"bytes","id":2}}},"UpdateSkipBlock":{"fields":{"id":{"rule":"required","type":"ID","id":1},"latest":{"type":"SkipBlock","id":2}}},"Authenticate":{"fields":{"nonce":{"rule":"required","type":"bytes","id":1},"ctx":{"rule":"required","type":"bytes","id":2}}},"FinalStatement":{"fields":{"desc":{"rule":"required","type":"PopDesc","id":1},"attendees":{"rule":"repeated","type":"bytes","id":2},"signature":{"rule":"required","type":"bytes","id":3},"merged":{"rule":"required","type":"bool","id":4}}},"FinalStatementToml":{"fields":{"desc":{"rule":"required","type":"PopDescToml","id":1},"attendees":{"rule":"repeated","type":"string","id":2},"signature":{"rule":"required","type":"string","id":3},"merged":{"rule":"required","type":"bool","id":4}}},"PopDesc":{"fields":{"name":{"rule":"required","type":"string","id":1},"dateTime":{"rule":"required","type":"string","id":2},"location":{"rule":"required","type":"string","id":3},"roster":{"rule":"required","type":"Roster","id":4},"parties":{"type":"ShortDesc","id":5}}},"PopDescToml":{"fields":{"name":{"rule":"required","type":"string","id":1},"dateTime":{"rule":"required","type":"string","id":2},"location":{"rule":"required","type":"string","id":3},"roster":{"rule":"repeated","type":"string","id":4},"parties":{"rule":"repeated","type":"bytes","id":5}}},"ShortDesc":{"fields":{"location":{"rule":"required","type":"string","id":1},"roster":{"rule":"required","type":"Roster","id":2}}},"ShortDescToml":{"fields":{"location":{"rule":"required","type":"string","id":1},"roster":{"rule":"repeated","type":"string","id":2}}},"SkipBlock":{"fields":{"index":{"type":"int32","id":1},"height":{"type":"int32","id":2},"maxHeight":{"rule":"required","type":"int32","id":3},"baseHeight":{"rule":"required","type":"int32","id":4},"backlinks":{"type":"bytes","id":5},"verifiers":{"type":"bytes","id":6},"parent":{"type":"bytes","id":7},"genesis":{"type":"bytes","id":8},"data":{"rule":"required","type":"bytes","id":9},"roster":{"rule":"required","type":"Roster","id":10},"hash":{"type":"bytes","id":11},"forward":{"type":"BlockLink","id":12},"children":{"type":"BlockLink","id":13}}},"SkipBlockMap":{"fields":{"skipblocks":{"keyType":"string","type":"SkipBlock","id":1}}},"SkipBlockDataEntry":{"fields":{"key":{"rule":"required","type":"string","id":1},"data":{"rule":"required","type":"bytes","id":2}}},"SkipBlockData":{"fields":{"entries":{"rule":"repeated","type":"SkipBlockDataEntry","id":1,"options":{"packed":false}}}},"BlockLink":{"fields":{"hash":{"rule":"required","type":"bytes","id":1},"signature":{"rule":"required","type":"bytes","id":2}}},"GetBlock":{"fields":{"id":{"rule":"required","type":"bytes","id":1}}},"GetSingleBlock":{"fields":{"id":{"rule":"required","type":"bytes","id":1}}},"GetSingleBlockByIndex":{"fields":{"genesis":{"rule":"required","type":"bytes","id":1},"index":{"rule":"required","type":"int32","id":2}}},"GetBlockReply":{"fields":{"skipblock":{"rule":"required","type":"SkipBlock","id":1}}},"LatestBlockRequest":{"fields":{"latestId":{"rule":"required","type":"bytes","id":1}}},"LatestBlockResponse":{"fields":{"update":{"rule":"repeated","type":"SkipBlock","id":1,"options":{"packed":false}}}},"StoreSkipBlockRequest":{"fields":{"latestId":{"rule":"required","type":"bytes","id":1},"newBlock":{"rule":"required","type":"SkipBlock","id":2}}},"StoreSkipBlockResponse":{"fields":{"previous":{"rule":"required","type":"SkipBlock","id":1},"latest":{"rule":"required","type":"SkipBlock","id":2}}},"PropagateSkipBlock":{"fields":{"skipblock":{"rule":"required","type":"SkipBlock","id":1}}},"PropagateSkipBlocks":{"fields":{"skipblocks":{"rule":"repeated","type":"SkipBlock","id":1,"options":{"packed":false}}}},"ForwardSignature":{"fields":{"targetHeight":{"rule":"required","type":"int32","id":1},"previous":{"rule":"required","type":"bytes","id":2},"newest":{"rule":"required","type":"SkipBlock","id":3},"forwardLink":{"rule":"required","type":"BlockLink","id":4}}},"CheckConfig":{"fields":{"popHash":{"rule":"required","type":"bytes","id":1},"attendees":{"rule":"required","type":"bytes","id":2}}},"CheckConfigReply":{"fields":{"popStatus":{"rule":"required","type":"sint32","id":1},"popHash":{"rule":"required","type":"bytes","id":2},"attendees":{"rule":"required","type":"bytes","id":3}}},"MergeConfig":{"fields":{"final":{"rule":"required","type":"FinalStatement","id":1},"id":{"rule":"required","type":"bytes","id":2}}},"MergeConfigReply":{"fields":{"popStatus":{"rule":"required","type":"sint32","id":1},"popHash":{"rule":"required","type":"bytes","id":2},"final":{"rule":"required","type":"FinalStatement","id":3}}},"StoreConfig":{"fields":{"desc":{"rule":"required","type":"PopDesc","id":1},"signature":{"rule":"required","type":"bytes","id":2}}},"StoreConfigReply":{"fields":{"id":{"rule":"required","type":"bytes","id":1}}},"FinalizeRequest":{"fields":{"descId":{"rule":"required","type":"bytes","id":1},"attendees":{"rule":"repeated","type":"bytes","id":2},"signature":{"rule":"required","type":"bytes","id":3}}},"FinalizeResponse":{"fields":{"final":{"type":"FinalStatement","id":1}}},"FetchRequest":{"fields":{"id":{"rule":"required","type":"bytes","id":1}}},"MergeRequest":{"fields":{"id":{"rule":"required","type":"bytes","id":1},"signature":{"rule":"required","type":"bytes","id":2}}},"PinRequest":{"fields":{"pin":{"rule":"required","type":"string","id":1},"public":{"rule":"required","type":"bytes","id":2}}},"PopToken":{"fields":{"final":{"rule":"required","type":"FinalStatement","id":1},"private":{"rule":"required","type":"bytes","id":2},"public":{"rule":"required","type":"bytes","id":3}}},"PopTokenToml":{"fields":{"final":{"rule":"required","type":"FinalStatementToml","id":1},"private":{"rule":"required","type":"string","id":2},"public":{"rule":"required","type":"string","id":3}}},"GetUpdateChain":{"fields":{"latestId":{"rule":"required","type":"bytes","id":1}}},"GetUpdateChainReply":{"fields":{"update":{"rule":"repeated","type":"SkipBlock","id":1,"options":{"packed":false}}}},"GetAllSkipchains":{"fields":{}},"GetAllSkipchainsReply":{"fields":{"skipchains":{"rule":"repeated","type":"SkipBlock","id":1,"options":{"packed":false}}}}}}';

const { Root } = Protobuf;

/**
 * As we need to create a bundle, we cannot use the *.proto files. The script will wrap them in a skeleton file that
 * contains the JSON representation that can be used in the JavaScript code.
 */
var Root$1 = Root.fromJSON(JSON.parse(Skeleton));

const Helper$1 = require("../../Helper");

/**
 * Base class for the protobuf library that provides helpers to encode and decode
 * messages according to a given model.
 *
 * @author Gaylor Bosson (gaylor.bosson@epfl.ch)
 * @author Cedric Maire (cedric.maire@epfl.ch)
 * @author Vincent Petri (vincent.petri@epfl.ch)
 */
class CothorityProtobuf {

  /**
   * @constructor
   */
  constructor() {
    this.root = Root$1;
  }

  /**
   * Encodes a model to be transmitted over websocket.
   * @param {string} name - the name of the model
   * @param {object} fields - the fields to be encoded
   * @returns {*|Buffer|Uint8Array} - the encoded message
   */
  encodeMessage(name, fields) {
    if (typeof name !== "string") {
      throw new Error("name must be of type string");
    }
    if (!(fields !== undefined && typeof fields === "object" && !Helper$1.isArray(fields))) {
      throw new Error("fields must be of type object and not undefined");
    }

    const model = this.getModel(name);

    // Create the message with the model.
    const msg = model.create(fields);

    // Encode the message in a BufferArray.
    return model.encode(msg).finish();
  }

  /**
   * Decodes a message coming from a websocket.
   * @param {string} name - the name of the model to be decoded
   * @param {Uint8Array} buffer - the data to decode
   * @returns {object} - the decoded data as the model given as parameter
   */
  decodeMessage(name, buffer) {
    if (typeof name !== "string") {
      throw new Error("name must be of type string");
    }
    if (!(buffer instanceof Uint8Array)) {
      throw new Error("buffer must be an instance of Uint8Array");
    }

    return this.getModel(name).decode(buffer);
  }

  /**
   * Returns the protobuf loaded model.
   * @param {string} name - the name of the model
   * @returns {ReflectionObject|?ReflectionObject|string} - the model
   */
  getModel(name) {
    if (typeof name !== "string") {
      throw new Error("name must be of type string");
    }

    const model = this.root.lookup(`${name}`);
    if (model === undefined || model === null) {
      throw new Error("unknown model: " + name);
    }

    return model;
  }
}

const Helper = require("../../Helper");
const ObjectType = require("../../ObjectType");

/**
 * Helpers to encode and decode messages of the Cothority
 *
 * @author Gaylor Bosson (gaylor.bosson@epfl.ch)
 * @author Cedric Maire (cedric.maire@epfl.ch)
 * @author Vincent Petri (vincent.petri@epfl.ch)
 */
class CothorityMessages extends CothorityProtobuf {

  /**
   * Decodes and returns the response of a request.
   * @param {string} messageType - type of the response
   * @param {*|Buffer|Uint8Array} response - response of the Cothority conode
   * @returns {object} - the decoded response
   */
  decodeResponse(messageType, response) {
    if (typeof messageType !== "string") {
      throw new Error("messageType must be of type string");
    }

    return this.decodeMessage(messageType, new Uint8Array(response));
  }

  /**
   * Server related messages.
   */

  /**
  * Creates a KeyPair object from the given public and private keys.
  * @param {Uint8Array} publicKey - the public key
  * @param {Uint8Array} privateKey - the private key
  * @param {Uint8Array} publicCompleteKey - the complete public key
  * @returns {KeyPair} - the key pair created given the parameters
  */
  createKeyPair(publicKey, privateKey, publicCompleteKey) {
    if (!(publicKey instanceof Uint8Array)) {
      throw new Error("publicKey must be an instance of Uint8Array");
    }
    if (!(privateKey instanceof Uint8Array)) {
      throw new Error("privateKey must be an instance of Uint8Array");
    }
    if (!(publicCompleteKey instanceof Uint8Array || publicCompleteKey === undefined)) {
      throw new Error("publicCompleteKey must be an instance of Uint8Array or undefined to be skipped");
    }

    const model = this.getModel(ObjectType.KEY_PAIR);

    const fields = {
      public: publicKey,
      private: privateKey
    };

    if (publicCompleteKey !== undefined) {
      fields.publicComplete = publicCompleteKey;
    }

    return model.create(fields);
  }

  /**
   * Creates a ServerIdentity object from the given parameters.
   * @param {Uint8Array} publicKey - the public key of the conode
   * @param {Uint8Array} id - the id of the conode
   * @param {string} address - the address of the conode
   * @param {string} desc - the description of the conode
   * @returns {ServerIdentity} - the server identity object created from the parameters
   */
  createServerIdentity(publicKey, id, address, desc) {
    if (!(publicKey instanceof Uint8Array)) {
      throw new Error("publicKey must be an instance of Uint8Array");
    }
    if (!(id instanceof Uint8Array)) {
      throw new Error("id must be an instance of Uint8Array");
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
  }

  /**
   * Creates a Roster object.
   * @param {Uint8Array} id - the id of the roster
   * @param {Array} list - array of ServerIdentity
   * @param {Uint8Array} aggregate - the aggregate of the conodes in list
   * @returns {Roster} - the roster object created form the parameters
   */
  createRoster(id, list, aggregate) {
    if (!(id === undefined || id instanceof Uint8Array)) {
      throw new Error("id must be an instance of Uint8Array or be undefined to skip it");
    }
    if (!(list instanceof Array)) {
      throw new Error("list must be an instance of Array");
    }
    if (list.length > 0 && !Helper.isOfType(list[0], ObjectType.SERVER_IDENTITY)) {
      throw new Error("list[i] must be an instance of ServerIdentity");
    }
    if (!(aggregate instanceof Uint8Array)) {
      throw new Error("aggregate must be an instance of Uint8Array");
    }

    const model = this.getModel(ObjectType.ROSTER);

    const fields = {
      list: list,
      aggregate: aggregate
    };

    if (id !== undefined) {
      fields.id = id;
    }

    return model.create(fields);
  }

  /**
   * Creates an encoded message to make a StatusRequest to a cothority node.
   * @returns {*|Buffer|Uint8Array} - the encoded status request
   */
  createStatusRequest() {
    return this.encodeMessage(ObjectType.STATUS_REQUEST, {});
  }

  /**
   * PoP related messages.
   */

  /**
   * Creates a PopDesc using the information given as parameters.
   * @param {string} name - the name of the pop party
   * @param {string} dateTime - the date and time of the pop party
   * @param {string} location - the location of the pop party
   * @param {Roster} roster - the roster used to host the pop party
   * @returns {PopDesc} - the PopDesc object created using the given parameters
   */
  createPopDesc(name, dateTime, location, roster) {
    if (typeof name !== "string") {
      throw new Error("name must be of type string");
    }
    if (typeof dateTime !== "string") {
      throw new Error("dateTime must be of type string");
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
      dateTime: dateTime,
      location: location,
      roster: roster
    };

    return model.create(fields);
  }

  /**
   * Creates a PopToken given the parameters.
   * @param {FinalStatement} final - the FinalStatement of the pop party
   * @param {Uint8Array} privateKey - the private key
   * @param {Uint8Array} publicKey - the public key
   * @returns {PopToken} - the pop token created using the given parameters
   */
  createPopToken(final, privateKey, publicKey) {
    if (!Helper.isOfType(final, ObjectType.FINAL_STATEMENT)) {
      throw new Error("final must be an instance of FinalStatement");
    }
    if (!(privateKey instanceof Uint8Array)) {
      throw new Error("privateKey must be an instance of Uint8Array");
    }
    if (!(publicKey instanceof Uint8Array)) {
      throw new Error("publicKey must be an instance of Uint8Array");
    }

    const model = this.getModel(ObjectType.POP_TOKEN);

    const fields = {
      final: final,
      private: privateKey,
      public: publicKey
    };

    return model.create(fields);
  }

  /**
   * Creates an encoded message to store configuration information of a given PoP party on a conode.
   * @param {PopDesc} desc - the pop description
   * @param {Uint8Array} signature - the signature of the message
   * @returns {*|Buffer|Uint8Array} - the encoded store config request
   */
  createStoreConfig(desc, signature) {
    if (!Helper.isOfType(desc, ObjectType.POP_DESC)) {
      throw new Error("desc must be an instance of PopDesc");
    }
    if (!(signature instanceof Uint8Array)) {
      throw new Error("signature must be an instance of Uint8Array");
    }

    const fields = {
      desc: desc,
      signature: signature
    };

    return this.encodeMessage(ObjectType.STORE_CONFIG, fields);
  }

  /**
   * Creates a FinalStatement given the parameters.
   * @param {PopDesc} desc - the description of the pop party
   * @param {Array} attendees - all the attendees of the pop party
   * @param {Uint8Array} signature - the collective signature of the pop party
   * @param {boolean} merged - if the pop party has been merged
   * @returns {FinalStatement} - the final statement created given the parameters
   */
  createFinalStatement(desc, attendees, signature, merged) {
    if (!Helper.isOfType(desc, ObjectType.POP_DESC)) {
      throw new Error("desc must be an instance of PopDesc");
    }
    if (!(attendees instanceof Array)) {
      throw new Error("attendees must be an instance of Array");
    }
    if (!(attendees[0] instanceof Uint8Array)) {
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
  }

  /**
   * Creates an encoded message to finalize the pop party referenced by descId.
   * @param {Uint8Array} descId - the id of the config
   * @param {Array} attendees - the array containing all the public keys of the attendees
   * @param {Uint8Array} signature - the signature of the message
   * @returns {*|Buffer|Uint8Array} - the encoded finalize request
   */
  createFinalizeRequest(descId, attendees, signature) {
    if (!(descId instanceof Uint8Array)) {
      throw new Error("descId must be an instance of Uint8Array");
    }
    if (!(attendees instanceof Array && attendees[0] instanceof Uint8Array)) {
      throw new Error("attendees must be an instance of Array[Uint8Array]");
    }
    if (!(signature instanceof Uint8Array)) {
      throw new Error("signature must be an instance of Uint8Array");
    }

    const fields = {
      descId: descId,
      attendees: attendees,
      signature: signature
    };

    return this.encodeMessage(ObjectType.FINALIZE_REQUEST, fields);
  }

  /**
   * Creates an encoded message to make a PinRequest to a cothority node.
   * @param {string} pin - previously generated by the conode
   * @param {Uint8Array} publicKey - the public key of the organizer
   * @returns {*|Buffer|Uint8Array} - the encoded pin request
   */
  createPinRequest(pin, publicKey) {
    if (typeof pin !== "string") {
      throw new Error("pin must be of type string");
    }
    if (!(publicKey instanceof Uint8Array)) {
      throw new Error("publicKey must be an instance of Uint8Array");
    }

    const fields = {
      pin: pin,
      public: publicKey
    };

    return this.encodeMessage(ObjectType.PIN_REQUEST, fields);
  }

  /**
   * Creates an encoded FetchRequest for the pop party referenced by id.
   * @param {Uint8Array} id - the id of the config
   * @returns {*|Buffer|Uint8Array} - the encoded fetch request
   */
  createFetchRequest(id) {
    if (!(id instanceof Uint8Array)) {
      throw new Error("id must be an instance of Uint8Array");
    }

    const fields = {
      id: id
    };

    return this.encodeMessage(ObjectType.FETCH_REQUEST, fields);
  }

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
  createConfig(threshold, device, data) {
    const model = this.getModel("Config");

    const fields = {
      threshold: threshold,
      device: device,
      data: data
    };

    return model.create(fields);
  }

  /**
   * Create a message request to get the config of a given conode.
   * @param id
   * @returns {*|Buffer|Uint8Array}
   */
  createConfigUpdate(id) {
    const fields = {
      id: id
    };

    return this.encodeMessage("ConfigUpdate", fields);
  }

  /**
   * Return the decoded message of a config update request.
   * @param response
   * @returns {*}
   */
  decodeConfigUpdateReply(response) {
    response = new Uint8Array(response);

    return this.decodeMessage("ConfigUpdateReply", response);
  }

  /**
   * Creates a SchnorrSig object using the given parameters.
   * @param challenge
   * @param response
   * @returns {object} SchnorrSig
   */
  createSchnorrSig(challenge, response) {
    const model = this.getModel("SchnorrSig");

    const fields = {
      challenge: challenge,
      response: response
    };

    return model.create(fields);
  }

  /**
   * Create a device structure, that may be added to a config.
   * @param key
   * @returns {fields}
   */
  createDevice(key) {
    const model = this.getModel("Device");

    const fields = {
      point: key
    };

    return model.create(fields);
  }

  /**
   * Create a message request to vote an update to a config.
   * @param id
   * @param signer
   * @param challenge
   * @param response
   * @returns {*|Buffer|Uint8Array}
   */
  createProposeVote(id, signer, challenge, response) {
    const fields = {
      id: id,
      signer: signer,
      signature: {
        challenge: challenge,
        response: response
      }
    };

    return this.encodeMessage("ProposeVote", fields);
  }

  /**
   * Create a message request to propose an update to a config.
   * @param id
   * @param config
   * @returns {*|Buffer|Uint8Array}
   */
  createProposeSend(id, data) {
    const fields = {
      id: id,
      data: data
    };

    return this.encodeMessage("ProposeSend", fields);
  }

  /**
   * Create a message request to get the current config update propositions.
   * @param id
   * @returns {*|Buffer|Uint8Array}
   */
  createProposeUpdate(id) {
    const fields = {
      id: id
    };

    return this.encodeMessage("ProposeUpdate", fields);
  }

  /**
   * Return the decoded message of a propose update request.
   * @param response
   * @returns {*}
   */
  decodeProposeUpdateReply(response) {
    response = new Uint8Array(response);

    return this.decodeMessage("ProposeUpdateReply", response);
  }
}

/**
 * Singleton
 */
var index = new CothorityMessages();

module.exports = index;
