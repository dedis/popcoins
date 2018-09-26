require("nativescript-nodeify");
const Kyber = require("@dedis/kyber-js");
const CURVE_ED25519_KYBER = new Kyber.curve.edwards25519.Curve;

const FilePaths = require("../../../shared/lib/file-io/files-path");
const FileIO = require("../../../shared/lib/file-io/file-io");
const KeyPair = require("../../../shared/lib/dedjs/KeyPair");

describe("KeyPair", () => {

    beforeEach(() => {
        return FileIO.rmrf("shared/res/files")
            .catch(() => {
                console.log("no keypair to delete");
            })
    });

    afterEach(() => {
        console.log("done");
    });

    it("should create a random keypair", function () {
        console.log("1 start");
        let kp = new KeyPair();
        expect(kp.private).toBeDefined();
        expect(kp.public).toBeDefined();
        const pub = CURVE_ED25519_KYBER.point().mul(kp.private, null);
        console.log("calculated public is:", pub);
        expect(kp.public.equal(pub)).toBeTruthy();
        console.log("1 end");
    });
});

describe("KeyPair load", () => {
    beforeEach(() => {
        return FileIO.rmrf("shared/res/files")
            .catch(() => {
                console.log("no keypair to delete");
            })
    });

    afterEach(() => {
        console.log("done");
    });
    it("should save a random keypair", () => {
        console.log("2 start");
        let kp = new KeyPair();
        console.log("private", kp.private);
        console.log("public", kp.public);
        return expectAsync(kp.save(FilePaths.KEY_PAIR)
            .then(() => {
                return KeyPair.fromFile(FilePaths.KEY_PAIR);
            })
            .then(kp2 => {
                expect(kp2.private).toBeDefined();
                expect(kp2.public).toBeDefined();
                expect(kp2.private.equal(kp.private)).toBeTruthy();
                expect(kp2.public.equal(kp.public)).toBeTruthy();
                console.log("2 end");
            }))
            .toBeResolved();
    });
});

describe("KeyPair not load", () => {
    beforeEach(() => {
        return FileIO.rmrf("shared/res/files")
            .catch(() => {
                console.log("no keypair to delete");
            })
    });

    afterEach(() => {
        console.log("done");
    });
    it("should create a random key if the load doesn't exist", () => {
        console.log("3 start");
        return expectAsync(KeyPair.fromFile(FilePaths.KEY_PAIR)
        ).toBeRejected();
    })
});
