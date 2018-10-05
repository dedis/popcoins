import {Observable} from "data/observable";
import {Item} from "./shared/item";

export class BadgesViewModel extends Observable {
    items: Array<Item>;

    constructor() {
        super();

        this.items = new Array<Item>(
            {
                name: "Party #12",
                datetime: "Tuesday, 9th of October 2018",
                location: "BC229",
            }
        );
    }
}
