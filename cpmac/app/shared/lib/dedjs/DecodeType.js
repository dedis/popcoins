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
module.exports = {
  STATUS_RESPONSE,
  RANDOM_RESPONSE,
  SIGNATURE_RESPONSE,
  CLOCK_RESPONSE,
  COUNT_RESPONSE,

  GET_BLOCK_REPLY,
  LATEST_BLOCK_RESPONSE,
  STORE_SKIP_BLOCK_RESPONSE,
  GET_UPDATE_CHAIN_REPLY,
  GET_ALL_SKIPCHAINS_REPLY,

  STORE_CONFIG_REPLY,
  FINALIZE_RESPONSE,
  FETCH_RESPONSE,

  DATA_UPDATE_REPLY,
  CONFIG_UPDATE_REPLY,
  PROPOSE_UPDATE_REPLY
}
