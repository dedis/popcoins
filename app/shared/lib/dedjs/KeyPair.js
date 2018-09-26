require("nativescript-nodeify");
const Kyber = require("@dedis/kyber-js");

const Log = require("./Log");
const FileIO = require("../file-io/file-io");
const Convert = require("./Convert");
const Curve25519 = new Kyber.curve.edwards25519.Curve;

/**
 * This represent a cryptographic key pair (public key with private key)
 */
class KeyPair {
    /**
     * Creates a new keypair. If the arguments are missing, creates a new new random keypair.
     * @param privKey
     * @param pubKey
     */
    constructor(privKey, pubKey) {
        try {
            if (privKey !== undefined) {
                this.setKeyPair(privKey, pubKey);
            } else {
                if (pubKey !== undefined && privKey !== undefined) {
                    Log.error("wrong parameters");
                    throw new Error(err);
                }
                Log.lvl3("creating random key");
                // Ignoring error if not both arguments are given.
                this.randomize();
            }
        } catch (err) {
            Log.error("oups - couldn't create new key", err);
            throw new Error(err);
        }
    }

    get public() {
        return this._public;
    }

    get private() {
        return this._private;
    }

    /**
     * Sets the new key pair given in parameters.
     * @param {Uint8Array} privateKey - the new private key
     * @param {Uint8Array} publicKey - the new public key
     */
    setKeyPair(privateKey, publicKey) {
        if (privateKey == undefined ||
            !privateKey instanceof Uint8Array) {
            throw new Error("privateKey must be of type UInt8Array");
        }
        if (publicKey == undefined ||
            !publicKey instanceof Uint8Array) {
            throw new Error("publicKey must be of type UInt8Array");
        }
        if (publicKey.length != 32 || privateKey.length != 32) {
            throw new Error("not in ed25519 format - need 32 bytes");
        }

        this._private = Curve25519.scalar();
        this._private.unmarshalBinary(privateKey.slice());
        this._public = Curve25519.point();
        this._public.unmarshalBinary(publicKey.slice());
    }

    /**
     * Saves the keypair to the given name.
     * @param filename where to store the keyfile
     * @returns {Promise<any | never>}
     */
    save(filename) {
        Log.lvl3("saving keypair to", filename);
        let toWrite = Convert.objectToJson({
            public: Convert.byteArrayToHex(this._public.marshalBinary()),
            private: Convert.byteArrayToHex(this._private.marshalBinary()),
        });

        return FileIO.writeStringTo(filename, toWrite)
            .catch((error) => {
                throw new Error("couldn't save keypair: " + error);
            });
    }

    /**
     * Saves the keypair to the given name in base64 format.
     * @param filename where to store the keyfile
     * @returns {Promise<any | never>}
     */
    saveBase64(filename) {
        let toWrite = Convert.objectToJson({
            public: Convert.byteArrayToBase64(this._public.marshalBinary()),
            private: Convert.byteArrayToBase64(this._private.marshalBinary()),
        });

        return FileIO.writeStringTo(filename, toWrite)
            .catch((error) => {
                throw new Error("couldn't save keypair: " + error);
            });
    }

    /**
     * Randomize the key pair
     */
    randomize() {
        this._private = Curve25519.newKey();
        this._public = Curve25519.point().mul(this._private, null);
    }

    /**
     * Create a KeyPair from a file.
     * @param {string} filename - directory of the key pair data. An error is thrown
     * if the file doesn't exist or is empty.
     */
    static fromFile(filename) {
        if (typeof filename !== "string") {
            throw new Error("dirname should be of type string or undefined");
        }

        // Try to read file and return that, or initialize with new keypair.
        return FileIO.getStringOf(filename)
            .then(jsonKeyPair => {
                if (jsonKeyPair.length > 0) {
                    const kp = Convert.jsonToObject(jsonKeyPair);
                    if (kp.public !== "" && kp.private !== "") {
                        return new KeyPair(Convert.hexToByteArray(kp.private),
                            Convert.hexToByteArray(kp.public));
                    }
                }
                throw new Error("file empty");
            })
            .catch(err => {
                throw new Error("Couldn't create a keypair: " + err);
            });
    }
    /**
     * Create a KeyPair from a file where the keys are stored in base64.
     * @param {string} filename - directory of the key pair data. An error is thrown
     * if the file doesn't exist or is empty.
     */
    static fromFileBase64(filename) {
        if (typeof filename !== "string") {
            throw new Error("dirname should be of type string or undefined");
        }

        // Try to read file and return that, or initialize with new keypair.
        return FileIO.getStringOf(filename)
            .then(jsonKeyPair => {
                if (jsonKeyPair.length > 0) {
                    const kp = Convert.jsonToObject(jsonKeyPair);
                    if (kp.public !== "" && kp.private !== "") {
                        return new KeyPair(Convert.base64ToByteArray(kp.private),
                            Convert.base64ToByteArray(kp.public));
                    }
                }
                throw new Error("file empty");
            })
            .catch(err => {
                throw new Error("Couldn't create a keypair: " + err);
            });
    }

    /**
     * Parses a JSON string into a KeyPair object.
     * @param {string} jsonString - the JSON string to parse into a KeyPair object
     * @returns {KeyPair} - the parsed KeyPair object
     */
    static fromJson(jsonString) {
        if (typeof jsonString !== "string") {
            throw new Error("jsonString must be of type string");
        }

        const keyPair = Convert.jsonToObject(jsonString);

        if (keyPair.private === undefined) {
            keyPair.private = "";
        }

        return new KeyPair(new Uint8Array(keyPair.private),
            new Uint8Array(keyPair.public));
    }
}

module.exports = KeyPair;