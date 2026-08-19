# acpchat sessions

Every time `acpchat` is run, a new session will be created and a
stream->prompt cycle will start. You can interrupt a stream at any time
using `ENTER` to issue commands or queue the next prompt. Questions and
config commands needing an immediate reply will be handled as they are
requested. The pending text for interrupted streams will be shown as
soon as all commands or replies are provided.

## Filters

Errors sent from the agent using _stderr_ and ACP _thinking_ tool calls
will support filtering. If hidden, a single line will identify them if
the user needs to show their contents later.

## Prompt and control commands

`acpchat` supports some slash commands in the prompt. For agents
reporting their own slash commands, `acpchat` will alias its own with a
double slash if they conflict.

* `/s` - Go back to the ACP response stream if it was interrupted.
* `/q` - Cleanly exits the agent and `acpchat` (also `Crtl-D`).
* `/c` - Cancel the current task (also `Ctrl-C` or `ESC`).
* `/p` - Show the list of providers/models to select between them.
* `/p [name]` - Select a provider/model by name.
* `/m` - `/p` alias.
* `/d` - Same as `/p`, but for session modes.
* `/ton`, `/toff`, `/eon`, `/eoff` - Show/hide _thinking_ and _stderr_.
* `/t{n}`, `/e{n}` - Echo the contents of hidden content (see above).

## Static configuration

Some `acpchat` features can be configured with a file in a known
location, containing commands from the previous section, one per line.
When it makes sense, the command will be issued after the ACP connection
is established (provider, modes, ...).

* `$HOME/.acpchat.rc`.
* `$HOME/.config/acpchat/rc`.
* `$PWD/.acpchat.rc`.
