import Protobuf from "protobufjs";
import Skeleton from "../../build/skeleton";

const {Root} = Protobuf;

/**
 * As we need to create a bundle, we cannot use the *.proto files. The script will wrap them in a skeleton file that
 * contains the JSON representation that can be used in the JavaScript code.
 */
export default Root.fromJSON(JSON.parse(Skeleton));
