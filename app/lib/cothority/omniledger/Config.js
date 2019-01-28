const root = require("../protobuf/index.js").root;
const identity = require("../identity");

/**
 * Config is the genesis configuration of an omniledger instance. It can be stored only once in omniledger
 * and defines the basic running parameters of omniledger.
 */
class Config {
  /**
   * Creates a config from knwon informations
   * @param {number} byzcoinID
   * @param {Roster} roster that hosts the OMniLedger
   */
  constructor(byzcoinID, roster) {
    this._byzcoinID = byzcoinID;
    this._roster = roster;
  }

  /**
   * @return {number} - the blockinterval used
   */
  get byzcoinID() {
    return this._byzcoinID;
  }

  /**
   * @return {Roster} - the roster of the omniledger
   */
  get roster() {
    return this._roster;
  }

  /**
   * Creates a Config from a byte array
   * @param {Uint8Array} buf
   * @return {Config}
   */
  static fromByteBuffer(buf) {
    if (!(buf instanceof Uint8Array)) {
      throw "buf must be of type UInt8Array";
    }
    const configModel = root.lookup("ChainConfig");
    let config = configModel.decode(buf);

    return new Config(config.byzcoinID, identity.Roster.fromProtobuf(config.roster, false));
  }

  /**
   * Check if two Configs are equal
   * @param {Object} config
   * @return {boolean} - true if the config are equals (e.i if they have
   * the same blockinterval)
   */
  equals(config) {
    if (config === undefined) return false;
    if (!(config instanceof Config)) return false;
    return this._byzcoinID === config.byzcoinID;
  }
}

module.exports = Config;