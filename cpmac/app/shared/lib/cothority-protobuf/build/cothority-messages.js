'use strict';

function _interopDefault(ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var Protobuf = _interopDefault(require('protobufjs'));

<<<var Skeleton = '{"options":{"java_package":"ch.epfl.dedis.proto","java_outer_classname":"StatusProto"},"nested":{"cothority":{},"Device":{"fields":{"point":{"rule":"required","type":"bytes","id":1}}},"SchnorrSig":{"fields":{"challenge":{"rule":"required","type":"bytes","id":1},"response":{"rule":"required","type":"bytes","id":2}}},"ID":{"fields":{"id":{"rule":"required","type":"bytes","id":1}}},"Data":{"fields":{"threshold":{"rule":"required","type":"sint32","id":1},"device":{"keyType":"string","type":"Device","id":2},"storage":{"keyType":"string","type":"string","id":3},"votes":{"keyType":"string","type":"SchnorrSig","id":4}}},"StoreKeys":{"fields":{"type":{"rule":"required","type":"sint32","id":1},"final":{"type":"FinalStatement","id":2},"publics":{"rule":"repeated","type":"bytes","id":3},"sig":{"rule":"required","type":"SchnorrSig","id":4}}},"CreateIdentity":{"fields":{"data":{"type":"Data","id":1},"roster":{"type":"Roster","id":2},"type":{"rule":"required","type":"sint32","id":3},"public":{"rule":"required","type":"bytes","id":4},"schnorrSig":{"rule":"required","type":"SchnorrSig","id":5},"sig":{"rule":"required","type":"bytes","id":6},"nonce":{"rule":"required","type":"bytes","id":7}}},"CreateIdentityReply":{"fields":{"root":{"type":"SkipBlock","id":1},"data":{"type":"SkipBlock","id":2}}},"DataUpdate":{"fields":{"id":{"rule":"required","type":"bytes","id":1}}},"DataUpdateReply":{"fields":{"data":{"type":"Data","id":1}}},"ProposeSend":{"fields":{"id":{"rule":"required","type":"bytes","id":1},"data":{"type":"Data","id":2}}},"ProposeUpdate":{"fields":{"id":{"rule":"required","type":"ID","id":1}}},"ProposeUpdateReply":{"fields":{"data":{"type":"Data","id":1}}},"ProposeVote":{"fields":{"id":{"rule":"required","type":"ID","id":1},"signer":{"rule":"required","type":"string","id":2},"signature":{"type":"SchnorrSig","id":3}}},"ProposeVoteReply":{"fields":{"data":{"type":"SkipBlock","id":1}}},"PropagateIdentity":{"fields":{"tag":{"rule":"required","type":"string","id":1},"public":{"rule":"required","type":"bytes","id":2}}},"UpdateSkipBlock":{"fields":{"id":{"rule":"required","type":"ID","id":1},"latest":{"type":"SkipBlock","id":2}}},"Authenticate":{"fields":{"nonce":{"rule":"required","type":"bytes","id":1},"ctx":{"rule":"required","type":"bytes","id":2}}},"FinalStatement":{"fields":{"desc":{"rule":"required","type":"PopDesc","id":1},"attendees":{"rule":"required","type":"bytes","id":2},"signature":{"rule":"required","type":"bytes","id":3},"merged":{"rule":"required","type":"bool","id":4}}},"FinalStatementToml":{"fields":{"desc":{"rule":"required","type":"PopDescToml","id":1},"attendees":{"rule":"repeated","type":"string","id":2},"signature":{"rule":"required","type":"string","id":3},"merged":{"rule":"required","type":"bool","id":4}}},"PopDesc":{"fields":{"name":{"rule":"required","type":"string","id":1},"date_time":{"rule":"required","type":"string","id":2},"location":{"rule":"required","type":"string","id":3},"roster":{"rule":"required","type":"Roster","id":4},"parties":{"type":"ShortDesc","id":5}}},"PopDescToml":{"fields":{"name":{"rule":"required","type":"string","id":1},"date_time":{"rule":"required","type":"string","id":2},"location":{"rule":"required","type":"string","id":3},"roster":{"rule":"repeated","type":"string","id":4},"parties":{"rule":"repeated","type":"bytes","id":5}}},"ShortDesc":{"fields":{"location":{"rule":"required","type":"string","id":1},"roster":{"rule":"required","type":"Roster","id":2}}},"ShortDescToml":{"fields":{"location":{"rule":"required","type":"string","id":1},"roster":{"rule":"repeated","type":"string","id":2}}},"Roster":{"fields":{"id":{"type":"bytes","id":1},"list":{"rule":"repeated","type":"ServerIdentity","id":2,"options":{"packed":false}},"aggregate":{"type":"bytes","id":3}}},"ServerIdentity":{"fields":{"public":{"rule":"required","type":"bytes","id":1},"id":{"rule":"required","type":"bytes","id":2},"address":{"rule":"required","type":"string","id":3},"description":{"rule":"required","type":"string","id":4}}},"SkipBlock":{"fields":{"index":{"type":"int32","id":1},"height":{"type":"int32","id":2},"maxHeight":{"rule":"required","type":"int32","id":3},"baseHeight":{"rule":"required","type":"int32","id":4},"backlinks":{"type":"bytes","id":5},"verifiers":{"type":"bytes","id":6},"parent":{"type":"bytes","id":7},"genesis":{"type":"bytes","id":8},"data":{"rule":"required","type":"bytes","id":9},"roster":{"rule":"required","type":"Roster","id":10},"hash":{"type":"bytes","id":11},"forward":{"type":"BlockLink","id":12},"children":{"type":"BlockLink","id":13}}},"SkipBlockMap":{"fields":{"skipblocks":{"keyType":"string","type":"SkipBlock","id":1}}},"SkipBlockDataEntry":{"fields":{"key":{"rule":"required","type":"string","id":1},"data":{"rule":"required","type":"bytes","id":2}}},"SkipBlockData":{"fields":{"entries":{"rule":"repeated","type":"SkipBlockDataEntry","id":1,"options":{"packed":false}}}},"BlockLink":{"fields":{"hash":{"rule":"required","type":"bytes","id":1},"signature":{"rule":"required","type":"bytes","id":2}}},"GetBlock":{"fields":{"id":{"rule":"required","type":"bytes","id":1}}},"GetSingleBlock":{"fields":{"id":{"rule":"required","type":"bytes","id":1}}},"GetSingleBlockByIndex":{"fields":{"genesis":{"rule":"required","type":"bytes","id":1},"index":{"rule":"required","type":"int32","id":2}}},"GetBlockReply":{"fields":{"skipblock":{"rule":"required","type":"SkipBlock","id":1}}},"LatestBlockRequest":{"fields":{"latestId":{"rule":"required","type":"bytes","id":1}}},"LatestBlockResponse":{"fields":{"update":{"rule":"repeated","type":"SkipBlock","id":1,"options":{"packed":false}}}},"StoreSkipBlockRequest":{"fields":{"latestId":{"rule":"required","type":"bytes","id":1},"newBlock":{"rule":"required","type":"SkipBlock","id":2}}},"StoreSkipBlockResponse":{"fields":{"previous":{"rule":"required","type":"SkipBlock","id":1},"latest":{"rule":"required","type":"SkipBlock","id":2}}},"PropagateSkipBlock":{"fields":{"skipblock":{"rule":"required","type":"SkipBlock","id":1}}},"PropagateSkipBlocks":{"fields":{"skipblocks":{"rule":"repeated","type":"SkipBlock","id":1,"options":{"packed":false}}}},"ForwardSignature":{"fields":{"targetHeight":{"rule":"required","type":"int32","id":1},"previous":{"rule":"required","type":"bytes","id":2},"newest":{"rule":"required","type":"SkipBlock","id":3},"forwardLink":{"rule":"required","type":"BlockLink","id":4}}},"GetUpdateChain":{"fields":{"latestId":{"rule":"required","type":"bytes","id":1}}},"GetUpdateChainReply":{"fields":{"update":{"rule":"repeated","type":"SkipBlock","id":1,"options":{"packed":false}}}},"GetAllSkipchains":{"fields":{}},"GetAllSkipchainsReply":{"fields":{"skipchains":{"rule":"repeated","type":"SkipBlock","id":1,"options":{"packed":false}}}},"CheckConfig":{"fields":{"popHash":{"rule":"required","type":"bytes","id":1},"attendees":{"rule":"required","type":"bytes","id":2}}},"CheckConfigReply":{"fields":{"popStatus":{"rule":"required","type":"sint32","id":1},"popHash":{"rule":"required","type":"bytes","id":2},"attendees":{"rule":"required","type":"bytes","id":3}}},"MergeConfig":{"fields":{"final":{"rule":"required","type":"FinalStatement","id":1},"id":{"rule":"required","type":"bytes","id":2}}},"MergeConfigReply":{"fields":{"popStatus":{"rule":"required","type":"sint32","id":1},"popHash":{"rule":"required","type":"bytes","id":2},"final":{"rule":"required","type":"FinalStatement","id":3}}},"StoreConfig":{"fields":{"desc":{"rule":"required","type":"PopDesc","id":1},"signature":{"type":"bytes","id":2}}},"StoreConfigReply":{"fields":{"id":{"rule":"required","type":"bytes","id":1}}},"FinalizeRequest":{"fields":{"descId":{"rule":"required","type":"bytes","id":1},"attendees":{"rule":"required","type":"bytes","id":2},"signature":{"type":"bytes","id":3}}},"FinalizeResponse":{"fields":{"final":{"rule":"required","type":"FinalStatement","id":1}}},"FetchRequest":{"fields":{"id":{"rule":"required","type":"bytes","id":1}}},"MergeRequest":{"fields":{"id":{"rule":"required","type":"bytes","id":1},"signature":{"rule":"required","type":"bytes","id":2}}},"PinRequest":{"fields":{"pin":{"rule":"required","type":"string","id":1},"public":{"rule":"required","type":"bytes","id":2}}},"PopToken":{"fields":{"final":{"rule":"required","type":"FinalStatement","id":1},"private":{"rule":"required","type":"bytes","id":2},"public":{"rule":"required","type":"bytes","id":3}}},"PopTokenToml":{"fields":{"final":{"rule":"required","type":"FinalStatementToml","id":1},"private":{"rule":"required","type":"string","id":2},"public":{"rule":"required","type":"string","id":3}}},"ClockRequest":{"fields":{"roster":{"rule":"required","type":"Roster","id":1}}},"ClockResponse":{"fields":{"time":{"rule":"required","type":"double","id":1},"children":{"rule":"required","type":"sint32","id":2}}},"CountRequest":{"fields":{}},"CountResponse":{"fields":{"count":{"rule":"required","type":"sint32","id":1}}},"RandomRequest":{"fields":{}},"RandomResponse":{"fields":{"R":{"rule":"required","type":"bytes","id":1},"T":{"rule":"required","type":"Transcript","id":2}},"nested":{"Transcript":{"fields":{"nodes":{"rule":"required","type":"sint32","id":1},"groups":{"rule":"required","type":"sint32","id":2},"purpose":{"rule":"required","type":"string","id":3},"time":{"rule":"required","type":"fixed64","id":4}}}}},"SignatureRequest":{"fields":{"message":{"rule":"required","type":"bytes","id":1},"roster":{"rule":"required","type":"Roster","id":2}}},"SignatureResponse":{"fields":{"hash":{"rule":"required","type":"bytes","id":1},"signature":{"rule":"required","type":"bytes","id":2}}},"Request":{"fields":{}},"Response":{"fields":{"system":{"keyType":"string","type":"Status","id":1},"server":{"rule":"required","type":"ServerIdentity","id":2}},"nested":{"Status":{"fields":{"field":{"keyType":"string","type":"string","id":1}}}}}}}';
>>>

const { Root } = Protobuf;

/**
 * As we need to create a bundle, we cannot use the *.proto files. The script will wrap them in a skeleton file that
 * contains the JSON representation that can be used in the JavaScript code.
 */
var Root$1 = Root.fromJSON(JSON.parse(Skeleton));

/**
 * Base class for the protobuf library that provides helpers to encode and decode
 * messages according to a given model.
 *
 * @author Gaylor Bosson (gaylor.bosson@epfl.ch)
 */
class CothorityProtobuf {

  /**
   * @constructor
   */
  constructor() {
    this.root = Root$1;
  }

  /**
   * Encode a model to be transmitted over websocket.
   * @param {String} name
   * @param {Object} fields
   * @returns {*|Buffer|Uint8Array}
   */
  encodeMessage(name, fields) {
    const model = this.getModel(name);

    // Create the message with the model.
    const msg = model.create(fields);

    // Encode the message in a BufferArray.
    return model.encode(msg).finish();
  }

  /**
   * Decode a message coming from a websocket.
   * @param {String} name
   * @param {*|Buffer|Uint8Array} buffer
   */
  decodeMessage(name, buffer) {
    const model = this.getModel(name);
    return model.decode(buffer);
  }

  /**
   * Return the protobuf loaded model.
   * @param {String} name
   * @returns {ReflectionObject|?ReflectionObject|string}
   */
  getModel(name) {
    return this.root.lookup(`${name}`);
  }
}

/**
 * Helpers to encode and decode messages of the Cothority
 *
 * @author Gaylor Bosson (gaylor.bosson@epfl.ch)
 * @author Cedric Maire (cedric.maire@epfl.ch)
 */
class CothorityMessages extends CothorityProtobuf {

  /**
   * Server related messages.
   */

  /**
   * Creates a ServerIdentity object from the given parameters.
   * @param publicKey
   * @param id
   * @param {string} address
   * @param {string} desc
   * @returns {object} ServerIdentity
   */
  createServerIdentity(publicKey, id, address, desc) {
    const model = this.getModel("ServerIdentity");

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
   * @param id
   * @param {Array} list of ServerIdentity
   * @param aggregate
   * @returns {object} Roster
   */
  createRoster(/*id, */list/*, aggregate*/) {
    const model = this.getModel("Roster");

    const fields = {
      // TODO: id: id,
      list: list
      // TODO: aggregate: aggregate
    };

    return model.create(fields);
  }

  /**
   * Create an encoded message to make a StatusRequest to a cothority node.
   * @returns {*|Buffer|Uint8Array}
   */
  createStatusRequest() {
    return this.encodeMessage("Request", {});
  }

  /**
   * Return the decoded response of a StatusRequest.
   * @param {*|Buffer|Uint8Array} response - Response of the Cothority
   * @returns {*}
   */
  decodeStatusResponse(response) {
    response = new Uint8Array(response);

    return this.decodeMessage("Response", response);
  }

  /**
   * Create an encoded  message to get a random number.
   * @returns {*|Buffer|Uint8Array}
   */
  createRandomMessage() {
    return this.encodeMessage("RandomRequest", {});
  }

  /**
   * Return the decoded message of a random number request.
   * @param {*|Buffer|Uint8Array} response - Response of the Cothority
   * @returns {*}
   */
  decodeRandomResponse(response) {
    response = new Uint8Array(response);

    return this.decodeMessage("RandomResponse", response);
  }

  /**
   * Create an encoded message to make a sign request to a cothority node.
   * @param {Uint8Array} message - Message to sign stored in a Uint8Array
   * @param {Array} servers - list of ServerIdentity
   * @returns {*|Buffer|Uint8Array}
   */
  createSignatureRequest(message, servers) {
    if (!(message instanceof Uint8Array)) {
      throw new Error("message must be a instance of Uint8Array");
    }

    const fields = {
      message,
      roster: {
        // TODO: id: id
        list: servers
        // TODO: aggregate: aggregate
      }
    };

    return this.encodeMessage("SignatureRequest", fields);
  }

  /**
   * Return the decoded response of a signature request.
   * @param {*|Buffer|Uint8Array} response - Response of the Cothority
   * @returns {*}
   */
  decodeSignatureResponse(response) {
    response = new Uint8Array(response);

    return this.decodeMessage("SignatureResponse", response);
  }

  /**
   * Create an encoded message to make a ClockRequest to a cothority node.
   * @param {Array} servers - list of ServerIdentity
   * @returns {*|Buffer|Uint8Array}
   */
  createClockRequest(servers) {
    const fields = {
      roster: {
        // TODO: id: id
        list: servers
        // TODO: aggregate: aggregate
      }
    };

    return this.encodeMessage("ClockRequest", fields);
  }

  /**
   * Return the decoded response of a ClockRequest.
   * @param {*|Buffer|Uint8Array} response - Response of the Cothority
   * @returns {*}
   */
  decodeClockResponse(response) {
    response = new Uint8Array(response);

    return this.decodeMessage("ClockResponse", response);
  }

  /**
   * Create an encoded message to make a CountRequest to a cothority node.
   * @returns {*|Buffer|Uint8Array}
   */
  createCountRequest() {
    return this.encodeMessage("CountRequest", {});
  }

  /**
   * Return the decoded response of a CountRequest.
   * @param {*|Buffer|Uint8Array} response - Response of the Cothority
   * @returns {*}
   */
  decodeCountResponse(response) {
    response = new Uint8Array(response);

    return this.decodeMessage("CountResponse", response);
  }

  /**
   * Skip{block, chain} related messages.
   */

  /**
   * Creates a SkipBlock with the given parameters.
   * @param {int} index
   * @param {int} height
   * @param {int} max_height
   * @param {int} base_height
   * @param backlinks
   * @param verifiers
   * @param parent
   * @param genesis
   * @param data
   * @param {object} roster a Roster object
   * @param hash
   * @param {object} forward a BlockLink object
   * @param {object} children a BlockLink object
   * @returns {object} SkipBlock
   */
  createSkipBlock(index, height, max_height, base_height, backlinks, verifiers, parent, genesis, data, roster, hash,
    forward, children) {
    const model = this.getModel("SkipBlock");

    const fields = {
      index: index,
      height: height,
      max_height: max_height,
      base_height: base_height,
      backlinks: backlinks,
      verifiers: verifiers,
      parent: parent,
      genesis: genesis,
      data: data,
      roster: roster,
      hash: hash,
      forward: forward,
      children: children
    };

    return model.create(fields);
  }

  /**
   * Creates a SkipBlockMap using the map given as parameter.
   * @param {map} skipblocks
   * @returns {object} SkipBlockMap
   */
  createSkipBlockMap(skipblocks) {
    const model = this.getModel("SkipBlockMap");

    const fields = {
      skipblocks: skipblocks
    };

    return model.create(fields);
  }

  /**
   * Creates a SkipBlockDataEntry from the given parameters.
   * @param {string} key
   * @param data
   * @returns {object} SkipBlockDataEntry
   */
  createSkipBlockDataEntry(key, data) {
    const model = this.getModel("SkipBlockDataEntry");

    const fields = {
      key: key,
      data: data
    };

    return model.create(fields);
  }

  /**
   * Creates a SkipBlockData from the given parameter.
   * @param {Array} entries a list of SkipBlockDataEntry
   * @returns {object} SkipBlockData
   */
  createSkipBlockData(entries) {
    const model = this.getModel("SkipBlockData");

    const fields = {
      entries: entries
    };

    return model.create(fields);
  }

  /**
   * Creates a BlockLink using the given parameters.
   * @param hash
   * @param signature
   * @returns {object} BlockLink
   */
  createBlockLink(hash, signature) {
    const model = this.getModel("BlockLink");

    const fields = {
      hash: hash,
      signature: signature
    };

    return model.create(fields);
  }

  /**
   * Creates a GetBlock request for the Cothority.
   * @param id
   * @returns {*|Buffer|Uint8Array}
   */
  createGetBlockRequest(id) {
    const fields = {
      id: id
    };

    return this.encodeMessage("GetBlock", fields);
  }

  /**
   * Creates a GetSingleBlock request for the Cothority.
   * @param id
   * @returns {*|Buffer|Uint8Array}
   */
  createGetSingleBlockRequest(id) {
    const fields = {
      id: id
    };

    return this.encodeMessage("GetSingleBlock", fields);
  }

  /**
   * Creates a GetSingleBlockByIndex request for the Cothority.
   * @param genesis
   * @param {int} index
   * @returns {*|Buffer|Uint8Array}
   */
  createGetSingleBlockByIndexRequest(genesis, index) {
    const fields = {
      genesis: genesis,
      index: index
    };

    return this.encodeMessage("GetSingleBlockByIndex", fields);
  }

  /**
   * Decodes and returns the reply of a block request.
   * @param response
   * @returns {*}
   */
  decodeGetBlockReply(response) {
    response = new Uint8Array(response);

    return this.decodeMessage("GetBlockReply", response);
  }

  /**
   * Create a message request to get the latest blocks of a skip-chain.
   * @param {Uint8Array} id - ID of the genesis block of the skip-chain
   * @returns {*|Buffer|Uint8Array}
   */
  createLatestBlockRequest(id) {
    if (!(id instanceof Uint8Array)) {
      throw new Error("message must be a instance of Uint8Array");
    }

    const fields = {
      latest_id: id
    };

    return this.encodeMessage("LatestBlockRequest", fields);
  }

  /**
   * Return the decoded message of a latest block request.
   * @param {*|Buffer|Uint8Array} response - Response of the Cothority
   * @returns {*}
   */
  decodeLatestBlockResponse(response) {
    response = new Uint8Array(response);

    return this.decodeMessage("LatestBlockResponse", response);
  }

  /**
   * Create a message to store a new block.
   * @param {Uint8Array} id - ID of the current latest block
   * @param {Array} servers - list of ServerIdentity
   * @returns {*|Buffer|Uint8Array}
   */
  createStoreSkipBlockRequest(id, servers) {
    if (!(id instanceof Uint8Array)) {
      throw new Error("message must be a instance of Uint8Array");
    }

    const fields = {
      latest_id: id,
      new_block: {
        // TODO: index: index
        // TODO: height: height
        max_height: 1,
        base_height: 1, // TODO: backlinks: backlinks
        // TODO: verifiers: verifiers
        // TODO: parent: parent
        // TODO: genesis: genesis
        data: new Uint8Array([]),
        roster: {
          // TODO: id: id
          list: servers
          // TODO: aggregate: aggregate
        }
        // TODO: hash: hash
        // TODO: forward: {
        // TODO:  hash: hash
        // TODO:  signature: sig
        // TODO: }
        // TODO: children: {
        // TODO:  hash: hash
        // TODO:  signature: sig
        // TODO: }
      }
    };

    return this.encodeMessage("StoreSkipBlockRequest", fields);
  }

  /**
   * Return the decoded message of a store skip block request.
   * @param {*|Buffer|Uint8Array} response - Response of the Cothority
   * @returns {*}
   */
  decodeStoreSkipBlockResponse(response) {
    response = new Uint8Array(response);

    return this.decodeMessage("StoreSkipBlockResponse", response);
  }

  /**
   * Encodes a PropagateSkipBlock request for the Cothority.
   * @param {object} skipblock a SkipBlock object
   * @returns {*|Buffer|Uint8Array}
   */
  createPropagateSkipBlockRequest(skipblock) {
    const fields = {
      skipblock: skipblock
    };

    return this.encodeMessage("PropagateSkipBlock", fields);
  }

  /**
   * Encodes a PropagateSkipBlocks request for the Cothority.
   * @param {Array} skipblocks a list of SkipBlock
   * @returns {*|Buffer|Uint8Array}
   */
  createPropagateSkipBlocksRequest(skipblocks) {
    const fields = {
      skipblocks: skipblocks
    };

    return this.encodeMessage("PropagateSkipBlocks", fields);
  }

  /**
   * Creates a ForwardSignature request for the Cothority.
   * @param {int} target_height
   * @param previous
   * @param {object} newest a SkipBlock object
   * @param {object} forward_link a BlockLink object
   * @returns {*|Buffer|Uint8Array}
   */
  createForwardSignatureRequest(target_height, previous, newest, forward_link) {
    const fields = {
      target_height: target_height,
      previous: previous,
      newest: newest,
      forward_link: forward_link
    };

    return this.encodeMessage("ForwardSignature", fields);
  }

  /**
   * Creates a GetUpdateChain request for the Cothority.
   * @param latest_id
   * @returns {*|Buffer|Uint8Array}
   */
  createGetUpdateChainRequest(latest_id) {
    const fields = {
      latest_id: latest_id
    };

    return this.encodeMessage("GetUpdateChain", fields);
  }

  /**
   * Decodes and returns the response to a GetUpdateChain request.
   * @param response
   * @returns {*}
   */
  decodeGetUpdateChainReply(response) {
    response = new Uint8Array(response);

    return this.decodeMessage("GetUpdateChainReply", response);
  }

  /**
   * Encodes a GetAllSkipchains request for the Cothority.
   * @returns {*|Buffer|Uint8Array}
   */
  createGetAllSkipchainsRequest() {
    return this.encodeMessage("GetAllSkipchains", {});
  }

  /**
   * Decodes and returns a GetAllSkipchains request.
   * @param response
   * @returns {*}
   */
  decodeGetAllSkipchainsReply(response) {
    response = new Uint8Array(response);

    return this.decodeMessage("GetAllSkipchainsReply", response);
  }

  /**
   * PoP related messages.
   */

  /**
   * Creates a PopDesc description using the information given as parameters.
   * @param {string} name
   * @param {string} date_time
   * @param {string} location
   * @param {object} roster
   * @param {Array} parties a list of ShortDesc objects
   * @returns {object} PopDesc
   */
  createPopDesc(name, date_time, location, roster/*, parties*/) {
    const model = this.getModel("PopDesc");

    const fields = {
      name: name,
      date_time: date_time,
      location: location,
      roster: roster
      // TODO: parties: parties
    };

    return model.create(fields);
  }

  /**
   * Creates a PopDescToml description using the information given as parameters.
   * @param {string} name
   * @param {string} date_time
   * @param {string} location
   * @param {string} roster
   * @param {Array} parties
   * @returns {object} PopDescToml
   */
  createPopDescToml(name, date_time, location, roster, parties) {
    const model = this.getModel("PopDescToml");

    const fields = {
      name: name,
      date_time: date_time,
      location: location,
      roster: roster,
      parties: parties
    };

    return model.create(fields);
  }

  /**
   * Creates a ShortDesc object using the given parameters.
   * @param {string} location
   * @param {object} roster a Roster object
   * @returns {object} ShortDesc
   */
  createShortDesc(location, roster) {
    const model = this.getModel("ShortDesc");

    const fields = {
      location: location,
      roster: roster
    };

    return model.create(fields);
  }

  /**
   * Creates a ShortDescToml object using the given parameters.
   * @param {string} location
   * @param {string} roster
   * @returns {object} ShortDescToml
   */
  createShortDescToml(location, roster) {
    const model = this.getModel("ShortDescToml");

    const fields = {
      location: location,
      roster: roster
    };

    return model.create(fields);
  }

  /**
   * Creates a PopToken given the parameters.
   * @param {object} final a FinalStatement
   * @param privateKey
   * @param publicKey
   * @returns {object} PopToken
   */
  createPopToken(final, privateKey, publicKey) {
    const model = this.getModel("PopToken");

    const fields = {
      final: final,
      private: privateKey,
      public: publicKey
    };

    return model.create(fields);
  }

  /**
   * Creates a PopTokenToml given the parameters.
   * @param {object} final a FinalStatementToml
   * @param {string} privateKey
   * @param {string} publicKey
   * @returns {object} PopTokenToml
   */
  createPopTokenToml(final, privateKey, publicKey) {
    const model = this.getModel("PopTokenToml");

    const fields = {
      final: final,
      private: privateKey,
      public: publicKey
    };

    return model.create(fields);
  }

  /**
   * Creates and encodes a CheckConfig request for the Cothority.
   * @param pop_hash
   * @param attendees
   * @returns {*|Buffer|Uint8Array}
   */
  createCheckConfigRequest(pop_hash, attendees) {
    const fields = {
      pop_hash: pop_hash,
      attendees: attendees
    };

    return this.encodeMessage("CheckConfig", fields);
  }

  /**
   * Decodes and returns a reply to a CheckConfig request.
   * @param response
   * @returns {*}
   */
  decodeCheckConfigReply(response) {
    response = new Uint8Array(response);

    return this.decodeMessage("CheckConfigReply", response);
  }

  /**
   * Encodes a MergeConfig request for the Cothority.
   * @param {object} final a FinalStatement object.
   * @param id
   * @returns {*|Buffer|Uint8Array}
   */
  createMergeConfigRequest(final, id) {
    const fields = {
      final: final,
      id: id
    };

    return this.encodeMessage("MergeConfig", fields);
  }

  /**
   * Decodes and returns a reply to a MergeConfig request.
   * @param response
   * @returns {*}
   */
  decodeMergeConfigReply(response) {
    response = new Uint8Array(response);

    return this.decodeMessage("MergeConfigReply", response);
  }

  /**
   * Create an encoded message to store configuration information of a given PoP party.
   * @param name
   * @param date
   * @param location
   * @param id
   * @param servers
   * @param aggregate
   * @returns {*|Buffer|Uint8Array}
   */
  createStoreConfig(name, date, location, /*id, */servers/*, aggregate*/) {
    const fields = {
      desc: this.createPopDesc(name, date, location, this.createRoster(servers))
    };

    /*
    const fields = {
      desc: {
        name: name,
        date_time: date,
        location: location,
        roster: this.createRoster(servers)
        /*
        roster: {
          // TODO: id: id,
          list: servers
          // TODO: aggregate: aggregate
        }
        *//*
// TODO: parties: {
// TODO:  location: location
// TODO:  roster: {
// TODO:    id: id
// TODO:    list: servers
// TODO:    aggregate: aggregate
// TODO:  }
// TODO: }
}
// TODO: signature: signature
};
*/

    return this.encodeMessage("StoreConfig", fields);
  }

  /**
   * Return the decoded response of a StoreConfig request.
   * @param response
   * @returns {*}
   */
  decodeStoreConfigReply(response) {
    response = new Uint8Array(response);

    return this.decodeMessage("StoreConfigReply", response);
  }

  /**
   * Creates a FinalStatement given the parameters.
   * @param {object} desc a PopDesc object
   * @param attendees
   * @param signature
   * @param {boolean} merged
   * @returns {fields}
   */
  createFinalStatement(desc, attendees, signature, merged) {
    const model = this.getModel("FinalStatement");

    const fields = {
      desc: desc,
      attendees: attendees,
      signature: signature,
      merged: merged
    };

    return model.create(fields);
  }

  /**
   * Creates a FinalStatementToml given the parameters.
   * @param {object} desc a PopDescToml object
   * @param {string} attendees
   * @param {string} signature
   * @param {boolean} merged
   * @returns {fields}
   */
  createFinalStatementToml(desc, attendees, signature, merged) {
    const model = this.getModel("FinalStatementToml");

    const fields = {
      desc: desc,
      attendees: attendees,
      signature: signature,
      merged: merged
    };

    return model.create(fields);
  }

  /**
   * Create an encoded message to finalize on the given descId-popconfig.
   * @param desc_id
   * @param attendees
   * @returns {*|Buffer|Uint8Array}
   */
  createFinalizeRequest(desc_id, attendees) {
    const fields = {
      desc_id: desc_id,
      attendees: attendees
      // TODO: signature: signature
    };

    return this.encodeMessage("FinalizeRequest", fields);
  }

  /**
   * Return the decoded response of a FinalizeRequest.
   * @param response
   * @returns {*}
   */
  decodeFinalizeResponse(response) {
    response = new Uint8Array(response);

    return this.decodeMessage("FinalizeResponse", response);
  }

  /**
   * Create an encoded message to make a PinRequest to a cothority node.
   * @param pin previously generated by the conode
   * @param publicKey
   * @returns {*|Buffer|Uint8Array}
   */
  createPinRequest(pin, publicKey) {
    const fields = {
      pin: pin,
      public: publicKey
    };

    return this.encodeMessage("PinRequest", fields);
  }

  /**
   * Creates and encodes a FetchRequest for the Cothority.
   * @param id
   * @returns {*|Buffer|Uint8Array}
   */
  createFetchRequest(id) {
    const fields = {
      id: id
    };

    return this.encodeMessage("FetchRequest", fields);
  }

  /**
   * Creates and encodes a MergeRequest for the Cothority.
   * @param id
   * @param signature
   * @returns {*|Buffer|Uint8Array}
   */
  createMergeRequest(id, signature) {
    const fields = {
      id: id,
      signature: signature
    };

    return this.encodeMessage("MergeRequest", fields);
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
   * Create a mesage request to get the config of a given identity.
   * @param id: the identifier of the identity you're trying to fetch
   * @returns {*|Buffer|Uint8Array} Data
   */
  createDataUpdate(id) {
    const fields = {
      id: id
    };

    return this.encodeMessage("DataUpdate", fields);
  }

  /**
   * Return the decoded message of a data update request.
   * @param response
   * @returns {*}
   */
  decodeDataUpdateReply(response) {
    response = new Uint8Array(response);

    return this.decodeMessage("DataUpdateReply", response);
  }

  /**
   * Create a message request to get the proposed config of a given conode.
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
   * Return the decoded message of a config update request.
   * @param response
   * @returns {*}
   */
  decodeProposeUpdateReply(response) {
    response = new Uint8Array(response);

    return this.decodeMessage("ProposeUpdateReply", response);
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
   * @param data
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

  /**
   * Extra helper methods.
   */

  /**
   * Decodes and returns the response of a request.
   * @param {string} messageType the type of the message or type of the response of a request.
   * @param response
   * @returns {*}
   */
  decodeResponse(messageType, response) {
    // TODO: remove the other ones?
    return this.decodeMessage(messageType, new Uint8Array(response));
  }

  /**
   * Converts an arraybuffer to a hex-string.
   * @param {ArrayBuffer} buffer
   * @returns {string} hexified ArrayBuffer
   */
  static buf2hex(buffer) {
    return Array.prototype.map.call(new Uint8Array(buffer), x => ("00" + x.toString(16)).slice(-2)).join("");
  }

  /**
   * Converts a hex-string to an arraybuffer.
   * @param {string} string
   * @returns {Buffer|Array|*}
   */
  static hex2Buf(string) {
    let temp = [];

    for (let i = 0; i < string.length; i += 2) {
      temp.push(parseInt(string.substring(i, i + 2), 16));
    }

    return Uint8Array.from(temp);
  }

  /**
   * Converts a toml-string of public.toml to a roster that can be sent
   * to a service. Also calculates the id of the ServerIdentities.
   * @param {string} toml of public.toml
   * @returns {object} Roster-object
   */
  toml_to_roster(toml) {
    let parsed = {};

    try {
      // TODO: import statement?
      parsed = topl.parse(toml);
      parsed.servers.forEach(function (server) {
        const publicKey = CothorityMessages.buf2hex(Uint8Array.from(atob(server.public), c => c.charCodeAt(0)));
        const url = "https://dedis.epfl.ch/id/" + publicKey;
        server.id = new UUID(5, "ns:URL", url).export();
      });
    } catch (err) {
    }

    return parsed;
  }

  /**
   * Returns a websocket-url from a ServerIdentity.
   * @param {object} si the server identity to convert to a websocket-url
   * @param {string} path
   * @returns {string} the url
   */
  static si_to_ws(si, path) {
    const ip_port = si.address.replace("tcp://", "").split(":");
    ip_port[1] = parseInt(ip_port[1]) + 1;

    return "ws://" + ip_port.join(":") + path;
  }

  /**
   * Use the existing socket or create a new one if required to send data over a web-socket.
   * @param socket - WebSocket-array
   * @param address - String ws address
   * @param message - ArrayBuffer the message to send
   * @param callback - Function callback when a message is received
   * @param errorFunction - Function callback if an error occurred
   * @returns {*}
   */
  createSocket(socket = {}, address, message, callback, errorFunction) {
    let sock = socket[address];
    if (!sock || sock.readyState > 2) {
      sock = new WebSocket(address);
      sock.binaryType = "arraybuffer";
      socket[address] = sock;
    }

    sock.addEventListener("error", onError);
    sock.addEventListener("message", onMessage);

    if (sock.readyState === 0) {
      sock.addEventListener("open", () => {
        sock.send(message);
      });
    } else {
      sock.send(message);
    }

    function onError(error) {
      sock.removeEventListener("error", onError);
      errorFunction(error);
    }

    function onMessage(message) {
      sock.removeEventListener("message", onMessage);
      callback(message.data);
    }

    return socket;
  }
}

/**
 * Singleton
 */
var index = new CothorityMessages();

module.exports = index;
