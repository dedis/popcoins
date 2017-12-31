const ObservableModule = require("data/observable");
const ObservableArray = require("data/observable-array").ObservableArray;
const Package = require("../../Package");
const ObjectType = require("../../ObjectType");
const Helper = require("../../Helper");
const Convert = require("../../Convert");
const FilesPath = require("../../../../res/files/files-path");
const FileIO = require("../../../../lib/file-io/file-io");
const CothorityMessages = require("../../protobuf/build/cothority-messages");

const User = require("../user/User").get;

/**
 * This singleton is the Cisc component of the app. It contains everything needed to interact with the identity skipchain.
 */

/**
 * We define the Cisc class which is the object representing the Cisc component of the app.
 */

class Cisc {
    /**
     * Constructor for the Cisc class.
     */
    constructor() {
        this._isLoaded = false;
        this._isConnected = false;
        this._adress = "";
        this._deviceList = ObservableModule.fromObject({
            array: new ObservableArray()
        });


        // this._identity = undefined;
        // this._deviceList = new ObservableArray();
        // this._proposedDeviceList = new ObservableArray();
        // this._storageList = new ObservableArray();
        // this._data = undefined;
        // this._proposedData = undefined;
        // this._isOnProposed = false;
    }

    /**
     * Getters and Setters.
     */

    /**
     * Gets the isLoaded property of Cisc. It is only true once all the settings have been loaded into memory.
     * @returns {boolean} - a boolean that is true if Cisc has completely been loaded into memory
     */
    isLoaded() {
        return this._isLoaded;
    }

    /**
     * Gets the device list array.
     * @returns {ObservableArray} - an observable array containing all the devices in the identity skipchain
     */
    getDeviceList() {
        return this.getDeviceListModule().array;
    }

    /**
     * Gets the device list module.
     * @returns {ObservableModule} - an observable module/object containing everything related to the device list (including the array of devices)
     */
    getDeviceListModule() {
        return this._deviceList;
    }

    /**
     * Sets the new device list array given as parameter.
     * @param {Array} array - the new device list to set
     * @returns {Promise} - a promise that gets resolved once the new device list array has been set
     */
    setFinalStatementsArray(array) {
        if (!(array instanceof Array)) {
            throw new Error("array must be an instance of Array");
        }
        if (array.length === 0 || !Helper.isOfType(array[0], ObjectType.DEVICE)) {
            throw new Error("array is empty or array[i] is not instance of device");
        }
    }

    /**
     * Load and reset functions and sub-functions to load/reset Cisc.
     */

    /**
     * Completely resets Cisc.
     * @returns {Promise} - a promise that gets resolved once Cisc has been reset
     */
    reset() {
        this._isLoaded = false;

        //const promises = [FileIO.writeStringTo(FilesPath.POP_FINAL_STATEMENTS, ""), FileIO.writeStringTo(FilesPath.POP_TOKEN, "")];

        /*return Promise.all(promises)
            .then(() => {
                this.emptyFinalStatementArray();
                this.emptyPopTokenArray();

                this._isLoaded = true;

                return Promise.resolve();
            })
            .catch(error => {
                console.log(error);
                console.dir(error);
                console.trace();

                return Promise.reject(error);
            });*/
        return Promise.resolve()
    }

    /**
     * Main load function.
     * @returns {Promise} - a promise that gets resolved once everything belonging to Cisc has been loaded into memory
     */
    load() {
        this._isLoaded = false;

        //const promises = [this.loadFinalStatements(), this.loadPopToken()];

        /*return Promise.all(promises)
            .then(() => {
                this._isLoaded = true;
            })
            .catch(error => {
                console.log(error);
                console.dir(error);
                console.trace();

                return Promise.reject(error);
            });*/
        return Promise.resolve();
    }

}

/**
 * Now we create a singleton object for Cisc.
 */

// The symbol key reference that the singleton will use.
const CISC_PACKAGE_KEY = Symbol.for(Package.CISC);

// We create the singleton if it hasn't been instanciated yet.
const globalSymbols = Object.getOwnPropertySymbols(global);
const ciscExists = (globalSymbols.indexOf(CISC_PACKAGE_KEY) >= 0);

if (!ciscExists) {
    global[CISC_PACKAGE_KEY] = (function () {
        const newCisc = new Cisc();
        newCisc.load();

        return newCisc;
    })();
}

// Singleton API
const CISC = {};

Object.defineProperty(CISC, "get", {
    configurable: false,
    enumerable: false,
    get: function () {
        return global[CISC_PACKAGE_KEY];
    },
    set: undefined
});

// We freeze the singleton.
Object.freeze(CISC);

// We export only the singleton API.
module.exports = CISC;
