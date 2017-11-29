const Frame = require("ui/frame");
const Dialog = require("ui/dialogs");
const FilesPath = require("~/shared/res/files/files-path");
const FileIO = require("~/shared/lib/file-io/file-io");

const OrgViewModel = require("./org-view-model");

function onLoaded(args) {
  if (args.isBackNavigation) {
    return;
  }

  const page = args.object;
  page.bindingContext = new OrgViewModel();
}

/**
 * Function called when the organizer wants to enter his config/description of the PoP Party.
 */
function configButtonTapped() {
  return FileIO.getStringOf(FilesPath.POP_LINKED_CONODE)
    .then(linkedConodeToml => {
      if (linkedConodeToml.length > 0) {
        Frame.topmost().navigate({
          moduleName: "drawers/pop/org/config/config-page"
        });

        return Promise.resolve();
      } else {
        return Dialog.alert({
          title: "Please Link to a Conode",
          message: "Before you can use the organizers functionalities you will have to link yourself to your conode. You can do this in the" +
            "home drawer.",
          okButtonText: "Ok"
        });
      }
    });
}

/**
 * Function called when the organizer wants to register the keys of the attendees.
 */
function registerButtonTapped() {
  return FileIO.getStringOf(FilesPath.POP_LINKED_CONODE)
    .then(linkedConodeToml => {
      if (linkedConodeToml.length > 0) {
        return FileIO.getStringOf(FilesPath.POP_DESC_HASH)
          .then(descriptionHash => {
            if (descriptionHash.length > 0) {
              Frame.topmost().navigate({
                moduleName: "drawers/pop/org/register/register-page"
              });

              return Promise.resolve();
            } else {
              return Promise.reject({
                title: "Please Create A Config",
                message: "Before you can register attendees you have to create a configuration for your PoP Party."
              });
            }
          });
      } else {
        return Promise.reject({
          title: "Please Link to a Conode",
          message: "Before you can use the organizers functionalities you will have to link yourself to your conode. You can do this in the" +
            "home drawer."
        });
      }
    })
    .catch(error => {
      return Dialog.alert({
        title: error.title,
        message: error.message,
        okButtonText: "Ok"
      });
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


  return FileIO.getStringOf(FilesPath.POP_LINKED_CONODE)
    .then(linkedConodeToml => {
      if (linkedConodeToml.length > 0) {
        return FileIO.getStringOf(FilesPath.POP_DESC_HASH);
      } else {
        return Dialog.alert({
          title: "Please Link to a Conode",
          message: "Before you can use the organizers functionalities you will have to link yourself to your conode. You can do the in the" +
            "home drawer.",
          okButtonText: "Ok"
        });
      }
    })
    .then(descriptionHash => {
      if (descriptionHash === undefined) {
        return Promise.resolve();
      } else if (descriptionHash.length > 0) {
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
