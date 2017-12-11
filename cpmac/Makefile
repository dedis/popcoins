### Clean
clean:
	-sudo rm -R node_modules/
	-sudo rm -R platforms/
	-sudo rm -R hooks/

### Clean Install
clean-install:
	make clean
	npm install --no-package-lock
	./prepare-hook.sh

### Run App iOS
run-ios:
	tns run ios

### Run App Android
run-android:
	tns run android

### Test App iOS
test-ios:
	tns test ios

### Test App Android
test-android:
	tns test android
