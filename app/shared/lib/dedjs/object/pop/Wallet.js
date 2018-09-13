/**
 * Wallet holds one or more configurations, final statements, and keypairs and lets the user and the organizer
 * use them.
 *
 * TODO: add more than one configuration.
 */

// List is all the Wallets that have been loaded from disk.
var List = {};

class Wallet{
    /**
     * The constructor creates the basic wallet element. You give the constructor, then the wallet element searches for
     * the other elements on disk. Later on you can ask it to update from the network, if available.
     *
     * @param config
     * @return {Promise<Wallet>}
     */
    constructor(config){
        this._config = config;
        this._keypair = null;
        this._finalStatement = null;
        this._token = null;

        return KeyPair(config.dirname())
            .then(kp =>{
                this._keypair = kp;
                return FinalStatement.loadAll();
            })
            .then(fss =>{
                for (let fsId in fss){

                }
            })
            .catch(err=>{
                throw new Error("couldn't create Wallet: " + err);
            });
    }

    /**
     * Loads all wallets from disk. It starts by loading all configurations, then adding for each configuration the
     * final statement, and the keypair.
     *
     * @returns {Promise<Wallet[]>}
     */
    static loadAll(){
        return Configuration.loadAll()
            .then(configs =>{
                return Promise.all(configs.map(config =>{
                    return Wallet(config);
                }))
            })
            .catch(err=>{
                console.log("Error while loading all configurations: " + err);
            })
    }
}

module.exports.List = List;
module.exports.Wallet = Wallet;