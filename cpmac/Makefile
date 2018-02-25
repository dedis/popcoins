### Clean
clean:
	-sudo rm -R node_modules/
	-sudo rm -R platforms/
	-sudo rm -R hooks/
	-sudo rm -f package-lock.json

### Install local and global dependencies
install-dependencies:
	npm install --no-package-lock
	npm install -g rollup

### Compile Protobuf Messages for EcmaScript6
compile-protobuf-es6:
	node app/shared/lib/dedjs/protobuf/src/build_proto.js
	rollup app/shared/lib/dedjs/protobuf/src/index.js --output.file app/shared/lib/dedjs/protobuf/build/cothority-messages.js --output.format cjs

### Compile Protobuf Messages for IIFE
compile-protobuf-iife:
	node app/shared/lib/dedjs/protobuf/src/build_proto.js
	node app/shared/lib/dedjs/protobuf/src/build.js

### Clean Install for EcmaScript6
clean-install:
	make clean
	make install-dependencies
	make compile-protobuf-es6
	./prepare-hook.sh
	patch -p0 < nodeify_temporary_patch.patch

### Clean Install for IIFE
clean-install-iife:
	make clean
	npm install --no-package-lock
	make compile-protobuf-iife
	./prepare-hook.sh

### Run App iOS
run-ios:
	tns run ios

### Clean Run App iOS
clean-run-ios:
	make clean-install
	tns run ios

### Run App Android
run-android:
	tns run android

### Clean Run App Android
clean-run-android:
	make clean-install
	tns run android

### Test App iOS
test-ios:
	tns test ios

### Clean Test App iOS
clean-test-ios:
	make clean-install
	tns test ios

### Test App Android
test-android:
	tns test android

### Clean Test App Android
clean-test-android:
	make clean-install
	tns test android
