NODE_ENV=-e NPM_CONFIG_UPDATE_NOTIFIER=false
PODMAN_RUN=podman run --rm -ti $(NODE_ENV) -v .:/app -w /app node:lts-alpine

.PHONY: install
install:
	@$(PODMAN_RUN) npm install

.PHONY: acpchat
acpchat:
	@$(PODMAN_RUN) npx tsx src/index.ts
