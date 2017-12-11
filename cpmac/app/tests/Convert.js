const Expect = require("chai").expect;
const Convert = require("../shared/lib/dedjs/Convert");
const User = require("../shared/object/user/User");

const BYTE_ARRAY = new Uint8Array([243, 39, 52, 77, 162, 48, 121, 100, 114, 48]);
const HEX_STRING = "f327344da23079647230";
const BASE64_STRING = "8yc0TaIweWRyMA==";

describe("Convert", function () {
  describe("#byteArrayToHex", function () {
    it("should correctly convert a byte array to its hexadecimal representation", function () {
      const actualHexString = Convert.byteArrayToHex(BYTE_ARRAY);

      Expect(actualHexString).to.equal(HEX_STRING);
      // assert.equal(-1, [1, 2, 3].indexOf(5));
    });
  });
});
