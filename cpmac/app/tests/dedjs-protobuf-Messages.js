const ChaiAsPromised = require("chai-as-promised");
chai.use(ChaiAsPromised);
chai.should();

const CothorityMessages = require("../shared/lib/dedjs/protobuf/build/cothority-messages");

describe("CothorityMessages", function () {
  describe("#encodeMessage", function () {
    it("should throw an error when name is not a string", function () {
      expect(() => CothorityMessages.encodeMessage(42, {})).to.throw();
    });

    it("should throw an error when fields is undefined", function () {
      expect(() => CothorityMessages.encodeMessage("Roster", undefined)).to.throw();
    });

    it("should throw an error when fields is not an object", function () {
      expect(() => CothorityMessages.encodeMessage("Roster", [])).to.throw();
    });

    it("should correctly ???", function () {
      // TODO
      //CothorityMessages.encodeMessage("Roster", {});
    });
  });
});
