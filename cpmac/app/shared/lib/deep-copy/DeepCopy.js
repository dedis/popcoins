/**
 * @file Library to deep copy an object.
 */

function copy(object) { // Does not copy functions!
  if (typeof object !== "object") {
    throw new Error("object must be of type object");
  }

  return JSON.parse(JSON.stringify(object));
}

exports.copy = copy;
