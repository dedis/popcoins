const Kyber = require("@dedis/kyber-js");
const CurveEd25519 = new Kyber.curve.edwards25519.Curve;

const RingSig = require("../../RingSig");

/**
 * Stores a final statement together with a keypair to disk.
 *
 * This module holds wrappers to save and load itself from disk.
 */

class Token {
    /**
     * Creates a new token from its basic data.
     * @param fs {FinalStatement}
     * @param keypair {KeyPair}
     */
    constructor(fs, keypair) {
        this._finalStatement = fs;
        this._keypair = keypair;
    }

    /**
     * Sign a message using (un)linkable ring signature
     *
     * @param PopToken Instance - the  pop token used to sign the message
     * @param {Uint8Array} message -  the message to be signed
     * @param {Uint8Array} [scope] - has to be given if linkable ring signature is used
     * @return {Uint8Array} - the signature
     */
    sign(message, scope) {
        let attendees = this._finalStatement.attendees;
        let anonimitySet = new Set();
        let minePublic = CurveEd25519.point();
        minePublic.unmarshalBinary(this._keypair.public);
        let minePrivate = CurveEd25519.scalar();
        minePrivate.unmarshalBinary(this._keypair.private);
        let mine = -1;
        for (let i = 0; i < attendees.length; i++) {
            let attendee = attendees[i];

            let point = CurveEd25519.point();
            point.unmarshalBinary(attendee);
            anonimitySet.add(point);
            if (point.equal(minePublic)) {
                mine = i;
            }
        }

        if (mine < 0) {
            throw "Pop Token is invalid"
        }

        return RingSig.Sign(CurveEd25519, message, [...anonimitySet], scope, mine, minePrivate)
    }

    /**
     * Creates a proto-file from this token.
     * @returns {Buffer}
     */
    toProto() {
        return Buffer();
    }

    /**
     * Creates a new token from a proto-file.
     * @param proto
     * @returns {Token}
     */
    static fromProto(proto) {
        return new Token();
    }

    // Getters for our public values.
    get config() {
        return this._config;
    }

    get attendees() {
        return this._attendees;
    }

    get signature() {
        return this._signature;
    }

    get token() {
        return null;
    }
}

module.exports = Token;