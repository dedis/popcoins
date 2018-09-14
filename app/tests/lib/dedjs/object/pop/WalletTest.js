const ChaiAsPromised = require("chai-as-promised");
chai.use(ChaiAsPromised);
chai.should();

const FilePaths = require("../../../../../shared/res/files/files-path");
const FileIO = require("../../../../../shared/lib/file-io/file-io");
const Convert = require("../../../../../shared/lib/dedjs/Convert");
const CothorityMessages = require("../../../../../shared/lib/dedjs/network/cothority-messages");
const PopToken = require("../../../../../shared/lib/dedjs/object/pop/att/PopToken");
const Configuration = require("../../../../../shared/lib/dedjs/object/pop/Configuration");
const KeyPair = require("../../../../../shared/lib/dedjs/object/pop/KeyPair");
const Wallet = require("../../../../../shared/lib/dedjs/object/pop/Wallet");
const FileSystem = require("tns-core-modules/file-system");
const Documents = FileSystem.knownFolders.documents();

const PoP = require("../../../../../shared/lib/dedjs/object/pop/PoP").get;

const ROSTER_ID = "8yc0TaIweWRyMA==";
const ROSTER_ID_BYTE_ARRAY = Convert.base64ToByteArray(ROSTER_ID);
const ROSTER_LIST = [
    {
        "public": "HkDzpR5Imd7WNx8kl2lJcIVRVn8gfDByJnmlfrYh/zU=",
        "id": "z6kCTQ77Xna9yfgKka5lNQ==",
        "address": "tls://10.0.2.2:7002",
        "description": "Conode_1"
    },
    {
        "public": "Fx6zzvJM6VzxfByLY2+uArGPtd2lHKPVmoXGMhdaFCA=",
        "id": "Qd8XkrUlVEeClO9I95nklQ==",
        "address": "tls://10.0.2.2:7004",
        "description": "Conode_2"
    },
    {
        "public": "j53MMKZNdtLlglcK9Ct1YYtkbbEOfq3R8ZoJOFIu6tE=",
        "id": "tUq+0651WRaAI4aTQC0d8w==",
        "address": "tls://10.0.2.2:7006",
        "description": "Conode_3"
    }
];
const ROSTER_LIST_SERVER_IDENTITIES = ROSTER_LIST.map(conode => {
    conode.public = Convert.base64ToByteArray(conode.public);
    conode.id = Convert.base64ToByteArray(conode.id);

    return Convert.toServerIdentity(conode.address, conode.public, conode.description, conode.id);
});
const ROSTER_AGGREGATE = "q+G+7n6FXsY7hpxK3m119GuDHnchS6wqTE0sZE/fOKg=";
const ROSTER_AGGREGATE_BYTE_ARRAY = Convert.base64ToByteArray(ROSTER_AGGREGATE);

const POP_DESC_NAME = "Ced's Gang";
const POP_DESC_DATETIME = "Thu, 30 Nov 2017 11:12:00 GMT";
const POP_DESC_LOCATION = "INM, Lausanne";
const POP_DESC_ROSTER = CothorityMessages.createRoster(ROSTER_ID_BYTE_ARRAY, ROSTER_LIST_SERVER_IDENTITIES, ROSTER_AGGREGATE_BYTE_ARRAY);

const FINAL_POP_DESC = CothorityMessages.createPopDesc(POP_DESC_NAME, POP_DESC_DATETIME, POP_DESC_LOCATION, POP_DESC_ROSTER);
let FINAL_ATTENDEES = ["HkDzpR5Imd7WNx8kl2lJcIVRVn8gfDByJnmlfrYh/zU=", "Fx6zzvJM6VzxfByLY2+uArGPtd2lHKPVmoXGMhdaFCA=", "j53MMKZNdtLlglcK9Ct1YYtkbbEOfq3R8ZoJOFIu6tE="];
FINAL_ATTENDEES = FINAL_ATTENDEES.map(base64Key => {
    return Convert.base64ToByteArray(base64Key);
});
const FINAL_SIGNATURE = Convert.base64ToByteArray("2lHKPVm8gfDBhpxK3m119Gux6zzvJM6VzE0s3MMKZNd=");
const FINAL_MERGED = false;
const FINAL_STATEMENT = CothorityMessages.createFinalStatement(FINAL_POP_DESC, FINAL_ATTENDEES, FINAL_SIGNATURE, FINAL_MERGED);

const PRIVATE_KEY = "AWKlOlcTuCHEV/fKX0X1IoAoBU0n1c5iKp/SWRLj3T4=";
const PRIVATE_KEY_BYTE_ARRAY = Convert.base64ToByteArray(PRIVATE_KEY);
const PUBLIC_KEY = "y4JMDWrle6RMV+0BKU92Xbu8+J8VkZ5kV3SvSr2ZxHw=";
const PUBLIC_KEY_BYTE_ARRAY = Convert.base64ToByteArray(PUBLIC_KEY);
const PUBLIC_COMPLETE_KEY = "BBmiuL/uxUuItsuFVQJT4oUv4qZrb1fYQ+GL/ZTpZ43MfMSZvUqvdFdknpEVn/i8u112TykB7VdMpHvlag1Mgss=";
const PUBLIC_COMPLETE_KEY_BYTE_ARRAY = Convert.base64ToByteArray(PUBLIC_COMPLETE_KEY);
const JSON_KEY_PAIR = JSON.stringify({
    "private": PRIVATE_KEY,
    "public": PUBLIC_KEY,
    "publicComplete": PUBLIC_COMPLETE_KEY
});
const KEY_PAIR = Convert.parseJsonKeyPair(JSON_KEY_PAIR);

const POP_TOKEN = new PopToken(FINAL_STATEMENT, KEY_PAIR.private, KEY_PAIR.public);

const POP_DESC_HASH = "is4ISmQqzyEcbzTqDQEo6jP42SU4DTijtPYam5kwsoI=";
const POP_DESC_HASH_JSON = Convert.objectToJson({
    hash: POP_DESC_HASH
});
const POP_DESC_HASH_BYTE_ARRAY = Convert.base64ToByteArray(POP_DESC_HASH);

const CONODE_ADDRESS = "tls://gasser.blue:7002";
//const CONODE_ADDRESS = "tls://10.0.2.2:7004";
//const CONODE_ADDRESS = "tls://10.0.2.2:7006";
const CONODE_PUBLIC_KEY = "HkDzpR5Imd7WNx8kl2lJcIVRVn8gfDByJnmlfrYh/zU=";
//const CONODE_PUBLIC_KEY = "Fx6zzvJM6VzxfByLY2+uArGPtd2lHKPVmoXGMhdaFCA=";
//const CONODE_PUBLIC_KEY = "j53MMKZNdtLlglcK9Ct1YYtkbbEOfq3R8ZoJOFIu6tE=";
const CONODE_PUBLIC_KEY_BYTE_ARRAY = Convert.base64ToByteArray(CONODE_PUBLIC_KEY);
const CONODE_DESCRIPTION = "Conode_1";
//const CONODE_DESCRIPTION = "Conode_2";
//const CONODE_DESCRIPTION = "Conode_3";
const CONODE_ID_REAL = "z6kCTQ77Xna9yfgKka5lNQ==";
//const CONODE_ID_REAL = "Qd8XkrUlVEeClO9I95nklQ==";
//const CONODE_ID_REAL = "tUq+0651WRaAI4aTQC0d8w==";
const CONODE_ID_REAL_BYTE_ARRAY = Convert.base64ToByteArray(CONODE_ID_REAL);
const SERVER_IDENTITY = Convert.toServerIdentity(CONODE_ADDRESS, CONODE_PUBLIC_KEY_BYTE_ARRAY, CONODE_DESCRIPTION, CONODE_ID_REAL_BYTE_ARRAY);

const info1 = {
    id: "6edbeb44219b3a212962567f6a9d26cf4a77708aff59fda08228df0063f97c59",
    omniledgerId: "0d75236a47c8b61b27b47da1df6af68e793ae68fa895eed95c6e5310846d5eab",
    address: CONODE_ADDRESS
};

const info2 = {
    id: "3be5abd7768f3cb049e0d88439f7444e93e1f6ca0a9e1a13c6c7ca1d77d6312d",
    omniledgerId: "0d75236a47c8b61b27b47da1df6af68e793ae68fa895eed95c6e5310846d5eab",
    address: CONODE_ADDRESS
};

describe("Wallet", function () {

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

    function clean() {
        return rmrf(FilePaths.WALLET_PATH)
            .then(() => {
                rmrf(FilePaths.POP_ATT_PATH);
            })
    }

    // before("Clean Files Before Each Test", function () {
    //     return clean();
    // });
    //
    // after("Clean Files After Each Test", function () {
    //     return clean();
    // });
    //
    beforeEach("Clean Files Before Each Test", function () {
        return clean();
    });

    afterEach("Clean Files After Each Test", function () {
        return clean();
    });

    it("should correctly update final statements array", function () {
        this.timeout(40000);
        const toWrite1 = Convert.objectToJson(info1);
        const toWrite2 = Convert.objectToJson(info2);

        return FileIO.writeStringTo(FileIO.join(FilePaths.POP_ATT_PATH, info1.id, FilePaths.POP_ATT_INFOS), toWrite1)
            .then(() => {
                // return FileIO.writeStringTo(FileIO.join(FilePaths.POP_ATT_PATH, info2.id, FilePaths.POP_ATT_INFOS), toWrite2)
            // }).then(() => {
                let kp = new KeyPair();
                return kp.saveBase64(FileIO.join(FilePaths.POP_ATT_PATH, info1.id, FilePaths.KEY_PAIR));
            // }).then(() => {
            //     let kp = new KeyPair();
            //     return kp.saveBase64(FileIO.join(FilePaths.POP_ATT_PATH, info2.id, FilePaths.KEY_PAIR));
            }).then(() => {
                return Wallet.loadNewVersions();
            }).then(configs => {
                if (configs.length > 0) {
                    throw new Error("this should not load anything");
                }
                return Wallet.MigrateFrom.version0();
            }).then(success => {
                if (!success) {
                    throw new Error("should've been able to convert");
                }
                return Wallet.loadNewVersions();
            }).then(configs => {
                if (configs.length != 1) {
                    throw new Error("expected 1 Wallets");
                }
                return Wallet.MigrateFrom.version0();
            }).then(configs =>{
                if (configs.length != 0){
                    throw new Error("should not have any old wallets left.");
                }
            });
    });
});
