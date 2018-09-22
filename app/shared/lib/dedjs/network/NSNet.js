const protobuf = require("protobufjs");
const co = require("co");
const shuffle = require("shuffle-array");
const WS = require("nativescript-websockets");
const Buffer = require("buffer/").Buffer;
const root = require("@dedis/cothority").protobuf.root;
const Log = require("../Log");

/**
 * Socket is a WebSocket object instance through which protobuf messages are
 * sent to conodes.
 * @param {string} addr websocket address of the conode to contact.
 * @param {string} service name. A socket is tied to a service name.
 *
 * @throws {TypeError} when url is not a string or protobuf is not an object
 */
function Socket(addr, service) {
    if (typeof protobuf !== "object") throw new TypeError();

    this.url = addr + "/" + service;
    this.protobuf = root;

    /**
     * Send transmits data to a given url and parses the response.
     * @param {string} request name of registered protobuf message
     * @param {string} response name of registered protobuf message
     * @param {object} data to be sent
     *
     * @returns {object} Promise with response message on success, and an error on failure
     */
    this.send = (request, response, data) => {
        return new Promise((resolve, reject) => {
            const path = this.url + "/" + request.replace(/.*\./, '');
            console.log("net.Socket: new WebSocketA(" + path + ")");
            const ws = new WS(path);

            const requestModel = this.protobuf.lookup(request);
            if (requestModel === undefined) {
                reject(new Error("Model " + request + " not found"));
            }

            const responseModel = this.protobuf.lookup(response);
            if (responseModel === undefined) {
                console.log("failed to find " + response);
                reject(new Error("Model " + response + " not found"));
            }

            ws.on('open', () => {
                const errMsg = requestModel.verify(data);
                if (errMsg) {
                    console.log("couldn't verify data:", errMsg);
                    reject(new Error(errMsg));
                }
                const message = requestModel.create(data);
                const marshal = requestModel.encode(message).finish();
                ws.send(marshal);
            });

            ws.on('message', (socket, message) => {
                Log.lvl2("Writing message:", message);
                let buffer = new Uint8Array(message);
                try {
                    const unmarshal = responseModel.decode(buffer);
                    ws.close();
                    resolve(unmarshal);
                } catch (err) {
                    console.log("got message with length", buffer.length);
                    console.dir("unmarshalling into", responseModel);
                    console.log("error while decoding:", err, "buffer is:", Buffer.from(buffer).toString("hex"));
                    ws.close();
                    reject(err);
                }
            });

            ws.on('close', (socket, code, reason) => {
                if (code === 4000) {
                    reject(new Error(reason));
                }
            });

            ws.on('error', (socket, error) => {
                console.log("got error:", error);
                reject(error);
            });

            return ws.open();
        });
    };
}

/*
 * RosterSocket offers similar functionality from the Socket class but chooses
 * a random conode when trying to connect. If a connection fails, it
 * automatically retries to connect to another random server.
 * */
class RosterSocket {
    constructor(roster, service) {
        this.addresses = roster.identities.map(conode => tlsToWebsocket(conode.tcpAddr, ""));
        this.service = service;
        this.lastGoodServer = null;
    }

    /**
     * send tries to send the request to a random server in the list as long as there is no successful response. It tries a permutation of all server's addresses.
     *
     * @param {string} request name of the protobuf packet
     * @param {string} response name of the protobuf packet response
     * @param {Object} data javascript object representing the request
     * @returns {Promise} holds the returned data in case of success.
     */
    send(request, response, data) {
        const that = this;
        const fn = co.wrap(function* () {
            const addresses = that.addresses;
            const service = that.service;
            shuffle(addresses);
            // try first the last good server we know
            if (that.lastGoodServer) addresses.unshift(that.lastGoodServer);

            for (let i = 0; i < addresses.length; i++) {
                const addr = addresses[i];
                try {
                    const socket = new Socket(addr, service);
                    console.log("RosterSocket: trying out " + addr + "/" + service);
                    const socketResponse = yield socket.send(request, response, data);
                    that.lastGoodServer = addr;
                    return Promise.resolve(socketResponse);
                } catch (err) {
                    console.error("rostersocket: " + err);
                    continue;
                }
            }
            return Promise.reject(new Error("no conodes are available"));
        });
        return fn();
    }
}

/**
 * LeaderSocket reads a roster and can be used to communicate with the leader
 * node. As of now the leader is the first node in the roster.
 *
 * @throws {Error} when roster doesn't have any node
 */
class LeaderSocket {
    constructor(roster, service) {
        this.service = service;
        this.roster = roster;

        if (this.roster.identities.length === 0) {
            throw new Error("Roster should have atleast one node");
        }
    }

    /**
     * Send transmits data to a given url and parses the response.
     * @param {string} request name of registered protobuf message
     * @param {string} response name of registered protobuf message
     * @param {object} data to be sent
     *
     * @returns {Promise} with response message on success and error on failure.
     */
    send(request, response, data) {
        // fn is a generator that tries the sending the request to the leader
        // maximum 3 times and returns on the first successful attempt
        const that = this;
        const fn = co.wrap(function* () {
            var lastErr
            for (let i = 0; i < 3; i++) {
                try {
                    const socket = new Socket(
                        that.roster.identities[0].websocketAddr,
                        that.service
                    );
                    const reply = yield socket.send(request, response, data);
                    return Promise.resolve(reply);
                } catch (e) {
                    console.error("error sending request: ", e.message);
                    lastErr = e
                }
            }
            return Promise.reject(
                new Error("couldn't send request after 3 attempts: " + lastErr.message)
            );
        });
        return fn();
    }
}

/**
 * Converts a TLS URL to a Wesocket URL and builds a complete URL with the path given as parameter.
 * @param {ServerIdentity|string} serverIdentity - the server identity to take the url from
 * @param {string} path - the path after the base url
 * @returns {string} - the builded websocket url
 */
function tlsToWebsocket(serverIdentity, path) {
    const URL_PORT_SPLITTER = ":";
    const BASE_URL_WS = "ws://";
    const BASE_URL_TLS = "tls://";

    let address = "";
    if (typeof serverIdentity === "string") {
        address = serverIdentity;
    } else if (serverIdentity.constructor.name === "ServerIdentity") {
        address = serverIdentity.address
    } else {
        throw new Error("serverIdentity must be of type ServerIdentity or string");
    }
    if (typeof path !== "string") {
        throw new Error("path must be of type string");
    }

    let [ip, port] = address.replace(BASE_URL_TLS, "").split(URL_PORT_SPLITTER);
    port = parseInt(port) + 1;

    return BASE_URL_WS + ip + URL_PORT_SPLITTER + port + path;
}


module.exports = {
    Socket,
    RosterSocket,
    LeaderSocket,
    tlsToWebsocket
};
