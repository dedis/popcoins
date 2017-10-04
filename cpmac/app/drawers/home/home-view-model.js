const ObservableModule = require("data/observable");
const ObservableArray = require("data/observable-array").ObservableArray;
const FileSystem = require("tns-core-modules/file-system");
const DedisJsNet = require("~/shared/lib/dedis-js/src/net");
const CothorityMessages = require("~/shared/lib/cothority-protobuf/build/cothority-messages");
const CothorityDecodeTypes = require("~/shared/res/cothority-decode-types/cothority-decode-types");
const CothorityPath = require("~/shared/res/cothority-path/cothority-path");

const viewModel = ObservableModule.fromObject({
                                                isLoading: true,
                                                conodeList: new ObservableArray()
                                              });

function HomeViewModel() {
  setUpConodeList();

  return viewModel;
}

function setUpConodeList() {
  const myConodeList = viewModel.conodeList;

  myConodeList.load = function () {
    //const message = CothorityMessages.createStatusRequest();
    const roster = tomlToServerList();

    //return new DedisJsNet.CothoritySocket().send(node, CothorityPath.STATUS_REQUEST, message,
                                                 //CothorityDecodeTypes.STATUS_RESPONSE);
  };

  myConodeList.empty = function () {
    while (myConodeList.length) {
      myConodeList.pop();
    }
  };

  function tomlToServerList() {
    const documents = FileSystem.knownFolders.currentApp();
    const conodesToml = documents.getFile("shared/res/files/conodes.toml");

    conodesToml.readText().then((tomlString) => {
      console.log(tomlString);
      const roster = DedisJsNet.parseCothorityRoster(tomlString);
      console.log(JSON.stringify(roster));
    }).catch((error) => {
      console.log("ERROR READING: " + conodesToml.name);
      console.dir(error);
    });
  }
}

module.exports = HomeViewModel;
