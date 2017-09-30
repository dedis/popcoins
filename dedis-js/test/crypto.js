const crypto = dedis.crypto;

describe('crypto', () => {
    it('Point Marshalling - Unmarshalling', () => {
	const point = crypto.generateRandomKeyPair().getPublic();

	const buffer = crypto.marshal(point);
	const bool = crypto.unmarshal(buffer).eq(point);
	assert.isTrue(bool);
    });
    
    it('Data Embeding', () => {
	const data = new Uint8Array([1, 2, 3]);
	const point = crypto.embed(data);

	assert.deepEqual(data, crypto.marshal(point).slice(1, 1 + data.length));
    });

    it('Data Extraction', () => {
	const data = new Uint8Array([1, 2, 3]);
	const point = crypto.embed(data);

	assert.deepEqual(data, crypto.extractDataFromPoint(point));
    });

    
    it('ElGamal Encryption - Decryption', () => {
	const pair = crypto.generateRandomKeyPair();
	const message = new Uint8Array([1, 2, 3]);

	const enc = crypto.elgamalEncrypt(pair.getPublic(), message);
	const dec = crypto.elgamalDecrypt(pair.getPrivate(), enc.Alpha, enc.Beta);

	const data = crypto.extractDataFromPoint(dec);
	assert.deepEqual(message, data);
    });

    it('Schnorr Signature - Verification', () => {
	const pair = crypto.generateRandomKeyPair();
	const message = new Uint8Array([1, 2, 3]);

	const signature = crypto.schnorrSign(pair.getPrivate(), message);
	assert.isTrue(crypto.schnorrVerify(pair.getPublic(), message, signature));
	assert.isFalse(crypto.schnorrVerify(pair.getPublic(), new Uint8Array([1]), signature));
    });
});
