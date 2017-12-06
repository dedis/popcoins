/**
 * @file File containing different available paths for the Cothority.
 */

/**
 * Status Requests
 */
const STATUS = "/Status";
const STATUS_REQUEST = `${STATUS}/Request`;

/**
 * Identity Requests
 */
const IDENTITY = "/Identity";
const IDENTITY_PIN_REQUEST = `${IDENTITY}/PinRequest`;
const IDENTITY_DATA_UPDATE = `${IDENTITY}/DataUpdate`;
const IDENTITY_PROPOSE_UPDATE = `${IDENTITY}/ProposeUpdate`;
const IDENTITY_PROPOSE_SEND = `${IDENTITY}/ProposeSend`;

/**
 * Skipchain Requests
 */
const SKIPCHAIN = "/Skipchain";
const SKIPCHAIN_GET_UPDATE_CHAIN = `${SKIPCHAIN}/GetUpdateChain`;
const SKIPCHAIN_GET_ALL_SKIPCHAINS = `${SKIPCHAIN}/GetAllSkipchains`;

/**
 * PoP Requests
 */
const POP = "/PoPServer";
const POP_STORE_CONFIG = `${POP}/storeConfig`;
const POP_FINALIZE_REQUEST = `${POP}/finalizeRequest`;
const POP_FETCH_REQUEST = `${POP}/fetchRequest`;
const POP_PIN_REQUEST = `${POP}/PinRequest`;

/**
 * CISC Requests
 */
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
exports.IDENTITY_PROPOSE_UPDATE = IDENTITY_PROPOSE_UPDATE;
exports.IDENTITY_PROPOSE_SEND = IDENTITY_PROPOSE_SEND;

exports.SKIPCHAIN_GET_UPDATE_CHAIN = SKIPCHAIN_GET_UPDATE_CHAIN;
exports.SKIPCHAIN_GET_ALL_SKIPCHAINS = SKIPCHAIN_GET_ALL_SKIPCHAINS;

exports.POP_STORE_CONFIG = POP_STORE_CONFIG;
exports.POP_FINALIZE_REQUEST = POP_FINALIZE_REQUEST;
exports.POP_FETCH_REQUEST = POP_FETCH_REQUEST;
exports.POP_PIN_REQUEST = POP_PIN_REQUEST;

exports.CISC_CONFIG = CISC_CONFIG;
exports.CISC_CONFIG_UPDATE = CISC_CONFIG_UPDATE;
exports.CISC_DEVICE = CISC_DEVICE;
exports.CISC_PROPOSE_VOTE = CISC_PROPOSE_VOTE;
exports.CISC_PROPOSE_SEND = CISC_PROPOSE_SEND;
exports.CISC_PROPOSE_UPDATE = CISC_PROPOSE_UPDATE;
exports.CISC_SCHNORR_SIG = CISC_SCHNORR_SIG;
