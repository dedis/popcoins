const ObservableModule = require("data/observable");
const Dialog = require("ui/dialogs");
const PoP = require("../../../shared/lib/dedjs/object/pop/PoP").get;

const viewModel = ObservableModule.fromObject({
  finalStatements: PoP.getFinalStatements(),
  popToken: PoP.getPopToken()
});;

function onLoaded(args) {
  if (args.isBackNavigation) {
    return;
  }

  const page = args.object;
  page.bindingContext = viewModel;

  PoP.getFinalStatements().push({
    name: "MY_NAME_IS..."
  });
}

module.exports.onLoaded = onLoaded;
