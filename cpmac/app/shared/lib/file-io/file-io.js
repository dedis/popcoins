/**
 * @file Library to ease file I/O using promises.
 */

const FileSystem = require("tns-core-modules/file-system");

const Documents = FileSystem.knownFolders.currentApp();

// Functions ------------------------------------------------------------------

/**
 * Gets the content of the file at filePath and return a promise with the content.
 * @param filePath - the path to the file
 * @returns {Promise.<string>}
 */
function getContentOf(filePath) {
  return Documents.getFile(filePath)
                  .readText()
                  .catch((error) => {
                    console.log("READING ERROR:");
                    console.dir(error);
                  });
}

/**
 * Writes the content to the file at filePath and returns a promise of any. This method overwrites the file completely.
 * @param filePath - the path to the file
 * @param content - the content to write
 * @returns {Promise.<any>}
 */
function writeContentTo(filePath, content) {
  return Documents.getFile(filePath)
                  .writeText(content)
                  .catch((error) => {
                    console.log("WRITING ERROR:");
                    console.dir(error);
                  });
}

// Exports --------------------------------------------------------------------
exports.getContentOf = getContentOf;
exports.writeContentTo = writeContentTo;
