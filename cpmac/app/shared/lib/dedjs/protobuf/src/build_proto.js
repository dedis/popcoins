const Protobuf = require("protobufjs");
const FileSystem = require("fs");
const Files = require("file");

const REGEX = /^.*\.proto$/;
const ROOT = new Protobuf.Root();

ROOT.define("cothority");

Files.walk("src/models/proto", (error, path, dirs, files) => {
  console.log("#Path:");
  console.log(path);
  console.log("#Dirs:");
  console.log(dirs);
  console.log("#Files:");
  console.log(files);

  files.forEach(file => {
    if (REGEX.test(file)) {
      ROOT.loadSync(file);
    }
  });

  FileSystem.writeFileSync("build/skeleton.js", `export default '${JSON.stringify(ROOT.toJSON())}';`);
  console.log("##############################");
  console.log("##############################");
});
