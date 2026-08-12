#!/usr/bin/env node
import { argv, stdin, stderr, exit } from "node:process";
import { CLI } from "./cli.js";

if (!stdin.isTTY) {
  stderr.write("STDIN is not a TTY.\n");
  exit(1);
}

const [acp_cmd, ...acp_args] = argv.slice(2);
if (!acp_cmd) {
  stderr.write("Missing ACP server command.\n");
  exit(1);
}

new CLI(acp_cmd, acp_args);
