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
  const cothoritySocket = new DedisJsNet.CothoritySocket();
  const statusRequestMessage = CothorityMessages.createStatusRequest();

  myConodeList.load = function () {
    const getRosterPromise = tomlToServerList();

    return getRosterPromise.then((roster) => {
      return roster.servers;
    }).then((servers) => {
      return servers.map((server) => {
        console.log(server)
        return cothoritySocket.send(server, CothorityPath.STATUS_REQUEST, statusRequestMessage,
                                    CothorityDecodeTypes.STATUS_RESPONSE)
                              .then((response) => {
                                viewModel.conodeList.push({
                                                            conode: response
                                                          });
                              });
      });
    }).then((promises) => {
      return Promise.all(promises);
    }).catch((error) => {
      console.log("ERROR: " + error);
      console.dir(error);
    });
  };

  myConodeList.empty = function () {
    while (myConodeList.length) {
      myConodeList.pop();
    }
  };

  function tomlToServerList() {
    const documents = FileSystem.knownFolders.currentApp();
    const conodesToml = documents.getFile("shared/res/files/conodes.toml");

    return conodesToml.readText().then((tomlString) => {
      return DedisJsNet.parseCothorityRoster(tomlString);
    }).catch((error) => {
      console.log("ERROR READING: " + conodesToml.name);
      console.dir(error);
    });
  }
}

module.exports = HomeViewModel;
