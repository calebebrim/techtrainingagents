NPM ?= npm
FRONTEND_DIR := frontend
BACKEND_DIR := backend

FRONTEND_BUILD_SCRIPT ?= build
FRONTEND_DEV_SCRIPT ?= dev
FRONTEND_PREVIEW_SCRIPT ?= preview
BACKEND_BUILD_SCRIPT ?= build
BACKEND_START_SCRIPT ?= start
BACKEND_DEPLOY_SCRIPT ?= start
BACKEND_URL=https://localhost:4000

.PHONY: install install-frontend install-backend \
        build build-frontend build-backend \
        deploy deploy-frontend deploy-backend \
        start start-frontend start-backend \
        preview \
        clean clean-frontend clean-backend

install: install-frontend install-backend

install-frontend:
	cd $(FRONTEND_DIR) && $(NPM) install

install-backend:
	cd $(BACKEND_DIR) && $(NPM) install

build: build-frontend build-backend

build-frontend:
	cd $(FRONTEND_DIR) && $(NPM) run $(FRONTEND_BUILD_SCRIPT)

build-backend:
	cd $(BACKEND_DIR) && $(NPM) run $(BACKEND_BUILD_SCRIPT)

deploy: deploy-frontend deploy-backend

deploy-frontend: build-frontend
	@echo "Frontend bundle is ready in $(FRONTEND_DIR)/dist"

deploy-backend: build-backend
	cd $(BACKEND_DIR) && $(NPM) run $(BACKEND_DEPLOY_SCRIPT)

start: start-backend start-frontend

start-frontend:
	cd $(FRONTEND_DIR) && VITE_BACKEND_URL=$(BACKEND_URL) $(NPM) run $(FRONTEND_DEV_SCRIPT)

start-backend:
	cd $(BACKEND_DIR) && $(NPM) run $(BACKEND_START_SCRIPT)

preview:
	cd $(FRONTEND_DIR) && $(NPM) run $(FRONTEND_PREVIEW_SCRIPT)

clean: clean-frontend clean-backend

clean-frontend:
	rm -rf $(FRONTEND_DIR)/node_modules $(FRONTEND_DIR)/dist

clean-backend:
	rm -rf $(BACKEND_DIR)/node_modules


nvm-install:
	curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash

nvm-version-install:
	nvm install 22.12.0 && nvm use 22.12.0