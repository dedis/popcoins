require("nativescript-nodeify");
const Kyber = require("@dedis/kyber-js");
const CurveEd25519 = new Kyber.curve.edwards25519.Curve;

const lib = require("../../../../../app/shared/lib");
const FilesPath = lib.files_path;
const FileIO = lib.file_io;
const dedjs = lib.dedjs;
const Convert = dedjs.Convert;
const Helper = dedjs.Helper;
const ObjectType = dedjs.ObjectType;
const Crypto = dedjs.Crypto;
const CothorityMessages = dedjs.network.CothorityMessages;
const User = dedjs.object.user.get;

const PRIVATE_KEY = "AWKlOlcTuCHEV/fKX0X1IoAoBU0n1c5iKp/SWRLj3T4=";
const PUBLIC_KEY = "y4JMDWrle6RMV+0BKU92Xbu8+J8VkZ5kV3SvSr2ZxHw=";
const PUBLIC_COMPLETE_KEY = "BBmiuL/uxUuItsuFVQJT4oUv4qZrb1fYQ+GL/ZTpZ43MfMSZvUqvdFdknpEVn/i8u112TykB7VdMpHvlag1Mgss=";
const JSON_KEY_PAIR = JSON.stringify({
    "private": PRIVATE_KEY,
    "public": PUBLIC_KEY,
    "publicComplete": PUBLIC_COMPLETE_KEY
});

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

describe("User", () => {
    beforeEach(() => {
        return FileIO.rmrf("shared/res/files")
            .catch(() => {
                console.log("no keypair to delete");
            })
    });

    afterEach(() => {
        console.log("done");
    });

    it("should save and load", ()=>{
        return expectAsync(User.setRoster(ROSTER, true)
            .then(()=>{
                User.roster = null;
                return User.loadRoster();
            })
            .then(()=>{
                if (!User.roster.aggregateKey().equal(ROSTER.aggregateKey())){
                    throw new Error("new aggregate key is not the same!")
                }
            })
            .catch(err =>{
                console.log(err);
                throw new Error(err);
            })).toBeResolved();
    })
});