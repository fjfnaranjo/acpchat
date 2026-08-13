import { stdin, stdout } from "node:process";
import { emitKeypressEvents, Key } from "node:readline";
import { createInterface } from "node:readline/promises";

type KeyHandler = (str: string, key: Key) => void;

export class Keyboard {
  private keypressHandler: KeyHandler | null = null;

  constructor() {
    emitKeypressEvents(stdin);
  }

  wait(onShowPrompt: () => void, onInterrupt: () => void) {
    stdin.setRawMode(true);
    stdin.resume();
    this.attachKeypress((_str, key) => {
      if (key) {
        if (key.name === "return") {
          this.detachKeypress();
          onShowPrompt();
        }
        if (key.name === "escape" || (key.ctrl && key.name === "c")) {
          this.detachKeypress();
          onInterrupt();
        }
      }
    });
  }

  async readLine(
    prompt: string,
    onHidePrompt: () => void,
    onInterrupt: () => void,
  ): Promise<string> {
    const rl = createInterface({ input: stdin, output: stdout });
    const ac = new AbortController();

    this.attachKeypress((_str, key) => {
      if (key && key.name === "escape") {
        ac.abort();
      }
    });
    rl.on("SIGINT", () => {
      this.detachKeypress();
      rl.close();
      onInterrupt();
    });

    try {
      return await rl.question(prompt, { signal: ac.signal });
    } catch {
      onHidePrompt();
      return "";
    } finally {
      this.detachKeypress();
      rl.close();
    }
  }

  private attachKeypress(handler: KeyHandler) {
    this.detachKeypress();
    this.keypressHandler = handler;
    stdin.on("keypress", this.keypressHandler);
  }

  private detachKeypress() {
    if (this.keypressHandler) {
      stdin.removeListener("keypress", this.keypressHandler);
      this.keypressHandler = null;
    }
  }
}
