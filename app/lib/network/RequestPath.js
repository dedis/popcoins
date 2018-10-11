module.exports = {

    /**
     * @file File containing different available paths for the Cothority.
     */
    OMNILEDGER_INSTANCE_ID: "0ec0129a820a2f6e8dd16f15660cf563f2a1bfc29dc0efd9291169696cfd7af5",

    /**
     * Making the party more userfriendly, but more dependant on dedis. Which is OK for the moment...
     */
    DEDIS_CONODES: ["gasser.blue:7002", "gasser.blue:7004", "gasser.blue:7006"],
// DEDIS_CONODES: ["conode.dedis.ch:7770", "gasser.blue:7770", "dedis.nella.org:6879"],
// If this is set to true, loading a party from disk will ignore the omniledger-id stored.
// This covers a bug where the omniledger-id is sometimes not correctly loaded.
    USE_DEFAULT_OLID: true,
// Setting this to true fills out part of the information
    PREFILL_PARTY: true,

    /**
     * Services
     */
    STATUS: "Status",
    IDENTITY: "Identity",
    SKIPCHAIN: "Skipchain",
    POP: "PoPServer",
    CISC: "Cisc",
    OMNILEDGER: "ByzCoin",
    PERSONHOOD: "Personhood",

    /**
     * Status Requests
     */
    STATUS_REQUEST: `status.Request`,

    /**
     * Identity Requests
     */
    IDENTITY_PIN_REQUEST: `PinRequest`,
    IDENTITY_DATA_UPDATE: `DataUpdate`,
    IDENTITY_PROPOSE_UPDATE: `ProposeUpdate`,
    IDENTITY_PROPOSE_SEND: `ProposeSend`,
    IDENTITY_PROPOSE_VOTE: `ProposeVote`,

    /**
     * Skipchain Requests
     */
    SKIPCHAIN_GET_UPDATE_CHAIN: `GetUpdateChain`,
    SKIPCHAIN_GET_ALL_SKIPCHAINS: `GetAllSkipchains`,

    /**
     * PoP Requests
     */
    POP_STORE_CONFIG: `pop.StoreConfig`,
    POP_FINALIZE_REQUEST: `pop.FinalizeRequest`,
    POP_FETCH_REQUEST: `pop.FetchRequest`,
    POP_PIN_REQUEST: `pop.PinRequest`,
    POP_GET_PROPOSALS: 'pop.GetProposals',
    POP_CHECK_CONFIG: 'pop.CheckConfig',
    POP_VERIFY_LINK: 'pop.VerifyLink',
    POP_GET_INSTANCE_ID: `pop.GetInstanceID`,
    POP_GET_INSTANCE_ID_REPLY: `pop.GetInstanceIDReply`,
    POP_GET_FINAL_STATEMENTS: `pop.GetFinalStatements`,
    POP_GET_FINAL_STATEMENTS_REPLY: `pop.GetFinalStatementsReply`,
    POP_STORE_KEYS: `pop.StoreKeys`,
    POP_STORE_KEYS_REPLY: `pop.StoreKeysReply`,
    POP_GET_KEYS: `pop.GetKeys`,
    POP_GET_KEYS_REPLY: `pop.GetKeysReply`,


    /**
     * CISC Requests
     */
    CISC_CONFIG: `Config`,
    CISC_CONFIG_UPDATE: `ConfigUpdate`,
    CISC_DEVICE: `Device`,
    CISC_PROPOSE_VOTE: `ProposeVote`,
    CISC_PROPOSE_SEND: `ProposeSend`,
    CISC_PROPOSE_UPDATE: `ProposeUpdate`,
    CISC_SCHNORR_SIG: `SchnorrSig`,

    /**
     * Personhood Requests
     */
    PERSONHOOD_SENDMESSAGE: `SendMessage`,
    PERSONHOOD_LISTMESSAGES: `ListMessages`,
    PERSONHOOD_READMESSAGE: `ReadMessage`
};