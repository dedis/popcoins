const ChaiAsPromised = require("chai-as-promised");
chai.use(ChaiAsPromised);
chai.should();

const RequestPath = require("../../../shared/lib/dedjs/RequestPath");
const DecodeType = require("../../../shared/lib/dedjs/DecodeType");
const Convert = require("../../../shared/lib/dedjs/Convert");
const CothorityMessages = require("../../../shared/lib/dedjs/protobuf/build/cothority-messages");

const Net = require("../../../shared/lib/dedjs/Net");
const StandardSocket = new Net.StandardSocket();
const CothoritySocket = new Net.CothoritySocket();

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
  describe("#StandardSocket", function () {
    it("should throw when address is not a string", function () {
      expect(() => StandardSocket.send(42, "HELLO!")).to.throw();
    });
  });

  describe("#CothoritySocket", function () {
    it("should throw when node is not a ServerIdentity", function () {
      expect(() => CothoritySocket.send("SERVER_IDENTITY", PATH, MESSAGE, TYPE_TO_DECODE)).to.throw();
    });

    it("should throw when path is not a string", function () {
      expect(() => CothoritySocket.send(SERVER_IDENTITY, 42, MESSAGE, TYPE_TO_DECODE)).to.throw();
    });

    it("should throw when message is not a byte array", function () {
      expect(() => CothoritySocket.send(SERVER_IDENTITY, PATH, "MESSAGE", TYPE_TO_DECODE)).to.throw();
    });

    it("should throw when typeToDecode is not a string", function () {
      expect(() => CothoritySocket.send(SERVER_IDENTITY, PATH, MESSAGE, 42)).to.throw();
    });
  });
});
