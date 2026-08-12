import { stdin, stdout, stderr, exit } from "node:process";
import { emitKeypressEvents, Key } from "node:readline";
import { createInterface } from "node:readline/promises";
import { spawn, ChildProcess } from "node:child_process";

enum CLIState {
  STREAMING = "STREAMING",
  PROMPT = "PROMPT",
  INTERRUPTED = "INTERRUPTED",
}

export class CLI {
  private state: CLIState = CLIState.STREAMING;
  private keypressHandler: ((str: string, key: Key) => void) | null = null;
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
      exit(1);
    });

    emitKeypressEvents(stdin);
    this.enableRawMode();
  }

  private enableRawMode(): void {
    stdin.setRawMode(true);
    stdin.resume();
    if (!this.keypressHandler) {
      this.keypressHandler = (_str, key) => {
        if (key.name === "escape" || (key.ctrl && key.name === "c")) {
          this.state = CLIState.INTERRUPTED;
          this.disableRawMode();
          this.promptHandler();
        }
      };
      stdin.on("keypress", this.keypressHandler);
    }
  }

  private disableRawMode(): void {
    if (this.keypressHandler) {
      stdin.removeListener("keypress", this.keypressHandler);
      this.keypressHandler = null;
    }
    stdin.setRawMode(false);
  }

  private promptHandler() {
    (async () => {
      let promptSymbol: string = "> ";
      if (this.state === CLIState.INTERRUPTED) {
        if (this.acp_chunks.length > 1) {
          promptSymbol = "[echo] > ";
        } else {
          promptSymbol = "[int] > ";
        }
      }

      const rl = createInterface({ input: stdin, output: stdout });

      rl.on("SIGINT", () => {
        // TODO: Handle interruption
      });

      let on_prompt: boolean = true;
      while (on_prompt) {
        const command = await rl.question(promptSymbol);
        const full_command = command.trim();

        switch (full_command) {
          case "/quit":
          case "/exit":
            // TODO: Handle ACP state when quit is requested
            this.flushChunks();
            rl.close();
            exit(0);
          case "/continue":
            this.state = CLIState.STREAMING;
            this.flushChunks();
            rl.close();
            this.enableRawMode();
            on_prompt = false;
            break;
          default:
            break;
        }
      }
    })();
  }

  private handleACPChunk(chunk: Buffer) {
    if (this.state === CLIState.STREAMING) {
      stdout.write(chunk);
    } else {
      this.acp_chunks.push(chunk);
    }
  }

  // TODO: Handle ACP close
  private handleACPClose(_code: number) {}

  private flushChunks() {
    if (this.acp_chunks.length > 0) {
      stdout.write(Buffer.concat(this.acp_chunks).toString());
      this.acp_chunks = [];
    }
  }
}
