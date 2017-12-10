const Convert = require("~/shared/lib/dedjs/Convert");
const Helper = require("~/shared/lib/dedjs/Helper");
const ObjectType = require("~/shared/lib/dedjs/ObjectType");
const WebSocket = require("nativescript-websockets");
const CothorityMessages = require("~/shared/lib/dedjs/protobuf/build/cothority-messages");

/**
 * Constructor for a standard socket. It can be used to communicate with standard web servers.
 * @param {string} address - the address where the data should be sent
 * @param {any} data - the data to be sent
 * @returns {Promise} - a promise that gets resolved once a response is received
 */
function StandardSocket() {
  this.send = (address, data) => new Promise((resolve, reject) => {
    if (typeof address !== "string") {
      reject("address must be of type string");
    }

    const socket = new WebSocket(address, {
      allowCellular: true
    });

    socket.on("open", (socket) => {
      console.log("Socket open...");
      socket.send(data);
    });

    socket.on("close", (socket, code, reason) => {
      console.log("Socket closed...");
    });

    socket.on("message", (socket, message) => {
      console.log("Got message...");

      socket.close();
      resolve(message);
    });

    socket.on("error", (socket, error) => {
      console.log("Socket error:");
      console.log(error);
      console.dir(error);
      console.trace();

      socket.close();
      reject(error);
    });

    socket.open();
  });
}

/**
 * Constructor for a cothority socket. It can be used to communicate with conodes.
 * @param {ServerIdentity} node - the conode where to send the data
 * @param {string} path - the path of the request (without the base URL)
 * @param {Uint8Array} message - the message to send
 * @param {string} typeToDecode - the type of the response (if undefined the response will not be decoded)
 * @returns {Promise} - a promise that gets resolved once a response is received
 */
function CothoritySocket() {
  this.send = (node, path, message, typeToDecode) => new Promise((resolve, reject) => {
    if (!Helper.isOfType(node, ObjectType.SERVER_IDENTITY)) {
      reject("node must be of type ServerIdentity");
    }
    if (typeof path !== "string") {
      reject("path must be of type string");
    }
    if (!(message instanceof Uint8Array)) {
      reject("message must be an instance of Uint8Array");
    }
    if (!(typeToDecode === undefined || typeof typeToDecode === "string")) {
      reject("typeToDecode must be of type string or undefined");
    }

    const url = Convert.tcpToWebsocket(node, path);

    const socket = new WebSocket(url, {
      allowCellular: true
    });
    socket.binaryType = "arraybuffer";

    socket.on("open", (socket) => {
      console.log("Socket open...");
      socket.send(message);
    });

    socket.on("close", (socket, code, reason) => {
      if (code === 4100) {
        resolve(reason);
      }
      if (code === 4101 || code === 4102 || code === 4104) {
        reject(reason);
      }

      console.log("Socket closed...");
    });

    socket.on("message", (socket, message) => {
      console.log("Got message...");

      if (typeToDecode !== undefined) {
        resolve(CothorityMessages.decodeResponse(typeToDecode, message));
      } else {
        resolve(message);
      }

      socket.close();
    });

    socket.on("error", (socket, error) => {
      console.log("Socket error:");
      console.log(error);
      console.dir(error);
      console.trace();

      socket.close();
      reject(error);
    });

    socket.open();
  });
}

module.exports.StandardSocket = StandardSocket;
module.exports.CothoritySocket = CothoritySocket;
