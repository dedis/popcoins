import {Observable} from "data/observable";
import {Item} from "./shared/item";
import * as Badge from "~/lib/pop/Badge";

export class BadgesViewModel extends Observable {
    items: Array<Item>;
    isEmpty: boolean = true;
    party: Badge.Badge;

    constructor() {
        super();

        this.items = new Array<Item>();
    }
}
