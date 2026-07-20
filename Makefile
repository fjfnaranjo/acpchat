NODE_ENV=-e NPM_CONFIG_UPDATE_NOTIFIER=false -e NPM_CONFIG_IGNORE_SCRIPTS=true
PODMAN_RUN=podman run --rm -ti $(NODE_ENV) -v .:/app -w /app node:lts-alpine

.PHONY: install
install:
	@$(PODMAN_RUN) npm install

.PHONY: shell
shell:
	@$(PODMAN_RUN) sh

.PHONY: acpchat
acpchat:
	@$(PODMAN_RUN) npx tsx src/index.ts

.PHONY: format
format:
	@$(PODMAN_RUN) npm run format

.PHONY: lint
lint:
	@$(PODMAN_RUN) npm run lint
