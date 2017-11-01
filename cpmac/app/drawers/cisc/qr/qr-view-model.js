const ObservableModule = require("data/observable");

const viewModel = ObservableModule.fromObject({ isConnected: false });
function QRViewModel() {
    return viewModel;
}

module.exports = QRViewModel;
