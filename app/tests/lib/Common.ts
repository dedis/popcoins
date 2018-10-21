import {Roster} from "~/lib/cothority/identity";
import * as Convert from "~/lib/Convert";

export let testRosterStr = `{
    "id": null,
    "identities": [{
        "public": "1da465f4d4341e57fe70b4e2de71e5133e4357da3e59de19e9a84313fe564251",
        "address": "tls://10.0.0.1:7002",
        "description": "Conode_1"
    }, {
        "public": "85c447b3cde22079528bca2d8f6f92e57790f290f52c39694bbbcf4fc70b99a4",
        "address": "tls://10.0.0.1:7004",
        "description": "Conode_2"
    }, {
        "public": "094a2729efd42df8f5c11f67dcb9a27771279ecab7926c2b31a6f011fc2dcff8",
        "address": "tls://10.0.0.1:7006",
        "description": "Conode_3"
    }]
}`;

export let testRoster = Convert.parseJsonRoster(testRosterStr);