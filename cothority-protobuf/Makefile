all:
### ES6 6 Compilation
	npm i
	npm i -g rollup
	node src/build_proto.js
	rollup src/index.js --output.file build/cothority-messages.js --output.format cjs
### IIFE Compilation
#	test -d node_modules || npm i
#	node src/build_proto.js
#	node src/build.js
