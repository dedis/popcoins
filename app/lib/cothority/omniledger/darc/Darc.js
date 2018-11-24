const root = require("../../protobuf/index.js").root;
const crypto = require('crypto-browserify');
const Log = require("../../../../lib/Log").default;

/**
 * Darc stands for distributed access right control. It provides a powerful access control policy that supports logical
 * expressions, delegation of rights, offline verification and so on. Please refer to
 * https://github.com/dedis/cothority/omniledger/README.md#darc for more information.
 */
class Darc {
  /**
   * Construct a Darc when the complete configuration is known
   *
   * @param {number} version - version of the cuurent Darc's evolution
   * @param {Uint8Array} description - a free-form fiels that can hold any data
   * @param {Uint8Array} baseID - the ID of the first darc in the evolution chain
   * @param {Uint8Array} prevID - the ID of the previous darc in the evolution chains
   * @param {Map<string, Uint8Array>} rules - map each action to an expression
   * @param {Array} signatures - It needs to be created by identities that have the "_evolve" action
   * from the previous valid Darc.
   */
  constructor(version, description, baseID, prevID, rules, signatures) {
    this._version = version;
    this._description = description;
    this._baseID = 0;
    this._prevID = prevID;
    this._rules = rules;
    this._signatures = signatures;
    this._id = 0;
    if (this._version == 0) {
      this._baseID = this.getID();
    } else {
      this._baseID = baseID;
    }
  }

  /**
   * Create a Darc from a Protobuf object
   *
   * @param proto - the object returned by protobud decode
   * @return {Darc} - the new instance
   */
  static fromProtoBuf(proto) {
    let version = proto.version;
    let description = proto.description.slice(0);
    let baseID = undefined;
    if (version > 0) {
      baseID = proto.baseid.slice(0);
    }
    let prevID = proto.previd.slice(0);
    let rules = new Map();
    Object.entries(proto.rules).forEach(([key, value]) =>
      rules.set(key, value.slice(0))
    );
    let signatures = proto.signatures;
    if (signatures !== undefined) signatures = signatures.slice(0);

    return new Darc(version, description, baseID, prevID, rules, signatures);
  }

  /**
   * Create a Darc from a byte buffer
   * @param {Uint8Array} buf - an array of byte
   * @return {Darc} - the new instance
   */
  static fromByteBuffer(buf) {
    if (!(buf instanceof Uint8Array)) {
      throw "buf must be of type UInt8Array";
    }
    const darcModel = root.lookup("Darc");
    let darcProto = darcModel.decode(buf);

    return Darc.fromProtoBuf(darcProto);
  }

  static createDarcWithOwner(owner) {
    const nonce = Math.floor(Math.random() * 0xffffffff);
     console.dir(new Map().set.toString());
     var rules = new Map();
     rules.set("_sign", owner);
     rules.set("invoke:evolve", owner);
     let darc = new Darc(0, "DARC #" + nonce.toString(16), 0, 0, rules, []);
     return darc;
  }

  static createDarcFromJSON(d) {
    let version = d._version  !== undefined   ? d._version        : 0 ;
    let desc = d._description !== undefined   ? d._description    : "";
    let bid  = d._baseID      !== undefined   ? d._baseID         : 0 ;
    let pid  = d._prevID      !== undefined   ? d._prevID         : 0 ;
    let rules = d._rules     instanceof Array ? new Map(d._rules) : new Map();
    let sigs = d._signatures instanceof Array ? d._signatures     : [];

    return new Darc(version, desc, bid, pid, rules, sigs);
  }

  getID() {
    if (this._id == 0) {
      const sha = crypto.createHash('sha256');
      sha.update(this._version.toString());
      sha.update(this._description.toString());
      sha.update(this._baseID.toString());
      sha.update(this._prevID.toString());
      for (var [rule, expr] of this._rules) {
        sha.update(rule.toString());
        sha.update(expr.toString());
      }
      this._id = sha.digest('hex');
    }
    return this._id;
  }

  getIDString() {
    return "darc:" + this.getID();
  }

  getBaseIDString() {
    return "darc:" + this._baseID;
  }

  getPrevIDString() {
    return "darc:" + this._prevID;
  }

  evolve() {
    this._version++;
    this._id = 0;
    return this;
  }

  getRule(index) {
    let i = 0;
    for (var [rule, expr] of this._rules) {
      if (i == index) return [rule, expr];
      i++;
    }
  }

  adaptForJSON() {
    var rules = [];
    for (var [r,e] of this._rules) {
      rules.push([r,e]);
    }
    return new Darc(this._version, this._description, this._baseID, this._prevID, rules, this._signatures);
  }
}

module.exports = Darc;
