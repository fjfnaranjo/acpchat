# acpchat action plan

## Consider dependencies and add them

* `agentclientprotocol/sdk`: For standardized JSON-RPC framing and
 ACP protocol streaming.
* `marked`: For parsing text stream Markdown into structural tokens.
  * Valuable for analysing the stream contents and detect full blocks,
    italics and bold.

## Core architecture

* Establish the ACP Client connection layer using the official SDK. Bind
  the JSON-RPC communication stream cleanly over the spawned process's
  _stdin_ and _stdout_.
* Route text chunk events straight to a processing queue.
  * Support basic prompt+echo (for basic prompt updates).
  * Completely isolate background updates, _stderr_, reasoning traces, or
    asynchronous chunks during active user interaction to avoid breaking
    assistive focus. Support hiding or showing this elements and the
    echo/recall function in the prompt control commands.

## Stream sanitization & markdown flattening

### Custom marked renderer

1. Subclass or extend the `marked` library's parsing lifecycle to map
   tokenized structural formats into standard linear strings before
   printing to _stdout_.
2. Ensure layout flattening follows these criteria:
  * **Emphasis markers:** Map `**bold**` or `_italics_` into simple
    high-contrast ANSI intensity codes or strip them completely to
    prioritize raw word predictability over style formatting.
  * **Links:** Transform structural markdown links from `[text](url)`
    layouts directly into standard linear prose: `text (link: url)`.
  * **Tables:** Completely serialize any tabular data into plain
    colon-separated key-value lines.

## Activity announcements

To prevent noisy, vibrating re-renders that lock or flood screen
readers, status updates must adhere strictly to chronological,
line-by-line transitions:

1. **Activity start:** Print a clear, static notification to _stdout_
   indicating the specific tool or process initiated: `[Agent] Working
   on: [Task/Tool Name]...`.
2. **Heartbeat (optional for long-running operations):** If a process
   crosses 5 seconds, append a single flat line detailing elapsed time.
3. **Activity completion:** Terminate with a final explicit indicator:
   `[Agent] [Task/Tool Name] completed.` or a descriptive failure
   notice.

## Context and parameter controls

1. Implement a command mode prefix (`/`) inside the input pipeline to
   capture control directives before they hit the agent engine.
2. Build discrete, non-interactive text-driven menus for configuration
   adjustments (such as switching providers or models mid-session):
  * Print a static, sequentially numbered menu (`1. Option A`, `2.
    Option B`).
  * Accept a single, clean numeric string from the user via a standard
    line prompt.
  * Avoid any implementation of visual fuzzy-matching pickers that
    filter lists dynamically on every typed keystroke.

## Authorization speed-bumps

When the harness requires confirmation for state-changing operations
(e.g., file writes or command execution):

1. Immediately freeze the background processing stream.
2. Render a predictable, highly structured text summary broken down line
   by line:
  * Line 1: Target Action name.
  * Line 2: Purpose context.
  * Line 3: Explicit parameters/resource paths.
3. Present a plain text choice query: `Approve this action? (y/n): `.
   Block _stdin_ entirely using `node:readline` until a carriage return
   is submitted.

### Forms

Support advanced question structures (like forms).

## Testing

See [TESTING.md](TESTING.md).

## Publishing

TBD.
