/**
 * @file File containing the different available paths for the Cothority.
 */

const STATUS = "/Status";
const STATUS_REQUEST = `${STATUS}/Request`;

const IDENTITY = "/Identity";
const IDENTITY_PIN_REQUEST = `${IDENTITY}/PinRequest`;
const IDENTITY_DATA_UPDATE = `${IDENTITY}/DataUpdate`;
const IDENTITY_PROPOSE_SEND = `${IDENTITY}/ProposeSend`;

const SKIPCHAIN = "/Skipchain";
const SKIPCHAIN_GET_UPDATE_CHAIN = `${SKIPCHAIN}/GetUpdateChain`;
const SKIPCHAIN_GET_ALL_SKIPCHAINS = `${SKIPCHAIN}/GetAllSkipchains`;

const POP = "/PoPServer";
const POP_CHECK_CONFIG = `${POP}/CheckConfig`;
const POP_MERGE_CONFIG = `${POP}/MergeConfig`;
const POP_STORE_CONFIG = `${POP}/storeConfig`;
const POP_FINAL_STATEMENT = `${POP}/FinalStatement`;
const POP_FINAL_STATEMENT_TOML = `${POP}/FinalStatementToml`;
const POP_FINALIZE_REQUEST = `${POP}/finalizeRequest`;
const POP_FINALIZE_RESPONSE = `${POP}/FinalizeResponse`;
const POP_FETCH_REQUEST = `${POP}/FetchRequest`;
const POP_MERGE_REQUEST = `${POP}/MergeRequest`;
const POP_PIN_REQUEST = `${POP}/PinRequest`;
const POP_POP_DESC = `${POP}/PopDesc`;
const POP_POP_DESC_TOML = `${POP}/PopDescToml`;
const POP_SHORT_DESC = `${POP}/ShortDesc`;
const POP_SHORT_DESC_TOML = `${POP}/ShortDescToml`;
const POP_TOKEN = `${POP}/PopToken`;
const POP_TOKEN_TOML = `${POP}/PopTokenToml`;

const CISC = "/Cisc";
const CISC_CONFIG = `${CISC}/Config`;
const CISC_CONFIG_UPDATE = `${CISC}/ConfigUpdate`;
const CISC_DEVICE = `${CISC}/Device`;
const CISC_PROPOSE_VOTE = `${CISC}/ProposeVote`;
const CISC_PROPOSE_SEND = `${CISC}/ProposeSend`;
const CISC_PROPOSE_UPDATE = `${CISC}/ProposeUpdate`;
const CISC_SCHNORR_SIG = `${CISC}/SchnorrSig`;

// Exports --------------------------------------------------------------------
exports.STATUS_REQUEST = STATUS_REQUEST;

exports.IDENTITY_PIN_REQUEST = IDENTITY_PIN_REQUEST;
exports.IDENTITY_DATA_UPDATE = IDENTITY_DATA_UPDATE;
exports.IDENTITY_PROPOSE_SEND = IDENTITY_PROPOSE_SEND;

exports.SKIPCHAIN_GET_UPDATE_CHAIN = SKIPCHAIN_GET_UPDATE_CHAIN;
exports.SKIPCHAIN_GET_ALL_SKIPCHAINS = SKIPCHAIN_GET_ALL_SKIPCHAINS;

exports.POP_CHECK_CONFIG = POP_CHECK_CONFIG;
exports.POP_MERGE_CONFIG = POP_MERGE_CONFIG;
exports.POP_STORE_CONFIG = POP_STORE_CONFIG;
exports.POP_FINAL_STATEMENT = POP_FINAL_STATEMENT;
exports.POP_FINAL_STATEMENT_TOML = POP_FINAL_STATEMENT_TOML;
exports.POP_FINALIZE_REQUEST = POP_FINALIZE_REQUEST;
exports.POP_FINALIZE_RESPONSE = POP_FINALIZE_RESPONSE;
exports.POP_FETCH_REQUEST = POP_FETCH_REQUEST;
exports.POP_MERGE_REQUEST = POP_MERGE_REQUEST;
exports.POP_PIN_REQUEST = POP_PIN_REQUEST;
exports.POP_POP_DESC = POP_POP_DESC;
exports.POP_POP_DESC_TOML = POP_POP_DESC_TOML;
exports.POP_SHORT_DESC = POP_SHORT_DESC;
exports.POP_SHORT_DESC_TOML = POP_SHORT_DESC_TOML;
exports.POP_TOKEN = POP_TOKEN;
exports.POP_TOKEN_TOML = POP_TOKEN_TOML;

exports.CISC_CONFIG = CISC_CONFIG;
exports.CISC_CONFIG_UPDATE = CISC_CONFIG_UPDATE;
exports.CISC_DEVICE = CISC_DEVICE;
exports.CISC_PROPOSE_VOTE = CISC_PROPOSE_VOTE;
exports.CISC_PROPOSE_SEND = CISC_PROPOSE_SEND;
exports.CISC_PROPOSE_UPDATE = CISC_PROPOSE_UPDATE;
exports.CISC_SCHNORR_SIG = CISC_SCHNORR_SIG;
