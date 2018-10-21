/*
In NativeScript, the app.ts file is the entry point to your application.
You can use this file to perform app-level initialization, but the primary
purpose of the file is to pass control to the app’s first module.
*/
import * as app from "application";
import { Data } from "~/lib/Data";

// Exporting a singleton of data to be used by all other modules.
export let gData: Data;

export function setGdata(d: Data){
    gData = d;
}

app.run({moduleName: "app-root"});


/*
Do not place any code after the application has been started as it will not
be executed on iOS.
*/
