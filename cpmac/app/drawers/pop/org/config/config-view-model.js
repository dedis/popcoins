const ObservableModule = require("data/observable");

function ConfigViewModel() {
  const viewModel = ObservableModule.fromObject({});

  return viewModel;
}

module.exports = ConfigViewModel;
