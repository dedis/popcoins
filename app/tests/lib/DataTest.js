"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Data_1 = require("~/lib/Data");
const Badge_1 = require("~/lib/pop/Badge");
const Configuration_1 = require("~/lib/pop/Configuration");
const Log_1 = require("~/lib/Log");
const Common_1 = require("~/tests/lib/Common");
const KeyPair = require("~/lib/crypto/KeyPair");
describe("Loading new data", function () {
    it("New data must have version 0 and be able to save new version", function () {
        let dl;
        return Data_1.Data.load()
            .then(d => {
            dl = d;
            expect(d.version).toEqual(0);
            d.version = 1;
            return d.save();
        })
            .then(() => {
            return Data_1.Data.load();
        })
            .then(d2 => {
            expect(d2.version).toEqual(1);
        });
    });
});
fdescribe("Loading Badges", () => {
    it("Should be able to load existing badges", () => {
        let c = new Configuration_1.default("test", new Date(), "jasmine", Common_1.testRoster);
        let b = new Badge_1.Badge(c);
        let kp = new KeyPair();
        b.attendees = [kp.public];
        let d;
        return b.save()
            .then(() => {
            return Data_1.Data.load();
        })
            .then(d1 => {
            d = d1;
            return d.loadBadges();
        })
            .then((badges) => {
            expect(badges.length).toBe(0);
            expect(d.badges.length).toBe(0);
            expect(d.parties.length).toBe(1);
        })
            .catch(err => {
            Log_1.Log.rcatch(err);
        });
    });
});
