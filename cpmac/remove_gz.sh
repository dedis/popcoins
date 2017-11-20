#!/bin/bash

rm -f platforms/android/src/main/assets/app/tns_modules/protobufjs/dist/protobuf.min.js.gz
rm -f platforms/android/src/main/assets/app/tns_modules/protobufjs/dist/minimal/protobuf.min.js.gz
rm -f platforms/android/src/main/assets/app/tns_modules/protobufjs/dist/light/protobuf.min.js.gz
rm -f platforms/android/src/main/assets/app/tns_modules/long/dist/long.min.js.gz
rm -R hooks/after-prepare/
rm -R hooks/before-watch/
rm -R hooks/before-prepare/nativescript-dev-sass.js
rm -R node_modules/nativescript-zxing/platforms/android/
