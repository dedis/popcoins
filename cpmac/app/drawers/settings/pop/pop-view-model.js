const ObservableModule = require("data/observable");

function PopViewModel() {
  const viewModel = ObservableModule.fromObject({});

  return viewModel;
}

module.exports = PopViewModel;
