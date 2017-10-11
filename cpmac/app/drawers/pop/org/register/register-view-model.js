const ObservableModule = require("data/observable");

function RegisterViewModel() {
  const viewModel = ObservableModule.fromObject({});

  return viewModel;
}

module.exports = RegisterViewModel;
