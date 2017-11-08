const ObservableModule = require("data/observable");
const FileIO = require("~/shared/lib/file-io/file-io");
const FilesPath = require("~/shared/res/files/files-path");

function CiscViewModel() {
  const viewModel = ObservableModule.fromObject({ name:"" });
  FileIO.getStringOf(FilesPath.CISC_NAME).then((response) => viewModel.name = response);

  return viewModel;
}


module.exports = CiscViewModel;
