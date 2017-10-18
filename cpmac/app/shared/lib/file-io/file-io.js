/**
 * @file Library to ease file I/O using promises.
 */

const FileSystem = require("tns-core-modules/file-system");

const Documents = FileSystem.knownFolders.currentApp();

// Functions ------------------------------------------------------------------
function getContentOf(file) {
  return Documents.getFile(file)
                  .readText()
                  .catch((error) => {
                    console.log("READING ERROR:");
                    console.dir(error);
                  });
}

function writeContentTo(file, string) {
  return Documents.getFile(file)
                  .writeText(string)
                  .catch((error) => {
                    console.log("WRITING ERROR:");
                    console.dir(error);
                  });
}

// Exports --------------------------------------------------------------------
exports.getContentOf = getContentOf;
exports.writeContentTo = writeContentTo;
