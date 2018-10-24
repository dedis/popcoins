UNAME_S := $(shell uname -s)
npm :=
ifeq ($(UNAME_S),Darwin)
	npm += CXX=clang++
endif
npm += npm

start-dev: clean apply-patches
	@echo "You are ready to start developing."
	@echo "use \"tns run ios\" or \"tns run android\""
	@echo "for tests:"
	@echo "use \"tns test ios\" or \"tns test android\""

clean-install: clean

# This is where we apply patches needed to the modules that we depend on.
apply-patches: init-npm
	patch -p0 < nodeify_temporary_patch.patch
	patch -p0 < websockets_temporary_patch.patch

init-npm:
	$(npm) install
	rm -rf node_modules/nativescript-zxing/platforms/android/

link: start-dev
#	cd dedis/cothority; \
#	npm i; \
#	npm link; \
#	npm run-script build || echo Error is normal here...
#	pwd
	npm link @dedis/cothority

clean:
	rm -rf node_modules platforms hooks

# build: start-dev
build:
	if [ ! "$$DEDIS_ANDROID_PASS" ]; then echo "Please set DEDIS_ANDROID_PASS"; exit 1; fi
	tns build android --key-store-path dedis-development.jks --key-store-password $$DEDIS_ANDROID_PASS \
	    --key-store-alias popcoins --key-store-alias-password $$DEDIS_ANDROID_PASS --release
	echo "Build successful - apk is at platforms/android/app/build/outputs/apk/release/app-release.ap"