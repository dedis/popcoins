
let defaultLvl = 2;

let lvlStr = ["E ", "W ", "I ", "!4", "!3", "!2", "!1", "  ", " 1", " 2", " 3", " 4"]

class Log {
    constructor(lvl){
        if (lvl !== undefined){
            this.lvl = lvl;
        } else {
            this.lvl = defaultLvl;
        }
    }

    printCaller(){
        let stack = new Error.stack.split('\n');
        return stack[3];
    }

    printLvl(l, args){
        if (l <= this.lvl) {
            console.dir(lvlStr[l + 7] + ":", this.printCaller().padEnd(20), ":", args.join(" "));
        }
    }

    print(...args){
        this.printLvl(0, args);
    }

    lvl1(...args){
        this.printLvl(1, args)
    }

    lvl2(...args){
        this.printLvl(2, args)
    }

    lvl3(...args){
        this.printLvl(3, args)
    }

    lvl4(...args){
        this.printLvl(4, args)
    }

    llvl1(...args){
        this.printLvl(-1, args)
    }

    llvl2(...args){
        this.printLvl(-2, args)
    }

    llvl3(...args){
        this.printLvl(-3, args)
    }

    llvl4(...args){
        this.printLvl(-4, args)
    }

    info(...args){
        this.printLvl(-5, args)
    }

    warn(...args){
        this.printLvl(-6, args)
    }

    error(...args){
        this.printLvl(-7, args)
    }
}

module.exports = Log;
module.exports.defaultLvl = defaultLvl;