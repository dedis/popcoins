require("nativescript-nodeify");
const Kyber = require('@dedis/kyber-js');

/**
 * Stores a configuration together with the list of attendees and the signature of the organizers.
 *
 * This module holds wrappers to save and load itself from disk.
 */

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
    }

    /**
     * @param att a new attendee to add - it is explicitly allowed to
     * add an attendee more than once, however, he will only appear once
     * in the list.
     */
    registerAttendee(att){
        if (!att instanceof Kyber.Point){
            console.log("att is not of type Point");
            return;
        }
        this._attendees.forEach(a =>{
            if (a.equal(att)){
                console.log("this attendee already exists");
                return;
            }
        })
        this._attendees.push(att);
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

    // Setters for the two attributes that are changeable.
    set attendees(a){
        this._attendees = a;
    }

    set signature(s){
        this._signature = s;
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

module.exports = FinalStatement;