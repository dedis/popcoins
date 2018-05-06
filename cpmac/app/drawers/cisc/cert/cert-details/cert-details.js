const Frame = require("ui/frame");
const ObservableArray = require("data/observable-array").ObservableArray;
const ObservableModule = require("data/observable");
const merge = require("node.extend");
const common = require("asn1js/org/pkijs/common");
const _asn1js = require("asn1js");
const _pkijs = require("pkijs");
const _x509schema = require("pkijs/org/pkijs/x509_schema");

let conode = undefined;
let conodeStatus = undefined;
let pageObject = undefined;
let viewModel = ObservableModule.fromObject({
	cert: ""
});

function onNavigatingTo(args) {
  	if (args.isBackNavigation) {
        return;
    }

    page = args.object;

    const context = page.navigationContext;

    viewModel.cert = context.cert;

    page.bindingContext = viewModel

    const result = getBasicInfo(context.cert);
    console.log("Cert Info");
    console.dir(result);

}

function pemToBinAb(pem) {
    var b64 = pem.replace(/(-----(BEGIN|END) CERTIFICATE-----|[\n\r])/g, '');
    var buf = Buffer.from(b64, 'base64');
    var ab = new Uint8Array(buf).buffer;
    return ab;
}

function getCertInfo(pem) {
    var ab = pemToBinAb(pem);

    // #region Merging function/object declarations for ASN1js and PKIjs
    var asn1js = merge(true, _asn1js, common);

    var x509schema = merge(true, _x509schema, asn1js);

    var pkijs_1 = merge(true, _pkijs, asn1js);
    var pkijs = merge(true, pkijs_1, x509schema);

    var asn1 = pkijs.org.pkijs.fromBER(ab);
    var certSimpl = new pkijs.org.pkijs.simpl.CERT({ schema: asn1.result });

    return certSimpl;
}

function getBasicInfo(pem) {
    var c = getCertInfo(pem);
    var domains = [];
    var sub;

    c.extensions.forEach(function (ext) {
    if (ext.parsedValue && ext.parsedValue.altNames) {
      ext.parsedValue.altNames.forEach(function (alt) {
        domains.push(alt.Name);
      });
    }
    });

    sub = c.subject.types_and_values[0].value.value_block.value || null;

    return {
    subject: sub
    , altnames: domains
    // for debugging during console.log
    // do not expect these values to be here
    , _issuedAt: c.notBefore.value
    , _expiresAt: c.notAfter.value
    , issuedAt: new Date(c.notBefore.value).valueOf()
    , expiresAt: new Date(c.notAfter.value).valueOf()
    };
}

function onDrawerButtonTap(args) {
    const sideDrawer = FrameModule.topmost().getViewById("sideDrawer");
    sideDrawer.showDrawer();
}

exports.onNavigatingTo = onNavigatingTo;
exports.onDrawerButtonTap = onDrawerButtonTap;
