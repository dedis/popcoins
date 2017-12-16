const ChaiAsPromised = require("chai-as-promised");
chai.use(ChaiAsPromised);
chai.should();

const FilesPath = require("../../../../../shared/res/files/files-path");
const FileIO = require("../../../../../shared/lib/file-io/file-io");
const Convert = require("../../../../../shared/lib/dedjs/Convert");
const Helper = require("../../../../../shared/lib/dedjs/Helper");

const User = require("../../../../../shared/lib/dedjs/object/user/User").get;

const PRIVATE_KEY = "AWKlOlcTuCHEV/fKX0X1IoAoBU0n1c5iKp/SWRLj3T4=";
const PRIVATE_KEY_BYTE_ARRAY = Convert.base64ToByteArray(PRIVATE_KEY);
const PUBLIC_KEY = "y4JMDWrle6RMV+0BKU92Xbu8+J8VkZ5kV3SvSr2ZxHw=";
const PUBLIC_KEY_BYTE_ARRAY = Convert.base64ToByteArray(PUBLIC_KEY);
const PUBLIC_COMPLETE_KEY = "BBmiuL/uxUuItsuFVQJT4oUv4qZrb1fYQ+GL/ZTpZ43MfMSZvUqvdFdknpEVn/i8u112TykB7VdMpHvlag1Mgss=";
const PUBLIC_COMPLETE_KEY_BYTE_ARRAY = Convert.base64ToByteArray(PUBLIC_COMPLETE_KEY);
const JSON_KEY_PAIR = JSON.stringify({
  "private": PRIVATE_KEY,
  "public": PUBLIC_KEY,
  "publicComplete": PUBLIC_COMPLETE_KEY
});

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
const ROSTER_LIST_BYTE_ARRAY = ROSTER_LIST.map(conode => {
  const copy = Helper.deepCopy(conode);
  copy.public = Convert.base64ToByteArray(conode.public);
  copy.id = Convert.base64ToByteArray(conode.id);

  return copy;
});
const ROSTER_AGGREGATE = "q+G+7n6FXsY7hpxK3m119GuDHnchS6wqTE0sZE/fOKg=";
const ROSTER_AGGREGATE_BYTE_ARRAY = Convert.base64ToByteArray(ROSTER_AGGREGATE);
const JSON_ROSTER_FULL = JSON.stringify({
  "id": ROSTER_ID,
  "list": ROSTER_LIST,
  "aggregate": ROSTER_AGGREGATE
});

describe("User", function () {

  function clean() {
    const promises = Object.getOwnPropertyNames(FilesPath).map(filePath => {
      return FileIO.writeStringTo(filePath, "");
    });

    promises.push(User.reset());

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
    const User2 = require("../../../../../shared/lib/dedjs/object/user/User").get;

    (User2 === User).should.be.true;
  });

  it("should correctly load empty key pair", function () {
    const keyPair = User.getKeyPair();

    keyPair.private.should.be.empty;
    keyPair.public.should.be.empty;
    keyPair.publicComplete.should.be.empty;
  });

  it("should correctly load empty roster", function () {
    const roster = User.getRoster();

    roster.id.should.be.empty;
    roster.list.should.be.empty;
    roster.aggregate.should.be.empty;
  });

  it("should correctly load key pair", function () {
    return FileIO.writeStringTo(FilesPath.KEY_PAIR, JSON_KEY_PAIR)
      .then(() => {
        return User.load();
      })
      .then(() => {
        const keyPair = User.getKeyPair();

        keyPair.private.should.deep.equal(PRIVATE_KEY_BYTE_ARRAY);
        keyPair.public.should.deep.equal(PUBLIC_KEY_BYTE_ARRAY);
        keyPair.publicComplete.should.deep.equal(PUBLIC_COMPLETE_KEY_BYTE_ARRAY);
      });
  });

  it("should correctly load roster", function () {
    return FileIO.writeStringTo(FilesPath.CONODES_JSON, JSON_ROSTER_FULL)
      .then(() => {
        return User.load();
      })
      .then(() => {
        const roster = User.getRoster();

        roster.id.should.deep.equal(ROSTER_ID_BYTE_ARRAY);
        roster.list.length.should.equal(ROSTER_LIST.length);
        for (let i = 0; i < ROSTER_LIST.length; ++i) {
          roster.list[i].public.should.deep.equal(ROSTER_LIST_BYTE_ARRAY[i].public);
          roster.list[i].id.should.deep.equal(ROSTER_LIST_BYTE_ARRAY[i].id);
          roster.list[i].address.should.equal(ROSTER_LIST_BYTE_ARRAY[i].address);
          roster.list[i].description.should.equal(ROSTER_LIST_BYTE_ARRAY[i].description);
        }
        roster.aggregate.should.deep.equal(ROSTER_AGGREGATE_BYTE_ARRAY);
      });
  });

  it("should correctly reset files and memory", function () {
    return FileIO.writeStringTo(FilesPath.KEY_PAIR, JSON_KEY_PAIR)
      .then(() => {
        return FileIO.writeStringTo(FilesPath.CONODES_JSON, JSON_ROSTER_FULL);
      })
      .then(() => {
        return User.load()
          .then(() => {
            return User.reset()
          });
      })
      .then(() => {
        return FileIO.getStringOf(FilesPath.KEY_PAIR)
          .then(string => {
            string.should.be.empty;

            return FileIO.getStringOf(FilesPath.CONODES_JSON)
              .then(string => {
                string.should.be.empty;

                return Promise.resolve();
              });
          });
      })
      .then(() => {
        const keyPair = User.getKeyPair();
        keyPair.private.should.be.empty;
        keyPair.public.should.be.empty;
        keyPair.publicComplete.should.be.empty;

        const roster = User.getRoster();
        roster.id.should.be.empty;
        roster.list.should.be.empty;
        roster.aggregate.should.be.empty;

        return Promise.resolve();
      });
  });

  describe("#emptyRosterStatusList", function () {
    it("should completely empty the status list", function () {
      for (let i = 0; i < 100; ++i) {
        User._roster.statusList.push(i);
      }

      User.emptyRosterStatusList();

      User._roster.statusList.length.should.be.equal(0);
    });
  });

  describe("#addRoster", function () {
    it("should throw an error when the input is not a roster", function () {
      expect(() => ???).to.throw();
    });

    it("should ...", function () {
    });
  });
});
