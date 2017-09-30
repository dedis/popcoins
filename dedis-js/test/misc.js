const misc = dedis.misc;

describe('misc', () => {
    it('Hex String Reversal', () => {
	assert.equal('', misc.reverseHex(''));
	assert.equal('01', misc.reverseHex('01'));
	assert.equal('010203', misc.reverseHex('030201'));
    });

    it('Hex - Uint8Array Conversions', () => {
	const hex = '010203';
	const buffer = new Uint8Array([1, 2, 3]);

	assert.equal(hex, misc.uint8ArrayToHex(misc.hexToUint8Array(hex)));
	assert.deepEqual(buffer, misc.hexToUint8Array(misc.uint8ArrayToHex(buffer)));
    });
});
