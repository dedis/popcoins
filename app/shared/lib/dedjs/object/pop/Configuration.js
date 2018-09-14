const FilePaths = require("../../../file-io/files-path");
const FileIO = require("../../../file-io/file-io");
const Convert = require("../../Convert");
const FileSystem = require("tns-core-modules/file-system");
const Documents = FileSystem.knownFolders.documents();
const Net = require("@dedis/cothority").net;
const RequestPath = require("../../network/RequestPath");
const OmniLedger = require("@dedis/cothority").omniledger;
const Crypto = require('crypto-browserify');

/**
 * Stores all necessary data for a configuration. A configuration of a pop-party holds the data
 * necessary to uniquely identify that party, but still lacks the attendees.
 *
 * This module holds wrappers to save and load itself from disk.
 */

class Configuration {

    /**
     * Creates a new configuration from its basic data.
     * @param name {string}
     * @param datetime {string}
     * @param location {string}
     * @param roster {Roster}
     */
    constructor(name, datetime, location, roster) {
        this._name = name;
        this._datetime = datetime;
        this._location = location;
        this._roster = roster;
        this._id = Crypto.randomBytes(32);

        // We only add it to the List on the first save.
        this._addedLoaded = false;
        this._finalStatement = null;
    }

    /**
     * Creates a proto-file from this configuration.
     * @returns {Buffer}
     */
    toProto() {
        return Buffer();
    }

    /**
     * Hash returns the hash of the configuration, that will also be used for saving.
     */
    hash() {
        return this._id;
    }

    /**
     * @returns {string} hex representation of the hash.
     */
    hashStr() {
        return Convert.byteArrayToHex(this.hash());
    }

    /**
     * Creates a new configuration from a proto-file.
     * @param proto
     * @returns {Configuration}
     */
    static fromProto(proto) {
        return new Configuration();
    }

    static fromPopPartyInstance(ppi){
        let desc = ppi.finalStatement.desc;
        return new Configuration(desc.name, desc.datetime, desc.location, desc.roster);
    }

    // Getters for our public values.
    /**
     * @returns {string}
     */
    get name() {
        return this._name;
    }

    /**
     * @returns {string}
     */
    get datetime() {
        return this._datetime;
    }

    /**
     * @returns {string}
     */
    get location() {
        return this._location;
    }

    /**
     * @returns {Roster}
     */
    get roster() {
        return this._roster;
    }

    // Setters for our public values
    set name(n) {
        this._name = n;
    }

    set datetime(dt) {
        this._datetime = dt;
    }

    set location(l) {
        this._location = l;
    }

    set roster(r) {
        this._roster = r;
    }
}

module.exports = Configuration;