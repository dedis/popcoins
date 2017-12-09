require("nativescript-nodeify");
const Helper = require("./Helper");
const ObjectType = require("./ObjectType");
const Crypto = require("./Crypto");
const Base64 = require("base64-coder-node")();
const TomlParser = require("toml");
const Tomlify = require('tomlify-j0.4');
const UUID = require("pure-uuid");
const CothorityMessages = require("~/shared/lib/cothority-protobuf/build/cothority-messages");

const HEX_KEYWORD = "hex";

const URL_PORT_SPLITTER = ":";
const BASE_URL_WS = "ws://";
const BASE_URL_TCP = "tcp://";
const BASE_URL_CONODE_ID = "https://dedis.epfl.ch/id/";
const NAME_SPACE_URL = "ns:URL";

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

  return Base64.encode(hexString, HEX_KEYWORD);
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

  return Base64.decode(base64String, HEX_KEYWORD);
}

/**
 * Converts an object into its JSON string representation.
 * @param {object} object - the object taht will be converted to a JSON string
 * @returns {string} - the JSON string representation
 */
function objectToJson(object) {
  if (!(object !== undefined && typeof object === "object")) {
    throw new Error("object must be of type object and not undefined");
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
  if (!(object !== undefined && typeof object === "object")) {
    throw new Error("object must be of type object and not undefined");
  }

  return Tomlify.toToml(object, { space: 4 });
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
 * Converts a TCP URL to a Wesocket URL and builds a complete URL with the path given as parameter.
 * @param {ServerIdentity} serverIdentity - the server identity to take the url from
 * @param {string} path - the path after the base url
 * @returns {string} - the builded websocket url
 */
function tcpToWebsocket(serverIdentity, path) {
  if (!Helper.isOfType(serverIdentity, ObjectType.SERVER_IDENTITY)) {
    throw new Error("serverIdentity must be of type ServerIdentity");
  }
  if (typeof path !== "string") {
    throw new Error("path must be of type string");
  }

  const [url, port] = serverIdentity.address.replace(BASE_URL_TCP, "").split(URL_PORT_SPLITTER);
  port = parseInt(port) + 1;

  return BASE_URL_WS + url + URL_PORT_SPLITTER + port + path;
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

  const id = roster.id;

  const points = [];
  const list = roster.list.map((server) => {
    points.push(Crypto.unmarshal(base64ToByteArray(server.public)));

    let id = server.id;
    if (id === undefined) {
      const url = BASE_URL_CONODE_ID + Base64.decode(server.public, HEX_KEYWORD);
      id = new Uint8Array(new UUID(5, NAME_SPACE_URL, url).export());
    }

    return CothorityMessages.createServerIdentity(server.public, id, server.address, server.description);
  });

  const aggregate = roster.aggregate;
  if (aggregate === undefined) {
    aggregate = Crypto.aggregatePublicKeys(points);
  }

  return CothorityMessages.createRoster(id, list, aggregate);
}

/**
 * Parses a TOML string into a Roster object, if the ServerIdentities does not have an ID yet it will be computed.
 * @param {string} tomlString - the TOML string to parse into a Roster object
 * @returns {Roster} - the parsed Roster object
 */
function parseTomlRoster(tomlString) {
  if (typeof tomlString !== "string") {
    throw new Error("tomlString must be of type string");
  }

  const points = [];
  const list = tomlToObject(tomlString).servers.map((server) => {
    points.push(Crypto.unmarshal(base64ToByteArray(server.Public)));

    let id = server.Id;
    if (id === undefined) {
      const url = BASE_URL_CONODE_ID + Base64.decode(server.Public, HEX_KEYWORD);
      id = new Uint8Array(new UUID(5, NAME_SPACE_URL, url).export());
    }

    return CothorityMessages.createServerIdentity(server.Public, id, server.Address, server.Description);
  });

  return CothorityMessages.createRoster(undefined, list, Crypto.aggregatePublicKeys(points));
}

/**
 * Parses a JSON string into a KeyPair object.
 * @param {string} jsonString - the JSON string to parse into a KeyPair object
 * @returns {KeyPair} - the parsed KeyPair object
 */
function parseJsonKeyPair(jsonString) {
  if (typeof jsonString !== "string") {
    throw new Error("jsonString must be of type string");
  }

  const keyPair = jsonToObject(jsonString);

  let publicComplete = undefined;
  if (keyPair.publicComplete !== undefined) {
    publicComplete = base64ToByteArray(keyPair.publicComplete);
  }

  return CothorityMessages.createKeyPair(base64ToByteArray(keyPair.public), base64ToByteArray(keyPair.private), publicComplete);
}

module.exports = {
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

  tcpToWebsocket,
  parseJsonRoster,
  parseTomlRoster,
  parseJsonKeyPair
}
