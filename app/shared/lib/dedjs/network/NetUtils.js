const Convert = require("../../../lib/dedjs/Convert");
const RequestPath = require("../../../lib/dedjs/network/RequestPath");
const DecodeType = require("../../../lib/dedjs/network/DecodeType");
const Net = require("../../../lib/dedjs/network/NSNet");
const StatusExtractor = require("../../../lib/dedjs/extractor/StatusExtractor");
const CothorityMessages = require("../../../lib/dedjs/network/cothority-messages");
const Helper = require("../../../lib/dedjs/Helper");
const Log = require("../../../lib/dedjs/Log");

function getServerIdentiyFromAddress(address) {
    if (!Helper.isValidAddress(address)) {
        return Promise.reject("Invalid address.")
    }

    const statusRequestMessage = CothorityMessages.createStatusRequest();
    const cothoritySocket = new Net.Socket(Convert.tlsToWebsocket(address, ""), RequestPath.STATUS);

    return cothoritySocket.send(RequestPath.STATUS_REQUEST, DecodeType.STATUS_RESPONSE, statusRequestMessage)
        .then(statusResponse => {
            Log.lvl2("status is:", statusResponse.serveridentity);
            const hexKey = StatusExtractor.getPublicKey(statusResponse);
            const description = StatusExtractor.getDescription(statusResponse);
            const id = StatusExtractor.getID(statusResponse);
            const server = Convert.toServerIdentity(address, Convert.hexToByteArray(hexKey), description, Convert.hexToByteArray(id));

            return Promise.resolve(server);
        })

}

module.exports.getServerIdentiyFromAddress = getServerIdentiyFromAddress;
