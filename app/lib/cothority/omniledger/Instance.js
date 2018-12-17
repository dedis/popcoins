class Instance {
  /**
   * @param {Uint8Array} id
   * @param {string} contractId
   * @param {Uint8Array} darcId
   * @param {Uint8Array} data
   */
  constructor(id, contractId, darcId, data) {
    this._id = id;
    this._contractId = contractId;
    this._darcId = darcId;
    this._data = data;
  }

  /**
   *
   * @param {Proof} proof
   */
  static fromProof(proof) {
    if (!proof.matches()) {
      throw "This is a proof of absence";
    }
    const contractId = proof.stateChangeBody.contractID

    return new Instance(proof.key, contractId, proof.stateChangeBody.darcID, proof.stateChangeBody.value);
  }

  /**
   *
   * @return {Uint8Array}
   */
  get id() {
    return this._id;
  }

  /**
   *
   * @return {string}
   */
  get contractId() {
    return this._contractId;
  }

  /**
   *
   * @return {Uint8Array}
   */
  get darcId() {
    return this._darcId;
  }

  /**
   *
   * @return {Uint8Array}
   */
  get data() {
    return this._data;
  }
}

module.exports = Instance;