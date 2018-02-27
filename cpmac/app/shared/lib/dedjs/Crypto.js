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
 * Generates a random ED25519 key pair.
 * @returns {KeyPair} - the generated key pair
 */
function generateRandomKeyPair() {
  const privateKey = CURVE_ED25519_KYBER.newKey();
  const basePoint = CURVE_ED25519_KYBER.point().base();
  const pubKey = CURVE_ED25519_KYBER.point().mul(privateKey, basePoint);

  return CothorityMessages.createKeyPair(pubKey.marshalBinary(), Convert.hexToByteArray(privateKey.toString()), Convert.hexToByteArray(pubKey.toString()));
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
module.exports.generateRandomKeyPair = generateRandomKeyPair;
module.exports.schnorrVerify = schnorrVerify;
