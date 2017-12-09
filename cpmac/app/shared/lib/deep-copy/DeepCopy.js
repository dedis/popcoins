/**
 * @file Library to deep copy an object.
 */

/**
 * Deep copies an object. Does not copy functions!
 * @param {object} - the object to deep copy
 * @returns {object} - a deep copy of an object
 */
function copy(object) {
  if (typeof object !== "object") {
    throw new Error("object must be of type object");
  }

  return JSON.parse(JSON.stringify(object));
}

module.exports = copy;
