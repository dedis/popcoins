/**
 * @file Library to ease file I/O using promises.
 */

const FileSystem = require("tns-core-modules/file-system");
const Documents = FileSystem.knownFolders.currentApp();

/**
 * Gets the string of the file at filePath and returns a promise with the content.
 * @param filePath - the path to the file
 * @returns {Promise} - a promise that gets resolved once the content of the file has been read
 */
function getStringOf(filePath) {
  if (typeof filePath !== "string") {
    throw new Error("filePath must be of type string");
  }

  return Documents.getFile(filePath)
    .readText()
    .catch((error) => {
      console.log("READING ERROR:");
      console.log(error);
      console.dir(error);
    });
}

/**
 * Writes the parameter string to the file at filePath. This method overwrites the file completely.
 * @param filePath - the path to the file
 * @param string - the string to write
 * @returns {Promise} - a promise that gets resolved once the content has been written to the file
 */
function writeStringTo(filePath, string) {
  if (typeof filePath !== "string") {
    throw new Error("filePath must be of type string");
  }
  if (typeof string !== "string") {
    throw new Error("string must be of type string");
  }

  return Documents.getFile(filePath)
    .writeText(string)
    .catch((error) => {
      console.log("WRITING ERROR:");
      console.log(error);
      console.dir(error);
    });
}

exports.getStringOf = getStringOf;
exports.writeStringTo = writeStringTo;
