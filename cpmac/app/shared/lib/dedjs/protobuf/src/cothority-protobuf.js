import Root from "./models/root";

/**
 * Base class for the protobuf library that provides helpers to encode and decode
 * messages according to a given model.
 *
 * @author Gaylor Bosson (gaylor.bosson@epfl.ch)
 * @author Cedric Maire (cedric.maire@epfl.ch)
 * @author Vincent Petri (vincent.petri@epfl.ch)
 */
export default class CothorityProtobuf {

  /**
   * @constructor
   */
  constructor() {
    this.root = Root;
  }

  /**
   * Encodes a model to be transmitted over websocket.
   * @param {string} name - the name of the model
   * @param {object} fields - the fields to be encoded
   * @returns {*|Buffer|Uint8Array} - the encoded message
   */
  encodeMessage(name, fields) {
    if (typeof name !== "string") {
      throw new Error("name must be of type string");
    }
    if (!(fields !== undefined && typeof object === "object")) {
      throw new Error("fields must be of type object and not undefined");
    }

    const model = this.getModel(name);

    // Create the message with the model.
    const msg = model.create(fields);

    // Encode the message in a BufferArray.
    return model.encode(msg).finish();
  }

  /**
   * Decodes a message coming from a websocket.
   * @param {string} name - the name of the model to be decoded
   * @param {Uint8Array} buffer - the data to decode
   * @returns {object} - the decoded data as the model given as parameter
   */
  decodeMessage(name, buffer) {
    if (typeof name !== "string") {
      throw new Error("name must be of type string");
    }
    if (!(buffer instanceof Uint8Array)) {
      throw new Error("buffer must be an instance of Uint8Array");
    }

    return this.getModel(name).decode(buffer);
  }

  /**
   * Returns the protobuf loaded model.
   * @param {string} name - the name of the model
   * @returns {ReflectionObject|?ReflectionObject|string} - the model
   */
  getModel(name) {
    if (typeof name !== "string") {
      throw new Error("name must be of type string");
    }

    return this.root.lookup(`${name}`);
  }
}
