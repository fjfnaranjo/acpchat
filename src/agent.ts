import { spawn, ChildProcess } from "node:child_process";

type ChunkCallback = (chunk: Buffer) => void;
type CloseCallback = (code: number) => void;
type ErrorCallback = (err: Error) => void;

export class AgentProcess {
  private process: ChildProcess;

  constructor(command: string, args: string[]) {
    this.process = spawn(command, args);
  }

  onChunk(callback: ChunkCallback) {
    this.process.stdout?.on("data", callback);
  }

  onClose(callback: CloseCallback) {
    this.process.on("close", callback);
  }

  onError(callback: ErrorCallback) {
    this.process.on("error", callback);
  }

  kill() {
    this.process.kill();
  }
}
