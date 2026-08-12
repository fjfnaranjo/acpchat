import { stdin, stdout, stderr, exit } from "node:process";
import { emitKeypressEvents, Key } from "node:readline";
import { createInterface } from "node:readline/promises";
import { spawn, ChildProcess } from "node:child_process";

type KeyHandler = (str: string, key: Key) => void;

enum CLIState {
  STREAMING = "STREAMING",
  PROMPT = "PROMPT",
  INTERRUPTED = "INTERRUPTED",
}

export class CLI {
  private state: CLIState = CLIState.STREAMING;
  private keypressHandler: KeyHandler | null = null;
  private acp_process: ChildProcess | null = null;
  private acp_chunks: Buffer[] = [];

  constructor(command: string, args: string[]) {
    this.acp_process = spawn(command, args);
    this.acp_process.stdout?.on("data", (chunk: Buffer) => {
      this.handleACPChunk(chunk);
    });
    this.acp_process.on("close", (code: number) => {
      this.handleACPClose(code);
    });
    this.acp_process.on("error", (err) => {
      stderr.write(`Failed to execute ACP command: ${err.message}\n`);
      this.cleanupAndExit(-1);
    });

    emitKeypressEvents(stdin);
    this.handleStreaming();
  }

  private handleACPChunk(chunk: Buffer) {
    if (this.state === CLIState.STREAMING) {
      stdout.write(chunk);
    } else {
      this.acp_chunks.push(chunk);
    }
  }

  private handleACPClose(code: number) {
    this.cleanupAndExit(code);
  }

  private cleanupAndExit(code: number) {
    this.flushChunks();
    // TODO: Handle ACP state when quit is requested
    // if this.acp_process ...
    stdin.setRawMode(false);
    exit(code);
  }

  private flushChunks() {
    if (this.acp_chunks.length > 0) {
      stdout.write(Buffer.concat(this.acp_chunks).toString());
      this.acp_chunks = [];
    }
  }

  private handleStreaming(): void {
    this.state = CLIState.STREAMING;
    stdin.setRawMode(true);
    stdin.resume();
    if (!this.keypressHandler) {
      this.keypressHandler = (_str, key) => {
        // TODO: This should stop the agent mid-streamning
        // if (key && (key.name === "escape" || (key.ctrl && key.name === "c"))) {
        if (key && key.name === "return") {
          this.state = CLIState.INTERRUPTED;
          if (this.keypressHandler) {
            stdin.removeListener("keypress", this.keypressHandler);
            this.keypressHandler = null;
          }
          this.handlePrompt();
        }
      };
      stdin.on("keypress", this.keypressHandler);
    }
  }

  private handlePrompt() {
    (async () => {
      let on_prompt: boolean = true;
      const rl = createInterface({ input: stdin, output: stdout });
      try {
        while (on_prompt) {
          const ac = new AbortController();
          if (!this.keypressHandler) {
            this.keypressHandler = (_str, key) => {
              if (key && key.name === "escape") {
                ac.abort();
              }
            };
          }
          stdin.on("keypress", this.keypressHandler);

          // TODO: Handle interruption
          rl.on("SIGINT", () => {
            this.cleanupAndExit(0);
          });

          const command = await rl.question(this.makePrompt(), {
            signal: ac.signal,
          });

          switch (command.trim()) {
            case "/quit":
            case "/exit":
              this.cleanupAndExit(0);
            case "/continue":
              this.flushChunks();
              on_prompt = false;
              break;
            default:
              break;
          }
        }
      } catch (err: any) {
        if (err.name === "AbortError") {
          this.flushChunks();
          on_prompt = false;
        }
      } finally {
        if (this.keypressHandler) {
          stdin.removeListener("keypress", this.keypressHandler);
          this.keypressHandler = null;
        }
        rl.close();
      }

      this.handleStreaming();
    })();
  }

  private makePrompt(): string {
    if (this.state === CLIState.INTERRUPTED) {
      if (this.acp_chunks.length > 1) {
        return "[echo] > ";
      } else {
        return "[int] > ";
      }
    } else {
      return "> ";
    }
  }
}
