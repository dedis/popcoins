const ObservableModule = require("data/observable");

function CiscPageViewModel() {
  const returnedValue = ObservableModule.fromObject({
                                                    myMessage: "TO_CHANGE"
                                                  });

  return returnedValue;
}

module.exports = CiscPageViewModel;
