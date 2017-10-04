const ObservableModule = require("data/observable");
const ObservableArray = require("data/observable-array").ObservableArray;
const StatusExtractor = require("~/shared/lib/extractors/StatusExtractor");
const DeepCopy = require("~/shared/lib/deep-copy/DeepCopy");

const viewModel = ObservableModule.fromObject({
                                                statsList: new ObservableArray()
                                              });

function ConodeStatsViewModel() {
  setUpConodeStatsList();

  return viewModel;
}

function setUpConodeStatsList() {
  const myStatsList = viewModel.statsList;

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

    stat.title = "ID";
    stat.info = StatusExtractor.getID(conode);
    pushStat(viewModel.statsList, DeepCopy.copy(stat));

    stat.title = "Public Key";
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

  myStatsList.empty = function () {
    while (myStatsList.length) {
      myStatsList.pop();
    }
  };

  function pushStat(list, statToAdd) {
    list.push({
                info: statToAdd
              });
  }
}

module.exports = ConodeStatsViewModel;
