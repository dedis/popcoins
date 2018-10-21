import { Badge, STATE_TOKEN } from "~/lib/pop/Badge";

const FileIO = require("./FileIO");
const FilePaths = require("./FilePaths");
const Convert = require("./Convert");
import Log from "~/lib/Log";

export class Data {
    // The version is used to know how to translate different data types.
    _version: number;
    // A list of finalized and not finalized parties.
    _badges: Badge[];

    constructor(version: number) {
        this._version = version;
        this._badges = [];
    }

    save(): Promise<null> {
        let str = JSON.stringify({version: this._version});
        return FileIO.writeStringTo(FilePaths.USER_NAME, str)
            .catch((error) => {
                Log.rcatch(error, "error while saving Data");
            });
    }

    /**
     * @return Promise<Array<Badge>> finalized parties
     */
    loadBadges(): Promise<Array<Badge>> {
        return Badge.loadAll()
            .then(badges => {
                badges.forEach(b =>{
                    this.addParty(b);
                });
                return this._badges;
            });
    }

    /**
     * updateAllBadges calls 'update' on all Badges stored in 'List'.
     * @return {Promise<Array<Badge>>}
     */
    updateAllBadges(): Promise<Array<Badge>> {
        return Promise.all(
            this._badges.map((badge) => {
                return badge.update()
                    .catch((err) => {
                        Log.catch(err, "while updating badge: " + badge.config.name);
                    });
            })
        ).then(() => {
            return this._badges;
        });
    }

    /**
     * Remove will delete the party from the list of available parties.
     */
    removeBadge(b: Badge) {
        const i = this._badges.indexOf(b);
        if (i >= 0) {
            let removed = this._badges.splice(i, 1)[0];
            return FileIO.rmrf(FileIO.join(FilePaths.WALLET_PATH,
                "wallet_" + removed.config.hashStr()));
        } else {
            throw new Error("Didn't find this Badge in List");
        }
    }

    /**
     * Adds a new party to the list of existing parties and sorts the list with the
     * most recent party at the top.
     * @param p
     */
    addParty(p: Badge) {
        this._badges.push(p);
        this._badges.sort((a, b) => {
            return Date.parse(b.config.datetime) - Date.parse(a.config.datetime);
        });
    }

    /**
     * Returns all finalized parties.
     */
    get badges(): Array<Badge> {
        return this._badges;
    }

    /**
     * Returns all parties that are not finalized yet.
     */
    get parties(): Array<Badge> {
        return this._badges.filter(b => {
            return b.state() != STATE_TOKEN;
        });
    }

    /**
     * Returns the current version.
     */
    get version(): number {
        return this._version;
    }

    /**
     * Sets the current version
     * @param v: number - new version.
     */
    set version(v: number) {
        this._version = v;
    }

    static load(): Promise<Data> {
        return FileIO.getStringOf(FilePaths.USER_NAME)
            .then(jsonVersion => {
                let version = 0;
                if (jsonVersion.length > 0) {
                    version = parseInt(JSON.parse(jsonVersion).version);
                }
                return new Data(version);
            })
            .catch(error => {
                Log.catch(error, "No version stored.");
                return new Data(0);
            });
    }
}