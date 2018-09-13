const Kyber = require('@dedis/kyber-js');

/**
 * Stores a configuration together with the list of attendees and the signature of the organizers.
 *
 * This module holds wrappers to save and load itself from disk.
 */

// List of all active final statements: only loaded and once saved configurations will appear in this list.
// The keys to this list are the hex string of the hash of the configuration stored in the final statement.
let List = {};

class FinalStatement {

    /**
     * Creates a new configuration from its basic data.
     * @param config {Configuration}
     * @param attendees {Kyber.Point[]}
     * @param signature {Uint8Array}
     */
    constructor(config, attendees, signature) {
        this._config = config;
        this._attendees = attendees;
        this._signature = signature;
        // We only add it to the List on the first save.
        this._addedLoaded = false;
    }

    /**
     * Saves this final statement to disk.
     */
    save() {
        // Do saving to disk
        if (!this._addedLoaded) {
            this._addedLoaded = true;
            List.push(this);
        }
    }

    /**
     * Creates a proto-file from this final statement.
     * @returns {Buffer}
     */
    toProto() {
        return Buffer();
    }

    /**
     * Creates a new final statement from a proto-file.
     * @param proto
     * @returns {FinalStatement}
     */
    static fromProto(proto) {
        return new FinalStatement();
    }

    /**
     * Loads all final statements from disk and does eventual conversion from older formats to new formats.
     * @return {Promise<Configuration[]>}
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