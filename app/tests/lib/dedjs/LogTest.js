const lib = require("../../../shared/lib");
const Log = lib.dedjs.Log;

describe("log should print", () => {
    afterEach(() => {
        console.log();
    });

    it("should print something", () => {
        Log.print("print-test");
        Log.lvl1("level 1 test");
        Log.lvl2("level 2 test");
        Log.lvl3("level 3 test");

        Log.lvl = 3;
        Log.print("print-test");
        Log.lvl1("level 1 test");
        Log.lvl2("level 2 test");
        Log.lvl3("level 3 test");
        try {
            throw new Error("my error");
        } catch (e) {
            Log.catch(e, "drives me crazy");
        }
        return Promise.resolve()
            .then(() => {
                throw new Error("promise error");
            })
            .catch(e =>{
                Log.rcatch(e, "recursive catch");
            })
            .catch(e => {
                Log.catch(e, "drives me nuts");
            })
    })
})