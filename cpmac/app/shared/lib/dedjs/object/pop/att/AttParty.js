const ObservableModule = require("data/observable");
const ObservableArray = require("data/observable-array").ObservableArray;
const uuidv4 = require("uuid/v4");


/**
 * This singleton represents the attendee of a PoP party. It contains everything related to the attendee.
 */

/**
 * We define the AttParty class which is the object representing the attendee.
 */

class AttParty {

  /**
   * Constructor for the AttParty class.
   * @param {string} [dirname] - directory of the party data (directory is created if non existent).
   *  If no directory is specified, a unique random directory name is generated
   */
  constructor(dirname) {
    if (typeof dirname === "string") {
      this._dirname = dirname;
    } else if (dirname === undefined) {
      this._dirname = uuidv4();
    } else {
      throw new Error("dirname should be of type string or undefined");
    }
    this._isLoaded = false;
    this._popDesc = ObservableModule.fromObjectRecursive({
      name: "",
      dateTime: "",
      location: "",
      roster: {
        id: new Uint8Array(),
        list: new ObservableArray(),
        aggregate: new Uint8Array()
      }
    });
    this._status = ObservableModule.fromObject({
      status: States.UNDEFINED
    });

  }
}
/**
 * Enumerate the different possible state for a party
 * @readonly
 * @enum {string}
 */
const States = Object.freeze({
  /** Status is loading **/
  UNDEFINED: "loading",

  /** Party is published (Stored) on the conode but not yet finalized **/
  PUBLISHED: "published",

  /** Party is fianlized **/
  FINALIZED: "finalized",

  /** Used if the status connot be retrived **/
  ERROR: "offline"
});

module.exports.Party = AttParty;
module.exports.States = States;

