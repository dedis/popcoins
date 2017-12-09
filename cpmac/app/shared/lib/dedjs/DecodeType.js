/**
 * @file File containing the different message types to decode for the Cothority.
 */

/**
 * Server response types.
 */
const STATUS_RESPONSE = "Response";
const RANDOM_RESPONSE = "RandomResponse";
const SIGNATURE_RESPONSE = "SignatureResponse";
const CLOCK_RESPONSE = "ClockResponse";
const COUNT_RESPONSE = "CountResponse";

/**
 * Skip{block, chain} response types.
 */
const GET_BLOCK_REPLY = "GetBlockReply";
const LATEST_BLOCK_RESPONSE = "LatestBlockResponse";
const STORE_SKIP_BLOCK_RESPONSE = "StoreSkipBlockResponse";
const GET_UPDATE_CHAIN_REPLY = "GetUpdateChainReply";
const GET_ALL_SKIPCHAINS_REPLY = "GetAllSkipchainsReply";

/**
 * PoP response types.
 */
const STORE_CONFIG_REPLY = "StoreConfigReply";
const FINALIZE_RESPONSE = "FinalizeResponse";
const FETCH_RESPONSE = FINALIZE_RESPONSE;

/**
 * CISC response types.
 */
const DATA_UPDATE_REPLY = "DataUpdateReply";
const CONFIG_UPDATE_REPLY = "ConfigUpdateReply";
const PROPOSE_UPDATE_REPLY = "ProposeUpdateReply";

// Exports --------------------------------------------------------------------
module.exports.STATUS_RESPONSE = STATUS_RESPONSE;
module.exports.RANDOM_RESPONSE = RANDOM_RESPONSE;
module.exports.SIGNATURE_RESPONSE = SIGNATURE_RESPONSE;
module.exports.CLOCK_RESPONSE = CLOCK_RESPONSE;
module.exports.COUNT_RESPONSE = COUNT_RESPONSE;
module.exports.GET_BLOCK_REPLY = GET_BLOCK_REPLY;
module.exports.LATEST_BLOCK_RESPONSE = LATEST_BLOCK_RESPONSE;
module.exports.STORE_SKIP_BLOCK_RESPONSE = STORE_SKIP_BLOCK_RESPONSE;
module.exports.GET_UPDATE_CHAIN_REPLY = GET_UPDATE_CHAIN_REPLY;
module.exports.GET_ALL_SKIPCHAINS_REPLY = GET_ALL_SKIPCHAINS_REPLY;
module.exports.STORE_CONFIG_REPLY = STORE_CONFIG_REPLY;
module.exports.FINALIZE_RESPONSE = FINALIZE_RESPONSE;
module.exports.FETCH_RESPONSE = FETCH_RESPONSE;
module.exports.DATA_UPDATE_REPLY = DATA_UPDATE_REPLY;
module.exports.CONFIG_UPDATE_REPLY = CONFIG_UPDATE_REPLY;
module.exports.PROPOSE_UPDATE_REPLY = PROPOSE_UPDATE_REPLY;
