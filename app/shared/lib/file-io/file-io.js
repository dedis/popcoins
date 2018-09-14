/**
 * @file Library to ease file I/O using promises.
 */

const FileSystem = require("tns-core-modules/file-system");
const Documents = FileSystem.knownFolders.documents();

/**
 * Gets the string of the file at filePath and returns a promise with the content.
 * @param {string} filePath - the path to the file
 * @returns {Promise} - a promise that gets resolved once the content of the file has been read
 */
function getStringOf(filePath) {
    if (typeof filePath !== "string") {
        throw new Error("filePath must be of type string");
    }

    return Documents.getFile(filePath)
        .readText()
        .then(string =>{
            // console.log("read from " + filePath + ":" + string);
            return Promise.resolve(string);
        })
        .catch((error) => {
            console.log("READING ERROR:");
            console.log(error);
            console.dir(error);
            console.trace();
        });
}

/**
 * Writes the parameter string to the file at filePath. This method overwrites the file completely.
 * @param {string} filePath - the path to the file
 * @param {string} string - the string to write
 * @returns {Promise} - a promise that gets resolved once the content has been written to the file
 */
function writeStringTo(filePath, string) {
    if (typeof filePath !== "string") {
        throw new Error("filePath must be of type string");
    }
    if (typeof string !== "string") {
        throw new Error("string must be of type string");
    }

    // console.log("writing: " + filePath);
    return Documents.getFile(filePath)
        .writeText(string)
        .catch((error) => {
            console.log("WRITING ERROR:");
            console.log(error);
            console.dir(error);
            console.trace();
        });
}

/**
 * Execute a given function on each element of a folder.
 * @param {string} folder - the path to the folder
 * @param {function} closure - the function that will be exeuted on each element. It has to be of type
 * function (elementName: string)
 */
function forEachFolderElement(folder, closure) {
    if (typeof folder !== "string") {
        throw new Error("folder must be of type string");
    }

    if (typeof closure !== "function") {
        throw new Error("closure must be of type function");
    }

    Documents.getFolder(folder).eachEntity(function (entity) {
        closure(entity);
        // continue until the last file
        return true;
    })
}

/**
 * Remove the specified fodler
 * @param {string} folder
 * @retuns {Promise} - a promise that gets resolved once the folder has been deleted
 */
function removeFolder(folder) {
    if (typeof folder !== "string") {
        throw new Error("folder must be of type string");
    }

    return Documents.getFolder(folder).remove().catch((error) => {
        console.log("REMOVING ERROR :");
        console.log(error);
        console.dir(error);
        console.trace();
    });
}

/**
 * Removes the directory recursively, but only files directly inside and the directory itself. If there
 * are subdirectories, this will fail.
 * @param dir
 * @returns {Promise<void>}
 */
function rmrf(dir) {
    let ps = Promise.resolve();
    FileIO.forEachFolderElement(dir, function (wallet) {
        let wp = FileIO.join(dir, wallet.name);
        // console.dir("wallet path is:", wp);
        FileIO.forEachFolderElement(wp, function (file) {
            // console.dir("wallet file is:", file);
            let f = Documents.getFile(FileIO.join(wp, file.name));
            ps = ps.then(() => {
                // console.dir("deleting file", f.path, f.name);
                return f.remove()
            });
        });
        let d = Documents.getFolder(wp);
        ps = ps.then(() => {
            // console.dir("deleting directory", d.path);
            return d.remove()
        });
    });
    return ps;
}

function folderExists(path) {
    return FileSystem.Folder.exists(this.join(Documents.path, path));
}

function fileExists(path) {
    return FileSystem.Folder.exists(this.join(Documents.path, path));
}

module.exports.getStringOf = getStringOf;
module.exports.writeStringTo = writeStringTo;
module.exports.forEachFolderElement = forEachFolderElement;
module.exports.removeFolder = removeFolder;
module.exports.join = FileSystem.path.join;
module.exports.fileExists = fileExists;
module.exports.folderExists = folderExists;
module.exports.rmrf = rmrf;
