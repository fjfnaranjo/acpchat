# acpchat testing strategy

Because `acpchat` is a pure linear transformation layer between an Agent
Client Protocol (ACP) server and `stdout`, testing is modeled entirely
around **Stream Simulation** rather than unit tests.

Integration tests spin up `acpchat` against a mocked ACP agent
(`mock-agent.ts`), inject specific text payloads, and assert against a
reference text, relying in `stdout` / `stdin` redirections.

```sh
tsx src/index.ts bin/mock-agent.ts \
    < test/fixtures/scenario-script.txt > test/output.log
```

## The ACP agent mock features

1. **Handshake loop:** Responds immediately with valid JSON-RPC
   initialization confirmations when `acpchat` binds to its pipes.
2. **Scripted scenarios:** Executes a deterministic response array
   triggered by specific input keywords:
  * Keyword `"stream"` -> Fires a continuous sequence of
    `agent_message_chunk` notifications.
  * Keyword `"tool"` -> Emits a JSON-RPC request requiring user
    permission, pauses, and looks for a `y ` or `n` confirmation on its
    `stdin`.
  * Keyword `"switch"` -> Emits a protocol capabilities acknowledgement
    verifying model runtime adjustments.

## Coverage matrix

### Stream text preservation & formatting

* **Plain stream progression:** Verify that standard stream chunks are
  caught, stripped of JSON framing, and dumped directly to `stdout`
  chunk-by-chunk without delay blocks.
* **Markdown flattening:**
  * Assert that structural hyperlinks (`[text](url)`) are emitted
    natively as flat linear text: `text (link: url)`.
  * Assert that emphasis tags (`**bold**`, `_italics_`) do not leak
    plain punctuation characters to the reader; ensure they output plain
    words or basic high-contrast ANSI codes.
  * Assert that markdown tables are parsed out and flattened into linear
    colon-delimited (`Key: Value`) lines.

### Activity & status lifecycle

* **Chronological announcements for short-running operations:** Verify
  that tool execution events generate exactly two discrete terminal
  lines for short tool executions:
  * `[Agent] Working on: [Tool Name]...`
  * `[Agent] [Tool Name] completed.`
* **Heartbeat for long-running operations:** For long-running tool
  executions, verify the heartbeat lines are present:
  * `[Agent] Working on: [Tool Name] (5 seconds)...`
  * `[Agent] Working on: [Tool Name] (10 seconds)...`
* **Decision routing (`y` / `n` input):**
  * Simulate typing `y`: Verify the approval JSON response is
    successfully relayed up to the mock agent process.
  * Simulate typing `n`: Verify a rejection payload is transmitted, and
    the stream cleanly gracefully winds down.

### Context command management

* **Non-interactive selection loops:** Verify that entering `/model`
  displays a static, numbered configuration menu, safely reads a single
  trailing numeric digit, and updates session contexts without firing
  dynamic, character-by-character filtering events.
