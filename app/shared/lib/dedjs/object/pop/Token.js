/**
 * Stores a final statement together with a keypair to disk.
 *
 * This module holds wrappers to save and load itself from disk.
 */

// List of all active tokens: only loaded and once saved configurations will appear in this list.
// The keys to this list are the hex string of the hash of the configuration stored in the token.
let List = {};

class Token {
    /**
     * Creates a new token from its basic data.
     * @param fs {FinalStatement}
     * @param keypair {KeyPair}
     */
    constructor(fs, keypair) {
        this._finalStatement = fs;
        this._keypair = keypair;
        // We only add it to the List on the first save.
        this._addedLoaded = false;
    }

    /**
     * Saves the token to disk.
     */
    save() {
        // Do saving to disk
        if (!this._addedLoaded) {
            this._addedLoaded = true;
            List.push(this);
        }
    }

    /**
     * Creates a proto-file from this configuration.
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

    /**
     * Loads all Tokens from disk and does eventual conversion from older formats to new formats.
     * @return {Promise<Token[]>}
     */
    static loadAll() {

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