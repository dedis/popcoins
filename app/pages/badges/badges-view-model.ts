import {fromObjectRecursive, Observable} from "data/observable";
import {ObservableArray} from "tns-core-modules/data/observable-array";

export let BadgesViewModel: Observable = fromObjectRecursive({
        items: new ObservableArray(0),
        isEmpty: true,
        party: undefined
    }
)