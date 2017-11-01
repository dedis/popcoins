const ObservableModule = require("data/observable");
const ObservableArray = require("data/observable-array").ObservableArray;
const DedisJsNet = require("~/shared/lib/dedis-js/src/net");
const CothorityMessages = require("~/shared/lib/cothority-protobuf/build/cothority-messages");
const CothorityDecodeTypes = require("~/shared/res/cothority-decode-types/cothority-decode-types");
const CothorityPath = require("~/shared/res/cothority-path/cothority-path");
const FilesPath = require("~/shared/res/files/files-path");
const FileIO = require("~/shared/lib/file-io/file-io");

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
    return FileIO.getStringOf(FilesPath.CONODES_TOML)
                 .then((tomlString) => {
                   return DedisJsNet.parseCothorityRoster(tomlString);
                 })
                 .then((roster) => {
                   return roster.servers;
                 })
                 .then((servers) => {
                   return servers.map((server) => {
                     return cothoritySocket.send(server, CothorityPath.STATUS_REQUEST, statusRequestMessage,
                                                 CothorityDecodeTypes.STATUS_RESPONSE)
                                           .then((response) => {
                                             viewModel.conodeList
                                                      .push({
                                                              conode: response
                                                            });

                                             return Promise.resolve();
                                           });
                   });
                 })
                 .then((promises) => {
                   return Promise.all(promises);
                 })
                 .catch((error) => {
                   console.log("ERROR: " + error);
                   console.dir(error);
                 });
  };

  myConodeList.empty = function () {
    while (myConodeList.length) {
      myConodeList.pop();
    }
  };
}

module.exports = HomeViewModel;
