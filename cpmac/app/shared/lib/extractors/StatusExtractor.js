const Convert = require("~/shared/lib/dedjs/Convert");
const ObjectType = require("~/shared/lib/dedjs/ObjectType");
const Helper = require("~/shared/lib/dedjs/Helper");

/**
 * @file Library to extract stats from a status response.
 */

function throwErrorIfTypeIsWrong(statusResponse) {
  if (!Helper.isOfType(statusResponse, ObjectType.STATUS_RESPONSE)) {
    throw new Error("statusResponse must be of type Response");
  }
}

function getDescription(statusResponse) {
  throwErrorIfTypeIsWrong(statusResponse)
  return statusResponse.server.description;
}

function getAddress(statusResponse) {
  throwErrorIfTypeIsWrong(statusResponse)
  return statusResponse.server.address;
}

function getID(statusResponse) {
  throwErrorIfTypeIsWrong(statusResponse)
  return Convert.byteArrayToBase64(statusResponse.server.id);
}

function getPublicKey(statusResponse) {
  throwErrorIfTypeIsWrong(statusResponse)
  return Convert.byteArrayToBase64(statusResponse.server.public);
}

function getServices(statusResponse) {
  throwErrorIfTypeIsWrong(statusResponse)
  return statusResponse.system.Status.field.Available_Services;
}

function getSystem(statusResponse) {
  throwErrorIfTypeIsWrong(statusResponse)
  return statusResponse.system.Status.field.System;
}

function getHost(statusResponse) {
  throwErrorIfTypeIsWrong(statusResponse)
  return statusResponse.system.Status.field.Host;
}

function getPort(statusResponse) {
  throwErrorIfTypeIsWrong(statusResponse)
  return statusResponse.system.Status.field.Port;
}

function getConnectionType(statusResponse) {
  throwErrorIfTypeIsWrong(statusResponse)
  return statusResponse.system.Status.field.ConnType;
}

function getVersion(statusResponse) {
  throwErrorIfTypeIsWrong(statusResponse)
  return statusResponse.system.Status.field.Version;
}

function getTXBytes(statusResponse) {
  throwErrorIfTypeIsWrong(statusResponse)
  return statusResponse.system.Status.field.TX_bytes;
}

function getRXBytes(statusResponse) {
  throwErrorIfTypeIsWrong(statusResponse)
  return statusResponse.system.Status.field.RX_bytes;
}

function getUptime(statusResponse) {
  throwErrorIfTypeIsWrong(statusResponse)
  return statusResponse.system.Status.field.Uptime;
}

function getTomlFromStatusResponse(statusResponse) {
  throwErrorIfTypeIsWrong(statusResponse)
  return "[[servers]]\n" +
    "  Address = \"" + getAddress(statusResponse) + "\"\n" +
    "  Public = \"" + getPublicKey(statusResponse) + "\"\n" +
    "  Description = \"" + getDescription(statusResponse) + "\"";
}

function getToml(address, publicKey, description) {
  if (typeof address !== "string") {
    throw new Error("address must be of type string");
  }
  if (typeof publicKey !== "string") {
    throw new Error("publicKey must be of type string");
  }
  if (typeof description !== "string") {
    throw new Error("description must be of type string");
  }

  return "[[servers]]\n" +
    "  Address = \"" + address + "\"\n" +
    "  Public = \"" + publicKey + "\"\n" +
    "  Description = \"" + description + "\"";
}

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
exports.getTomlFromStatusResponse = getTomlFromStatusResponse;
exports.getToml = getToml;
