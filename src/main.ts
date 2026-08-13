#!/usr/bin/env node
import { argv, stdin, stderr, exit } from "node:process";
import { Session } from "./session.js";

if (!stdin.isTTY) {
  stderr.write("STDIN is not a TTY.\n");
  exit(1);
}

const [command, ...args] = argv.slice(2);
if (!command) {
  stderr.write("Missing ACP server command.\n");
  exit(1);
}

new Session(command, args).run();
