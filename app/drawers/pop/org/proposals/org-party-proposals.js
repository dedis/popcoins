const Dialog = require("ui/dialogs");
const ObservableArray = require("data/observable-array").ObservableArray;
const topmost = require("ui/frame").topmost;

const lib = require("../../../../shared/lib");
const dedjs = lib.dedjs;
const Net = dedjs.network.NSNet;
const Convert = dedjs.Convert;
const User = dedjs.object.user.get;
const Log = dedjs.Log;
const Configuration = dedjs.object.pop.Configuration;
const Wallet = dedjs.object.pop.Wallet;
const DecodeType = dedjs.network.DecodeType;
const RequestPath = dedjs.network.RequestPath;

let conode = undefined;

let viewModel = {
    proposals: new ObservableArray()
};

function onLoaded(args) {
    const page = args.object;
    const context = page.navigationContext;

    page.bindingContext = viewModel;

    if (context.conode === undefined) {
        throw new Error("Conode address should be given in the context");
    }

    conode = context.conode;
    return retrieveProposals();
}

function retrieveProposals() {
    viewModel.proposals.splice(0);
    const cothoritySocket = new Net.Socket(Convert.tlsToWebsocket(conode, ""), RequestPath.POP);

    return cothoritySocket.send(RequestPath.POP_GET_PROPOSALS, DecodeType.GET_PROPOSALS_REPLY, {})
        .then(response => {
            response.proposals.forEach(prop => {
                viewModel.proposals.push(prop);
            });
        })
        .catch(error => {
            Log.catch(error);
            return Dialog.alert({
                title: "Error",
                message: "An error occured, please try again. - " + error,
                okButtonText: "Ok"
            });
        });
}

function proposalTapped(args) {
    const index = args.index;

    // create the party
    let p = viewModel.proposals.getItem(index);
    p.roster.identities = p.roster.list;
    console.log(new Error().stack);
    let roster = Convert.parseJsonRoster(JSON.stringify(p.roster));
    let config = new Configuration(p.name, p.datetime, p.location, roster);
    let wallet = new Wallet(config);
    wallet.linkedConode = conode;
    wallet.addToList();
    return wallet.publish(User.getKeyPair().private)
        .then(()=> {
            return wallet.storeAttendees();
        })
        .then(()=>{
            return goBack();
        })
        .catch(err=>{
            Log.catch(err);
            return Dialog.alert({
                title: "Error",
                message: "An error occured, please try again. - " + error,
                okButtonText: "Ok"
            });
        })
}

function goBack() {
    topmost().goBack();
}

module.exports.goBack = goBack;
module.exports.onLoaded = onLoaded;
module.exports.proposalTapped = proposalTapped;