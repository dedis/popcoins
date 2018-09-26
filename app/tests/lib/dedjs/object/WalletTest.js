require("nativescript-nodeify");

const lib = require("../../../../shared/lib");
const dedjs = lib.dedjs;
const FilePaths = lib.files_path;
const FileIO = lib.file_io;
const Log = dedjs.Log;
const Convert = dedjs.Convert;
const Configuration = dedjs.object.pop.Configuration;
const KeyPair = dedjs.KeyPair;
const Wallet = dedjs.object.pop.Wallet;
const RequestPath = dedjs.network.RequestPath;

const CONODE_ADDRESS = "tls://gasser.blue:7002";

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

const ROSTER_ID = "8yc0TaIweWRyMA==";
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
const ROSTER_AGGREGATE = "q+G+7n6FXsY7hpxK3m119GuDHnchS6wqTE0sZE/fOKg=";
const JSON_ROSTER_FULL = JSON.stringify({
    "id": ROSTER_ID,
    "identities": ROSTER_LIST,
    "aggregate": ROSTER_AGGREGATE
});
const ROSTER = Convert.parseJsonRoster(JSON_ROSTER_FULL);

function clean() {
    return FileIO.rmrf(FilePaths.WALLET_PATH)
        .then(() => {
            return FileIO.rmrf(FilePaths.POP_ATT_PATH);
        })
}

jasmine.DEFAULT_TIMEOUT_INTERVAL = 40000;

describe("Wallet", function () {
    beforeEach(() => {
        return clean();
    });

    afterEach(() => {
        console.log("done");
        return clean();
    });

    it("should correctly save and load attendees", function () {
        debugger;
        let config = new Configuration("test", "now", "here", ROSTER);
        let wallet = new Wallet(config);
        wallet.attendees = [wallet.keypair.public];
        return expectAsync(wallet.save()
            .then(() => {
                wallet.List = {};
                return Wallet.loadAll();
            })
            .then(wallets => {
                Log.print(wallets);
                wallet = Object.values(wallets)[0];
                Log.print(wallet);
                Log.print(wallet.attendees);
                Log.print(wallet.finalStatement);
                expect(wallet.attendees.length).toBe(1);
            })
            .catch(err => {
                Log.rcatch(err);
            }))
            .toBeResolved();
    });

    it("should correctly update final statements array", function () {
        const toWrite1 = Convert.objectToJson(info1);
        const toWrite2 = Convert.objectToJson(info2);

        return FileIO.writeStringTo(FileIO.join(FilePaths.POP_ATT_PATH, info1.id, FilePaths.POP_ATT_INFOS), toWrite1)
            .then(() => {
                return FileIO.writeStringTo(FileIO.join(FilePaths.POP_ATT_PATH, info2.id, FilePaths.POP_ATT_INFOS), toWrite2)
            }).then(() => {
                let kp = new KeyPair();
                return kp.saveBase64(FileIO.join(FilePaths.POP_ATT_PATH, info1.id, FilePaths.KEY_PAIR));
            }).then(() => {
                let kp = new KeyPair();
                return kp.saveBase64(FileIO.join(FilePaths.POP_ATT_PATH, info2.id, FilePaths.KEY_PAIR));
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
            }).then(configs => {
                if (configs.length != 0) {
                    throw new Error("should not have any old wallets left.");
                }
            });
    });
});

describe("Loading wallet from server", () => {
    beforeEach(() => {
        return clean();
    });

    afterEach(() => {
        console.log("done");
        return clean();
    });

    it("should load correctly and save", () => {
        let test_party = "f927be510671f57f8930237bcbbd91264e5ae35fc445a7568dad4aef23d3988f";
        return expectAsync(Wallet.MigrateFrom.conodeGetWallet("tls://gasser.blue:7002",
            RequestPath.OMNILEDGER_INSTANCE_ID, test_party)
            .then(wallet => {
                wallet.attendeesAdd([wallet.keypair.public]);
                Log.print("Roster is:", wallet.config.roster);
                Log.print("tcpaddress:", wallet.config.roster.tcpAddr);
                return wallet.save()
            })
            .catch(err => {
                Log.rcatch(err);
            })).toBeResolved();
    })
})

describe("Updating wallet from server", () => {
    beforeEach(() => {
        return clean();
    });

    afterEach(() => {
        console.log("done");
        return clean();
    });

    it("should load correctly and save", () => {
        let test_party = "3d1f16b30cbaf1c1f3eaa7f1c008efb30cfcf8c04c1cb2a5b9922edb350d61a3";
        let wallet = null;
        return expectAsync(Wallet.MigrateFrom.conodeGetWallet("tls://gasser.blue:7002",
            RequestPath.OMNILEDGER_INSTANCE_ID, test_party)
            .then(w => {
                wallet = w;
                return wallet.getPartyInstance();
            })
            .then(pi =>{
                Log.print("state is:", wallet.stateStr());
                return pi.update()
            })
            .then(()=>{
                Log.print("successfully updated the party instance");
            })
            .catch(err => {
                Log.rcatch(err);
            })).toBeResolved();
    })
})
