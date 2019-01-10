/**
 * Different constants to make it easier to test popcoins on different testing platforms.
 * Making the party more userfriendly, but more dependant on dedis. Which is OK for the moment...
 */

// gasser.blue bc id
export let OMNILEDGER_INSTANCE_ID = "0ec0129a820a2f6e8dd16f15660cf563f2a1bfc29dc0efd9291169696cfd7af5";
// ineiti's personal mac
// export let OMNILEDGER_INSTANCE_ID = "983537f186b46023032e37215f40a126220b5ad6632d130d828811e3e5eb2f77";
// ineiti's working mac
// export let OMNILEDGER_INSTANCE_ID = "13f3d8fb433a584eb60236546c6dc9f24f55cd5eba8dfe673d25bdcead8ebd04";

// export let DEDIS_CONODES = ["10.0.0.1:7002", "10.0.0.1:7004", "10.0.0.1:7006"];
// export let DEDIS_CONODES = ["gasser.blue:7002", "gasser.blue:7004", "gasser.blue:7006"];
export let DEDIS_CONODES  = ["192.168.42.71:7002", "192.168.42.71:7004", "192.168.42.71:7006"]
// export let DEDIS_CONODES = ["conode.dedis.ch:7770", "gasser.blue:7770", "dedis.nella.org:6879"];

// If this is set to true, loading a party from disk will ignore the omniledger-id stored.
// This covers a bug where the omniledger-id is sometimes not correctly loaded.
export let USE_DEFAULT_OLID = true;
// Setting this to true fills out part of the information
export let PREFILL_PARTY = true;
// Helps with some stuff when simulating.
export let DEBUG_MODE = false;
