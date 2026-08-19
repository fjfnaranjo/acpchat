include make/container.mk

.PHONY: install
install:
	@$(CONTAINER_CMD) run $(CONTAINER_ARGS) npm install

.PHONY: shell
shell:
	@$(CONTAINER_CMD) run $(CONTAINER_ARGS) sh

.PHONY: acpchat
acpchat:
	@$(CONTAINER_CMD) run $(CONTAINER_ARGS) npx tsx src/main.ts

.PHONY: format
format:
	@$(CONTAINER_CMD) run $(CONTAINER_ARGS) npm run format

.PHONY: lint
lint:
	@$(CONTAINER_CMD) run $(CONTAINER_ARGS) npm run lint
