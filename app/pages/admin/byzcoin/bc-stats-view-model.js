const ObservableModule = require("data/observable");
const ObservableArray = require("data/observable-array").ObservableArray;
const StatusExtractor = require("~/lib/network/StatusExtractor");
const Helper = require("~/lib/Helper");
const User = require("~/lib/User");
const Log = require("~/lib/Log").default;

const viewModel = ObservableModule.fromObject({
  isBCConfigDefined: false,
  statsList: new ObservableArray()
});

function BCStatsViewModel() {
  setUpBCStatsList();
  return viewModel;
}

function setDefined(defined) {
  viewModel.isBCConfigDefined = defined;
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
  myStatsList.load = function(cfg) {

    if (cfg != null) {
      viewModel.isBCConfigDefined = true;

      let stat = {
        title: "",
        info: ""
      };

      stat.title = "ByzCoin ID";
      stat.info = cfg._byzcoinID;
      pushStat(viewModel.statsList, Helper.deepCopy(stat));

      try {
        for (var si of cfg.roster.identities) {
          stat.title = si.tcpAddr;
          stat.info = si.public;
          pushStat(viewModel.statsList, Helper.deepCopy(stat));
        }
      } catch (ignore) {}
    } else viewModel.isBCConfigDefined = false;
  };

  /**
   * Empties the list of stats.
   */
  myStatsList.empty = function() {
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
module.exports.setDefined = setDefined;