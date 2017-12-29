const Convert = require("./Convert");
const Helper = require("./Helper");
const ObjectType = require("./ObjectType");
const WebSocket = require("nativescript-websockets");
const CothorityMessages = require("./protobuf/build/cothority-messages");

/**
 * Constructor for a standard socket. It can be used to communicate with standard web servers.
 * @param {string} address - the address where the data should be sent
 * @param {any} data - the data to be sent
 * @returns {Promise} - a promise that gets resolved once a response is received
 */
function StandardSocket() {
  this.send = (address, data) => {
    if (typeof address !== "string") {
      throw new Error("address must be of type string");
    }

    return new Promise((resolve, reject) => {
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
    })
  };
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
  this.send = (node, path, message, typeToDecode) => {
    if (!Helper.isOfType(node, ObjectType.SERVER_IDENTITY)) {
      throw new Error("node must be of type ServerIdentity");
    }
    if (typeof path !== "string") {
      throw new Error("path must be of type string");
    }
    if (!(message instanceof Uint8Array)) {
      throw new Error("message must be an instance of Uint8Array");
    }
    if (!(typeToDecode === undefined || typeof typeToDecode === "string")) {
      throw new Error("typeToDecode must be of type string or undefined");
    }

    return new Promise((resolve, reject) => {
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
    })
  };
}

/**
 * Constructor foa pastebin object. This can be used to upload/download plain text.
 */
function PasteBin() {
  /**
   * Gets the plain text of a paste given its ID.
   * @param {string} id - the id of the paste
   * @returns {Promise} - a promise that gets resolved once the plain text has been downloaded from the paste, the promise contains the plain text
   */
  this.get = (id, callBack, fail) => {
    if (typeof id !== "string") {
      throw new Error("id must be of type string");
    }
  }

  /**
   * Creates a new paste from the text and title given as parameter.
   * @param {string} text - the wanted content of the paste
   * @param {string} title - the wanted title for the paste
   * @returns {Promise} - a promise that gets resolved once the paste has been created, the promise contains the ID of the new paste
   */
  this.paste = (text, title) => {
    if (typeof text !== "string") {
      throw new Error("text must be of type string");
    }
    if (typeof title !== "string") {
      throw new Error("title must be of type string");
    }
  }
}

module.exports.StandardSocket = StandardSocket;
module.exports.CothoritySocket = CothoritySocket;
module.exports.PasteBin = PasteBin;
