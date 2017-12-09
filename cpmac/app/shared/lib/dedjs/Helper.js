/**
 * Checks wether the object is of a specific type.
 * @param {object} object - the object we want to check the type of
 * @param {string} type - the type name
 * @returns {boolean} - true if and only if object has the type given as paramter
 */
function isOfType(object, type) {
  if (!(object !== undefined && typeof object === "object")) {
    throw new Error("object must be of type object and not undefined");
  }
  if (typeof type !== "string") {
    throw new Error("type must be of type string");
  }

  return object.constructor.name === type;
}

/**
 * Deep copies an object (DOES NOT COPY FUNCTION PROPERTIES).
 * @param {object} object - the object to deep copy
 * @returns {object} - a copy of the object given as parameter
 */
function deepCopy(object) {
  if (typeof object !== "object") {
    throw new Error("object must be of type object");
  }

  return JSON.parse(JSON.stringify(object));
}

module.exports.isOfType = isOfType;
module.exports.deepCopy = deepCopy;
