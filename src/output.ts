import { stdout } from "node:process";

export class ChunkBuffer {
  private chunks: Buffer[] = [];
  private streaming: boolean = true;

  setStreaming(streaming: boolean) {
    this.streaming = streaming;
  }

  push(chunk: Buffer) {
    if (this.streaming) {
      stdout.write(chunk);
    } else {
      this.chunks.push(chunk);
    }
  }

  flush() {
    if (this.chunks.length > 0) {
      stdout.write(Buffer.concat(this.chunks).toString());
      this.chunks = [];
    }
  }

  get bufferedCount(): number {
    return this.chunks.length;
  }
}
