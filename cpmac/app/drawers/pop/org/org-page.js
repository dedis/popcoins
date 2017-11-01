const Frame = require("ui/frame");
const Dialog = require("ui/dialogs");
const FilesPath = require("~/shared/res/files/files-path");
const FileIO = require("~/shared/lib/file-io/file-io");

const OrgViewModel = require("./org-view-model");

function onLoaded(args) {
  if (args.isBackNavigation) {
    return;
  }

  // TODO: check if linked to a conode

  const page = args.object;
  page.bindingContext = new OrgViewModel();
}

/**
 * Function called when the organizer wants to enter his config/description of the PoP Party.
 */
function configButtonTapped() {
  Frame.topmost().navigate({
                             moduleName: "drawers/pop/org/config/config-page"
                           });
}

/**
 * Function called when the organizer wants to register the keys of the attendees.
 */
function registerButtonTapped() {
  Frame.topmost().navigate({
                             moduleName: "drawers/pop/org/register/register-page"
                           });
}

/**
 * Function called when the organizer wants to finalize the PoP Party.
 * @returns {*|Promise.<any>}
 */
function finalizeButtonTapped() {

  /**
   * Finalizes the PoP Party using the organizers conode. Returns the final.toml that will be given to the attendees.
   * @returns {Promise.<any>}
   */
  function finalizePopParty() {
    // TODO: actually finalize pop party
    return Promise.resolve();
  }

  return FileIO.getStringOf(FilesPath.POP_DESC_HASH)
               .then(descriptionHash => {
                 if (descriptionHash.length > 0) {
                   return Dialog.confirm({
                                           title: "Finalize PoP Party",
                                           message: "You are about to finalize your PoP Party. Did you self and all" +
                                                    " the other organizers registered the public keys of all the" +
                                                    " attendees?",
                                           okButtonText: "Yes",
                                           cancelButtonText: "Cancel"
                                         })
                                .then(result => {
                                  if (result) {
                                    return finalizePopParty();
                                  } else {
                                    return Promise.resolve();
                                  }
                                })
                                .catch(() => {
                                  return Dialog.alert({
                                                        title: "Finalizing Error",
                                                        message: "An unexpected error occurred during the finalizing" +
                                                                 " process. Please try again.",
                                                        okButtonText: "Ok"
                                                      });
                                });
                 } else {
                   return Dialog.alert({
                                         title: "Missing Description Hash",
                                         message: "Please provide the description hash of your PoP Party.",
                                         okButtonText: "Ok"
                                       });
                 }
               })
               .catch(() => {
                 return Dialog.alert({
                                       title: "Finalizing Error",
                                       message: "An unexpected error occurred during the finalizing process. Please" +
                                                " try again.",
                                       okButtonText: "Ok"
                                     });
               });
}

exports.onLoaded = onLoaded;
exports.configButtonTapped = configButtonTapped;
exports.registerButtonTapped = registerButtonTapped;
exports.finalizeButtonTapped = finalizeButtonTapped;
