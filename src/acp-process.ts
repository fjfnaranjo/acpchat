import { spawn, ChildProcess } from "node:child_process";

type ChunkCallback = (chunk: Buffer) => void;
type CloseCallback = (code: number) => void;
type ErrorCallback = (err: Error) => void;

export class ACPProcess {
  private process: ChildProcess;

  constructor(
    command: string,
    args: string[],
    onChunk: ChunkCallback,
    onClose: CloseCallback,
    onError: ErrorCallback,
  ) {
    this.process = spawn(command, args);
    this.process.stdout?.on("data", onChunk);
    this.process.on("close", onClose);
    this.process.on("error", onError);
  }

  kill() {
    this.process.kill();
  }
}
