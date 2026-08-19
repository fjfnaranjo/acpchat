CONTAINER_RT := $(shell \
	if command -v podman >/dev/null 2>&1; then \
		echo "podman"; \
	else \
		echo "docker"; \
	fi \
)
CONTAINER_RUN_USER := $(shell \
	if command -v podman >/dev/null 2>&1; then \
		echo ""; \
	else \
		echo "--user $$(id -u):$$(id -g)"; \
	fi \
)
CONTAINER_IMG := acpchat
CONTAINER_CMD = \
	$(CONTAINER_RT) image inspect $(CONTAINER_IMG) >/dev/null 2>&1 || \
	$(CONTAINER_RT) build --env=NPM_CONFIG_UPDATE_NOTIFIER=false -f Dockerfile.dev -t $(CONTAINER_IMG) .; \
	$(CONTAINER_RT)
CONTAINER_ARGS = \
	--rm -ti \
	$(CONTAINER_RUN_USER) \
	-e NPM_CONFIG_UPDATE_NOTIFIER=false \
	-v .:/app \
	-w /app \
	$(CONTAINER_IMG)
