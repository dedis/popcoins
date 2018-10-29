const ObservableModule = require("data/observable");
const ObservableArray = require("data/observable-array").ObservableArray;
const StatusExtractor = require("~/lib/network/StatusExtractor");
const Helper = require("~/lib/Helper");

const viewModel = ObservableModule.fromObject({
  statsList: new ObservableArray()
});

function BCStatsViewModel() {
  setUpBCStatsList();

  return viewModel;
}

/**
 * Sets up the list of stats with properties and functions needed.
 */
function setUpBCStatsList() {
  const myStatsList = viewModel.statsList;

  /**
   * Loads the stats into the list.
   * @param conodeStatus - the conode to fetch stats from
   */
  myStatsList.load = function (bcStatus) {
    let stat = {
      title: "",
      info: ""
    };

    stat.title = "Roster";
    stat.info = "RosterDesc";
    pushStat(viewModel.statsList, Helper.deepCopy(stat));

    stat.title = "ByzCoin ID (hex)";
    stat.info = "bc:hexadecimalid";
    pushStat(viewModel.statsList, Helper.deepCopy(stat));

    stat.title = "Genesis Darc";
    stat.info = "darc:hexadecimalid";
    pushStat(viewModel.statsList, Helper.deepCopy(stat));

    stat.title = "Admin Identity";
    stat.info = "ed25519:hexadecimalpublickey";
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

module.exports = BCStatsViewModel;
