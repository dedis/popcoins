/**
 * @file File containing package paths. They are used to uniquely create symbols which are then used for singletons.
 */

const DEDIS = "ch.epfl.dedis";
const APP = `${DEDIS}.cpmac`;

/**
 * User
 */
const USER = `${APP}.user`;

/**
 * PoP
 */
const POP = `${APP}.pop`;
const ORG = `${POP}.org`;
const ATT = `${POP}.att`;
const POPMSG = `${POP}.msg`;

module.exports.USER = USER;
module.exports.POP = POP;
module.exports.ORG = ORG;
module.exports.ATT = ATT;
module.exports.POPMSG = POPMSG;