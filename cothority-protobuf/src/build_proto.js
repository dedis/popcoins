const Protobuf = require("protobufjs");
const FileSystem = require("fs");
const Files = require("file");

const REGEX = /^.*\.proto$/;
const ROOT = new Protobuf.Root();

ROOT.define("cothority");

function filesRollUp(error, path, dirs, items) {
  items.forEach(file => {
    console.log(file);

    if (REGEX.test(file)) {
      ROOT.loadSync(file);
    }
  });

  FileSystem.writeFileSync("../build/skeleton.js", `export default '${JSON.stringify(ROOT.toJSON())}';`);
}

Files.walk("models/proto", filesRollUp());
