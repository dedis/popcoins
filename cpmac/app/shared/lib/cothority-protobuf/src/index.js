import CothorityProtobuf from "./cothority-protobuf";

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
   * @param {Array} list of ServerIdentity
   * @param aggregate
   * @returns {object} Roster
   */
  createRoster(list, aggregate) {
    const model = this.getModel("Roster");

    const fields = {
      list: list,
      aggregate: aggregate
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
   * @param {Uint8Array} aggregate - aggregate of the servers
   * @returns {*|Buffer|Uint8Array}
   */
  createSignatureRequest(message, servers, aggregate) {
    if (!(message instanceof Uint8Array)) {
      throw new Error("message must be a instance of Uint8Array");
    }

    const fields = {
      message,
      roster: this.createRoster(servers, aggregate)
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
   * @param {Uint8Array} aggregate - aggregate of the servers
   * @returns {*|Buffer|Uint8Array}
   */
  createClockRequest(servers, aggregate) {
    const fields = {
      roster: this.createRoster(servers, aggregate)
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
   * @param {string} dateTime
   * @param {string} location
   * @param {object} roster
   * @returns {*}
   */
  createPopDesc(name, dateTime, location, roster) {
    const model = this.getModel("PopDesc");

    const fields = {
      name: name,
      dateTime: dateTime,
      location: location,
      roster: roster
    };

    return model.create(fields);
  }

  /**
   * Creates a PopDesc encoded as a Uint8Array, this way it can easily be signed.
   * @param {string} name
   * @param {string} dateTime
   * @param {string} location
   * @param {object} roster
   */
  createPopDescEncoded(name, dateTime, location, roster) {
    const fields = {
      name: name,
      dateTime: dateTime,
      location: location,
      roster: roster
    };

    return this.encodeMessage("PopDesc", fields);
  }

  /**
   * Creates a PopDescToml description using the information given as parameters.
   * @param {string} name
   * @param {string} dateTime
   * @param {string} location
   * @param {string} roster
   * @returns {object} PopDescToml
   */
  createPopDescToml(name, dateTime, location, roster) {
    const model = this.getModel("PopDescToml");

    const fields = {
      name: name,
      dateTime: dateTime,
      location: location,
      roster: roster
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
   * @param popHash
   * @param attendees
   * @returns {*|Buffer|Uint8Array}
   */
  createCheckConfigRequest(popHash, attendees) {
    const fields = {
      popHash: popHash,
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
   * @param roster
   * @param signature
   * @returns {*|Buffer|Uint8Array}
   */
  createStoreConfig(name, date, location, roster, signature) {
    if (!(signature instanceof Uint8Array)) {
      throw new Error("signature must be a instance of Uint8Array");
    }

    const fields = {
      desc: this.createPopDesc(name, date, location, roster),
      signature: signature
    };

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
   * @param descId
   * @param attendees
   * @returns {*|Buffer|Uint8Array}
   */
  createFinalizeRequest(descId, attendees) {
    const fields = {
      descId: descId,
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
export default new CothorityMessages();
