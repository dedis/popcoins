const ChaiAsPromised = require("chai-as-promised");
chai.use(ChaiAsPromised);
chai.should();

const Convert = require("../shared/lib/dedjs/Convert");

const BYTE_ARRAY = new Uint8Array([243, 39, 52, 77, 162, 48, 121, 100, 114, 48]);
const HEX_STRING = "f327344da23079647230";
const BASE64_STRING = "8yc0TaIweWRyMA==";

describe("Convert", function () {
  describe("#byteArrayToHex", function () {
    before("Optional Description", function () {
      // Prepare stuff before all the tests.
    });

    after("Optional Description", function () {
      // Clean up after all the tests.
    });

    beforeEach("Optional Description", function () {
      // Do stuff before each test.
    });

    afterEach("Optional Description", function () {
      // Do stuff after each test.
    });

    it("should correctly convert a byte array to its hexadecimal representation", function () {
      const actualHexString = Convert.byteArrayToHex(BYTE_ARRAY);

      actualHexString.should.equal(HEX_STRING);
    });
  });
});
