/**
 * This represent a cryptographic key pair (public key with private key)
 */
class KeyPair {
    /**
     * Constructor for the Org class.
     * @param {string} dirname - directory of the key pair data. If the data doesn't exist, a random key pair
     *  is generated. The key pair will be stored under dirname/keypair.json
     */
    constructor(dirname) {
        if (typeof dirname !== "string") {
            throw new Error("dirname should be of type string or undefined");
        }
        this._dirname = dirname;
        this._public = Uint8Array;
        this._private = Uint8Array;

        // Try to read file and return that, or initialize with new keypair.
        return FileIO.getStringOf(FileIO.join(this._dirname, FilesPath.KEY_PAIR))
            .then(jsonKeyPair => {
                if (jsonKeyPair.length > 0) {
                    const kp = Convert.jsonToObject(jsonKeyPair);
                    if (kp.public !== "" && kp.private !== "") {
                        return this.setKeyPair(kp.public, kp.private);
                    }
                }
                return this.randomize();
            })
            .catch(() => {
                return this.randomize();
            });
    }

    get public() {
        return this._public.slice(0);
    }

    get private() {
        return this._private.slice(0);
    }

    /**
     * Sets the new key pair given in parameters.
     * @param {Uint8Array} publicKey - the new public key
     * @param {Uint8Array} privateKey - the new private key
     * @returns {Promise} - a promise that gets resolved once the new key pair has been set and saved if the save parameter is set to true
     */
    setKeyPair(publicKey, privateKey) {
        if (!publicKey instanceof Uint8Array) {
            throw new Error("publicKey must be of type UInt8Array");
        }
        if (!privateKey instanceof Uint8Array) {
            throw new Error("privateKey must be of type UInt8Array");
        }

        this._public = publicKey.slice();
        this._private = privateKey.slice();

        let toWrite = "";
        if (publicKey.length > 0 && privateKey.length > 0) {
            toWrite = Convert.objectToJson({
                public: Convert.byteArrayToBase64(publicKey),
                private: Convert.byteArrayToBase64(privateKey),
            });
        }

        return FileIO.writeStringTo(FileIO.join(this._dirname, FilesPath.KEY_PAIR), toWrite)
            .catch((error) => {
                console.log(error);
                console.dir(error);
                console.trace();
                throw new Error(error);
            });
    }

    /**
     * Randomize the key pair
     * @returns {Promise} - a promise that get resolved once a random keypair has been generated and saved
     */
    randomize() {
        const privateKey = CURVE_ED25519_KYBER.newKey();
        const basePoint = CURVE_ED25519_KYBER.point().base();
        const pubKey = CURVE_ED25519_KYBER.point().mul(privateKey, basePoint);

        return this.setKeyPair(pubKey.marshalBinary(), privateKey.marshalBinary());
    }
}
