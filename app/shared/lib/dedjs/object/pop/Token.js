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
     * Signs a message in a given context using linkable ring signatures.
     * @param message an arbitrary buffer of data
     * @param context a context within which an attendee will be recognized
     * @returns {Uint8ArrayConstructor} the signature
     */
    sign(message, context) {
        return Uint8Array;
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