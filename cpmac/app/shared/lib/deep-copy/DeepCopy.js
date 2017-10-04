/**
 * @file Library to deep copy an object.
 */

// Functions ------------------------------------------------------------------
function copy(object) { // Does not copy functions!
  return JSON.parse(JSON.stringify(object));
}

// Exports --------------------------------------------------------------------
exports.copy = copy;
