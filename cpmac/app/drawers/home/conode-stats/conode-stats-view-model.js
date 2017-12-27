const ObservableModule = require("data/observable");
const ObservableArray = require("data/observable-array").ObservableArray;
const StatusExtractor = require("../../../shared/lib/dedjs/extractor/StatusExtractor");
const Helper = require("../../../shared/lib/dedjs/Helper");

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
    pushStat(viewModel.statsList, Helper.deepCopy(stat));

    stat.title = "Address";
    stat.info = StatusExtractor.getAddress(conode);
    pushStat(viewModel.statsList, Helper.deepCopy(stat));

    stat.title = "ID (base64)";
    stat.info = StatusExtractor.getID(conode);
    pushStat(viewModel.statsList, Helper.deepCopy(stat));

    stat.title = "Public Key (base64)";
    stat.info = StatusExtractor.getPublicKey(conode);
    pushStat(viewModel.statsList, Helper.deepCopy(stat));

    stat.title = "Services";
    stat.info = StatusExtractor.getServices(conode);
    pushStat(viewModel.statsList, Helper.deepCopy(stat));

    stat.title = "System";
    stat.info = StatusExtractor.getSystem(conode);
    pushStat(viewModel.statsList, Helper.deepCopy(stat));

    stat.title = "Host";
    stat.info = StatusExtractor.getHost(conode);
    pushStat(viewModel.statsList, Helper.deepCopy(stat));

    stat.title = "Port";
    stat.info = StatusExtractor.getPort(conode);
    pushStat(viewModel.statsList, Helper.deepCopy(stat));

    stat.title = "ConnectionType";
    stat.info = StatusExtractor.getConnectionType(conode);
    pushStat(viewModel.statsList, Helper.deepCopy(stat));

    stat.title = "Version";
    stat.info = StatusExtractor.getVersion(conode);
    pushStat(viewModel.statsList, Helper.deepCopy(stat));

    stat.title = "TX Bytes";
    stat.info = StatusExtractor.getTXBytes(conode);
    pushStat(viewModel.statsList, Helper.deepCopy(stat));

    stat.title = "RX Bytes";
    stat.info = StatusExtractor.getRXBytes(conode);
    pushStat(viewModel.statsList, Helper.deepCopy(stat));

    stat.title = "Uptime";
    stat.info = StatusExtractor.getUptime(conode);
    pushStat(viewModel.statsList, Helper.deepCopy(stat));
  };

  /**
   * Empties the list of stats.
   */
  myStatsList.empty = function () {
    while (myStatsList.length) {
      myStatsList.pop();
    }
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

module.exports = ConodeStatsViewModel;
