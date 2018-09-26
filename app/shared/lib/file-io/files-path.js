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
     * CISC Files
     */
    CISC_PATH: "shared/res/files/cisc",
    CISC_IDENTITY_LINK: "identity_link.json",
    CISC_NAME: "name.json",

    /**
     * USER files
     */
    USER_PATH: "shared/res/files/user",
    POP_ORG_PATH: "shared/res/files/pop/org",
    POP_ORG_CONODE: "conode.json",
    /**
     * BEERCOIN Files
     */
    BEERCOIN_PATH: "shared/res/files/beercoin",
    BEERCOIN_BAR_CONFIG: "bar_config.json",
    BEERCOIN_LINKED_FINALS: "final_statements.json",
    BEERCOIN_CHECKED_CLIENTS: "checked_clients.json",
    BEERCOIN_ORDER_HISTORY: "order_history.json",

    /**
     * Wallet files
     */
    WALLET_PATH: "shared/res/files/wallet",
    WALLET_CONFIG: "config.json",
    WALLET_FINAL: "final.json",
    WALLET_KEYPAIR: "keypair.json",

    /**
     * Message files
     */
    MESSAGES_PATH: "shared/res/files/messages",
}