NPM ?= npm
FRONTEND_DIR := frontend
BACKEND_DIR := backend

ENV_LOCAL_FILE := .env.local

ifneq (,$(wildcard $(ENV_LOCAL_FILE)))
include $(ENV_LOCAL_FILE)
export $(shell sed -n 's/^[[:space:]]*\([A-Za-z_][A-Za-z0-9_]*\)=.*/\1/p' $(ENV_LOCAL_FILE))
endif

FRONTEND_BUILD_SCRIPT ?= build
FRONTEND_DEV_SCRIPT ?= dev
FRONTEND_PREVIEW_SCRIPT ?= preview
BACKEND_BUILD_SCRIPT ?= build
BACKEND_START_SCRIPT ?= start
BACKEND_DEPLOY_SCRIPT ?= start
BACKEND_URL ?= http://localhost:4000

.PHONY: install install-frontend install-backend \
        build build-frontend build-backend \
        deploy deploy-frontend deploy-backend \
        start start-frontend start-backend \
        preview db-init \
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
	cd $(FRONTEND_DIR) && \
	  VITE_BACKEND_URL=$(BACKEND_URL) \
	  VITE_GOOGLE_CLIENT_ID=$(VITE_GOOGLE_CLIENT_ID) \
	  VITE_ALLOWED_HOSTS=$(VITE_ALLOWED_HOSTS) \
	  $(NPM) run $(FRONTEND_DEV_SCRIPT)

start-backend:
	cd $(BACKEND_DIR) && \
	  GOOGLE_CLIENT_ID=$(GOOGLE_CLIENT_ID) \
	  GOOGLE_CLIENT_SECRET=$(GOOGLE_CLIENT_SECRET) \
	  AUTH_JWT_SECRET=$(AUTH_JWT_SECRET) \
	  $(NPM) run $(BACKEND_START_SCRIPT)

db-init:
	@echo "Initializing SQLite database with migrations and seed data"
	@rm -f $(BACKEND_DIR)/data/dev.sqlite
	cd $(BACKEND_DIR) && NODE_ENV=development $(NPM) run migrate
	cd $(BACKEND_DIR) && NODE_ENV=development $(NPM) run seed

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
