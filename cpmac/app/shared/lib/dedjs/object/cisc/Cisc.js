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
        this._address = "";
        this._viewModel = ObservableModule.fromObject({
            devices: new ObservableArray(),
            proposedDevices: new ObservableArray(),
            storage: new ObservableArray(),
            proposedStorage: new ObservableArray(),
            isConnected: false,
            name: ""
        });
        this._data = {};
        this._proposedData = {};
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
    getDevices() {
        return this.getVMModule().devices;
    }

    /**
     * Gets the proposed device list array.
     * @returns {ObservableArray} - an observable array containing all the proposed devices in the identity skipchain
     */
    getProposedDevices() {
        return this.getVMModule().proposedDevices;
    }

    /**
     * Gets the key/value pairs list array.
     * @returns {ObservableArray} - an observable array containing all the key/value pairs in the identity skipchain
     */
    getStorage() {
        return this.getVMModule().storage;
    }

    /**
     * Gets the proposed key/value list array.
     * @returns {ObservableArray} - an observable array containing all the proposed key/value pairs in the identity skipchain
     */
    getProposedStorage() {
        return this.getVMModule().proposedStorage;
    }

    /**
     * Gets the boolean value showing if the app is connected to a skipchain stored in memory
     * @returns {boolean} - the boolean stored in memory
     */
    getIsConnected() {
        return this.getVMModule().isConnected;
    }

    /**
     * Gets the name stored in memory
     * @returns {name} - the name stored in memory
     */
    getName() {
        return this.getVMModule().name
    }

    /**
     * Gets the viewmodel module.
     * @returns {ObservableModule} - an observable module/object containing everything related to the cisc tab binding context
     */
    getVMModule() {
        return this._viewModel;
    }

    /**
     * Gets the data stored in memory
     * @returns {Data} - the data stored in memory
     */
    getData() {
        return this._data;
    }

    /**
     * Gets the proposedData stored in memory
     * @returns {Data} - the proposed data stored in memory
     */
    getProposedData() {
        return this._proposedData;
    }

    /**
     * Gets the string representing the address to the identity skipchain
     * @returns {string} - the url of the skipchain
     */
    getAddress() {
        return this._address;
    }

    /**
     * Sets the new device list array given as parameter.
     * @param {Array} array - the new device list to set
     * @returns {Promise} - a promise that gets resolved once the new device list array has been set
     */
    setDevicesArray(array) {
        if (!(array instanceof Array)) {
            throw new Error("array must be an instance of Array");
        }
        if (array.length === 0 || !Helper.isOfType(array[0], ObjectType.DEVICE)) {
            throw new Error("array is empty or array[i] is not instance of device");
        }

        this.emptyDevicesArray();

        if (array.length === 1) {
            return this.addDevice(array[0]);
        } else {
            const promises = [];
            for (let i = 0; i < array.length; ++i) {
                promises.push(this.addDevice(array[i]));
            }

            return Promise.all(promises);
        }
    }

    /**
     * Sets the new proposed device list array given as parameter.
     * @param {Array} array - the new proposed device list to set
     * @returns {Promise} - a promise that gets resolved once the new proposed device list array has been set
     */
    setProposedDevicesArray(array) {
        if (!(array instanceof Array)) {
            throw new Error("array must be an instance of Array");
        }
        if (array.length === 0 || !Helper.isOfType(array[0], ObjectType.DEVICE)) {
            throw new Error("array is empty or array[i] is not instance of device");
        }
        this.emptyProposedDevicesArray();

        if (array.length === 1) {
            return this.addProposedDevice(array[0]);
        } else {
            const promises = [];
            for (let i = 0; i < array.length; ++i) {
                promises.push(this.addProposedDevice(array[i]));
            }

            return Promise.all(promises);
        }
    }

    /**
     * Sets the new key/value pair list array given as parameter.
     * @param {Array} array - the new key/value pair list to set
     * @returns {Promise} - a promise that gets resolved once the new key/value list array has been set
     */
    setDevicesStorageArray(array) {
        if (!(array instanceof Array)) {
            throw new Error("array must be an instance of Array");
        }
        if (array.length === 0 || !Helper.isOfType(array[0], ObjectType.keyValue)) {
            throw new Error("array is empty or array[i] is not instance of device");
        }

        this.emptyStorageArray();

        if (array.length === 1) {
            return this.addStorage(array[0]);
        } else {
            const promises = [];
            for (let i = 0; i < array.length; ++i) {
                promises.push(this.addStorage(array[i]));
            }

            return Promise.all(promises);
        }
    }

    /**
     * Sets the new proposed key/value pair list array given as parameter.
     * @param {Array} array - the new proposed key/value pair list to set
     * @returns {Promise} - a promise that gets resolved once the new proposed key/value list array has been set
     */
    setProposedStorageArray(array) {
        if (!(array instanceof Array)) {
            throw new Error("array must be an instance of Array");
        }
        if (array.length === 0 || !Helper.isOfType(array[0], ObjectType.keyValue)) {
            throw new Error("array is empty or array[i] is not instance of device");
        }

        this.emptyProposedStorageArray();

        if (array.length === 1) {
            return this.addProposedStorage(array[0]);
        } else {
            const promises = [];
            for (let i = 0; i < array.length; ++i) {
                promises.push(this.addProposedStorage(array[i]));
            }

            return Promise.all(promises);
        }
    }

    /**
     * set the isConnected parameter from the viewmodel
     * @param bool - the value to assign
     * @returns {Promise} - a promise that get resolved once the value is set
     */
    setIsConnected(bool) {
        if (!(typeof bool !== "boolean")) {
            throw new Error("bool must be a Boolean");
        }
        this.getVMModule().isConnected = true;
        return new Promise((resolve, reject) => resolve())
    }

    /**
     * set the address parameter from the class
     * @param address - the value to assign
     * @param save - a boolean saying if you want the value saved permanently
     * @returns {Promise} - a promise that get resolved once the value is set
     */
    setAddress(address, save) {
        if (typeof save !== "boolean") {
            throw new Error("save must be of type boolean");
        }
        if (typeof address !== "string") {
            throw new Error("address must be of type string");
        }

        const oldAddress = this.getAddress();
        this._address = address;
        if (save) {
            let toWrite;
            let obj = new Object();
            obj.address = address;
            toWrite = Convert.objectToJson(obj);

            return FileIO.writeStringTo(FilesPath.CISC_IDENTITY_LINK, toWrite)
                .catch((error) => {
                    console.log(error);
                    console.dir(error);
                    console.trace();

                    return this.setAddress(oldAddress, false)
                        .then(() => {
                            return Promise.reject(error);
                        });
                });
        }

        return Promise.resolve();
    }

    /**
     * set the address parameter from the class
     * @param name - the value to assign
     * @param save - a boolean saying if you want the value saved permanently
     * @returns {Promise} - a promise that get resolved once the value is set
     */
    setName(name, save) {
        if (typeof save !== "boolean") {
            throw new Error("save must be of type boolean");
        }
        if (typeof name !== "string") {
            throw new Error("name must be of type string");
        }

        const oldName = this.getName();
        this.getVMModule().name = name;
        if (save) {
            let toWrite;
            let obj = new Object();
            obj.name = name;
            toWrite = Convert.objectToJson(obj);

            return FileIO.writeStringTo(FilesPath.CISC_NAME, toWrite)
                .catch((error) => {
                    console.log(error);
                    console.dir(error);
                    console.trace();

                    return this.setName(oldName, false)
                        .then(() => {
                            return Promise.reject(error);
                        });
                });
        }

        return Promise.resolve();
    }

    /**
     * Action functions.
     */

    /**
     * Empties the device list array.
     */
    emptyDevicesArray() {
        while (this.getDevices().length > 0) {
            this.getDevices().pop();
        }
    }

    /**
     * Empties the proposed device list array.
     */
    emptyProposedDevicesArray() {
        while (this.getProposedDevices().length > 0) {
            this.getProposedDevices().pop();
        }
    }

    /**
     * Empties the device list array.
     */
    emptyStorageArray() {
        while (this.getStorage().length > 0) {
            this.getStorage().pop();
        }
    }

    /**
     * Empties the device list array.
     */
    emptyProposedStorageArray() {
        while (this.getProposedStorage().length > 0) {
            this.getProposedStorage().pop();
        }
    }

    /**
     * Empties the viewmodel.
     */
    emptyViewModel() {
        const promises = [
            this.emptyDevicesArray(),
            this.emptyProposedDevicesArray(),
            this.emptyStorageArray(),
            this.emptyProposedStorageArray()
        ];

        return Promise.all(promises)
    }

    /**
     * Adds the new device given as parameter to the list of devices.
     * @param {Device} device - the new device to add
     * @returns {Promise} - a promise that gets resolved once the new device has been added
     */
    addDevice(device) {
        if (!Helper.isOfType(device, ObjectType.DEVICE)) {
            throw new Error("device must be an instance of Device");
        }

        this.getDevices().push(device);
        return new Promise((resolve, reject) => resolve())
    }

    /**
     * Adds the new device given as parameter to the list of proposed devices.
     * @param {Device} device - the new device to add
     * @returns {Promise} - a promise that gets resolved once the new device has been added
     */
    addProposedDevice(device) {
        if (!Helper.isOfType(device, ObjectType.DEVICE)) {
            throw new Error("device must be an instance of Device");
        }

        this.getProposedDevices().push(device);
        return new Promise((resolve, reject) => resolve())
    }

    /**
     * Adds the new key/value pair given as parameter to the storage.
     * @param {KeyValue} keyValue - the new key/value pair to add
     * @returns {Promise} - a promise that gets resolved once the new key/value pair has been added
     */
    addStorage(keyValue) {
        if (!Helper.isOfType(keyValue, ObjectType.keyValue)) {
            throw new Error("device must be an instance of Device");
        }

        this.getStorage().push(keyValue);
        return new Promise((resolve, reject) => resolve())
    }

    /**
     * Adds the new key/value pair given as parameter to the proposed Storage.
     * @param {KeyValue} keyValue - the new key/value pair to add
     * @returns {Promise} - a promise that gets resolved once the new key/value pair has been added
     */
    addProposedStorage(keyValue) {
        if (!Helper.isOfType(keyValue, ObjectType.keyValue)) {
            throw new Error("device must be an instance of Device");
        }

        this.getProposedStorage().push(keyValue);
        return new Promise((resolve, reject) => resolve())

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
        const promises = [this.emptyViewModel(),this.resetName(),this.resetAddress()];

        return Promise.all(promises)
            .then(() => {
                this._isLoaded = true;

                return Promise.resolve();
            })
            .catch(error => {
                console.log(error);
                console.dir(error);
                console.trace();
                return Promise.reject(error);
            });
    }

    resetName(){
        return this.setName("",true);
    }

    resetAddress(){
        return this.setAddress("",true);
    }

    /**
     * Main load function.
     * @returns {Promise} - a promise that gets resolved once everything belonging to Cisc has been loaded into memory
     */
    load() {
        this._isLoaded = false;

        const promises = [this.loadAddress(),this.loadName()];

        return Promise.all(promises)
         .then(() => {
         this._isLoaded = true;
         })
         .catch(error => {
         console.log(error);
         console.dir(error);
         console.trace();

         return Promise.reject(error);
         });
    }

    /**
     * Load the identity address into memory
     * @returns {Promise} that gets resolved once the address is loaded into memory
     */
    loadAddress() {
        return FileIO.getStringOf(FilesPath.CISC_IDENTITY_LINK)
            .then(jsonAddress => {
                const obj = JSON.parse(jsonAddress);
                return this.setAddress(obj.address,false)
            })
            .catch(error => {
                console.log(error);
                console.dir(error);
                console.trace();

                return Promise.reject(error);
            });
    }

    /**
     * Load the device name into memory
     * @returns {Promise} that gets resolved once the address is loaded into memory
     */
    loadName() {
        return FileIO.getStringOf(FilesPath.CISC_NAME)
            .then(jsonName => {
                const obj = Convert.jsonToObject(jsonName);
                return this.setName(obj.name,false)
            })
            .catch(error => {
                console.log(error);
                console.dir(error);
                console.trace();

                return Promise.reject(error);
            });
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
