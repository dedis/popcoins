/**
 * @file File containing different available paths for the Cothority.
 */
const OMNILEDGER_INSTANCE_ID = "0ec0129a820a2f6e8dd16f15660cf563f2a1bfc29dc0efd9291169696cfd7af5";

/**
 * Making the party more userfriendly, but more dependant on dedis. Which is OK for the moment...
 */
const DEDIS_CONODES = ["gasser.blue:7002", "gasser.blue:7004", "gasser.blue:7006"];
// const DEDIS_CONODES = ["conode.dedis.ch:7770", "gasser.blue:7770", "dedis.nella.org:6879"];
// If this is set to true, loading a party from disk will ignore the omniledger-id stored.
// This covers a bug where the omniledger-id is sometimes not correctly loaded.
const USE_DEFAULT_OLID = true;
// Setting this to true fills out part of the information
const PREFILL_PARTY = true;

/**
 * Services
 */
const STATUS = "Status";
const IDENTITY = "Identity";
const SKIPCHAIN = "Skipchain";
const POP = "PoPServer";
const CISC = "Cisc";
const OMNILEDGER = "ByzCoin";
const PERSONHOOD = "Personhood"


/**
 * Status Requests
 */
const STATUS_REQUEST = `status.Request`;

/**
 * Identity Requests
 */
const IDENTITY_PIN_REQUEST = `PinRequest`;
const IDENTITY_DATA_UPDATE = `DataUpdate`;
const IDENTITY_PROPOSE_UPDATE = `ProposeUpdate`;
const IDENTITY_PROPOSE_SEND = `ProposeSend`;
const IDENTITY_PROPOSE_VOTE = `ProposeVote`;

/**
 * Skipchain Requests
 */
const SKIPCHAIN_GET_UPDATE_CHAIN = `GetUpdateChain`;
const SKIPCHAIN_GET_ALL_SKIPCHAINS = `GetAllSkipchains`;

/**
 * PoP Requests
 */
const POP_STORE_CONFIG = `pop.StoreConfig`;
const POP_FINALIZE_REQUEST = `pop.FinalizeRequest`;
const POP_FETCH_REQUEST = `pop.FetchRequest`;
const POP_PIN_REQUEST = `pop.PinRequest`;
const POP_GET_PROPOSALS = 'pop.GetProposals';
const POP_CHECK_CONFIG = 'pop.CheckConfig';
const POP_VERIFY_LINK = 'pop.VerifyLink';
const POP_GET_INSTANCE_ID = `pop.GetInstanceID`;
const POP_GET_INSTANCE_ID_REPLY = `pop.GetInstanceIDReply`;
const POP_GET_FINAL_STATEMENTS = `pop.GetFinalStatements`;
const POP_GET_FINAL_STATEMENTS_REPLY = `pop.GetFinalStatementsReply`;
const POP_STORE_KEYS = `pop.StoreKeys`;
const POP_STORE_KEYS_REPLY = `pop.StoreKeysReply`
const POP_GET_KEYS = `pop.GetKeys`;
const POP_GET_KEYS_REPLY = `pop.GetKeysReply`


/**
 * CISC Requests
 */
const CISC_CONFIG = `Config`;
const CISC_CONFIG_UPDATE = `ConfigUpdate`;
const CISC_DEVICE = `Device`;
const CISC_PROPOSE_VOTE = `ProposeVote`;
const CISC_PROPOSE_SEND = `ProposeSend`;
const CISC_PROPOSE_UPDATE = `ProposeUpdate`;
const CISC_SCHNORR_SIG = `SchnorrSig`;

/**
 * Personhood Requests
 */
const PERSONHOOD_SENDMESSAGE = `SendMessage`;
const PERSONHOOD_LISTMESSAGES = `ListMessages`;
const PERSONHOOD_READMESSAGE = `ReadMessage`;

/**
 * OmniLedger Requests
 */

// Exports --------------------------------------------------------------------
module.exports.STATUS = STATUS;
module.exports.IDENTITY = IDENTITY;
module.exports.SKIPCHAIN = SKIPCHAIN;
module.exports.POP = POP;
module.exports.CISC = CISC;
module.exports.PERSONHOOD = PERSONHOOD;
module.exports.STATUS_REQUEST = STATUS_REQUEST;
module.exports.IDENTITY_PIN_REQUEST = IDENTITY_PIN_REQUEST;
module.exports.IDENTITY_DATA_UPDATE = IDENTITY_DATA_UPDATE;
module.exports.IDENTITY_PROPOSE_UPDATE = IDENTITY_PROPOSE_UPDATE;
module.exports.IDENTITY_PROPOSE_SEND = IDENTITY_PROPOSE_SEND;
module.exports.SKIPCHAIN_GET_UPDATE_CHAIN = SKIPCHAIN_GET_UPDATE_CHAIN;
module.exports.SKIPCHAIN_GET_ALL_SKIPCHAINS = SKIPCHAIN_GET_ALL_SKIPCHAINS;
module.exports.POP_STORE_CONFIG = POP_STORE_CONFIG;
module.exports.POP_FINALIZE_REQUEST = POP_FINALIZE_REQUEST;
module.exports.POP_FETCH_REQUEST = POP_FETCH_REQUEST;
module.exports.POP_PIN_REQUEST = POP_PIN_REQUEST;
module.exports.POP_GET_PROPOSALS = POP_GET_PROPOSALS;
module.exports.POP_CHECK_CONFIG = POP_CHECK_CONFIG;
module.exports.POP_VERIFY_LINK = POP_VERIFY_LINK;
module.exports.POP_GET_INSTANCE_ID = POP_GET_INSTANCE_ID;
module.exports.POP_GET_INSTANCE_ID_REPLY = POP_GET_INSTANCE_ID_REPLY;
module.exports.POP_GET_FINAL_STATEMENTS = POP_GET_FINAL_STATEMENTS;
module.exports.POP_GET_FINAL_STATEMENTS_REPLY = POP_GET_FINAL_STATEMENTS_REPLY;
module.exports.POP_STORE_KEYS = POP_STORE_KEYS;
module.exports.POP_STORE_KEYS_REPLY = POP_STORE_KEYS_REPLY;
module.exports.POP_GET_KEYS = POP_GET_KEYS;
module.exports.POP_GET_KEYS_REPLY = POP_GET_KEYS_REPLY;
module.exports.CISC_CONFIG = CISC_CONFIG;
module.exports.CISC_CONFIG_UPDATE = CISC_CONFIG_UPDATE;
module.exports.CISC_DEVICE = CISC_DEVICE;
module.exports.CISC_PROPOSE_VOTE = CISC_PROPOSE_VOTE;
module.exports.CISC_PROPOSE_SEND = CISC_PROPOSE_SEND;
module.exports.CISC_PROPOSE_UPDATE = CISC_PROPOSE_UPDATE;
module.exports.CISC_SCHNORR_SIG = CISC_SCHNORR_SIG;
module.exports.IDENTITY_PROPOSE_VOTE = IDENTITY_PROPOSE_VOTE;
module.exports.OMNILEDGER_INSTANCE_ID = OMNILEDGER_INSTANCE_ID;
module.exports.OMNILEDGER = OMNILEDGER;
module.exports.PERSONHOOD_SENDMESSAGE = PERSONHOOD_SENDMESSAGE;
module.exports.PERSONHOOD_LISTMESSAGES = PERSONHOOD_LISTMESSAGES;
module.exports.PERSONHOOD_READMESSAGE = PERSONHOOD_READMESSAGE;
module.exports.DEDIS_CONODES = DEDIS_CONODES;
module.exports.USE_DEFAULT_OLID = USE_DEFAULT_OLID;
module.exports.PREFILL_PARTY = PREFILL_PARTY;