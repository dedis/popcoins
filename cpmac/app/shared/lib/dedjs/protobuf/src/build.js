const Rollup = require("rollup");
const Babel = require("rollup-plugin-babel");

Rollup.rollup({
  entry: "index.js",
  external: ["protobufjs"],
  plugins: [Babel({
    babelrc: false,
    presets: [["es2015-rollup"]]
  })]
})
  .then(bundle => {
    console.log("Writing file...");

    bundle.write({
      format: "iife",
      moduleName: "CothorityProtobuf",
      dest: "../build/bundle.js"
    });
  }, error => console.log("error", error))
  .then(t => {
    console.log("Done!");
  });
