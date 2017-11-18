const ObservableModule = require("data/observable");
const ObservableArray = require("data/observable-array").ObservableArray;
const StatusExtractor = require("~/shared/lib/extractors/StatusExtractor");
const DeepCopy = require("~/shared/lib/deep-copy/DeepCopy");
const FilesPath = require("~/shared/res/files/files-path");
const FileIO = require("~/shared/lib/file-io/file-io");
const DedisJsNet = require("~/shared/lib/dedis-js/src/net");
const CothorityMessages = require("~/shared/lib/cothority-protobuf/build/cothority-messages");
const Dialog = require("ui/dialogs");
const Misc = require("~/shared/lib/dedis-js/src/misc");

const viewModel = ObservableModule.fromObject({
                                                statsList: new ObservableArray()
                                              });

function ConodeStatsViewModel() {
  setUpConodeStatsList();

  return viewModel;
}

/**
 * Sets up the list of stats with properties and functions needed.
 */
function setUpConodeStatsList() {
  const myStatsList = viewModel.statsList;

  /**
   * Loads the stats into the list.
   * @param conode - the conode to fetch stats from
   */
  myStatsList.load = function (conode) {
    let stat = {
      title: "",
      info: ""
    };

    stat.title = "Description";
    stat.info = StatusExtractor.getDescription(conode);
    pushStat(viewModel.statsList, DeepCopy.copy(stat));

    stat.title = "Address";
    stat.info = StatusExtractor.getAddress(conode);
    pushStat(viewModel.statsList, DeepCopy.copy(stat));

    stat.title = "ID (hex)";
    stat.info = StatusExtractor.getID(conode);
    pushStat(viewModel.statsList, DeepCopy.copy(stat));

    stat.title = "Public Key (base64)";
    stat.info = StatusExtractor.getPublicKey(conode);
    pushStat(viewModel.statsList, DeepCopy.copy(stat));

    stat.title = "Services";
    stat.info = StatusExtractor.getServices(conode);
    pushStat(viewModel.statsList, DeepCopy.copy(stat));

    stat.title = "System";
    stat.info = StatusExtractor.getSystem(conode);
    pushStat(viewModel.statsList, DeepCopy.copy(stat));

    stat.title = "Host";
    stat.info = StatusExtractor.getHost(conode);
    pushStat(viewModel.statsList, DeepCopy.copy(stat));

    stat.title = "Port";
    stat.info = StatusExtractor.getPort(conode);
    pushStat(viewModel.statsList, DeepCopy.copy(stat));

    stat.title = "ConnectionType";
    stat.info = StatusExtractor.getConnectionType(conode);
    pushStat(viewModel.statsList, DeepCopy.copy(stat));

    stat.title = "Version";
    stat.info = StatusExtractor.getVersion(conode);
    pushStat(viewModel.statsList, DeepCopy.copy(stat));

    stat.title = "TX Bytes";
    stat.info = StatusExtractor.getTXBytes(conode);
    pushStat(viewModel.statsList, DeepCopy.copy(stat));

    stat.title = "RX Bytes";
    stat.info = StatusExtractor.getRXBytes(conode);
    pushStat(viewModel.statsList, DeepCopy.copy(stat));

    stat.title = "Uptime";
    stat.info = StatusExtractor.getUptime(conode);
    pushStat(viewModel.statsList, DeepCopy.copy(stat));
  };

  /**
   * Empties the list of stats.
   */
  myStatsList.empty = function () {
    while (myStatsList.length) {
      myStatsList.pop();
    }
  };

  /**
   * Starts the linking process.
   * @param conode - the conode to link to
   * @param pin - the pin given by the conode
   * @param publicKey - the public key of the organizer
   * @param cothorityPath - the path for the pin request on the conode
   * @returns {Promise.<any>}
   */
  myStatsList.linkToConode = function (conode, pin, publicKey, cothorityPath) {
    const wantedConodeAddress = StatusExtractor.getAddress(conode);

    return FileIO.getStringOf(FilesPath.CONODES_TOML)
                 .then((tomlString) => {
                   return DedisJsNet.getConodeFromRoster(tomlString, wantedConodeAddress);
                 })
                 .then(parsedConode => {
                   if (parsedConode !== undefined) {
                     return link(parsedConode, pin, publicKey, cothorityPath);
                   } else {
                     return Promise.reject();
                   }
                 })
                 .catch((error) => {
                   console.dir(error);
                   return Dialog.alert({
                                         title: "Error",
                                         message: "An unexpected error occurred during the linking" +
                                                  " process. Please try again.",
                                         okButtonText: "Ok"
                                       });
                 });
  };
}

/**
 * Pushes a new stat into the list of stats.
 * @param list - the list to add to
 * @param statToAdd - the stat to add
 */
function pushStat(list, statToAdd) {
  list.push({
              info: statToAdd
            });
}

/**
 * Handles the socket part of the linking process.
 * @param conode - the conode to link to
 * @param pin - the pin given from the conode
 * @param publicKey - the public key of the organizer
 * @param cothorityPath - the path for the pin request on the conode
 */
function link(conode, pin, publicKey, cothorityPath) {
  const cothoritySocket = new DedisJsNet.CothoritySocket();
  const pinRequestMessage = CothorityMessages.createPinRequest(pin, Misc.hexToUint8Array(publicKey));

  return cothoritySocket.send(conode, cothorityPath, pinRequestMessage, undefined);
}

module.exports = ConodeStatsViewModel;
