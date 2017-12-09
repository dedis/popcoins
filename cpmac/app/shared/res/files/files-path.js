/**
 * @file File containing the paths for files used to store information permanently.
 */

/**
 * General settings files.
 */
const CONODES_TOML = "shared/res/files/conodes.toml";
const CONODES_JSON = "shared/res/files/conodes.json";
const PUBLIC_KEY = "shared/res/files/public.key";
const PUBLIC_KEY_COTHORITY = "shared/res/files/public_cothority.key";
const PRIVATE_KEY = "shared/res/files/private.key";
const KEY_PAIR = "shared/res/files/keypair.json";

/**
 * PoP Files
 */
const POP_DESC_HASH = "shared/res/files/pop/description.hash";
const POP_FINAL_TOML = "shared/res/files/pop/final.toml";
const POP_LINKED_CONODE = "shared/res/files/pop/org/link.conode";
const POP_REGISTERED_KEYS = "shared/res/files/pop/org/party/registered_keys.txt";
const POP_PARTY_NAME = "shared/res/files/pop/org/party/party.name";
const POP_PARTY_DATETIME = "shared/res/files/pop/org/party/party.datetime";
const POP_PARTY_LOCATION = "shared/res/files/pop/org/party/party.location";
const POP_PARTY_CONODES = "shared/res/files/pop/org/party/party_conodes.toml";

/**
 * CISC Files
 */
const CISC_IDENTITY_LINK = "shared/res/files/cisc/identity_link.txt";
const CISC_NAME = "shared/res/files/cisc/name.txt";

module.exports = {
  CONODES_TOML,
  CONODES_JSON,
  PUBLIC_KEY,
  PUBLIC_KEY_COTHORITY,
  PRIVATE_KEY,
  KEY_PAIR,

  POP_DESC_HASH,
  POP_FINAL_TOML,
  POP_LINKED_CONODE,
  POP_REGISTERED_KEYS,
  POP_PARTY_NAME,
  POP_PARTY_DATETIME,
  POP_PARTY_LOCATION,
  POP_PARTY_CONODES,

  CISC_IDENTITY_LINK,
  CISC_NAME
}
