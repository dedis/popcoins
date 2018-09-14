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

clean-install: clean apply-patches

# This is where we apply patches needed to the modules that we depend on.
apply-patches: init-npm
	patch -p0 < nodeify_temporary_patch.patch
	patch -p0 < websockets_temporary_patch.patch

init-npm:
	$(npm) install

link: start-dev
#	cd dedis/cothority; \
#	npm i; \
#	npm link; \
#	npm run-script build || echo Error is normal here...
#	pwd
	npm link @dedis/cothority

clean:
	rm -rf node_modules platforms hooks

