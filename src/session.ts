import { stdin, stderr, exit } from "node:process";
import { Stream } from "./stream.js";
import { Keyboard } from "./keyboard.js";
import { ACPProcess } from "./acp-process.js";

enum PromptMode {
  HIDDEN = "HIDDEN",
  INTERRUPTED = "INTERRUPTED",
}

export class Session {
  private prompt_mode: PromptMode = PromptMode.HIDDEN;
  private stream: Stream;
  private keyboard: Keyboard;
  private acp_process: ACPProcess;

  constructor(command: string, args: string[]) {
    this.stream = new Stream();
    this.keyboard = new Keyboard();
    this.acp_process = new ACPProcess(
      command,
      args,
      (chunk) => this.stream.push(chunk),
      (code) => this.cleanupAndExit(code),
      (err) => {
        stderr.write(`Failed to execute ACP command: ${err.message}\n`);
        this.cleanupAndExit(-1);
      },
    );
  }

  run() {
    this.enterStreaming();
  }

  private enterStreaming() {
    this.prompt_mode = PromptMode.HIDDEN;
    this.stream.setStreaming(true);
    this.keyboard.wait(
      () => {
        this.prompt_mode = PromptMode.INTERRUPTED;
        this.stream.setStreaming(false);
        void this.showPrompt();
      },
      () => {
        // TODO: Replace by ACP cancel
        this.cleanupAndExit();
      },
    );
  }

  private async showPrompt() {
    let on_prompt = true;
    while (on_prompt) {
      const command = await this.keyboard.readLine(
        this.makePrompt(),
        () => {
          this.stream.flush();
          on_prompt = false;
        },
        () => this.cleanupAndExit(),
      );

      switch (command.trim()) {
        case "/quit":
        case "/exit":
          this.cleanupAndExit();
          break;
        case "/continue":
          this.stream.flush();
          on_prompt = false;
          break;
        default:
          break;
      }
    }
    this.enterStreaming();
  }

  private makePrompt(): string {
    if (this.prompt_mode === PromptMode.INTERRUPTED) {
      if (this.stream.hasChunks) {
        return "[echo] > ";
      } else {
        return "[int] > ";
      }
    } else {
      return "> ";
    }
  }

  private cleanupAndExit(code: number = 0) {
    // TODO: Verify if the agent is still running
    // this.acp_process.kill();
    this.stream.flush();
    stdin.setRawMode(false);
    exit(code);
  }
}
