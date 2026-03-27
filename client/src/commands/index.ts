import { helpCommand } from "./help";
import { clearCommand } from "./clear";
import { curlCommand } from "./curl";
import type { Terminal } from "@xterm/xterm";

export const runCommand = async (
  rawCommand: string,
  term: Terminal,
): Promise<void> => {
  const command = rawCommand.trim();
  if (!command) return;

  if (command === "help") {
    helpCommand(term);
    return;
  }
  if (command === "clear") {
    clearCommand(term);
    return;
  }
  if (command.startsWith("curl ")) {
    const endpoint = command.slice(5).trim();
    if (!endpoint) {
      term.writeln("Usage: curl <url>");
      return;
    }
    await curlCommand(term, endpoint);
    return;
  }
  term.writeln(`Unknown command: ${command}`);
  term.writeln("Try: help");
};
