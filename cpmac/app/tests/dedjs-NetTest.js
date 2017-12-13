const ChaiAsPromised = require("chai-as-promised");
chai.use(ChaiAsPromised);
chai.should();

const Net = require("../shared/lib/dedjs/Net");

const StandardSocket = new Net.StandardSocket();
const CothoritySocket = new Net.CothoritySocket();

describe.only("Net", function () {
  describe("#StandardSocket", function () {
    it("should reject when address is not a string", function () {
      // TODO:
      StandardSocket.send(42, "HELLO!").should.be.rejected;
    });
  });
});
