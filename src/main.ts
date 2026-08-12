#!/usr/bin/env node
import { argv, stdin, stdout, stderr, exit } from "node:process";
import { createInterface } from "node:readline/promises";
import { spawn } from "node:child_process";

const [acp_exec, ...acp_args] = argv.slice(2);
if (!acp_exec) {
  stderr.write("Missing ACP server command.\n");
  exit(1);
}

const acp_app = spawn(acp_exec, acp_args);
acp_app.stdout.on("data", (chunk: Buffer) => {
  console.log(chunk.toString());
});
acp_app.on("close", (code: number) => {
  stderr.write(`ACP server stopped abruptly (code: ${code}).\n`);
  exit(1);
});

const rl = createInterface({ input: stdin, output: stdout });
const answer = await rl.question("? ");
console.log(answer);
rl.close();
