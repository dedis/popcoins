const ChaiAsPromised = require("chai-as-promised");
chai.use(ChaiAsPromised);
chai.should();

const RequestPath = require("../../../shared/lib/dedjs/RequestPath");
const DecodeType = require("../../../shared/lib/dedjs/DecodeType");
const Convert = require("../../../shared/lib/dedjs/Convert");
const CothorityMessages = require("../../../shared/lib/dedjs/protobuf/build/cothority-messages");

const Net = require("../../../shared/lib/dedjs/Net");
const PasteBin = new Net.PasteBin();

const CONODE_ADDRESS = "tcp://10.0.2.2:7002";
const CONODE_PUBLIC_KEY = "HkDzpR5Imd7WNx8kl2lJcIVRVn8gfDByJnmlfrYh/zU=";
const CONODE_PUBLIC_KEY_BYTE_ARRAY = Convert.base64ToByteArray(CONODE_PUBLIC_KEY);
const CONODE_DESCRIPTION = "Conode_1";
const CONODE_ID_REAL = "z6kCTQ77Xna9yfgKka5lNQ==";
const CONODE_ID_REAL_BYTE_ARRAY = Convert.base64ToByteArray(CONODE_ID_REAL);

const SERVER_IDENTITY = Convert.toServerIdentity(CONODE_ADDRESS, CONODE_PUBLIC_KEY_BYTE_ARRAY, CONODE_DESCRIPTION, CONODE_ID_REAL_BYTE_ARRAY);

const PATH = RequestPath.STATUS_REQUEST;
const MESSAGE = CothorityMessages.createStatusRequest();
const TYPE_TO_DECODE = DecodeType.STATUS_RESPONSE;

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
