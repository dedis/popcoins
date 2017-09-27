/**
 * @file File containing the different available paths for the Cothority.
 * @author Cedric Maire <mairecedric@netplus.ch>
 */

const STATUS = "/Status";
const STATUS_REQUEST = `${STATUS}/Request`;

const SKIPCHAIN = "/Skipchain";
const SKIPCHAIN_GET_UPDATE_CHAIN = `${SKIPCHAIN}/GetUpdateChain`;

// Exports --------------------------------------------------------------------
exports.STATUS_REQUEST = STATUS_REQUEST;
exports.SKIPCHAIN_GET_UPDATE_CHAIN = SKIPCHAIN_GET_UPDATE_CHAIN;
