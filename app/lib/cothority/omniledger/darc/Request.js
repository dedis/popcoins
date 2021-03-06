const crypto = require("crypto-browserify");

class Request {
    /**
     *
     * @param {Uint8Array} baseId
     * @param {string} action
     * @param {Uint8Array} msg
     * @param {Identity[]} identities
     */
    constructor(baseId, action, msg, identities) {
        this._baseId = baseId;
        this._action = action;
        this._msg = msg;
        this._identities = identities;
    }

    /**
     * Computes the sha256 digest of the request, the message that it hashes does not include the signature part of the
     * request.

     * @return {Uint8Array} The digest.
     */
    hash() {
        const hash = crypto.createHash("sha256");
        if (this._baseId !== undefined) {
            hash.update(this._baseId);
        }
        hash.update(this._action);
        hash.update(this._msg);
        this._identities.forEach(identity => {
            hash.update(identity.toString());
        });

        const b = hash.digest();
        return new Uint8Array(b.buffer, b.byteOffset, b.byteLength / Uint8Array.BYTES_PER_ELEMENT);
    }
}

module.exports = Request;
