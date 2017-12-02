require("nativescript-nodeify");
const Frame = require("ui/frame");
const Dialog = require("ui/dialogs");
const FilesPath = require("~/shared/res/files/files-path");
const FileIO = require("~/shared/lib/file-io/file-io");
const Base64 = require("base64-coder-node")();
const Misc = require("~/shared/lib/dedis-js/src/misc");
const DedisJsNet = require("~/shared/lib/dedis-js/src/net");
const CothorityMessages = require("~/shared/lib/cothority-protobuf/build/cothority-messages");
const CothorityDecodeTypes = require("~/shared/res/cothority-decode-types/cothority-decode-types");
const CothorityPath = require("~/shared/res/cothority-path/cothority-path");

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
 * Function called when the organizer wants to fetch the final statement of the PoP Party.
 * @returns {*|Promise.<any>}
 */
function fetchButtonTapped() {

  let conode = undefined;

  /**
   * Fetches the PoP Party using the organizers conode. Returns the final.toml that will be given to the attendees.
   * @returns {Promise.<any>}
   */
  function fetchPopParty(descriptionHash) {
    const descId = Misc.hexToUint8Array(Base64.decode(descriptionHash, "hex"));

    const cothoritySocket = new DedisJsNet.CothoritySocket();
    const fetchRequestMessage = CothorityMessages.createFetchRequest(descId);

    return cothoritySocket.send(conode, CothorityPath.POP_FETCH_REQUEST, fetchRequestMessage, CothorityDecodeTypes.FETCH_RESPONSE)
      .then(finalStatement => {
        const jsonFinalStatement = JSON.stringify(finalStatement, undefined, 4);

        return FileIO.writeStringTo(FilesPath.POP_FINAL_TOML, jsonFinalStatement);
      })
      .then(() => {
        return Dialog.alert({
          title: "Final Statement Saved",
          message: "The final statement can be found in your settings.",
          okButtonText: "Ok"
        });
      })
      .catch(reason => {
        return Dialog.alert({
          title: "Fetching Error",
          message: reason,
          okButtonText: "Ok"
        });
      });
  }

  return FileIO.getStringOf(FilesPath.POP_LINKED_CONODE)
    .then(linkedConodeToml => {
      if (linkedConodeToml.length > 0) {
        conode = DedisJsNet.parseCothorityRoster(linkedConodeToml).servers[0];

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
          title: "Fetch PoP Party",
          message: "You are about to fetch the final statement of your PoP Party. Did you self and all" +
            " the other organizers registered the public keys of all the" +
            " attendees?",
          okButtonText: "Yes",
          cancelButtonText: "Cancel"
        })
          .then(result => {
            if (result) {
              return fetchPopParty(descriptionHash);
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
    .catch((error) => {
      console.log(error);
      return Dialog.alert({
        title: "Fetching Error",
        message: "An unexpected error occurred during the fetching process. Please" +
          " try again.",
        okButtonText: "Ok"
      });
    });
}

exports.onLoaded = onLoaded;
exports.configButtonTapped = configButtonTapped;
exports.registerButtonTapped = registerButtonTapped;
exports.fetchButtonTapped = fetchButtonTapped;
