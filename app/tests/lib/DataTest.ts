import { Data } from "~/lib/Data";
import { Badge } from "~/lib/pop/Badge";
import Configuration from "~/lib/pop/Configuration";
import * as Net from "~/lib/network/NSNet";
import * as RequestPath from "~/lib/network/RequestPath";
import { Log } from "~/lib/Log";
import { testRoster } from "~/tests/lib/Common";
const KeyPair = require("~/lib/crypto/KeyPair");

describe("Loading new data", function () {
    it("New data must have version 0 and be able to save new version", function () {
        let dl: Data;
        return Data.load()
            .then(d => {
                dl = d;
                expect(d.version).toEqual(0);
                d.version = 1;
                return d.save();
            })
            .then(() => {
                return Data.load();
            })
            .then(d2 => {
                expect(d2.version).toEqual(1);
            });
    });
});

fdescribe("Loading Badges", () => {
    it("Should be able to load existing badges", () => {
        let c = new Configuration("test", new Date(), "jasmine", testRoster);
        let b = new Badge(c);
        let kp = new KeyPair();
        b.attendees = [kp.public];
        let d: Data;
        return b.save()
            .then(()=>{
                return Data.load();
            })
            .then(d1 =>{
                d = d1;
                return d.loadBadges();
            })
            .then((badges) =>{
                expect(badges.length).toBe(0);
                expect(d.badges.length).toBe(0);
                expect(d.parties.length).toBe(1);
            })
            .catch(err =>{
                Log.rcatch(err);
            })
    });
});