### Clean
clean:
	-sudo rm -R node_modules/
	-sudo rm -R platforms/
	-sudo rm -R hooks/
	-sudo rm -f package-lock.json

### Clean Install
clean-install:
	make clean
	npm install --no-package-lock
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
