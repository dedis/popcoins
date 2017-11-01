/**
 * @file Library to ease file I/O using promises.
 */

const FileSystem = require("tns-core-modules/file-system");

const Documents = FileSystem.knownFolders.currentApp();

// Functions ------------------------------------------------------------------

/**
 * Gets the string of the file at filePath and return a promise with the content.
 * @param filePath - the path to the file
 * @returns {Promise.<string>}
 */
function getStringOf(filePath) {
  return Documents.getFile(filePath)
                  .readText()
                  .catch((error) => {
                    console.log("READING ERROR:");
                    console.log(error);
                    console.dir(error);
                  });
}

/**
 * Writes the string to the file at filePath and returns a promise of any. This method overwrites the file completely.
 * @param filePath - the path to the file
 * @param string - the string to write
 * @returns {Promise.<any>}
 */
function writeStringTo(filePath, string) {
  return Documents.getFile(filePath)
                  .writeText(string)
                  .catch((error) => {
                    console.log("WRITING ERROR:");
                    console.log(error);
                    console.dir(error);
                  });
}

// Exports --------------------------------------------------------------------
exports.getStringOf = getStringOf;
exports.writeStringTo = writeStringTo;
