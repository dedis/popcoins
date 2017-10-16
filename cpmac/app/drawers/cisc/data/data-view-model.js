const ObservableModule = require("data/observable");

function DataViewModel() {
    const viewModel = ObservableModule.fromObject({});

    return viewModel;
}

module.exports = DataViewModel;
