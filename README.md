# acpchat

> NOTE: This is a vibe-designed WIP mess... You should probably ignore
> it for now...

A pure stream-oriented (TUI-Free), text-only Agent Client Protocol (ACP)
CLI client designed with consideration for users of screen readers and
terminal refresh displays.

`acpchat` eliminates the visual noise, absolute cursor positioning,
background re-renders, and visual frame layouts of traditional Text User
Interfaces (TUIs). It flattens structural layouts and streams agent
interactions as a predictable, chronological, text-only stream via
standard `stdout`.

## Key design principles

* **No screen overwriting:** Doesn't clear lines or alter historical
  terminal rows. Text only flows downward.
* **Basic system bindings:** Relies exclusively on readline-style
  text input and entry modification.
* **Linear layout rendering:** Dynamically linearises and converts
  Markdown into text strings or broadly supported ANSI escape sequences.
* **Decoupled architecture:** Acts strictly as a lean ACP Client. It
  leaves tool execution, lifecycle state, and Model Context Protocol
  (MCP) host orchestration entirely to the backend agent harness.

## Getting started

Launch `acpchat` by supplying the command required to instantiate your
background agent server (from the basic application parameters):

```sh
acpchat headless-agent-engine --stdio
```

### Control directives

`acpchat` captures runtime configuration updates via explicit slash
commands before they pass to the engine pipeline. These command
interfaces present clean, non-interactive numbered selections instead of
visual fuzzy matchers:

* `/model` — Opens a linear text list to update the active engine LLM.
* `/provider` — Opens a linear option list to switch model orchestration
  backends.
* `//` - Allows sending a literal '/' to the backend agent.
* `/quit`, `/exit` - Kills the session.

Some keyboard interrupts are also supported at any time:

* `Ctrl-C` - Cancel pending tasks.
* `Ctrl-D` - Cancel pending tasks and kills the session.
