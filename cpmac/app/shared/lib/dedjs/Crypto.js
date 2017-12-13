const Helper = require("./Helper");
const ObjectType = require("./ObjectType");
const Convert = require("./Convert");
const EllipticCurve = require("elliptic").ec;
const Hash = require("hash.js");
const BigNumber = require("bn.js");

const CURVE_ED25519 = new EllipticCurve("ed25519");
const RED = BigNumber.red(CURVE_ED25519.n);
const HEX_KEYWORD = "hex";
const SCHNORR_SIGNATURE_LENGTH = 64;

/**
 * Returns the reduced BigNumber given as parameter ("p25519" reduction).
 * @param {BigNumber} bigNumber - the big number to be reduced
 * @returns {BigNumber} - the reduced big number
 */
function toRed(bigNumber) {
  if (!Helper.isOfType(bigNumber, ObjectType.BIG_NUMBER)) {
    throw new Error("bigNumber must be of type BigNumber");
  }

  return bigNumber.toRed(RED);
}

/**
 * Returns the key pair formed using the secret key given as parameter.
 * @param {Uint8Array} secret - the secret as Uint8Array
 * @returns {KeyPair} - the public point and the private key as a key pair
 */
function getKeyPairFromSecret(secret) {
  if (!(secret instanceof Uint8Array)) {
    throw new Error("secret must be an instance of Uint8Array");
  }

  const keyPair = getKeyPairFromPrivate(secret);
  const pubPoint = CURVE_ED25519.g.mul(keyPair.getPrivate());

  keyPair.pub = pubPoint;

  return keyPair;
}

/**
 * Returns the key pair formed using only the privateKey given as parameter.
 * @param {Uint8Array} privateKey - the private key as Uint8Array
 * @returns {KeyPair} - key pair containing only the private key
 */
function getKeyPairFromPrivate(privateKey) {
  if (!(privateKey instanceof Uint8Array)) {
    throw new Error("privateKey must be an instance of Uint8Array");
  }

  return CURVE_ED25519.keyFromPrivate(Convert.byteArrayToHex(privateKey), HEX_KEYWORD);
}

/**
 * Returns the key pair formed using only the publicKey given as parameter.
 * @param {Uint8Array} publicKey - the public key as Uint8Array
 * @returns {KeyPair} - key pair containing only the public key
 */
function getKeyPairFromPublic(publicKey) {
  if (!(publicKey instanceof Uint8Array)) {
    throw new Error("publicKey must be an instance of Uint8Array");
  }

  return CURVE_ED25519.keyFromPublic(Convert.byteArrayToHex(publicKey), HEX_KEYWORD);
}

/**
 * Computes the aggregate of a list of public keys (elliptic.js curve points).
 * @param {Array} points - array of public keys to aggregate (elliptic.js curve points)
 * @returns {Uint8Array} - the aggregate point as Uint8Array format
 */
function aggregatePublicKeys(points) {
  if (!(points instanceof Array)) {
    throw new Error("points must be an instance of Array");
  }
  if (points.length > 0 && !Helper.isOfType(points[0], ObjectType.POINT)) {
    throw new Error("points[i] must be of type Point");
  }

  const [head, ...tail] = points;

  let addition = head;
  for (let point of tail) {
    addition = addition.add(point);
  }

  return marshal(addition);
}

/** (TAKEN FROM DEDIS-JS, ALL CREDITS GO TO Andrea, IT HAS BEEN ADAPTED TO MY CODE)
 * Converts a ED25519 curve point into its byte representation.
 * @param {Point} point - elliptic.js curve point
 * @returns {Uint8Array} - byte representation of the point given as paramter
 */
function marshal(point) {
  if (!Helper.isOfType(point, ObjectType.POINT)) {
    throw new Error("point must be of type Point");
  }

  point.normalize();

  const buffer = Convert.hexToByteArray(point.y.toString(16, 2));
  buffer[0] ^= (point.x.isOdd() ? 1 : 0) << 7;

  return buffer.reverse();
}

/** (TAKEN FROM DEDIS-JS, ALL CREDITS GO TO Andrea, IT HAS BEEN ADAPTED TO MY CODE)
 * Convert a Uint8Array back into a ED25519 curve point.
 * @param {Uint8Array} bytes - the bytes to be converted to a curve point
 * @returns {Point} - curve point
 */
function unmarshal(bytes) {
  if (!(bytes instanceof Uint8Array)) {
    throw new Error("bytes must be an instance of Uint8Array");
  }

  const bytesCopy = Uint8Array.from(bytes);

  const odd = (bytesCopy[31] >> 7) === 1;
  if (odd) {
    bytesCopy[0] -= 19;
  }

  return CURVE_ED25519.curve.pointFromY(bytesCopy.reverse(), odd);
}

/**
 * Generates a random ED25519 key pair.
 * @returns {KeyPair} - the generated key pair
 */
function generateRandomKeyPair() {
  return CURVE_ED25519.genKeyPair();
}

/** (BASE CODE TAKEN FROM DEDIS-JS, IT HAS BEEN ADAPTED TO MY CODE AND FIXED TO WORK WITH THE CONODES)
 * Computes the private schnorr hash using the given inputs.
 * @param {Point} r
 * @param {Point} pub - the public point
 * @param {Uint8Array} message - the message to sign as Uint8Array
 * @returns {BigNumber} - the computed hash
 */
function schnorrHash(r, pub, message) {
  if (!Helper.isOfType(r, ObjectType.POINT)) {
    throw new Error("r must be of type Point");
  }
  if (!Helper.isOfType(pub, ObjectType.POINT)) {
    throw new Error("pub must be of type Point");
  }
  if (!(message instanceof Uint8Array)) {
    throw new Error("message must be an instance of Uint8Array");
  }

  const h = Hash.sha512();

  h.update(marshal(r));
  h.update(marshal(pub));
  h.update(message);

  // Could be done in one line, but this way we can exactly see what we are actually doing.
  const hex = h.digest(HEX_KEYWORD);
  const uInt8Array = Convert.hexToByteArray(hex);
  const reversed = uInt8Array.reverse();
  const hexReversed = Convert.byteArrayToHex(reversed);

  return toRed(new BigNumber(hexReversed, 16));
}

/** (BASE CODE TAKEN FROM DEDIS-JS, IT HAS BEEN ADAPTED TO MY CODE AND FIXED TO WORK WITH THE CONODES)
 * Computes the signature of the given message using the given secret.
 * @param {BigNumber} secret - the secret key
 * @param {Uint8Array} message - the message to sign
 * @returns {Uint8Array} - the computed signature
 */
function schnorrSign(secret, message) {
  if (!Helper.isOfType(secret, ObjectType.BIG_NUMBER)) {
    throw new Error("secret must be of type BigNumber");
  }
  if (!(message instanceof Uint8Array)) {
    throw new Error("message must be an instance of Uint8Array");
  }

  secret = toRed(secret);

  const k = toRed(CURVE_ED25519.genKeyPair().getPrivate());
  const R = CURVE_ED25519.g.mul(k);

  const pub = CURVE_ED25519.g.mul(secret);
  const h = schnorrHash(R, pub, message);

  const xh = secret.redMul(h);
  const s = k.redAdd(xh);

  const left = marshal(R);
  const right = Convert.hexToByteArray(s.toString(16, 2)).reverse();

  if (left.length + right.length > SCHNORR_SIGNATURE_LENGTH) {
    throw new Error("signature length to long: " + left.length + right.length);
  }

  const concat = new Uint8Array(SCHNORR_SIGNATURE_LENGTH);
  concat.set(left);
  concat.set(right, left.length);

  return concat;
}

/** (BASE CODE TAKEN FROM DEDIS-JS, IT HAS BEEN ADAPTED TO MY CODE AND FIXED TO WORK WITH THE CONODES)
 * Verifies the signature of a given message using the public key.
 * @param {Point} pub - the public key
 * @param {Uint8Array} message - the message that was signed
 * @param {Uint8Array} signature - the signature to verify
 * @returns {boolean} - true if and only if the signature is valid
 */
function schnorrVerify(pub, message, signature) {
  if (!Helper.isOfType(pub, ObjectType.POINT)) {
    throw new Error("pub must be of type Point");
  }
  if (!(message instanceof Uint8Array)) {
    throw new Error("message must be an instance of Uint8Array");
  }
  if (!(signature instanceof Uint8Array)) {
    throw new Error("signature must be an instance of Uint8Array");
  }

  const size = marshal(pub).length;

  const R = unmarshal(signature.slice(0, size));
  const s = toRed(new BigNumber(signature.slice(size, signature.length).reverse()));

  const h = schnorrHash(R, pub, message);

  const S = CURVE_ED25519.g.mul(s);
  const Ah = pub.mul(h);
  const RAs = R.add(Ah);

  return S.eq(RAs);
}

module.exports.getKeyPairFromSecret = getKeyPairFromSecret;
module.exports.aggregatePublicKeys = aggregatePublicKeys;
module.exports.marshal = marshal;
module.exports.unmarshal = unmarshal;
module.exports.generateRandomKeyPair = generateRandomKeyPair;
module.exports.schnorrSign = schnorrSign;
module.exports.schnorrVerify = schnorrVerify;
