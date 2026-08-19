# Contributor guidelines

## Index of docs

* [README.md](../README.md): General project description, features and
  purpose.
* [CONTRIBUTING.md](CONTRIBUTING.md): This file. Instructions for
  contributors.
* [SESSION.md](SESSION.md): Information about the session control
  interface.
* [ACTIONPLAN.md](ACTIONPLAN.md): Development plan to cover the MVP
  feature set.
* [TESTING.md](TESTING.md): Testing strategy.
* [FUTUREPLANS.md](FUTUREPLANS.md): Non-MVP features under
  consideration.

## Essential architectural consideration

`acpchat` relies entirely on standard I/O streams (_stdout_ / _stdio_)
to communicate with an agent runner via JSON-RPC. It intentionally
implements zero orchestration logic for local systems or remote Model
Context Protocol (MCP) data servers.

## Project Structure

* `src/`.
  * `main.ts`: Entry point and agent command parsing.
  * `session.ts`: Main loop and session commands.
  * `adapter.ts`:  Session->agent ACP protocol adapter.
  * `acp-process.ts`: Agent JSON-RPC process streams control.
  * `keyboard.ts`: keyboard input control.
  * `stream.ts`: Stream sanitization, buffer and Markdown tokenizer.
* `test/`.
  * `sessions/`: Stream recordings for reproducible sessions.
  * `mock-agent.ts`: JSON-RPC mock server to play the sessions.
* `docs/`: Project documentation (see index at the top of this file).
