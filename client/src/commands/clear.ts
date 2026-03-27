import type { Terminal } from "@xterm/xterm";

export function clearCommand(term: Terminal) {
  term.clear();
}
