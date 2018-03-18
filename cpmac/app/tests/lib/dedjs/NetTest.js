const ChaiAsPromised = require("chai-as-promised");
chai.use(ChaiAsPromised);
chai.should();

const Net = require("../../../shared/lib/dedjs/Net");
const PasteBin = new Net.PasteBin();

describe("Net", function () {
  describe("#PasteBin", function () {
    describe("#get", function () {
      it("should throw when id is not a string", function () {
        expect(() => PasteBin.get(42)).to.throw();
      });
    });

    describe("#paste", function () {
      it("should throw when text is not a string", function () {
        expect(() => PasteBin.paste(42)).to.throw();
      });
    });

    /*
    it("should correctly paste and get a paste for pastebin", function () {
      const TEXT_TO_PASTE = "DIS_MAH_PASTE";

      return PasteBin.paste(TEXT_TO_PASTE)
        .then(id => {
          console.log(id);
          console.dir(id);

          return PasteBin.get(id);
        })
        .then(pasteText => {
          console.log(pasteText);
          console.dir(pasteText);
        });
    });
    */
  });
});
