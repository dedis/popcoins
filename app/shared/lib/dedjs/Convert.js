require("nativescript-nodeify");
const Kyber = require("@dedis/kyber-js");
const CurveEd25519 = new Kyber.curve.edwards25519.Curve;

const ServerIdentity = require("../../cothority/lib/identity").ServerIdentity;
const Roster = require("../../cothority/lib/identity").Roster;
const Buffer = require("buffer/").Buffer;
const Helper = require("./Helper");
const Log = require("./Log");
const Crypto = require("./Crypto");
const TomlParser = require("toml");
const Tomlify = require('tomlify-j0.4');
const UUID = require("pure-uuid");
const CothorityMessages = require("./network/cothority-messages");

const HEX_KEYWORD = "hex";
const BASE64_KEYWORD = "base64";

const URL_PORT_SPLITTER = ":";
const BASE_URL_WS = "ws://";
const BASE_URL_TLS = "tls://";

const BASE_URL_CONODE_ID = "https://dedis.epfl.ch/id/";
const NAME_SPACE_URL = "ns:URL";
const UUID_VERSION = 5;

/**
 * Converts a byte array to it's hexadecimal string representation
 * @param {Uint8Array} byteArray - the byte array to convert
 * @returns {string} - the hexadecimal string
 */
function byteArrayToHex(byteArray) {
    if (!(byteArray instanceof Uint8Array)) {
        throw new Error("byteArray must be an instance of Uint8Array");
    }

    return Buffer.from(byteArray).toString(HEX_KEYWORD);
}

/**
 * Converts a hexadecimal string to it's byte array representation.
 * @param {string} hexString - the hexadecimal string to convert
 * @returns {Uint8Array} - the byte array
 */
function hexToByteArray(hexString) {
    if (typeof hexString !== "string") {
        throw new Error("hexString must be of type string");
    }

    const hexBuffer = Buffer.from(hexString, HEX_KEYWORD);

    return new Uint8Array(hexBuffer.buffer, hexBuffer.byteOffset, hexBuffer.byteLength / Uint8Array.BYTES_PER_ELEMENT);
}

/**
 * Converts a byte array to it's base64 string representation.
 * @param {Uint8Array} byteArray - the byte array to convert
 * @returns {string} - the base64 string
 */
function byteArrayToBase64(byteArray) {
    if (!(byteArray instanceof Uint8Array)) {
        throw new Error("byteArray must be an instance of Uint8Array");
    }

    const hexString = byteArrayToHex(byteArray);

    return hexToBase64(hexString);
}

/**
 * Converts a base64 string to it's byte array representation.
 * @param {string} base64String - the base64 string to convert
 * @returns {Uint8Array} - the byte array
 */
function base64ToByteArray(base64String) {
    if (typeof base64String !== "string") {
        throw new Error("base64String must be of type string");
    }

    const hexString = base64ToHex(base64String);

    return hexToByteArray(hexString);
}

/**
 * Converts a hexadecimal string into it's base64 string representation.
 * @param {string} hexString - the hexadecimal string to convert
 * @returns {string} - the base64 string
 */
function hexToBase64(hexString) {
    if (typeof hexString !== "string") {
        throw new Error("hexString must be of type string");
    }

    return Buffer.from(hexString, HEX_KEYWORD).toString(BASE64_KEYWORD);
}

/**
 * Converts a base64 string into it's hexadecimal string representation.
 * @param {string} base64String - the base64 string to convert
 * @returns {string} - the hexadecimal string
 */
function base64ToHex(base64String) {
    if (typeof base64String !== "string") {
        throw new Error("base64String must be of type string");
    }

    return Buffer.from(base64String, BASE64_KEYWORD).toString(HEX_KEYWORD);
}

/**
 * Converts an object into its JSON string representation.
 * @param {object} object - the object taht will be converted to a JSON string
 * @returns {string} - the JSON string representation
 */
function objectToJson(object) {
    if (!(object !== undefined && typeof object === "object" && !Helper.isArray(object))) {
        Log.error("cannot convert", object);
        throw new Error("object must be of type object (not array!) and not undefined");
    }

    return JSON.stringify(object, undefined, 4);
}

/**
 * Converts a JSON string into a JavaScript object.
 * @param {string} jsonString - the JSON string to convert to an object
 * @returns {object} - the object created from the JSON string
 */
function jsonToObject(jsonString) {
    if (typeof jsonString !== "string") {
        throw new Error("jsonString must be of type string");
    }

    return JSON.parse(jsonString);
}

/**
 * Converts an object into its TOML string representation.
 * @param {object} object - the object to be converted into TOML representation
 * @returns {string} - the TOML string representing the object
 */
function objectToToml(object) {
    if (!(object !== undefined && typeof object === "object" && !Helper.isArray(object))) {
        throw new Error("object must be of type object (not array!) and not undefined");
    }

    return Tomlify.toToml(object, {space: 4});
}

/**
 * Converts a TOML string into a JavaScript object.
 * @param {string} tomlString - the TOML string to be converted into an object
 * @returns {object} - the object parsed from the TOML string
 */
function tomlToObject(tomlString) {
    if (typeof tomlString !== "string") {
        throw new Error("tomlString must be of type string");
    }

    return TomlParser.parse(tomlString);
}

/**
 * Converts a JSON string into it's TOML string representation.
 * @param {string} jsonString - the JSON string to be converted into a TOML string
 * @returns {string} - the TOML string converted from the JSON string
 */
function jsonToToml(jsonString) {
    if (typeof jsonString !== "string") {
        throw new Error("jsonString must be of type string");
    }

    const object = jsonToObject(jsonString);

    return objectToToml(object);
}

/**
 * Converts a TOML string into it's JSON string representation.
 * @param {string} tomlString - the TOML string to be converted into a JSON string
 * @returns {string} - the JSON string converted from the TOML string
 */
function tomlToJson(tomlString) {
    if (typeof tomlString !== "string") {
        throw new Error("tomlString must be of type string");
    }

    const object = tomlToObject(tomlString);

    return objectToJson(object);
}

/**
 * Converts a TLS URL to a Wesocket URL and builds a complete URL with the path given as parameter.
 * @param {ServerIdentity|string} serverIdentity - the server identity to take the url from
 * @param {string} path - the path after the base url
 * @returns {string} - the builded websocket url
 */
function tlsToWebsocket(serverIdentity, path) {
    let address = serverIdentity;
    if (typeof serverIdentity !== "string") {
        if (!(serverIdentity instanceof ServerIdentity)) {
            throw new Error("serverIdentity needs to be string or ServerIdentity");
        }
        address = serverIdentity.tcpAddr;
    }
    // if (Helper.isOfType(serverIdentity, ObjectType.SERVER_IDENTITY)) {
    //     address = serverIdentity.address
    // } else if (typeof serverIdentity === "string") {
    //     address = serverIdentity;
    // } else {
    //     throw new Error("serverIdentity must be of type ServerIdentity or string");
    // }
    if (typeof path !== "string") {
        throw new Error("path must be of type string");
    }

    let [ip, port] = address.replace(BASE_URL_TLS, "").split(URL_PORT_SPLITTER);
    port = parseInt(port) + 1;

    return BASE_URL_WS + ip + URL_PORT_SPLITTER + port + path;
}

function serverIdentityToJson(serverIdentity) {
    if (!(serverIdentity instanceof ServerIdentity)) {
        throw new Error("serverIdentity must be of type ServerIdentity");
    }

    return JSON.stringify({
        public: Buffer.from(serverIdentity.pub.marshalBinary()).toString('hex'),
        address: serverIdentity.tcpAddr,
        description: serverIdentity.description
    });
}

function rosterToJson(roster) {
    if (!(roster instanceof Roster)) {
        throw new Error("roster must be of type roster");
    }

    const jRoster = {
        id: roster.id,
        identities: roster.identities.map(identity => {
            return {
                public: Buffer.from(identity.pub.marshalBinary()).toString('hex'),
                address: identity.tcpAddr,
                description: identity.description
            }
        })
    }
    return JSON.stringify(jRoster);
}

/**
 * Parses a JSON string into an array of FinalStatement objects. The JSON string has to respresent an object with a property called "array".
 * @param {string} jsonString - the JSON string to parse into an array of FinalStatement objects
 * @returns {Array} - the parsed array of FinalStatement objects
 */
function parseJsonFinalStatementsArray(jsonString) {
    if (typeof jsonString !== "string") {
        throw new Error("jsonString must be of type string");
    }

    const object = jsonToObject(jsonString);
    if (object.array === undefined || !Array.isArray(object.array)) {
        throw new Error("object.array is undefined or not an array");
    }

    object.array = object.array.map(element => {
        return parseJsonFinalStatement(objectToJson(element));
    });

    return object.array;
}

/**
 * Parses a JSON string into a FinalStatement object.
 * @param {string} jsonString - the JSON string to parse into a FinalStatement object
 * @returns {FinalStatement} - the parsed FinalStatement object
 */
function parseJsonFinalStatement(jsonString) {
    if (typeof jsonString !== "string") {
        throw new Error("jsonString must be of type string");
    }

    const object = jsonToObject(jsonString);
    if (object.attendees === undefined || !Array.isArray(object.attendees)) {
        throw new Error("object.attendees is undefined or not an array");
    }

    object.attendees = object.attendees.map(base64String => {
        return base64ToByteArray(base64String.split(" ").join("+"));
    });
    object.signature = base64ToByteArray(object.signature.split(" ").join("+"));
    object.desc = parseJsonPopDesc(objectToJson(object.desc));

    return CothorityMessages.createFinalStatement(object.desc, object.attendees, object.signature, object.merged);
}

/**
 * Parses a JSON string into a PopDesc object.
 * @param {string} jsonString - the JSON string to parse into a PopDesc object
 * @returns {PopDesc} - the parsed PopDesc object
 */
function parseJsonPopDesc(jsonString) {
    if (typeof jsonString !== "string") {
        throw new Error("jsonString must be of type string");
    }

    const object = jsonToObject(jsonString);

    return CothorityMessages.createPopDesc(object.name, object.datetime, object.location, parseJsonRoster(objectToJson(object.roster)));
}

/**
 * Parses a JSON string into a PopDesc hash. The JSON has to represent an object with a "hash" property containing a base64 encoded string.
 * @param {string} jsonString - the JSON string to parse into a PopDesc hash
 * @returns {Uint8Array} - the parsed PopDesc hash
 */
function parseJsonPopDescHash(jsonString) {
    if (typeof jsonString !== "string") {
        throw new Error("jsonString must be of type string");
    }

    const hash = jsonToObject(jsonString).hash;

    return base64ToByteArray(hash);
}

/**
 * Parses a JSON string into a Cisc username
 * @param {string} jsonString - the JSON string to parse into the Cisc username
 * @returns {String} - the parsed string for the username
 */
function parseJsonUserName(jsonString) {
    if (typeof jsonString !== "string") {
        throw new Error("jsonString must be of type string");
    }

    const name = jsonToObject(jsonString);

    return name.name;
}

/**
 * Parses a JSON string into a Roster object, if the ServerIdentities does not have an ID yet it will be computed.
 * @param {string} jsonString - the JSON string to parse into a Roster object
 * @returns {Roster} - the parsed Roster object
 */
function parseJsonRoster(jsonString) {
    if (typeof jsonString !== "string") {
        throw new Error("jsonString must be of type string");
    }

    const roster = jsonToObject(jsonString);
    let ids = [];
    let tob = hexToByteArray;
    if (roster.identities !== undefined && Array.isArray(roster.identities)) {
        ids = roster.identities;
    } else if (roster.list !== undefined && Array.isArray(roster.list)) {
        // This comes in from the conodes - and it'll be in base64.
        tob = base64ToByteArray;
        ids = roster.list;
    } else {
        throw new Error("didn't find either roster.identities or roster.list");
    }

    let rosterId = roster.id;

    let aggregate = (roster.aggregate === undefined) ? undefined : base64ToByteArray(roster.aggregate.split(" ").join("+"));

    const points = [];
    const identities = ids.map((server) => {
        let point = CurveEd25519.point();
        point.unmarshalBinary(tob(server.public.split(" ").join("+")));
        if (aggregate === undefined) {
            points.push(point);
        }

        return toServerIdentity(server.address, point, server.description);
    });

    if (aggregate === undefined) {
        aggregate = Crypto.aggregatePublicKeys(points);
    }
    return new Roster(CurveEd25519, identities, rosterId);
}

function parseJsonServerIdentity(jsonString) {
    const si = jsonToObject(jsonString);

    let point = CurveEd25519.point();
    point.unmarshalBinary(hexToByteArray(si.public.split(" ").join("+")));
    if (aggregate === undefined) {
        points.push(point);
    }

    return toServerIdentity(si.address, point, si.description);
}

/**
 * Parses a TOML string into a Roster object, if the ServerIdentities does not have an ID yet it will be computed.
 *
 * The TOML has to be in this format:
 "[[servers]]\n" +
 "  Address = \"tls://10.0.2.2:7002\"\n" +
 "  Public = \"HkDzpR5Imd7WNx8kl2lJcIVRVn8gfDByJnmlfrYh/zU=\"\n" +
 "  Description = \"Conode_1\"\n" +
 "[[servers]]\n" +
 "  Address = \"tls://10.0.2.2:7004\"\n" +
 "  Public = \"Fx6zzvJM6VzxfByLY2+uArGPtd2lHKPVmoXGMhdaFCA=\"\n" +
 "  Description = \"Conode_2\"\n" +
 "[[servers]]\n" +
 "  Address = \"tls://10.0.2.2:7006\"\n" +
 "  Public = \"j53MMKZNdtLlglcK9Ct1YYtkbbEOfq3R8ZoJOFIu6tE=\"\n" +
 "  Description = \"Conode_3\""
 *
 * @param {string} tomlString - the TOML string to parse into a Roster object
 * @returns {Roster} - the parsed Roster object
 */
function parseTomlRoster(tomlString) {
    if (typeof tomlString !== "string") {
        throw new Error("tomlString must be of type string");
    }

    const roster = tomlToObject(tomlString);
    if (roster.servers === undefined) {
        throw new Error("roster.servers is undefined");
    }

    roster.servers.forEach(server => {
        Object.getOwnPropertyNames(server).forEach((propertyName, index, array) => {
            const lowerCased = propertyName.toLocaleLowerCase();

            if (lowerCased !== propertyName) {
                server[lowerCased] = server[propertyName];
                delete server[propertyName];
            }
        });
    });

    roster.list = [];
    roster.servers.forEach(server => {
        roster.list.push(Helper.deepCopy(server));
    });
    delete roster.servers;

    return parseJsonRoster(JSON.stringify(roster));
}

/**
 * Parses a JSON string into a ServerIdentity object.
 * @param {string} jsonString - the JSON string to parse into a ServerIdentity object
 * @returns {ServerIdentity} - the parsed ServerIdentity object
 */
function parseJsonServerIdentity(jsonString) {
    if (typeof jsonString !== "string") {
        throw new Error("jsonString must be of type string");
    }

    const serverIdentity = jsonToObject(jsonString);

    const publicKeyBuf = hexToByteArray(serverIdentity.public);
    const publicKey = CurveEd25519.point();
    publicKey.unmarshalBinary(publicKeyBuf);

    return toServerIdentity(serverIdentity.address, publicKey, serverIdentity.description);
}

/**
 * Parses a JSON string into an array of Uint8Array. The JSON has to represent an object with a "array" property that is an array of base64 encoded strings.
 * @param {string} jsonString - the JSON string to parse into an array of Uint8Array
 * @returns {Array} - the parsed an array of Uint8Array
 */
function parseJsonArrayOfKeys(jsonString) {
    if (typeof jsonString !== "string") {
        throw new Error("jsonString must be of type string");
    }

    let array = jsonToObject(jsonString).array;
    if (array === undefined || !Array.isArray(array)) {
        throw new Error("object.array is undefined or not an array");
    }

    array = array.map(base64String => {
        return base64ToByteArray(base64String);
    });

    return array;
}

/**
 * Converts the arguments given as parameter into a ServerIdentity object.
 * @param {string} address - the address of the server
 * @param {Point|Uint8Array} publicKey - the public key of the server
 * @param {string} description - the description of the server
 * @returns {ServerIdentity} - the server identity object created from the given parameters
 */
function toServerIdentity(address, publicKey, description) {
    if (typeof address !== "string" || !Helper.isValidAddress(address)) {
        throw new Error("address must be of type string and have the right format");
    }
    if (!(publicKey instanceof Kyber.Point)) {
        if (!(publicKey instanceof Uint8Array)) {
            throw new Error("publicKey must be an instance of Point or Uint8array");
        }
        const pub = CurveEd25519.point();
        pub.unmarshalBinary(publicKey);
        publicKey = pub;
    }
    if (typeof description !== "string") {
        throw new Error("description must be of type string");
    }

    return new ServerIdentity(CurveEd25519, publicKey, address, description, false);
}

/**
 * Converts a public key into a UUID. This UUID can then be used to uniquely identify the conode.
 * @param {Uint8Array} publicKey - the public key of the server
 * @returns {Uint8Array} - the uuid of the server
 */
function publicKeyToUuid(publicKey) {
    if (!(publicKey instanceof Kyber.Point)) {
        throw new Error("publicKey must be an instance of Point");
    }

    const url = BASE_URL_CONODE_ID + byteArrayToHex(publicKey.marshalBinary());

    return new Uint8Array(new UUID(UUID_VERSION, NAME_SPACE_URL, url).export());
}

module.exports = {
    rosterToJson,
    serverIdentityToJson,
    parseJsonServerIdentity,
    byteArrayToHex,
    hexToByteArray,
    byteArrayToBase64,
    base64ToByteArray,
    hexToBase64,
    base64ToHex,
    objectToJson,
    jsonToObject,
    objectToToml,
    tomlToObject,
    jsonToToml,
    tomlToJson,
    tlsToWebsocket,
    parseJsonFinalStatementsArray,
    parseJsonFinalStatement,
    parseJsonPopDesc,
    parseJsonPopDescHash,
    parseJsonUserName,
    parseJsonRoster,
    parseTomlRoster,
    parseJsonServerIdentity,
    parseJsonArrayOfKeys,
    toServerIdentity,
    publicKeyToUuid
}
