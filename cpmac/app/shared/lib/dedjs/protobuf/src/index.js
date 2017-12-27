import CothorityProtobuf from "./cothority-protobuf";
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
  createDataUpdate(id) {
    const fields = {
      id: id
    };

    return this.encodeMessage("DataUpdate", fields);
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
  createProposeVote(id, signer, signature) {
    const fields = {
      id: id,
      signer: signer,
      signature: signature
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
export default new CothorityMessages();
