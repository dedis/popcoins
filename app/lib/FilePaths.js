/**
 * @file File containing the paths for files used to store information permanently.
 */

module.exports = {
    /**
     * General settings files.
     */
    ROSTER: "shared/res/files/user/roster.json",
    USER_NAME: "shared/res/files/user/name.json",
    KEY_PAIR: "shared/res/files/user/keypair.json",
    FILES_DIR: "shared/res/files",

    /**
     * Data structure files that define the current configuration
     * of the app.
     */
    DATA_VERSION: "shared/res/files/data/version",

    /**
     * PoP Files
     */
    POP_FINAL_STATEMENTS: "shared/res/files/pop/final_statements.json",
    POP_TOKEN: "shared/res/files/pop/token.json",


    POP_ORG_DESC: "description.json",
    POP_ORG_DESC_HASH: "hash.json",
    POP_ORG_ATTENDEES: "attendees.json",

    POP_ATT_PATH: "shared/res/files/pop/att",
    POP_ATT_FINAL: "final_statements.json",
    POP_ATT_INFOS: "party_informations.json",

    /**
     * USER files
     */
    USER_PATH: "shared/res/files/user",
    POP_ORG_PATH: "shared/res/files/pop/org",
    POP_ORG_CONODE: "conode.json",

    /**
     * COUPON Files
     */
    COUPON_PATH: "shared/res/files/coupon",
    COUPON_BAR_CONFIG: "bar_config.json",
    COUPON_LINKED_FINALS: "final_statements.json",
    COUPON_CHECKED_CLIENTS: "checked_clients.json",
    COUPON_ORDER_HISTORY: "order_history.json",

    /**
     * Badge files
     */
    WALLET_PATH: "shared/res/files/wallet",
    WALLET_CONFIG: "config.json",
    WALLET_FINAL: "final.json",
    WALLET_KEYPAIR: "keypair.json",

    /**
     * Message files
     */
    MESSAGES_PATH: "shared/res/files/messages",

    /**
     * ByzCoin Files
     */
    DARCS: "darcs.json",
    BCCONFIG: "bcconfig.json",
}
