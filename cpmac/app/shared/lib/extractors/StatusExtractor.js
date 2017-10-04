/**
 * @file Library to extract stats from a status response.
 */

// Functions ------------------------------------------------------------------
function getDescription(conode) {
  return conode.server.description;
}

function getAddress(conode) {
  return conode.server.address;
}

function getID(conode) {
  return conode.server.id.toString();
}

function getPublicKey(conode) {
  return conode.server.public.toString();
}

function getServices(conode) {
  return conode.system.Status.field.Available_Services;
}

function getSystem(conode) {
  return conode.system.Status.field.System;
}

function getHost(conode) {
  return conode.system.Status.field.Host;
}

function getPort(conode) {
  return conode.system.Status.field.Port;
}

function getConnectionType(conode) {
  return conode.system.Status.field.ConnType;
}

function getVersion(conode) {
  return conode.system.Status.field.Version;
}

function getTXBytes(conode) {
  return conode.system.Status.field.TX_bytes;
}

function getRXBytes(conode) {
  return conode.system.Status.field.RX_bytes;
}

function getUptime(conode) {
  return conode.system.Status.field.Uptime;
}

// Exports --------------------------------------------------------------------
exports.getDescription = getDescription;
exports.getAddress = getAddress;
exports.getID = getID;
exports.getPublicKey = getPublicKey;
exports.getServices = getServices;
exports.getSystem = getSystem;
exports.getHost = getHost;
exports.getPort = getPort;
exports.getConnectionType = getConnectionType;
exports.getVersion = getVersion;
exports.getTXBytes = getTXBytes;
exports.getRXBytes = getRXBytes;
exports.getUptime = getUptime;
