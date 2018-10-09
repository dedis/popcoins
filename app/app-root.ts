import Log from "~/lib/Log";

export function onLoaded(){
    Log.print("app-root loaded");
}

export function onUnLoaded(){
    Log.print("app-root unloaded");
}