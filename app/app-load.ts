import { NavigatedData, Page, View } from "tns-core-modules/ui/page";
import { fromObject } from "tns-core-modules/data/observable";
import { getFrameById, topmost } from "tns-core-modules/ui/frame";
import Log from "~/lib/Log";
import { ObservableArray } from "tns-core-modules/data/observable-array";
import { Data } from "~/lib/Data";
import { gData, setGdata } from "~/app";

let view = undefined;
let actions = new ObservableArray();

export function onLoaded(args: NavigatedData) {
    view = <View>args.object;
    view.bindingContext = fromObject({updateActions: actions});
    if (gData == undefined) {
        addAction("Loading data");
        return Data.load()
            .then(d => {
                setGdata(d);
            })
            .then(() =>{
                addAction("Loading Badges");
                return gData.loadBadges()
            })
            .then(() => {
                return updateData();
            })
            .then(() => {
                return topmost().navigate({
                    moduleName: "app-tabview"
                });
            })
            .catch(err => {
                Log.catch(err);
            });
    }
}

function addAction(str: string) {
    actions.push({description: str});
}

function updateData(): Promise<any> {
    addAction("Updating data");
    return Promise.resolve();
}
