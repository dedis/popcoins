const Convert = require("~/shared/lib/dedjs/Convert");

QUnit.test("byteArrayToHex Test", (assert) => {
  const byteArray = new Uint8Array([1, 2, 3]);
  const expectedHexString = "010203";

  const actualHexString = Convert.byteArrayToHex(byteArray);

  assert.equal(expectedHexString, actualHexString);
});
