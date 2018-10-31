require("nativescript-nodeify");
const uuidv4 = require("uuid/v4");
const ObservableArray = require("data/observable-array").ObservableArray;
const Observable = require("data/observable");
const Kyber = require("@dedis/kyber-js");
const Suite = new Kyber.curve.edwards25519.Curve;
const Crypto = require("crypto-browserify");

const Badge = require("~/lib/pop/Badge").Badge;
const FileIO = require("~/lib/FileIO");
const FilesPath = require("~/lib/FilePaths");
const Convert = require("~/lib/Convert");
const Log = require("~/lib/Log").default;
const RingSig = require("~/lib/crypto/RingSig");

/**
 * @param {string} [dirname] - directory of the coupon data (directory is created if non existent).
 *  If no directory is specified, a unique random directory name is generated
 **/
class Coupon {
    constructor(dirname) {
        if (typeof dirname !== "string") {
            throw new Error("dirname should be of type string or undefined");
        }
        this._dirname = dirname;
        this._config = Observable.fromObject({
            name: "",
            frequency: "",
            date: new Date(Date.now())
        });
        this._checkedClients = [];
        this._finalStatement = undefined;
        this._anonymitySet = new Set();
        this._orderHistory = new ObservableArray();

        this.load();
    }

    /**
     * Add a new date to the order history
     *
     * @param date - the date that will be added
     * @return {Promise} - a promise that gets resolved once the new history is saved on the disk
     */
    addOrderToHistory(date) {
        if (!(date instanceof Date)) {
            throw "date must be an instance of Date"
        }

        const history = this.getOrderHistoryModule();
        history.push(date);

        return this.saveHistory()
    }

    /**
     * Load everything that is related to this coupon in memory :
     *  - The already check clients
     *  - The linked final statements
     *  - The configuration
     * @return {Promise<>}
     */
    load() {
        const promises = [this.loadConfig(), this.loadOrderHistory()];

        return Promise.all(promises)
            .then(() => {
                // needs to be done after, as the period may need to be reset (thus we check the config before)
                return this.loadCheckedClients();
            })
            .catch(error => {
                Log.catch(error);

                return Promise.reject(error)
            })
    }

    /**
     * Load the configuration in memory
     * @return {Promise<void>} - a promise that gets resolved once the configuration is loaded
     */
    loadConfig() {
        return FileIO.getStringOf(FileIO.join(FilesPath.COUPON_PATH, this._dirname, FilesPath.COUPON_BAR_CONFIG))
            .then(configJson => {
                const config = Convert.jsonToObject(configJson);
                const configModule = this.getConfigModule();
                const ONE_DAY = 24 * 60 * 60 * 1000;

                configModule.name = config.name;
                configModule.frequency = config.frequency;
                configModule.date = new Date(parseInt(config.date)); // + permforms the conversion to Int


                Log.lvl3("val 1 = " + Date.now());
                Log.lvl3("val 2 = " + configModule.date);
                Log.lvl3("json = " + configJson);
                Log.lvl3(config);

                let numberOfDay = Math.floor((Date.now() - configModule.date.getTime()) / ONE_DAY);
                let maxDays;

                switch (configModule.frequency) {
                    case Frequencies.DAILY:
                        maxDays = 1;
                        break;
                    case Frequencies.WEEKLY:
                        maxDays = 7;
                        break;
                    case Frequencies.MONTHLY:
                        maxDays = 30;
                        break;
                    default:
                        throw "Date is not valid"
                }


                Log.lvl1("nb of day =" + numberOfDay);
                Log.lvl1("max days =" + maxDays);

                if (numberOfDay >= maxDays) {
                    return this.resetPeriod()
                }


                return Promise.resolve();
            })
    }

    /**
     * Load the already checked clients in memory
     * @return {Promise<void>} - a promise that gets resolved once the clients are loaded
     */
    loadCheckedClients() {
        return FileIO.getStringOf(FileIO.join(FilesPath.COUPON_PATH, this._dirname, FilesPath.COUPON_CHECKED_CLIENTS))
            .then(checkedClientsJson => {
                if (checkedClientsJson.length === 0) {
                    return Promise.resolve();
                }
                const checkedClients = Convert.jsonToObject(checkedClientsJson);

                checkedClients.clients.forEach(client => {
                    this._checkedClients.push(new Uint8Array(Object.values(client)));
                });
                return Promise.resolve();
            })

    }

    /**
     * Load the order history in memory
     * @return {Promise} - a promise that gets resolved once the history is loaded
     */
    loadOrderHistory() {
        return FileIO.getStringOf(FileIO.join(FilesPath.COUPON_PATH, this._dirname, FilesPath.COUPON_ORDER_HISTORY))
            .then(orderHistoryJson => {
                if (orderHistoryJson.length === 0) {
                    return Promise.resolve()
                }

                const orderHistory = Convert.jsonToObject(orderHistoryJson);
                const orderHistoryModule = this.getOrderHistoryModule();
                orderHistory.dates.forEach(date => {
                    orderHistoryModule.push(new Date(parseInt(date)));
                })
            })
    }

    /**
     * Save the list of checked client of this
     * @return {Promise} - a promise that gets solved once the it is saved
     */
    saveCheckedClients() {
        const fields = {
            clients: this._checkedClients.map(client => {
                return client;
            })
        };

        const objectString = Convert.objectToJson(fields);
        return FileIO.writeStringTo(FileIO.join(FilesPath.COUPON_PATH, this._dirname, FilesPath.COUPON_CHECKED_CLIENTS), objectString)
            .catch(error => {
                Log.rcatch(error);
            })
    }

    /**
     * Save the current coupon configuration on the disk
     *
     * @return {Promise} - a promise that gets solved once the config is saved on the disk
     */
    saveConfig() {
        return FileIO.writeStringTo(FileIO.join(FilesPath.COUPON_PATH, this._dirname, FilesPath.COUPON_BAR_CONFIG),
            this.getConfigString())
    }

    /**
     * Returns the configuration as a string
     *
     * @return {String} json-configuration
     */
    getConfigString() {
        let currentConfig = this.getConfigModule();
        return Coupon.getConfigStringJson(currentConfig.name,
            currentConfig.frequency,
            currentConfig.date);
    }

    /**
     * Convert the relevant data of a configuration to a string
     * @param name {String}
     * @param frequency {String}
     * @param date {Date}
     * @returns {string}
     */
    static getConfigStringJson(name, frequency, date) {
        return Convert.objectToJson({
            name: name,
            frequency: frequency,
            date: date.getTime()
        })
    }

    /**
     * Save the current history on the disk
     * @return {Promise} - a promise that gets solved once the datas are on the disk
     */
    saveHistory() {
        let history = this.getOrderHistoryModule();
        const fields = {
            dates: history.map(date => {
                return date.getTime();
            })

        };
        let historyString = Convert.objectToJson(fields);
        return FileIO.writeStringTo(FileIO.join(FilesPath.COUPON_PATH, this._dirname, FilesPath.COUPON_ORDER_HISTORY), historyString)
    }

    /**
     * Check if a specific tag has already been registered to this coupon
     *
     * @param tag {Uint8Array} - the tag to be checked
     * @return {boolean} - true if this client already came here
     */
    isAlreadyChecked(tag) {
        if (!(tag instanceof Uint8Array)) {
            throw "tag must be an Uint8Array";
        }
        return this._checkedClients.findIndex(cl => {
            return Buffer.compare(Buffer.from(cl), Buffer.from(tag)) == 0;
        }) >= 0;
    }

    /**
     * Reset the current period (set to date to now and clear the list of checked clients)
     *
     * @return {Promise} - a promise that gets solved when everything (config + check clients) is saved to disk
     */
    resetPeriod() {
        const configModule = this.getConfigModule();
        configModule.date = new Date(Date.now());

        this._checkedClients.splice(0);
        const promises = [this.saveCheckedClients(), this.saveConfig()];
        return Promise.all(promises)
            .catch(error => {
                Log.catch(error);

                return Promise.reject()
            })
    }

    /**
     * Empty the history and save it on the disk
     * @return {Promise} - a promise that gets solved once the history is cleared in memory and on the disk
     */
    resetOrderHistory() {
        const history = this.getOrderHistoryModule();
        history.splice(0);
        this._checkedClients = [];
        this.saveCheckedClients();
        this.saveHistory();

        return this.saveHistory();
    }

    /**
     * Register a new client and save it on the disk
     *
     * @param signature - the new client signature
     * @param signingData - the signing info used to register a client. Shoul be an object oh hex string
     * @return {Promise} - a promise that gets solved once the save process is finished if the client is not already
     * registered
     */
    registerClient(signature, signingData) {
        if (!(signature instanceof Uint8Array)) {
            throw "signature must be an Uint8Array";
        }

        let nonce = signingData.nonce;
        let scope = signingData.scope;

        const verifyInfo = RingSig.Verify(Suite, nonce, [...this._anonymitySet], scope, signature);
        if (!verifyInfo.valid) {
            return Promise.reject("You are not part of the right group.")
        } else if (this.isAlreadyChecked(verifyInfo.tag)) {
            return Promise.reject("You already redeemed this coupon. Please come back later.")
        }

        this._checkedClients.push(verifyInfo.tag);
        return this.saveCheckedClients();
    }


    /**
     * Get the datas used that will be signed to identificate an user
     *
     * @return {{nonce: Uint8Array, scope: Uint8Array}}
     */
    getSigningData() {
        const configModule = this.getConfigModule();

        const nonce = Crypto.randomBytes(16);
        const scopeString =
            configModule.name +
            configModule.frequency +
            configModule.date.getFullYear() +
            configModule.date.getMonth() +
            configModule.date.getDay();
        const scope = new Uint8Array(Buffer.from(scopeString));

        return {
            nonce: nonce,
            scope: scope
        }
    }

    /**
     * Return the history of the ordered beer since the last reset
     *
     * @return {ObservableArray}
     */
    getOrderHistoryModule() {
        return this._orderHistory;
    }

    /**
     * @return {Observable} - the observable config module
     */
    getConfigModule() {
        return this._config;
    }

    /**
     * @return {ObservableArray} - the observable array of the final statements
     */
    getFinalStatement() {
        return this._finalStatement;
    }

    /**
     * Create a new coupon and save it locally
     *
     * @param {String} name - the name of the coupon
     * @param {String} frequency - the frequency at which clients can have a beer. Should be a member of Frequencies enum
     * @param {Date} date - when the frequencies align
     * @param {Badge} b - the linked final statement to get the allowed clients
     * @return {Promise<Coupon>} - a promise that gets solved when the coupon is correctly saved on the disk
     */
    static createWithConfig(name, frequency, date, b) {
        if (typeof name !== "string") {
            throw new Error("name must be of type string");
        }

        if (!Object.values(Frequencies).includes(frequency)) {
            throw new Error("frequency must be part of the Frequencies enumeration");
        }

        if (!(b instanceof Badge)) {
            throw new Error("b must be of type Badge");
        }

        let config = b.config;
        const configObject = {
            name: config.name,
            datetime: config.datetime,
            location: config.location,
            roster: Convert.rosterToJson(config.roster),
            attendees: b.finalStatement.attendees.map(a => {
                return a.marshalBinary();
            })
        }
        const configString = Convert.objectToJson(configObject);
        const dirname = uuidv4();

        return FileIO.writeStringTo(FileIO.join(FilesPath.COUPON_PATH, dirname, FilesPath.COUPON_LINKED_FINALS),
            configString)
            .then(() => {
                return FileIO.writeStringTo(FileIO.join(FilesPath.COUPON_PATH, dirname, FilesPath.COUPON_BAR_CONFIG),
                    this.getConfigStringJson(name, frequency, date));
            })
            .then(() => {
                return new Coupon(dirname);
            })
            .catch(error => {
                Log.catch(error);
                FileIO.removeFolder(FileIO.join(FilesPath.COUPON_PATH, dirname));

                return Promise.reject(error)
            })

    }

    /**
     * Completely remove the Bar from disk
     * @returns {Promise} a promise that gets resolved once the coupon is deleted
     */
    remove() {
        return FileIO.removeFolder(FileIO.join(FilesPath.COUPON_PATH, this._dirname));
    }

}

/**
 * Enumerate the different possible frequency for a coupon
 * @readonly
 * @enum {string}
 */
const Frequencies = Object.freeze({
    DAILY: "daily",

    WEEKLY: "weekly",

    MONTHLY: "monthly",
});

module.exports = Coupon;
module.exports.Frequencies = Frequencies;
