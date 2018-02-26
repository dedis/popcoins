require("nativescript-nodeify");

const Helper = require("./Helper");
const ObjectType = require("./ObjectType");
const Convert = require("./Convert");
const CothorityMessages = require("./protobuf/build/cothority-messages");
const Kyber = require("@dedis/kyber-js");

const CURVE_ED25519_KYBER = new Kyber.curve.edwards25519.Curve;
const Schnorr = Kyber.sign.schnorr;

/**
 * Computes the aggregate of a list of public keys (elliptic curve points).
 * @param {Array} points - array of public keys to aggregate (elliptic curve points)
 * @returns {Uint8Array} - the aggregate point as Uint8Array format
 */
function aggregatePublicKeys(points) {
  if (!(points instanceof Array)) {
    throw new Error("points must be an instance of Array");
  }
  if (points.length > 0 && points[0].constructor !== Kyber.curve.edwards25519.Point) {
    throw new Error("points[i] must be of type Point");
  } else if (points.length === 0) {
    throw new Error("points is an empty array");
  }

  const [head, ...tail] = points;

  let addition = head;
  for (let point of tail) {
    addition = CURVE_ED25519_KYBER.point().add(addition, point);
  }

  return addition.marshalBinary();
}

/**
 *  Convert a ed25519 curve point into a byte representation
 * @param {Point} point - elliptic.js curve point
 * @returns {Uint8Array} - byte representation of the point given as paramter
 */
function marshal(point) {
  if (point.constructor !== Kyber.curve.edwards25519.Point) {
    throw new Error("point must be of type Point");
  }

  return point.marshalBinary();
}

/**
 * Convert a Uint8Array back into a ED25519 curve point.
 * @param {Uint8Array} bytes - the bytes to be converted to a curve point
 * @returns {Point} - curve point
 */
function unmarshal(bytes) {
  if (!(bytes instanceof Uint8Array)) {
    throw new Error("bytes must be an instance of Uint8Array");
  }

  let result = CURVE_ED25519_KYBER.point();
  result.unmarshalBinary(bytes);

  return result;
}

/**
 * Generates a random ED25519 key pair.
 * @returns {KeyPair} - the generated key pair
 */
function generateRandomKeyPair() {
  const privateKey = CURVE_ED25519_KYBER.newKey();
  const basePoint = CURVE_ED25519_KYBER.point().base();
  const pubKey = CURVE_ED25519_KYBER.point().mul(privateKey, basePoint);

  return CothorityMessages.createKeyPair(marshal(pubKey), Convert.hexToByteArray(privateKey.toString()), Convert.hexToByteArray(pubKey.toString()));
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

  const bytes = new Uint8Array(secret.toArray('le'));
  const secretScalar = CURVE_ED25519_KYBER.scalar();
  secretScalar.unmarshalBinary(bytes);

  return Schnorr.sign(CURVE_ED25519_KYBER, secretScalar, message);
}

/** (BASE CODE TAKEN FROM DEDIS-JS, IT HAS BEEN ADAPTED TO MY CODE AND FIXED TO WORK WITH THE CONODES)
 * Verifies the signature of a given message using the public key.
 * @param {Point} pub - the public key
 * @param {Uint8Array} message - the message that was signed
 * @param {Uint8Array} signature - the signature to verify
 * @returns {boolean} - true if and only if the signature is valid
 */
function schnorrVerify(pub, message, signature) {
  if (pub.constructor !== Kyber.curve.edwards25519.Point) {
    throw new Error("pub must be of type Point");
  }
  if (!(message instanceof Uint8Array)) {
    throw new Error("message must be an instance of Uint8Array");
  }
  if (!(signature instanceof Uint8Array)) {
    throw new Error("signature must be an instance of Uint8Array");
  }

  return Schnorr.verify(CURVE_ED25519_KYBER, pub, message, signature);
}

module.exports.aggregatePublicKeys = aggregatePublicKeys;
module.exports.marshal = marshal;
module.exports.unmarshal = unmarshal;
module.exports.generateRandomKeyPair = generateRandomKeyPair;
module.exports.schnorrSign = schnorrSign;
module.exports.schnorrVerify = schnorrVerify;
