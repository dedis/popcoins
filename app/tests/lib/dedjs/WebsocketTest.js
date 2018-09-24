const WS = require("nativescript-websockets");
const Buffer = require('buffer/').Buffer;

// Print the buffer or the length.
function printBuf(str, buf) {
    if (true) {
        console.log(str + ": length = " + buf.length);
    } else {
        for (let i = 0; i < buf.length; i += 80) {
            console.log(str + ": " + buf.slice(i, i + 80).toString('hex'));
        }
    }
}

/**
 * Opens a connection to path, sends the message send and verifies if the return value is
 * rcv. Resolves the promise if it is, or rejects if it doesn't match.
 *
 * @param msg {{path, send, rcv}}
 * @returns {Promise<any>}
 */
function verifyComm(msg) {
    return new Promise((resolve, reject) => {
        console.dir("connecting to: " + msg.path);
        const ws = new WS(msg.path, {timeout: 6000});

        ws.on('open', () => {
            console.dir("sending data:", msg.send);
            ws.send(Buffer.from(msg.send, 'hex'));
        });

        ws.on('message', (socket, message) => {
            let buf = Buffer.from(message);

            printBuf("received message", buf);
            // if (Buffer.compare(buf, orig) == 0) {
            console.log("data is correct");
            ws.close();
            // } else {
            //     console.log("wrong data");
            //     printBuf("original", orig);
            //     console.log("sending again");
            //     ws.send(Buffer.from(msg.send, 'hex'));
            // }
        });

        ws.on('close', (socket, code, reason) => {
            console.log("closing:", code, reason);
            if (code == 1002) {
                ws.open();
            }
            resolve();
        });

        ws.on('error', (socket, error) => {
            console.log("error is:", error);
            reject(error);
        });

        console.log("opening");
        ws.open();
    })
}

jasmine.DEFAULT_TIMEOUT_INTERVAL = 100000;

// Testing all messages
fdescribe("Getting a pop-party proof", function () {
    it("should pass all these tests...", function () {

        let queue = Promise.resolve();
        for (let i = 0; i < 10; i++) {
            queue = queue.then(() => {
                console.log("*********** TEST #", i, "************");
            });
            ws_vector.forEach(msg => {
                queue = queue.then(() => {
                    return verifyComm(msg);
                })
            });
        }
        return queue.catch(err => {
            fail("didn't work: " + err);
        });
    });
});

// Test-data - caution, this data might change...
const ws_vector = [
    {
        path: "ws://gasser.blue:7003/PoPServer/GetInstanceID",
        send: "0a203d1f16b30cbaf1c1f3eaa7f1c008efb30cfcf8c04c1cb2a5b9922edb350d61a3"
    },
    {
        path: "ws://gasser.blue:7003/OmniLedger/GetProof",
        send: "0802122000000000000000000000000000000000000000000000000000000000000000001a200d75236a47c8b61b27b47da1df6af68e793ae68fa895eed95c6e5310846d5eab"
    },
    {
        path: "ws://gasser.blue:7003/OmniLedger/GetProof",
        send: "0802122011910580e99f594ff1a415611f36ba4af04441c1a0d2d380cff1ffb95c67270e1a200d75236a47c8b61b27b47da1df6af68e793ae68fa895eed95c6e5310846d5eab"
    },
    {
        path: "ws://gasser.blue:7003/Skipchain/GetSingleBlock",
        send: "0a200d75236a47c8b61b27b47da1df6af68e793ae68fa895eed95c6e5310846d5eab"
    },
    {
        path: "ws://gasser.blue:7003/Skipchain/GetUpdateChain",
        send: "0a200d75236a47c8b61b27b47da1df6af68e793ae68fa895eed95c6e5310846d5eab"
    },
    {
        path: "ws://gasser.blue:7003/OmniLedger/GetProof",
        send: "080212209d626d62dca2d038bfe2c8903a54f24487dc1832dc07368644fbcda06a45b71d1a200d75236a47c8b61b27b47da1df6af68e793ae68fa895eed95c6e5310846d5eab"
    },
    {
        path: "ws://gasser.blue:7003/PoPServer/GetInstanceID",
        send: "0a203d1f16b30cbaf1c1f3eaa7f1c008efb30cfcf8c04c1cb2a5b9922edb350d61a3"
    },
    {
        path: "ws://gasser.blue:7003/OmniLedger/GetProof",
        send: "0802122000000000000000000000000000000000000000000000000000000000000000001a200d75236a47c8b61b27b47da1df6af68e793ae68fa895eed95c6e5310846d5eab"
    },
    {
        path: "ws://gasser.blue:7003/OmniLedger/GetProof",
        send: "0802122011910580e99f594ff1a415611f36ba4af04441c1a0d2d380cff1ffb95c67270e1a200d75236a47c8b61b27b47da1df6af68e793ae68fa895eed95c6e5310846d5eab"
    },
    {
        path: "ws://gasser.blue:7003/Skipchain/GetSingleBlock",
        send: "0a200d75236a47c8b61b27b47da1df6af68e793ae68fa895eed95c6e5310846d5eab"
    },
    {
        path: "ws://gasser.blue:7003/Skipchain/GetUpdateChain",
        send: "0a200d75236a47c8b61b27b47da1df6af68e793ae68fa895eed95c6e5310846d5eab"
    },
    {
        path: "ws://gasser.blue:7003/OmniLedger/GetProof",
        send: "080212209d626d62dca2d038bfe2c8903a54f24487dc1832dc07368644fbcda06a45b71d1a200d75236a47c8b61b27b47da1df6af68e793ae68fa895eed95c6e5310846d5eab"
    },
    {
        path: "ws://gasser.blue:7003/OmniLedger/GetProof",
        send: "080212209d626d62dca2d038bfe2c8903a54f24487dc1832dc07368644fbcda06a45b71d1a200d75236a47c8b61b27b47da1df6af68e793ae68fa895eed95c6e5310846d5eab"
    },
];

