# acpchat action plan

## Phase 1: Environment setup & toolchain configuration

### 1.1 Project initialization

1. Create a Node.js dev container to encapsulate all development tools.
2. Initialize a clean Node.js project.
3. Configure the project to use ECMAScript Modules (`"type": "module"`)
   within `package.json`.

### 1.2 Dependency management

Install the absolute minimum production and development packages to
prevent ecosystem fragmentation and code bloat:

* **Production Dependencies:**
  * `@modelcontextprotocol/sdk`: For standardized JSON-RPC framing and
    ACP protocol streaming.
  * `commander`: For handling robust, structured command-line arguments.
  * `zod`: For strict, runtime data validation of asynchronous JSON
    payloads from the agent.
  * `marked`: For parsing text stream Markdown into structural tokens.
  * `chalk`: For basic, high-contrast terminal styling attributes.
* **Development Dependencies:**
  * `typescript`: The compiler core.
  * `tsx`: For zero-compilation execution of TypeScript files directly
    during development.
  * `eslint` & `prettier`: To enforce strict linting rules and format
    consistency automatically.
  * `tsup`: A zero-config bundler to package the application into a
    single executable JavaScript file for distribution.

### 1.3 TypeScript optimization

Configure `tsconfig.json` targeting modern Node.js environments
(`NodeNext` module resolution, strict type checking enabled, and modern
syntax compilation targets) to eliminate standard compilation
boilerplate.

## Phase 2: Core architecture & ACP client implementation

### 2.1 Process orchestration & connection

1. Implement a module that spawns the external agent engine (the
   harness/MCP host) as a background child process via standard I/O
   pipes (`stdio: ['pipe', 'pipe', 'inherit']`).
2. Establish the ACP Client connection layer using the official SDK.
   Bind the JSON-RPC communication stream cleanly over the spawned
   process's `stdin` and `stdout`.

### 2.2 Event-driven stream handler

1. Create a centralized event pipeline to intercept all incoming
   JSON-RPC notifications from the ACP session.
2. Route text chunk events (`agent_message_chunk` or equivalent text
   stream notifications) straight to a processing queue.
3. Completely isolate background updates, reasoning traces, or
   asynchronous chunks during active user interaction to avoid breaking
   assistive focus.

## Phase 3: The UX layer

### 3.1 Native line-editing & I/O

1. Use Node's built-in `node:readline/promises` module exclusively to
   manage user input. Do not use interactive prompt libraries that
   overwrite rows or manually manage virtual screen matrices via raw
   ANSI sequences.
2. Rely entirely on the operating system's native TTY stream behaviors
   to allow the user's screen reader to naturally track character
   insertion, word deletion, and command history (`Up`/`Down` arrow
   navigation).
3. Delegate vertical terminal history navigation, paging, and screen
   clearance fully to the user's host terminal emulator or terminal
   multiplexer (`tmux`). Do not implement custom software wrappers for
   these tasks.

### 3.2 Activity announcements

To prevent noisy, vibrating re-renders that lock or flood screen
readers, status updates must adhere strictly to chronological,
line-by-line transitions:

1. **Activity start:** Print a clear, static notification to `stdout`
   indicating the specific tool or process initiated: `[Agent] Working
   on: [Task/Tool Name]...`.
2. **Heartbeat (optional for long-running operations):** If a process
   crosses 5 seconds, append a single flat line detailing elapsed time.
3. **Activity completion:** Terminate with a final explicit indicator:
   `[Agent] [Task/Tool Name] completed.` or a descriptive failure
   notice.

### 3.3 Authorization speed-bumps

When the harness requires confirmation for state-changing operations
(e.g., file writes or command execution):

1. Immediately freeze the background processing stream.
2. Render a predictable, highly structured text summary broken down line
   by line:
  * Line 1: Target Action name.
  * Line 2: Purpose context.
  * Line 3: Explicit parameters/resource paths.
3. Present a plain text choice query: `Approve this action? (y/n): `.
   Block `stdin` entirely using `node:readline` until a carriage return
   is submitted.

### 3.4 Context and parameter controls

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

## Phase 4: Stream sanitization & markdown flattening

### 4.1 Custom marked renderer

1. Subclass or extend the `marked` library's parsing lifecycle to map
   tokenized structural formats into standard linear strings before
   printing to `stdout`.
2. Ensure layout flattening follows these criteria:
  * **Emphasis markers:** Map `**bold**` or `_italics_` into simple
    high-contrast ANSI intensity codes or strip them completely to
    prioritize raw word predictability over style formatting.
  * **Links:** Transform structural markdown links from `[text](url)`
    layouts directly into standard linear prose: `text (link: url)`.
  * **Tables:** Completely serialize any tabular data into plain
    colon-separated key-value lines.

## Phase 5: Verification & delivery setup

### 5.1 Compilation & bundling build

1. Set up a distribution script utilizing `tsup` to bundle the entire
   client codebase, dependencies, and typings into a single optimized
   JavaScript artifact.
2. Expose the final script via an entry point that can be directly
   mapped to a system binary.
3. Ensure a clean run of tests before actual distribution.
