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
const PROPOSE_VOTE_REPLY = "ProposeVoteReply";

// Exports --------------------------------------------------------------------
exports.STATUS_RESPONSE = STATUS_RESPONSE;
exports.RANDOM_RESPONSE = RANDOM_RESPONSE;
exports.SIGNATURE_RESPONSE = SIGNATURE_RESPONSE;
exports.CLOCK_RESPONSE = CLOCK_RESPONSE;
exports.COUNT_RESPONSE = COUNT_RESPONSE;

exports.GET_BLOCK_REPLY = GET_BLOCK_REPLY;
exports.LATEST_BLOCK_RESPONSE = LATEST_BLOCK_RESPONSE;
exports.STORE_SKIP_BLOCK_RESPONSE = STORE_SKIP_BLOCK_RESPONSE;
exports.GET_UPDATE_CHAIN_REPLY = GET_UPDATE_CHAIN_REPLY;
exports.GET_ALL_SKIPCHAINS_REPLY = GET_ALL_SKIPCHAINS_REPLY;

exports.STORE_CONFIG_REPLY = STORE_CONFIG_REPLY;
exports.FINALIZE_RESPONSE = FINALIZE_RESPONSE;
exports.FETCH_RESPONSE = FETCH_RESPONSE;

exports.DATA_UPDATE_REPLY = DATA_UPDATE_REPLY;
exports.CONFIG_UPDATE_REPLY = CONFIG_UPDATE_REPLY;
exports.PROPOSE_UPDATE_REPLY = PROPOSE_UPDATE_REPLY;
exports.PROPOSE_VOTE_REPLY = PROPOSE_VOTE_REPLY;
