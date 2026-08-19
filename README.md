# acpchat

⚠️ WIP: This project is currently under its initial development phase.

A pure stream-oriented (TUI-Free), text-only Agent Client Protocol (ACP)
CLI client designed with consideration for users of screen readers and
terminal refresh displays.

`acpchat` eliminates the visual noise, absolute cursor positioning,
background re-renders, and visual frame layouts of traditional Text User
Interfaces (TUIs). It flattens structural layouts and streams agent
interactions as a predictable, chronological, text-only stream via
standard _stdout_.

## Key design principles

* **Text only flows downward:** Doesn't clear lines or alter historical
  terminal rows. Interfaces to choose options show a list of numbered
  options and prompt for the number. No text scroll support. ¹
* **Basic system bindings:** Heavily relies on readline text-input and
  entry modification.
* **ANSI formatting backend:** Dynamically linearises and converts
  Markdown into text strings or broadly supported ANSI escape sequences.
* **Decoupled architecture:** Acts strictly as a lean ACP Client. It
  leaves tool execution, life-cycle state, and Model Context Protocol
  (MCP) host orchestration entirely to the backend agent harness.
* **No session support:** Each program invocation creates its own
  session. ¹

¹ Want support for text scroll and sessions? Use a terminal multiplexer
that integrates well with your terminal environment and supports
sessions or a full UI terminal that provides this features.

## Getting started

Launch `acpchat` by supplying the command required to instantiate your
background agent server:

```sh
acpchat headless-agent-engine --stdio
```

## Usage

See [SESSION.md](docs/SESSION.md).

## Contributing

See [CONTRIBUTING.md](docs/CONTRIBUTING.md).
