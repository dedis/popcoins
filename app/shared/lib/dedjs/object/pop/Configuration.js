require("nativescript-nodeify");

const Roster = require("../../../../cothority/lib/identity").Roster;
const Convert = require("../../Convert");
const Crypto = require('crypto-browserify');
const HashJs = require("hash.js");

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
        console.dir("aggregate is:", this.roster.aggregate);
        this._id = new Uint8Array(HashJs.sha256()
            .update(this.name)
            .update(this.datetime)
            .update(this.location)
            .update(this.roster.aggregateKey().marshalBinary())
            .digest());
        console.dir("calculated hash:", Convert.byteArrayToHex(this._id));
        return this._id;
    }

    /**
     * @returns {string} hex representation of the hash.
     */
    hashStr() {
        return Convert.byteArrayToHex(this.hash());
    }

    /**
     * @return {Object} description in a cothority-compatible way.
     */
    getDesc(){
        console.dir("Roster is:", this._roster);
        console.dir("RType:", this._roster.constructor.name);
        let r = {
            list: [],
            aggregate: this._roster.aggregateKey().marshalBinary()
        }
        this._roster.identities.forEach(si =>{
            console.dir("ServerIdentity is:", si);
            console.dir("SIType is:", si.constructor.name);
            r.list.push({
                public: si.public.marshalBinary(),
                id: si.id,
                address: si.tcpAddr,
                description: si.description
            })
        })
        return {
            name: this._name,
            datetime: this._datetime,
            location: this._location,
            roster: r
        }
    }

    /**
     * Creates a new configuration from a proto-file.
     * @param proto
     * @returns {Configuration}
     */
    static fromProto(proto) {
        return new Configuration();
    }

    static fromPopPartyInstance(ppi) {
        let desc = ppi.finalStatement.desc;
        let roster = Roster.fromProtobuf(desc.roster, false);
        return new Configuration(desc.name, desc.datetime, desc.location, roster);
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