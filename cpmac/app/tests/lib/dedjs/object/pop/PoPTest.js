const ChaiAsPromised = require("chai-as-promised");
chai.use(ChaiAsPromised);
chai.should();

const FilesPath = require("../../../../../shared/res/files/files-path");
const FileIO = require("../../../../../shared/lib/file-io/file-io");

const PoP = require("../../../../../shared/lib/dedjs/object/pop/PoP").get;

describe("PoP", function () {

  function clean() {
    const promises = Object.getOwnPropertyNames(FilesPath).map(filePath => {
      return FileIO.writeStringTo(filePath, "");
    });

    // TODO: decomment
    //promises.push(PoP.reset());

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
  });

  it("should correctly load empty key pair", function () {
  });

  it("should correctly load empty roster", function () {
  });

  it("should correctly load key pair", function () {
  });

  it("should correctly load roster", function () {
  });

  it("should correctly reset files and memory", function () {
  });
});
