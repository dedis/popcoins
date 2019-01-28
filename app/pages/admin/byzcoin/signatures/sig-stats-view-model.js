const ObservableModule = require("data/observable");
const ObservableArray = require("data/observable-array").ObservableArray;
const StatusExtractor = require("~/lib/network/StatusExtractor");
const Helper = require("~/lib/Helper");

const viewModel = ObservableModule.fromObject({
  statsList: new ObservableArray()
});

function SigStatsViewModel() {
  setUpSigStatsList();

  return viewModel;
}

/**
 * Sets up the list of stats with properties and functions needed.
 */
function setUpSigStatsList() {
  const myStatsList = viewModel.statsList;

  /**
   * Loads the stats into the list.
   * @param conodeStatus - the conode to fetch stats from
   */
  myStatsList.load = function (sigStatus) {
    let stat = {
      title: "",
      info: ""
    };

    stat.title = "InstanceID";
    stat.info = "inst:hexadecimalid";
    pushStat(viewModel.statsList, Helper.deepCopy(stat));

    stat.title = "Author";
    stat.info = "ed25519:authorpublickey";
    pushStat(viewModel.statsList, Helper.deepCopy(stat));

    stat.title = "Type";
    stat.info = "invoke:test";
    pushStat(viewModel.statsList, Helper.deepCopy(stat));

    stat.title = "Index";
    stat.info = "0";
    pushStat(viewModel.statsList, Helper.deepCopy(stat));

    stat.title = "Length";
    stat.info = "1";
    pushStat(viewModel.statsList, Helper.deepCopy(stat));

    stat.title = "Info";
    stat.info = "Any additional information on the transaction";
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

module.exports = SigStatsViewModel;
