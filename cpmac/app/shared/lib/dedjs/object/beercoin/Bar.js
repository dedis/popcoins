const uuidv4 = require("uuid/v4");
const Helper = require("../../Helper");
const ObjectType = require("../../ObjectType");
const FileIO = require("../../../file-io/file-io");
const FilesPath = require("../../../../res/files/files-path");
const Convert = require("../../Convert");
const ObservableArray = require("data/observable-array").ObservableArray;
const Observable = require("data/observable");


/**
 * @param {string} [dirname] - directory of the bar data (directory is created if non existent).
 *  If no directory is specified, a unique random directory name is generated
 **/
class Bar {

  constructor(dirname) {
    if (typeof dirname !== "string") {
      throw new Error("dirname should be of type string or undefined");
    }
    this._dirname = dirname;
    this._config = Observable.fromObject({
      name: "",
      frequency: "",
      date: ""
    });
    this._checkedClients = new ObservableArray();
    this._finalStatements = new ObservableArray();

    load()
  }

  /**
   * Load everything that is related to this bar in memory :
   *  - The already check clients
   *  - The linked final statements
   *  - The configuration
   * @return {Promise<[any]>}
   */
  load() {
    const promises = [this.loadConfig(), this.loadCheckedClients(), this.loadFinalStatements()];

    return Promise.all(promises)
      .catch(error => {
        console.log(error);
        console.dir(error);
        console.trace();

        return Promise.reject(error)
      })
  }

  /**
   * Load the configuration in memory
   * @return {Promise<void>} - a promise that gets resolved once the configuration is loaded
   */
  loadConfig() {
    return FileIO.getStringOf(FileIO.join(FilesPath.BEERCOIN_PATH, dirname, FilesPath.BEERCOIN_BAR_CONFIG))
      .then(configJson => {
        const config = Convert.jsonToObject(configJson);
        const configModule = this.getConfigModule();

        configModule.name = config.name;
        configModule.frequency = config.frequency;
        configModule.date = config.date;

        return Promise.resolve();
      })
  }

  /**
   * Load the already checked clients in memory
   * @return {Promise<void>} - a promise that gets resolved once the clients are loaded
   */
  loadCheckedClients() {
    return FileIO.getStringOf(FileIO.join(FilesPath.BEERCOIN_PATH, dirname, FilesPath.BEERCOIN_CHECKED_CLIENTS))
      .then(checkedClientsJson => {
        const checkedClients = Convert.jsonToObject(checkedClientsJson);
        const checkedClientsModule = this.getCheckedClientsModule();

        checkedClients.forEach(client => {
          checkedClientsModule.push(client)
        });

        return Promise.resolve();
      })

  }

  /**
   * Load the final statements in memory
   * @return {Promise<void>} - a promise that gets resolved once the final statements are loaded
   */
  loadFinalStatements() {
    return FileIO.getStringOf(FileIO.join(FilesPath.BEERCOIN_PATH, dirname, FilesPath.BEERCOIN_LINKED_FINALS))
      .then(finalStatemnetsJson => {
        const finalStatements = Convert.jsonToObject(finalStatemnetsJson);
        const finalStatementsModule = this.getFinalStatementsModule();

        finalStatements.forEach(finalStatement => {
          finalStatementsModule.push(finalStatement)
        });

        return Promise.resolve();
      })

  }

  /**
   * @return {Observable} - the observable config module
   */
  getConfigModule() {
    return this._config;
  }

  /**
   * @return {ObservableArray} - the observable array of the checked clients
   */
  getCheckedClientsModule() {
    return this._checkedClients;
  }

  /**
   * @return {ObservableArray} - the observable array of the final statements
   */
  getFinalStatementsModule() {
    return this._finalStatements;
  }

  /**
   * Create a new bar and save it locally
   *
   * @param {String} name - the name of the bar
   * @param {String} frequency - the frequency at which clients can have a beer. Should be a member of Frequencies enum
   * @param {Array<FinalStatement>} finalStatements - the linked final statements to get the allowed clients
   * @return {Promise<Bar>} - a promise that gets solved when the bar is correctly saved on the disk
   */
  static createWithConfig(name, frequency, finalStatements) {
    if (typeof name !== "string") {
      throw new Error("name must be of type string");
    }

    if(!Object.values(Frequencies).includes(frequency)) {
      throw new Error("frequency must be part of the Frequencies enumeration");
    }

    if(!(finalStatements) instanceof Array) {
      throw new Error("name must be an instance of array");
    }

    finalStatements.forEach(finalStatement => {
      if(!Helper.isOfType(finalStatement, ObjectType.FINAL_STATEMENT)) {
        throw new Error("objects inside finalStatements must be of type FinalStatement");
      }
    });

    const config = {
      name: name,
      frequency: frequency,
      lastPeriodStartDate: Date.now().toString(),
    };

    const configString = Convert.objectToJson(config);
    const finalStatementsString = Convert.objectToJson(finalStatements);
    const dirname = uuidv4();

    return FileIO.writeStringTo(FileIO.join(FilesPath.BEERCOIN_PATH, dirname, FilesPath.BEERCOIN_LINKED_FINALS), finalStatementsString)
      .then(() => {
        return FileIO.writeStringTo(FileIO.join(FilesPath.BEERCOIN_PATH, dirname, FilesPath.BEERCOIN_BAR_CONFIG), configString)
      })
      .then(() => {
        return new Bar(dirname);
      })
      .catch(error => {
        console.log(error);
        console.dir(error);
        console.trace();
        FileIO.removeFolder(FileIO.join(FilesPath.BEERCOIN_PATH, dirname));

        return Promise.reject(error)
      })

  }

  /**
   * Completely remove the Bar from disk
   * @returns {Promise} a promise that gets resolved once the bar is deleted
   */
  remove() {
    return FileIO.removeFolder(FileIO.join(FilesPath.BEERCOIN_PATH, this._dirname));
  }

}

/**
 * Enumerate the different possible frequency for a bar
 * @readonly
 * @enum {string}
 */
const Frequencies = Object.freeze({
  DAILY: "daily",

  WEEKLY: "weekly",

  MONTHLY: "monthly",
});
