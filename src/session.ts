import { stdin, stderr, exit } from "node:process";
import { AgentProcess } from "./agent.js";
import { ChunkBuffer } from "./output.js";
import { Terminal } from "./prompt.js";

enum SessionState {
  STREAMING = "STREAMING",
  INTERRUPTED = "INTERRUPTED",
}

export class Session {
  private state: SessionState = SessionState.STREAMING;
  private agent: AgentProcess;
  private buffer: ChunkBuffer;
  private terminal: Terminal;

  constructor(command: string, args: string[]) {
    this.agent = new AgentProcess(command, args);
    this.buffer = new ChunkBuffer();
    this.terminal = new Terminal();

    this.agent.onChunk((chunk) => this.buffer.push(chunk));
    this.agent.onClose((code) => this.cleanupAndExit(code));
    this.agent.onError((err) => {
      stderr.write(`Failed to execute ACP command: ${err.message}\n`);
      this.cleanupAndExit(-1);
    });
  }

  run() {
    this.enterStreaming();
  }

  private enterStreaming() {
    this.state = SessionState.STREAMING;
    this.buffer.setStreaming(true);
    this.terminal.enterStreamingMode(() => {
      this.state = SessionState.INTERRUPTED;
      this.buffer.setStreaming(false);
      void this.promptLoop();
    });
  }

  private async promptLoop() {
    let on_prompt = true;
    while (on_prompt) {
      const command = await this.terminal.readLine(
        this.makePrompt(),
        () => {
          this.buffer.flush();
          on_prompt = false;
        },
        () => this.cleanupAndExit(0),
      );

      switch (command.trim()) {
        case "/quit":
        case "/exit":
          this.cleanupAndExit(0);
          break;
        case "/continue":
          this.buffer.flush();
          on_prompt = false;
          break;
        default:
          break;
      }
    }
    this.enterStreaming();
  }

  private makePrompt(): string {
    if (this.state === SessionState.INTERRUPTED) {
      if (this.buffer.bufferedCount > 1) {
        return "[echo] > ";
      } else {
        return "[int] > ";
      }
    } else {
      return "> ";
    }
  }

  private cleanupAndExit(code: number) {
    this.buffer.flush();
    // TODO: Handle ACP state when quit is requested
    stdin.setRawMode(false);
    exit(code);
  }
}
