const ChaiAsPromised = require("chai-as-promised");
chai.use(ChaiAsPromised);
chai.should();

const FilesPath = require("../../../../../shared/res/files/files-path");
const FileIO = require("../../../../../shared/lib/file-io/file-io");
const Convert = require("../../../../../shared/lib/dedjs/Convert");
const CothorityMessages = require("../../../../../shared/lib/dedjs/protobuf/build/cothority-messages");

const PoP = require("../../../../../shared/lib/dedjs/object/pop/PoP").get;

const ROSTER_ID = "8yc0TaIweWRyMA==";
const ROSTER_ID_BYTE_ARRAY = Convert.base64ToByteArray(ROSTER_ID);
const ROSTER_LIST = [
  {
    "public": "HkDzpR5Imd7WNx8kl2lJcIVRVn8gfDByJnmlfrYh/zU=",
    "id": "z6kCTQ77Xna9yfgKka5lNQ==",
    "address": "tcp://10.0.2.2:7002",
    "description": "Conode_1"
  },
  {
    "public": "Fx6zzvJM6VzxfByLY2+uArGPtd2lHKPVmoXGMhdaFCA=",
    "id": "Qd8XkrUlVEeClO9I95nklQ==",
    "address": "tcp://10.0.2.2:7004",
    "description": "Conode_2"
  },
  {
    "public": "j53MMKZNdtLlglcK9Ct1YYtkbbEOfq3R8ZoJOFIu6tE=",
    "id": "tUq+0651WRaAI4aTQC0d8w==",
    "address": "tcp://10.0.2.2:7006",
    "description": "Conode_3"
  }
];
const ROSTER_LIST_SERVER_IDENTITIES = ROSTER_LIST.map(conode => {
  conode.public = Convert.base64ToByteArray(conode.public);
  conode.id = Convert.base64ToByteArray(conode.id);

  return Convert.toServerIdentity(conode.address, conode.public, conode.description, conode.id);
});
const ROSTER_AGGREGATE = "q+G+7n6FXsY7hpxK3m119GuDHnchS6wqTE0sZE/fOKg=";
const ROSTER_AGGREGATE_BYTE_ARRAY = Convert.base64ToByteArray(ROSTER_AGGREGATE);

const POP_DESC_NAME = "Ced's Gang";
const POP_DESC_DATETIME = "Thu, 30 Nov 2017 11:12:00 GMT";
const POP_DESC_LOCATION = "INM, Lausanne";
const POP_DESC_ROSTER = CothorityMessages.createRoster(ROSTER_ID_BYTE_ARRAY, ROSTER_LIST_SERVER_IDENTITIES, ROSTER_AGGREGATE_BYTE_ARRAY);

const FINAL_POP_DESC = CothorityMessages.createPopDesc(POP_DESC_NAME, POP_DESC_DATETIME, POP_DESC_LOCATION, POP_DESC_ROSTER);
let FINAL_ATTENDEES = ["HkDzpR5Imd7WNx8kl2lJcIVRVn8gfDByJnmlfrYh/zU=", "Fx6zzvJM6VzxfByLY2+uArGPtd2lHKPVmoXGMhdaFCA=", "j53MMKZNdtLlglcK9Ct1YYtkbbEOfq3R8ZoJOFIu6tE="];
FINAL_ATTENDEES = FINAL_ATTENDEES.map(base64Key => {
  return Convert.base64ToByteArray(base64Key);
});
const FINAL_SIGNATURE = Convert.base64ToByteArray("2lHKPVm8gfDBhpxK3m119Gux6zzvJM6VzE0s3MMKZNd=");
const FINAL_MERGED = false;
const FINAL_STATEMENT = CothorityMessages.createFinalStatement(FINAL_POP_DESC, FINAL_ATTENDEES, FINAL_SIGNATURE, FINAL_MERGED);

describe.only("PoP", function () {

  function clean() {
    const promises = Object.getOwnPropertyNames(FilesPath).map(filePath => {
      return FileIO.writeStringTo(filePath, "");
    });

    promises.push(PoP.reset());

    return Promise.all(promises)
      .catch(error => {
        console.log(error);
        console.dir(error);
        console.trace();

        return Promise.reject(error);
      });
  }

  before("Clean Files Before Starting", function () {
    return clean();
  });

  after("Clean Files After Testing", function () {
    return clean();
  });

  beforeEach("Clean Files Before Each Test", function () {
    return clean();
  });

  afterEach("Clean Files After Each Test", function () {
    return clean();
  });

  it("should be a singleton", function () {
    const PoP2 = require("../../../../../shared/lib/dedjs/object/pop/PoP").get;

    (PoP2 === PoP).should.be.true;
  });

  it("should correctly load empty key pair", function () {
  });

  it("should correctly load key pair", function () {
  });

  it("should correctly reset files and memory", function () {
    return FileIO.writeStringTo(FilesPath.POP_FINAL_STATEMENTS, "POP_FINAL_STATEMENTS")
      .then(() => {
        return FileIO.writeStringTo(FilesPath.POP_TOKEN, "POP_TOKEN");
      })
      .then(() => {
        for (let i = 0; i < 100; ++i) {
          PoP._finalStatements.array.push(i);
          PoP._popToken.array.push(i);
        }

        return PoP.reset();
      })
      .then(() => {
        return FileIO.getStringOf(FilesPath.POP_FINAL_STATEMENTS)
          .then(finalStatementsString => {
            finalStatementsString.should.equal("");
          });
      })
      .then(() => {
        return FileIO.getStringOf(FilesPath.POP_TOKEN)
          .then(popTokenString => {
            popTokenString.should.equal("");
          });
      })
      .then(() => {
        PoP._finalStatements.array.length.should.equal(0);
        PoP._popToken.array.length.should.equal(0);
      });
  });

  describe("#isLoaded", function () {
    it("should return the reference to the boolean", function () {
      (PoP.isLoaded() === PoP._isLoaded).should.be.true;
    });
  });

  describe("#getFinalStatements", function () {
    it("should return the reference to the final statements observable array", function () {
      (PoP.getFinalStatements() === PoP._finalStatements.array).should.be.true;
    });
  });

  describe("#getFinalStatementsModule", function () {
    it("should return the reference to the final statements observable module", function () {
      (PoP.getFinalStatementsModule() === PoP._finalStatements).should.be.true;
    });
  });

  describe("#getPopToken", function () {
    it("should return the reference to the PoP-Token observable array", function () {
      (PoP.getPopToken() === PoP._popToken.array).should.be.true;
    });
  });

  describe("#getPopTokenModule", function () {
    it("should return the reference to the PoP-Token observable module", function () {
      (PoP.getPopTokenModule() === PoP._popToken).should.be.true;
    });
  });

  describe("#emptyFinalStatementArray", function () {
    it("should completely empty the final statement array", function () {
      for (let i = 0; i < 100; ++i) {
        PoP._finalStatements.array.push(i);
      }

      PoP.emptyFinalStatementArray();

      PoP._finalStatements.array.length.should.equal(0);
    });
  });

  describe("#emptyPopTokenArray", function () {
    it("should completely empty the PoP-Token array", function () {
      for (let i = 0; i < 100; ++i) {
        PoP._popToken.array.push(i);
      }

      PoP.emptyPopTokenArray();

      PoP._popToken.array.length.should.equal(0);
    });
  });

  describe("#addFinalStatement", function () {
    it("should throw an error when finalStatement is not a final statement", function () {
      expect(() => PoP.addFinalStatement("FINAL_STATEMENT", true)).to.throw();
    });

    it("should throw an error when save is not a boolean", function () {
      expect(() => PoP.addFinalStatement(FINAL_STATEMENT, "true")).to.throw();
    });

    it("should save if save is true", function () {
      /* // TODO
      return PoP.addFinalStatement(FINAL_STATEMENT, true)
        .then(() => {
        });
        */
    });
  });
});
