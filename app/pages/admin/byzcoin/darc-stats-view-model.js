const ObservableModule = require("data/observable");
const ObservableArray = require("data/observable-array").ObservableArray;
const StatusExtractor = require("~/lib/network/StatusExtractor");
const Helper = require("~/lib/Helper");

const viewModel = ObservableModule.fromObject({
  statsList: new ObservableArray()
});

function DarcStatsViewModel() {
  setUpDarcStatsList();

  return viewModel;
}

/**
 * Sets up the list of stats with properties and functions needed.
 */
function setUpDarcStatsList() {
  const myStatsList = viewModel.statsList;

  /**
   * Loads the stats into the list.
   * @param conodeStatus - the conode to fetch stats from
   */
  myStatsList.load = function (darcStatus) {
    let stat = {
      title: "",
      info: ""
    };

    stat.title = "Description";
    stat.info = "Test DARC";
    pushStat(viewModel.statsList, Helper.deepCopy(stat));

    stat.title = "BaseID (hex)";
    stat.info = "darc:hexadecimalid";
    pushStat(viewModel.statsList, Helper.deepCopy(stat));

    stat.title = "ID (hex)";
    stat.info = "darc:hexadecimalid";
    pushStat(viewModel.statsList, Helper.deepCopy(stat));

    stat.title = "Depth";
    stat.info = "1";
    pushStat(viewModel.statsList, Helper.deepCopy(stat));

    stat.title = "_sign";
    stat.info = "ed25519:ownerkey";
    pushStat(viewModel.statsList, Helper.deepCopy(stat));

    stat.title = "_evolve";
    stat.info = "ed25519:ownerkey & ed25519:adminkey";
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

module.exports = DarcStatsViewModel;
