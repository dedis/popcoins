const FileIO = require("./FileIO");
const FilePaths = require("./FilePaths");
const Convert = require("./Convert");
import Log from "~/lib/Log";

export class Data{
    _version: number;

    constructor(version: number){
        this._version = version;
    }

    save(): Promise<null>{
        let str = JSON.stringify({version: this._version});
        return FileIO.writeStringTo(FilePaths.USER_NAME, str)
            .catch((error) => {
                Log.rcatch(error, "error while saving Data");
            });
    }

    static load() : Promise<Data>{
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