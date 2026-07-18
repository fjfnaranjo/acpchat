# ACP Agents Integration & Lifecycle Guide

## Core reference docs for coding agents

* [README.md](README.md): General project description, features and
  purpose.
* [TESTING.md](TESTING.md): Testing strategy.
* [AGENTS.md](AGENTS.md): This file. Instructions for agents.
* [ACTIONPLAN.md](ACTIONPLAN.md): Development plan to cover the MVP
  feature set.
* [FUTUREPLANS.md](FUTUREPLANS.md): Non-MVP features under
  consideration.

## Essential architectural consideration

`acpchat` relies entirely on standard I/O streams (`stdout` / `stdio`)
to communicate with an agent runner via JSON-RPC. It intentionally
implements zero orchestration logic for local systems or remote Model
Context Protocol (MCP) data servers.

## Project Structure

* `src/`.
  * `index.ts`: Entry point, CLI flags, main app loop.
  * `connection.ts`: JSON-RPC process and ACP session binding managers.
  * `interface.ts`: readline UI loops, alerts, and authorization gates.
  * `stream.ts`: Markdown tokenization and stream sanitization.
* `test/`.
  * `fixtures/`: Plain text input scripts for reproducible runs.
  * `mock-agent.ts`: JSON-RPC mock server for integration tests.

## Supported lifecycle events

To maintain a pure linear stream, `acpchat` maps incoming JSON-RPC
notifications directly to immediate, fixed text evaluations:

### Agent sessions & prompts

* `initialize` / `initialized`: Handshake sequence determining base
  model metadata, capabilities, and system context limits.
* `agent_message_chunk`: Continuous token-by-token text payloads
  streamed straight into the sanitization pipeline before terminal
  display.

### Tool execution & authorizations

* `tool_call_request`: Triggers an immediate suspension of the
  processing loop. It captures the tool context and invokes the
  plain-text authorization barrier before sending a matching approval
  or rejection frame back to the engine.
