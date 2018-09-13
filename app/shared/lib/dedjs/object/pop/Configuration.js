/**
 * Stores all necessary data for a configuration. A configuration of a pop-party holds the data
 * necessary to uniquely identify that party, but still lacks the attendees.
 *
 * This module holds wrappers to save and load itself from disk.
 */

// List of all active configurations: only loaded and once saved configurations will appear in this list.
// The keys to this list are the hex string of the hash of the configuration.
let List = {};

class Configuration {

    /**
     * Creates a new configuration from its basic data.
     * @param name {string}
     * @param datetime {string}
     * @param location {string}
     * @param roster {Roster}
     */
    constructor(name, datetime, location, roster) {
        this._name = name;
        this._datetime = datetime;
        this._location = location;
        this._roster = roster;
        // We only add it to the List on the first save.
        this._addedLoaded = false;
        this._finalStatement = null;
    }

    /**
     * Saves this configuration to disk.
     * @return {Promise<Configuration>} the saved configuration.
     */
    save() {
        // Do saving to disk
        if (!this._addedLoaded) {
            this._addedLoaded = true;
            List.push(this);
        }
        return Promise.resolve(this);
    }

    /**
     * Searches on the network for an eventual final statement.
     * @returns {null}
     */
    searchFinalStatement() {
        return null
    }

    // Return an eventual final statement that holds this configuration.
    // This will only search in the list of the final statements if one
    // exists, without going to the network.
    get finalStatement() {
        return null;
    }

    /**
     * Creates a proto-file from this configuration.
     * @returns {Buffer}
     */
    toProto() {
        return Buffer();
    }

    /**
     * Hash returns the hash of the configuration, that will also be used for saving.
     */
    hash() {
        return Uint8Array();
    }

    /**
     * @returns {string} hex representation of the hash.
     */
    hashStr() {
        return Convert.byteArrayToHex(this.hash());
    }

    dirname() {
        return "wallet_" + this.hashStr();
    };

    /**
     * Creates a new configuration from a proto-file.
     * @param proto
     * @returns {Configuration}
     */
    static fromProto(proto) {
        return new Configuration();
    }

    /**
     * Loads all configurations from disk and does eventual conversion from older formats to new formats.
     * @return {Promise<{}>}
     */
    static loadAll() {
        // Only loading if not done yet.
        if (List.length == 0) {
            // Start with compatibility test
            return this.migrateOldVersions()
                .then(() => {
                    return this.loadNewVersions()
                })
        }
        return Promise.resolve(List);
    }

    /**
     * @returns {Promise<Configuration[]>} of all configurations stored
     */
    static loadNewVersions() {
        let fileNames = [];
        FileIO.forEachFolderElement(FilePaths.POP_ATT_PATH, function (partyFolder) {
            if (partyFolder.startsWith("wallet_")) {
                fileNames.push(FileIO.join(FilePath.POP_ATT_PATH, partyFolder, FilePath.POP_ATT_INFOS))
            }
        });
        return Promise.all(
            fileNames.map(fileName => {
                console.log("reading configuration from: " + fileName);
                return FileIO.getStringOf(fileName);
            })
        ).then(files => {
            files.map(file => {
                let object = Convert.jsonToObject(file);
                console.dir("converting file to config:", object);
                let config = new Configuration(object.name, object.datetime, object.location, object.roster);
                List[config.hashStr()] = config;
                return config;
            })
        })
    }

    /**
     * Loads all old configurations and deletes them.
     * @returns {Promise<Configuration[] | never>}
     */
    static migrateOldVersions() {
        let fileNames = [];
        FileIO.forEachFolderElement(FilePaths.POP_ATT_PATH, function (partyFolder) {
            fileNames.push(FileIO.join(FilePath.POP_ATT_PATH, partyFolder, FilePath.POP_ATT_INFOS))
        });

        return Promise.all(
            fileNames.map(fileName => {
                console.log("converting party-config to new version: " + fileName);
                return FileIO.getStringOf(fileName);
            })
        ).then(files => {
            return Promise.all(
                // Convert all files to configurations
                files.map(file => {
                    let object = Convert.jsonToObject(file);
                    console.dir("converting file to config:", object);
                    return new Configuration(object.name, object.datetime, object.location, object.roster).save();
                }))
        }).then(() => {
            return this.deleteOldVersions();
        })
    }

    /**
     * Deletes all old versions and returns true or rejects with an error.
     * @returns {Promise<boolean | never>}
     */
    static deleteOldVersions() {
        console.log("deleting all old folders");
        let fileNames = [];
        FileIO.forEachFolderElement(FilePaths.POP_ATT_PATH, function (partyFolder) {
            fileNames.push(FileIO.join(FilePath.POP_ATT_PATH, partyFolder, FilePath.POP_ATT_INFOS))
        });
        return Promise.all(
            fileNames.map(fileName => {
                return Documents.getFile(fileName).remove();
            })
        ).then(() => {
            return true;
        })
    }

// Getters for our public values.
    get name() {
        return this._name;
    }

    get datetime() {
        return this._datetime;
    }

    get location() {
        return this._location;
    }

    get roster() {
        return this._roster;
    }

// Setters for our public values
    set name(n) {
        this._name = n;
    }

    set datetime(dt) {
        this._datetime = dt;
    }

    set location(l) {
        this._location = l;
    }

    set roster(r) {
        this._roster = r;
    }
}