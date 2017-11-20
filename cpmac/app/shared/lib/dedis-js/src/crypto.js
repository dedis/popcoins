"use strict";

/** @module crypto */

exports.aggregatePublicKeys = aggregatePublicKeys;
exports.marshal = marshal;
exports.unmarshal = unmarshal;
exports.embed = embed;
exports.elgamalEncrypt = elgamalEncrypt;
exports.elgamalDecrypt = elgamalDecrypt;
exports.generateRandomKeyPair = generateRandomKeyPair;
exports.extractDataFromPoint = extractDataFromPoint;
exports.schnorrSign = schnorrSign;
exports.schnorrVerify = schnorrVerify;

const EC = require("elliptic").ec;
const curve = new EC("ed25519");
const hash = require("hash.js");
const BN = require("bn.js");

const misc = require("./misc");

/**
 * Computes the aggregate of a list of public keys (elliptic.js curve points).
 * @param points - array of public keys to aggregate (elliptic.js curve points)
 * @returns {Uint8Array} - the aggregate point as Uint8Array format
 */
function aggregatePublicKeys(points) {
  const [head, ...tail] = points;

  let addition = head;
  for (let point of tail) {
    addition = addition.add(point);
  }

  return marshal(addition);
}

/**
 * Convert a ed25519 curve point into a byte representation.
 * {@link github.com/dedis/kyber/blob/master/group/edwards25519/ge.go#L99}.
 * @param {object} point elliptic.js curve point
 *
 * @return {Uint8Array} byte representation
 */
function marshal(point) {
  point.normalize();

  const buffer = misc.hexToUint8Array(point.y.toString(16, 2));
  buffer[0] ^= (point.x.isOdd() ? 1 : 0) << 7;

  return buffer.reverse();
}

/**
 * Convert a Uint8Array back into a ed25510 curve point.
 * {@link github.com/dedis/kyber/blob/master/group/edwards25519/ge.go#L109}.
 * @param {Uint8Array} bytes
 *
 * @throws {TypeError} when bytes is not Uint8Array
 * @throws {Error} when bytes does not correspond to a valid point
 * @return {object} elliptic.js curve point
 */
function unmarshal(bytes) {
  if (bytes.constructor !== Uint8Array) {
    throw new TypeError;
  }

  const odd = (bytes[31] >> 7) === 1;
  if (odd) {
    bytes[0] -= 19;
  }

  return curve.curve.pointFromY(bytes.reverse(), odd);
}

/**
 * Embed tries to find a valid ed25519 curve point for data of maximal size
 * 29 bytes. Currently no data messages are not supported.
 * {@link github.com/dedis/kyber/blob/master/group/edwards25519/point.go#L107}.
 * @param {Uint8Array} data to be embeded
 *
 * @throws {TypeError} when data is not a Uint8Array
 * @throws {Error} when data size is not between 1 and 29 bytes
 * @returns {object} elliptic.js curve point
 */
function embed(data) {
  if (data.constructor !== Uint8Array) {
    throw new TypeError;
  }
  if (data.length < 1 || data.length > 29) {
    throw new Error("Invalid data size");
  }

  const size = data.length;

  for (; ;) {
    let random = curve.genKeyPair().getPublic();
    let bytes = misc.hexToUint8Array(random.y.toString(16, 2)).reverse();
    bytes[0] = size;
    bytes.set(data, 1);

    try {
      let key = unmarshal(bytes);
      if (key.validate() && key.mul(curve.n).isInfinity()) {
        return key;
      }
    } catch (err) {
    }
  }
}

/**
 * ElGamal encryption algorithm.
 * {@link en.wikipedia.org/wiki/ElGamal_encryption}.
 * @param {object} key elliptic.js curve point
 * @param {Uint8Array} message to be encrypted
 *
 * @throws {TypeError} when message is not a Uint8Array
 * @returns {object} ElGamal elliptic.js keypair
 */
function elgamalEncrypt(key, message) {
  if (message.constructor !== Uint8Array) {
    throw new TypeError;
  }

  let point = embed(message);

  const k = curve.genKeyPair().getPrivate();
  const K = curve.g.mul(k);
  const S = key.mul(k);
  const C = S.add(point);

  // return { Alpha: marshal(K), Beta: marshal(C) };
  return {
    Alpha: K,
    Beta: C
  };
}

/**
 * ElGamal decryption algorithm.
 * {@link en.wikipedia.org/wiki/ElGamal_encryption}.
 * @param {object} secret bn.js number
 * @param {object} K first elliptic.js point.
 * @param {object} C second elliptic.js point.
 *
 * @returns {object} elliptic.js point
 */
function elgamalDecrypt(secret, K, C) {
  const S = K.mul(secret);

  return C.add(S.neg());
}

/**
 * Extract embeded bytes from point.
 * @param {object} elliptic.js point.
 *
 * @returns {Uint8Array} data
 */
function extractDataFromPoint(point) {
  const buffer = marshal(point);

  return buffer.slice(1, 1 + buffer[0]);
}

/**
 * Generate a random ed25519 elliptic.js key pair.
 *
 * @returns {object} elliptic.js key pair
 */
function generateRandomKeyPair() {
  return curve.genKeyPair();
}

// Private Schnorr hashing algorithm.
// https://github.com/dedis/kyber/blob/v0/sign/schnorr.go
function schnorrHash(pub, r, message) {
  const h = hash.sha512();
  h.update(marshal(r));
  h.update(marshal(pub));
  h.update(message);

  return new BN(h.digest("hex"), 16);
}

/**
 * Perform a Schnorr signature on a given message.
 * {@link https://github.com/dedis/kyber/blob/v0/sign/schnorr.go}
 * @param {object} secret bn.js number
 * @param {Uint8Array} message to be signed
 *
 * @returns {Uint8Array} signature
 */
function schnorrSign(secret, message) {
  const k = curve.genKeyPair().getPrivate();
  const R = curve.g.mul(k);

  const pub = curve.g.mul(secret);
  const h = schnorrHash(pub, R, message);

  const xh = secret.mul(h);
  const s = k.add(xh);

  const left = marshal(R);
  const right = misc.hexToUint8Array(s.toString(16, 2));

  const concat = new Uint8Array(left.length + right.length);
  concat.set(left);
  concat.set(right, left.length);

  return concat;
}

/**
 * Verfiy a given Schnorr signature.
 * {@link https://github.com/dedis/kyber/blob/v0/sign/schnorr.go}
 * @param {object} pub elliptic.js point
 * @param {Uint8Array} message
 * @param {Uint8Array} signature to be verified
 *
 * @returns {boolean}
 */
function schnorrVerify(pub, message, signature) {
  const size = marshal(pub).length;

  const R = unmarshal(signature.slice(0, size));
  const s = new BN(signature.slice(size, signature.length));

  const h = schnorrHash(pub, R, message);

  const S = curve.g.mul(s);
  const Ah = pub.mul(h);
  const RAs = R.add(Ah);

  return S.eq(RAs);
}
